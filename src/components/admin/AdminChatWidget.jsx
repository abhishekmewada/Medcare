import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  X,
  Send,
  Minus,
  ArrowLeft,
  Circle,
  Search,
  Headphones,
} from "lucide-react";
import { useSelector } from "react-redux";

import {
  getOrCreateConversationApi,
  getMyConversationsApi,
  getAdminDoctorContactsApi,
  getConversationByIdApi,
  getConversationMessagesApi,
  markConversationAsReadApi,
  markMessageAsReadApi,
} from "../../api/chat.api";

import {
  joinConversation,
  leaveConversation,
  sendChatMessage,
  startTyping,
  stopTyping,
  readChatMessage,
} from "../../socket/chatSocket";

import socket, { connectSocket } from "../../socket/socket";

// Helper to resolve backend image URLs
const resolveAvatarUrl = (path) => {
  if (!path) return "";
  if (
    path.startsWith("blob:") ||
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }
  return `http://localhost:5000${path.startsWith("/") ? "" : "/"}${path}`;
};

export default function AdminChatWidget() {
  const user = useSelector((state) => state.auth.user);

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);

  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("chats"); // "chats" | "contacts"

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // ==========================================
  // SOCKET CONNECTION HANDLER
  // ==========================================
  useEffect(() => {
    connectSocket();

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  // ==========================================
  // FETCH CONVERSATIONS & CONTACTS
  // ==========================================
  const loadConversations = useCallback(async () => {
    try {
      const data = await getMyConversationsApi();
      if (data?.success) {
        // Enforce doctor-admin conversations only
        const filtered = data.conversations.filter(
          (c) => c.conversationType === "doctor-admin"
        );
        setConversations(filtered);
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    const loadData = async () => {
      try {
        setContactsLoading(true);
        const [convData, contData] = await Promise.all([
          getMyConversationsApi(),
          getAdminDoctorContactsApi(),
        ]);
        if (!isMounted) return;
        if (convData?.success) {
          const filtered = convData.conversations.filter(
            (c) => c.conversationType === "doctor-admin"
          );
          setConversations(filtered);
        }
        if (contData?.success) {
          setContacts(contData.contacts || []);
        }
      } catch (err) {
        console.error("Failed to load admin support chat data:", err);
      } finally {
        if (isMounted) setContactsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // ==========================================
  // FETCH MESSAGES FOR SELECTED CONVERSATION
  // ==========================================
  useEffect(() => {
    if (!selectedConversationId) return;

    const loadSingleConv = async () => {
      try {
        setMessagesLoading(true);
        const [convRes, msgRes] = await Promise.all([
          getConversationByIdApi(selectedConversationId),
          getConversationMessagesApi(selectedConversationId),
        ]);

        if (convRes?.success) setCurrentConversation(convRes.conversation);
        if (msgRes?.success) setMessages(msgRes.messages || []);

        await markConversationAsReadApi(selectedConversationId);
        joinConversation(selectedConversationId);
      } catch (err) {
        console.error("Error loading chat messages:", err);
      } finally {
        setMessagesLoading(false);
      }
    };

    loadSingleConv();

    return () => {
      leaveConversation(selectedConversationId);
      setIsTyping(false);
    };
  }, [selectedConversationId]);

  // ==========================================
  // REAL-TIME SOCKET MESSAGE LISTENER
  // ==========================================
  useEffect(() => {
    const handleNewMessage = (msg) => {
      const msgConvId =
        msg?.conversation?._id?.toString() || msg?.conversation?.toString();
      const senderId =
        msg?.sender?._id?.toString() || msg?.sender?.toString();
      const currentUserId = user?._id?.toString();
      const isOwn = senderId === currentUserId;

      if (
        selectedConversationId &&
        msgConvId === selectedConversationId.toString()
      ) {
        setMessages((prev) =>
          prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]
        );
        if (!isOwn) {
          if (!isOpen || isMinimized) {
            setUnreadCount((prev) => prev + 1);
          } else {
            readChatMessage(msg._id);
            markMessageAsReadApi(msg._id);
          }
        }
        setIsTyping(false);
      } else {
        if (!isOwn) {
          setUnreadCount((prev) => prev + 1);
        }
        loadConversations();
      }
    };

    socket.on("chat:message", handleNewMessage);

    return () => {
      socket.off("chat:message", handleNewMessage);
    };
  }, [selectedConversationId, isOpen, isMinimized, user?._id, loadConversations]);

  // ==========================================
  // REAL-TIME TYPING LISTENER
  // ==========================================
  useEffect(() => {
    if (!selectedConversationId) return;

    const handleTyping = (data) => {
      if (
        data?.conversationId?.toString() === selectedConversationId?.toString() &&
        data?.userId?.toString() !== user?._id?.toString()
      ) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = (data) => {
      if (
        data?.conversationId?.toString() === selectedConversationId?.toString()
      ) {
        setIsTyping(false);
      }
    };

    socket.on("chat:typing", handleTyping);
    socket.on("chat:stopTyping", handleStopTyping);

    return () => {
      socket.off("chat:typing", handleTyping);
      socket.off("chat:stopTyping", handleStopTyping);
    };
  }, [selectedConversationId, user?._id]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input
  useEffect(() => {
    if (isOpen && !isMinimized && selectedConversationId) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized, selectedConversationId]);

  // ==========================================
  // SEND MESSAGE
  // ==========================================
  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || !selectedConversationId || !isConnected) return;

    sendChatMessage({
      conversationId: selectedConversationId,
      message: trimmed,
      messageType: "text",
      attachments: [],
    });

    setInput("");
    stopTyping(selectedConversationId);
  }, [input, selectedConversationId, isConnected]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
      return;
    }

    if (!selectedConversationId) return;

    startTyping(selectedConversationId);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(selectedConversationId);
    }, 1200);
  };

  // Open conversation from contact
  const handleSelectContact = async (contact) => {
    try {
      const res = await getOrCreateConversationApi({
        targetUserId: contact.targetUser?._id,
        conversationType: "doctor-admin",
      });

      if (res?.success && res.conversation?._id) {
        setSelectedConversationId(res.conversation._id);
        setCurrentConversation(res.conversation);
        setIsOpen(true);
        setIsMinimized(false);
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Failed to select support contact:", err);
    }
  };

  // Participant helper for header and subtext
  const otherParticipant = useMemo(() => {
    if (!currentConversation) return null;
    const parts = currentConversation.participants || [];
    return parts.find((p) => (p._id || p)?.toString() !== user?._id?.toString()) || parts[0];
  }, [currentConversation, user?._id]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((c) => {
      const name = c.participants?.map((p) => p.fullName).join(" ") || "";
      return name.toLowerCase().includes(q);
    });
  }, [conversations, searchQuery]);

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    const q = searchQuery.toLowerCase();
    return contacts.filter(
      (c) =>
        c.targetUser?.fullName?.toLowerCase().includes(q) ||
        c.targetUser?.email?.toLowerCase().includes(q)
    );
  }, [contacts, searchQuery]);

  const totalUnread =
    unreadCount + conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  // ==========================================
  // FLOATING LAUNCHER ICON
  // ==========================================
  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
          setUnreadCount(0);
        }}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#1f363d] to-[#40798c] text-white shadow-2xl shadow-[#1f363d]/40 transition-all duration-300 hover:scale-110 active:scale-95 group border-2 border-white/20"
        title="Live Doctor-Admin Support Chat"
      >
        <Headphones className="h-6 w-6 group-hover:rotate-12 transition-transform" />

        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-extrabold text-white ring-2 ring-white animate-bounce">
            {totalUnread > 9 ? "9+" : totalUnread}
          </span>
        )}

        <span className="absolute right-16 px-3 py-1.5 bg-[#1f363d] text-white text-xs font-semibold rounded-xl shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-[#40798c]/40">
          Doctor ↔ Admin Live Chat
        </span>
      </button>
    );
  }

  // ==========================================
  // FLOATING CHAT WINDOW
  // ==========================================
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden rounded-3xl border border-[#40798c]/30 bg-white shadow-2xl transition-all duration-300 ${
        isMinimized ? "h-16 w-72" : "h-[500px] w-[360px] sm:w-[400px]"
      }`}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between bg-gradient-to-r from-[#1f363d] to-[#40798c] px-4 py-3 text-white shadow-md">
        <div className="flex items-center gap-2.5 min-w-0">
          {selectedConversationId && (
            <button
              onClick={() => setSelectedConversationId(null)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-200 transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
          )}

          <div className="relative h-9 w-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-bold text-sm text-white shrink-0 overflow-hidden">
            {selectedConversationId ? (
              otherParticipant?.avatar ? (
                <img
                  src={resolveAvatarUrl(otherParticipant.avatar)}
                  alt={otherParticipant.fullName}
                  className="h-full w-full object-cover rounded-xl"
                />
              ) : (
                (otherParticipant?.fullName || "U")[0].toUpperCase()
              )
            ) : (
              <Headphones size={18} />
            )}
            <Circle
              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ${
                isConnected
                  ? "fill-emerald-400 text-emerald-400"
                  : "fill-slate-400 text-slate-400"
              }`}
            />
          </div>

          <div className="min-w-0">
            <h4 className="text-xs font-bold truncate text-white">
              {selectedConversationId
                ? otherParticipant?.fullName || "Support Chat"
                : user?.role === "admin"
                ? "Doctor Support Telemetry"
                : "Admin Support Chat"}
            </h4>
            <p className="text-[10px] text-slate-200 truncate">
              {selectedConversationId
                ? isTyping
                  ? "Typing..."
                  : otherParticipant?.role === "admin"
                  ? "Super Administrator"
                  : "Doctor Specialist"
                : isConnected
                ? "WebSocket Connected"
                : "Connecting..."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-200"
          >
            <Minus size={16} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-200"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
          {!selectedConversationId ? (
            /* LIST VIEW: CHATS & CONTACTS */
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-3 bg-white border-b border-slate-100 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search doctor or admin..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#40798c]"
                  />
                </div>
              </div>

              {/* TABS */}
              <div className="flex border-b border-slate-200 bg-white px-2">
                <button
                  onClick={() => setActiveTab("chats")}
                  className={`flex-1 py-2 text-xs font-bold border-b-2 transition ${
                    activeTab === "chats"
                      ? "border-[#40798c] text-[#1f363d]"
                      : "border-transparent text-slate-400"
                  }`}
                >
                  Active Chats ({conversations.length})
                </button>
                <button
                  onClick={() => setActiveTab("contacts")}
                  className={`flex-1 py-2 text-xs font-bold border-b-2 transition ${
                    activeTab === "contacts"
                      ? "border-[#40798c] text-[#1f363d]"
                      : "border-transparent text-slate-400"
                  }`}
                >
                  {user?.role === "admin" ? "Doctors" : "Admins"} ({contacts.length})
                </button>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {activeTab === "chats" ? (
                  filteredConversations.length > 0 ? (
                    filteredConversations.map((conv) => {
                      const other = conv.participants?.find(
                        (p) => (p._id || p)?.toString() !== user?._id?.toString()
                      );
                      return (
                        <button
                          key={conv._id}
                          onClick={() => {
                            setSelectedConversationId(conv._id);
                            setCurrentConversation(conv);
                          }}
                          className="w-full p-3 flex items-center gap-3 hover:bg-slate-100 transition text-left"
                        >
                          <div className="h-9 w-9 rounded-full bg-[#1f363d] text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                            {other?.avatar ? (
                              <img
                                src={resolveAvatarUrl(other.avatar)}
                                alt={other?.fullName || "User"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              other?.fullName?.charAt(0).toUpperCase() || "C"
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800 text-xs truncate">
                                {other?.fullName || "Support User"}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {conv.lastMessageAt
                                  ? new Date(conv.lastMessageAt).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : ""}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {conv.lastMessage || "No messages yet"}
                            </p>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="py-12 text-center text-xs text-slate-400">
                      No active support chats yet.
                    </div>
                  )
                ) : contactsLoading ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    Loading support contacts...
                  </div>
                ) : filteredContacts.length > 0 ? (
                  filteredContacts.map((contact, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectContact(contact)}
                      className="w-full p-3 flex items-center justify-between hover:bg-slate-100 transition text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-[#40798c] text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                          {contact.targetUser?.avatar ? (
                            <img
                              src={resolveAvatarUrl(contact.targetUser.avatar)}
                              alt={contact.targetUser.fullName || "User"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            contact.targetUser?.fullName?.charAt(0).toUpperCase() || "U"
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-xs">
                            {contact.targetUser?.fullName}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {contact.targetUser?.role === "admin"
                              ? "Super Administrator"
                              : contact.targetUser?.specialty || "Doctor"}
                          </div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-[#40798c] text-white text-[10px] font-bold rounded-lg">
                        Chat
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No contacts available.
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* CONVERSATION MESSAGES VIEW */
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messagesLoading ? (
                  <div className="py-10 text-center text-xs text-slate-400">
                    Loading messages...
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((msg) => {
                    const isOwn =
                      (msg.sender?._id || msg.sender)?.toString() ===
                      user?._id?.toString();

                    return (
                      <div
                        key={msg._id}
                        className={`flex flex-col ${
                          isOwn ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-2xl text-xs font-sans leading-relaxed ${
                            isOwn
                              ? "bg-[#1f363d] text-white rounded-br-none shadow-sm"
                              : "bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm"
                          }`}
                        >
                          <p>{msg.message}</p>
                        </div>
                        <span className="text-[9px] text-slate-400 mt-1 px-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-xs text-slate-400">
                    Start a live conversation with {otherParticipant?.fullName || "user"}.
                  </div>
                )}
                {isTyping && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 italic">
                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" />
                    <span>{otherParticipant?.fullName} is typing...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* INPUT BAR */}
              <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#40798c]"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || !isConnected}
                  className="p-2 bg-[#1f363d] hover:bg-[#40798c] disabled:opacity-50 text-white rounded-xl transition-colors shadow-sm"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
