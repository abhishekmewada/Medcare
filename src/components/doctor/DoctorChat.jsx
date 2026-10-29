import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  MessageSquare,
  X,
  Send,
  Minus,
  ArrowLeft,
  Circle,
  Search,
  Users,
  Calendar,
  CheckCheck,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchConversations,
  fetchConversation,
  fetchMessages,
  fetchContacts,
  fetchAdminDoctorContacts,
  getOrCreateConversation,
  sendMessage,
  addMessage,
  selectConversation,
  markMessageAsRead,
  markConversationAsRead,
} from "../../redux/slice/chatSlice";

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

// Helper to determine the other participant in a conversation
const getOtherParticipant = (conv, currentUserId) => {
  if (!conv) return null;
  const otherFromParticipants = conv.participants?.find(
    (p) => (p?._id || p)?.toString() !== currentUserId?.toString()
  );
  if (otherFromParticipants && typeof otherFromParticipants === "object") {
    return otherFromParticipants;
  }
  if (conv.patient && (conv.patient._id || conv.patient)?.toString() !== currentUserId?.toString()) {
    return conv.patient;
  }
  if (conv.doctor && (conv.doctor._id || conv.doctor)?.toString() !== currentUserId?.toString()) {
    return conv.doctor;
  }
  return null;
};

const DoctorChat = () => {
  const dispatch = useDispatch();

  const {
    conversations,
    contacts,
    adminContacts,
    contactsLoading,
    currentConversation,
    selectedConversationId,
    messages,
    messagesLoading,
  } = useSelector((state) => state.chat);

  const user = useSelector((state) => state.auth.user);

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState("chats"); // "chats" | "patients" | "colleagues"
  const [searchQuery, setSearchQuery] = useState("");

  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // ==========================================
  // SOCKET CONNECTION
  // ==========================================

  useEffect(() => {
    connectSocket();

    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  // ==========================================
  // FETCH CONVERSATIONS & ELIGIBLE PATIENTS
  // ==========================================

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    dispatch(fetchConversations());
    dispatch(fetchContacts());
    dispatch(fetchAdminDoctorContacts());
  }, [isOpen, dispatch]);

  // ==========================================
  // OPEN SELECTED CONVERSATION ROOM & MESSAGES
  // ==========================================

  useEffect(() => {
    if (!selectedConversationId) {
      return;
    }

    dispatch(fetchConversation(selectedConversationId));
    dispatch(fetchMessages(selectedConversationId));
    dispatch(markConversationAsRead(selectedConversationId));
    joinConversation(selectedConversationId);

    return () => {
      leaveConversation(selectedConversationId);
      setIsTyping(false);
    };
  }, [selectedConversationId, dispatch]);

  // ==========================================
  // REAL-TIME MESSAGE RECEIVE
  // ==========================================

  useEffect(() => {
    const handleNewMessage = (message) => {
      const messageConversationId =
        message?.conversation?._id?.toString() ||
        message?.conversation?.toString();

      const senderId =
        message?.sender?._id?.toString() ||
        message?.sender?.toString();

      const currentUserId = user?._id?.toString();
      const isOwnMessage = senderId === currentUserId;

      dispatch(addMessage(message));

      if (
        selectedConversationId &&
        messageConversationId === selectedConversationId.toString()
      ) {
        if (!isOwnMessage) {
          if (!isOpen || isMinimized) {
            setUnreadCount((prev) => prev + 1);
          } else {
            readChatMessage(message._id);
            dispatch(markMessageAsRead(message._id));
          }
        }
        setIsTyping(false);
      } else {
        if (!isOwnMessage) {
          setUnreadCount((prev) => prev + 1);
        }
      }
    };

    socket.on("chat:message", handleNewMessage);

    return () => {
      socket.off("chat:message", handleNewMessage);
    };
  }, [selectedConversationId, dispatch, isOpen, isMinimized, user?._id]);

  // ==========================================
  // TYPING INDICATOR
  // ==========================================

  useEffect(() => {
    if (!selectedConversationId) {
      return;
    }

    const handleTyping = (data) => {
      if (
        data?.conversationId?.toString() !== selectedConversationId?.toString()
      ) {
        return;
      }

      if (data?.userId?.toString() === user?._id?.toString()) {
        return;
      }

      setIsTyping(true);
    };

    const handleStopTyping = (data) => {
      if (
        data?.conversationId?.toString() !== selectedConversationId?.toString()
      ) {
        return;
      }

      setIsTyping(false);
    };

    socket.on("chat:typing", handleTyping);
    socket.on("chat:stopTyping", handleStopTyping);

    return () => {
      socket.off("chat:typing", handleTyping);
      socket.off("chat:stopTyping", handleStopTyping);
    };
  }, [selectedConversationId, user?._id]);

  // ==========================================
  // AUTO SCROLL
  // ==========================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  // ==========================================
  // FOCUS INPUT
  // ==========================================

  useEffect(() => {
    if (isOpen && !isMinimized && selectedConversationId) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isOpen, isMinimized, selectedConversationId]);

  // ==========================================
  // SEND MESSAGE
  // ==========================================

  const handleSend = useCallback(() => {
    const trimmed = input.trim();

    if (!trimmed || !selectedConversationId) {
      return;
    }

    if (currentConversation?.status === "closed") {
      return;
    }

    if (socket.connected) {
      sendChatMessage({
        conversationId: selectedConversationId,
        message: trimmed,
        messageType: "text",
        attachments: [],
      });
    } else {
      dispatch(
        sendMessage({
          conversationId: selectedConversationId,
          message: trimmed,
          messageType: "text",
          attachments: [],
        })
      );
    }

    setInput("");
    stopTyping(selectedConversationId);
  }, [input, selectedConversationId, currentConversation, dispatch]);

  // ==========================================
  // KEYBOARD ENTER HANDLING
  // ==========================================

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
      return;
    }

    if (!selectedConversationId) {
      return;
    }

    startTyping(selectedConversationId);

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(selectedConversationId);
    }, 1200);
  };

  // ==========================================
  // TIME FORMATTER
  // ==========================================

  const formatTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==========================================
  // SELECTION HANDLERS
  // ==========================================

  const handleSelectConversation = (conversation) => {
    dispatch(selectConversation(conversation._id));
    setIsOpen(true);
    setIsMinimized(false);
    setUnreadCount(0);
  };

  const handleSelectPatientContact = async (contact) => {
    try {
      const result = await dispatch(
        getOrCreateConversation({
          patientId: contact.patientId || contact.patient?._id,
          appointmentId: contact.appointment?._id,
        })
      ).unwrap();

      const convId = result?._id || result?.conversation?._id;
      if (convId) {
        dispatch(selectConversation(convId));
        setIsOpen(true);
        setIsMinimized(false);
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Failed to open conversation with patient:", err);
    }
  };

  const handleSelectColleagueContact = async (contact) => {
    try {
      const target = contact.targetUser;
      if (!target?._id) return;
      const convType = target.role === "admin" ? "doctor-admin" : "doctor-doctor";
      const result = await dispatch(
        getOrCreateConversation({
          targetUserId: target._id,
          conversationType: convType,
        })
      ).unwrap();

      const convId = result?._id || result?.conversation?._id;
      if (convId) {
        dispatch(selectConversation(convId));
        setIsOpen(true);
        setIsMinimized(false);
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Failed to open conversation with colleague/admin:", err);
    }
  };

  const handleBack = () => {
    dispatch(selectConversation(null));
    setIsTyping(false);
    setInput("");
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  // Filter conversations & contacts by search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((c) => {
      const other = getOtherParticipant(c, user?._id);
      return (
        other?.fullName?.toLowerCase().includes(q) ||
        other?.email?.toLowerCase().includes(q) ||
        c.patient?.fullName?.toLowerCase().includes(q)
      );
    });
  }, [conversations, searchQuery, user?._id]);

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    const q = searchQuery.toLowerCase();
    return contacts.filter(
      (c) =>
        c.patient?.fullName?.toLowerCase().includes(q) ||
        c.patient?.email?.toLowerCase().includes(q)
    );
  }, [contacts, searchQuery]);

  const filteredAdminContacts = useMemo(() => {
    if (!adminContacts) return [];
    if (!searchQuery.trim()) return adminContacts;
    const q = searchQuery.toLowerCase();
    return adminContacts.filter(
      (c) =>
        c.targetUser?.fullName?.toLowerCase().includes(q) ||
        c.targetUser?.email?.toLowerCase().includes(q)
    );
  }, [adminContacts, searchQuery]);

  const currentOtherUser = useMemo(() => {
    return getOtherParticipant(currentConversation, user?._id);
  }, [currentConversation, user?._id]);

  // Total unread count calculation
  const totalUnread =
    unreadCount +
    conversations.reduce(
      (sum, c) => sum + (c.unreadCount || 0),
      0
    );

  // ==========================================
  // FLOATING LAUNCHER BUTTON
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
        className="
          fixed
          bottom-6
          right-6
          z-40
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-full
          bg-[#0D9488]/60
          text-white
          shadow-xl
          shadow-blue-600/30
          transition-all
          duration-200
          hover:scale-105
          hover:bg-[#0D9488]
          active:scale-95
        "
        aria-label="Open Patient Chat"
      >
        <MessageSquare className="h-6 w-6" strokeWidth={2} />

        {totalUnread > 0 && (
          <span
            className="
              absolute
              -right-1
              -top-1
              flex
              h-5
              min-w-5
              items-center
              justify-center
              rounded-full
              bg-rose-600
              px-1
              text-[11px]
              font-bold
              text-white
              ring-2
              ring-white
            "
          >
            {totalUnread > 9 ? "9+" : totalUnread}
          </span>
        )}
      </button>
    );
  }

  // ==========================================
  // DOCTOR CHAT WIDGET
  // ==========================================

  return (
    <div
      className={`
        fixed
        bottom-6
        right-8
        z-100
        flex
        
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-2xl
        shadow-slate-900/15
        transition-all
        duration-200
        dark:border-slate-800
        dark:bg-slate-900
        ${
          isMinimized
            ? "h-19  md:w-60 w-55 "
            : "h-90 md:h-85 lg:h-90 lg:w-130 md:w-90 w-70 "
        }
      `}
    >
      {/* ======================================
          HEADER
      ====================================== */}

      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-4 py-3 text-white dark:border-slate-800">
        <div className="flex items-center gap-3 min-w-0">
          {selectedConversationId && (
            <button
              type="button"
              onClick={handleBack}
              className="rounded-lg p-1.5 text-slate-300 transition hover:bg-slate-800 hover:text-white"
              aria-label="Back to conversations"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}

          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-600 font-semibold text-sm text-white">
            {selectedConversationId ? (
              currentOtherUser?.avatar ? (
                <img
                  src={resolveAvatarUrl(currentOtherUser.avatar)}
                  alt={currentOtherUser.fullName || "User"}
                  className="h-full w-full object-cover"
                />
              ) : (
                (currentOtherUser?.fullName || "U")[0].toUpperCase()
              )
            ) : (
              <MessageSquare className="h-4 w-4" />
            )}

            <Circle
              className={`
                absolute
                -bottom-0.5
                -right-0.5
                h-3
                w-3
                rounded-full
                bg-slate-900
                ring-2
                ring-slate-900
                ${
                  isConnected
                    ? "fill-emerald-500 text-emerald-500"
                    : "fill-slate-400 text-slate-400"
                }
              `}
            />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight text-white">
              {selectedConversationId
                ? currentOtherUser?.fullName || "Conversation"
                : "Messages & Consultations"}
            </p>

            <p className="truncate text-[11.5px] leading-tight text-slate-300">
              {selectedConversationId
                ? isTyping
                  ? `${currentOtherUser?.fullName?.split(" ")[0] || "User"} is typing...`
                  : isConnected
                  ? currentOtherUser?.role === "admin"
                    ? "Support Administrator"
                    : currentOtherUser?.role === "doctor"
                    ? currentOtherUser?.specialty || "Doctor Colleague"
                    : "Patient"
                  : "Connecting..."
                : isConnected
                ? "Online"
                : "Connecting..."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsMinimized((val) => !val)}
            className="rounded-lg p-1.5 text-slate-300 transition hover:bg-slate-800 hover:text-white"
            aria-label="Minimize chat"
          >
            <Minus className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-slate-300 transition hover:bg-slate-800 hover:text-white"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* ====================================
              CONVERSATION LIST & PATIENTS VIEW
          ==================================== */}

          {!selectedConversationId ? (
            <div className="flex flex-1 flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
              {/* SEARCH BAR */}
              <div className="p-2.5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                <div className="relative flex items-center">
                  <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search patients..."
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 py-1.5 pl-8 pr-3 text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* TABS */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab("chats")}
                  className={`flex-1 pb-2.5 pt-2 text-xs font-semibold border-b-2 transition ${
                    activeTab === "chats"
                      ? "border-blue-600 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Active Chats ({conversations.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("patients")}
                  className={`flex-1 pb-2.5 pt-2 text-xs font-semibold border-b-2 transition ${
                    activeTab === "patients"
                      ? "border-blue-600 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Booked Patients ({contacts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("colleagues")}
                  className={`flex-1 pb-2.5 pt-2 text-xs font-semibold border-b-2 transition ${
                    activeTab === "colleagues"
                      ? "border-blue-600 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Colleagues & Admin ({adminContacts?.length || 0})
                </button>
              </div>

              {/* TAB CONTENT */}
              <div className="flex-1 overflow-y-auto">
                {activeTab === "chats" ? (
                  filteredConversations.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center px-6 text-center text-slate-400">
                      <Users
                        className="mb-3 h-9 w-9 text-slate-300"
                        strokeWidth={1.25}
                      />
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        No active conversations
                      </p>
                      <p className="mt-1 text-xs text-slate-400 max-w-[240px]">
                        Patients, doctor colleagues, and admin support will appear here once a conversation begins.
                      </p>
                      {contacts.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setActiveTab("patients")}
                          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-medium text-white shadow-sm hover:bg-blue-700 transition"
                        >
                          View Eligible Patients ({contacts.length})
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      {filteredConversations.map((conversation) => {
                        const other = getOtherParticipant(conversation, user?._id);
                        const unread = conversation.unreadCount || 0;

                        return (
                          <button
                            type="button"
                            key={conversation._id}
                            onClick={() =>
                              handleSelectConversation(conversation)
                            }
                            className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-blue-600 font-semibold text-sm">
                              {other?.avatar ? (
                                <img
                                  src={resolveAvatarUrl(other.avatar)}
                                  alt={other?.fullName || "User"}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                (other?.fullName || "U")[0].toUpperCase()
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                                  {other?.fullName || "User"}
                                </p>
                                {conversation.lastMessageAt && (
                                  <span className="shrink-0 text-[10px] text-slate-400">
                                    {formatTime(conversation.lastMessageAt)}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center justify-between gap-2 mt-0.5">
                                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                  {conversation.lastMessage || "No messages yet"}
                                </p>
                                {unread > 0 && (
                                  <span className="shrink-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                                    {unread > 9 ? "9+" : unread}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )
                ) : activeTab === "patients" ? (
                  /* BOOKED PATIENTS TAB */
                  contactsLoading ? (
                    <div className="flex h-full items-center justify-center text-xs text-slate-400">
                      Loading booked patients...
                    </div>
                  ) : filteredContacts.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center px-6 text-center text-slate-400">
                      <Calendar
                        className="mb-3 h-9 w-9 text-slate-300"
                        strokeWidth={1.25}
                      />
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        No booked patients found
                      </p>
                      <p className="mt-1 text-xs text-slate-400 max-w-[230px]">
                        Only patients with active booked appointments can be contacted.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      <div className="bg-slate-50 dark:bg-slate-800/40 px-4 py-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Patients with active booked appointments
                      </div>
                      {filteredContacts.map((contact) => (
                        <button
                          type="button"
                          key={contact.patientId || contact.patient?._id}
                          onClick={() => handleSelectPatientContact(contact)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-blue-600 font-semibold text-sm">
                            {contact.patient?.avatar ? (
                              <img
                                src={resolveAvatarUrl(contact.patient.avatar)}
                                alt={contact.patient.fullName || "Patient"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              (contact.patient?.fullName || "P")[0].toUpperCase()
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                              {contact.patient?.fullName || "Patient"}
                            </p>
                            {contact.appointment && (
                              <span className="mt-0.5 inline-block text-[11px] text-slate-500 dark:text-slate-400">
                                {contact.appointment.appointmentDate
                                  ? new Date(
                                      contact.appointment.appointmentDate
                                    ).toLocaleDateString(undefined, {
                                      month: "short",
                                      day: "numeric",
                                    })
                                  : "Appointment"}{" "}
                                • {contact.appointment.startTime || "Scheduled"}
                              </span>
                            )}
                          </div>

                          <span className="shrink-0 rounded-lg bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition">
                            Chat
                          </span>
                        </button>
                      ))}
                    </div>
                  )
                ) : (
                  /* COLLEAGUES & ADMIN TAB */
                  filteredAdminContacts.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center px-6 text-center text-slate-400">
                      <Users
                        className="mb-3 h-9 w-9 text-slate-300"
                        strokeWidth={1.25}
                      />
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        No colleagues or administrators found
                      </p>
                      <p className="mt-1 text-xs text-slate-400 max-w-[230px]">
                        Doctor colleagues and platform administrators will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      <div className="bg-slate-50 dark:bg-slate-800/40 px-4 py-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Doctor Colleagues & Admin Support
                      </div>
                      {filteredAdminContacts.map((contact, idx) => (
                        <button
                          type="button"
                          key={contact.targetUser?._id || idx}
                          onClick={() => handleSelectColleagueContact(contact)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-blue-600 font-semibold text-sm">
                            {contact.targetUser?.avatar ? (
                              <img
                                src={resolveAvatarUrl(contact.targetUser.avatar)}
                                alt={contact.targetUser.fullName || "User"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              (contact.targetUser?.fullName || "U")[0].toUpperCase()
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                              {contact.targetUser?.fullName || "User"}
                            </p>
                            <span className="mt-0.5 inline-block text-[11px] text-slate-500 dark:text-slate-400">
                              {contact.targetUser?.role === "admin"
                                ? "Support Administrator"
                                : contact.targetUser?.specialty || "Doctor Colleague"}
                            </span>
                          </div>

                          <span className="shrink-0 rounded-lg bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition">
                            Chat
                          </span>
                        </button>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>
          ) : (
            <>
              {/* ==================================
                  MESSAGES VIEW
              ================================== */}

              <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 dark:bg-slate-950 px-4 py-4">
                {messagesLoading ? (
                  <div className="flex h-full items-center justify-center text-xs text-slate-400">
                    Loading conversation...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center text-slate-400 gap-2">
                    <MessageSquare
                      className="h-8 w-8 text-slate-300"
                      strokeWidth={1.25}
                    />
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Start a consultation with this patient
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const senderId =
                      msg?.sender?._id?.toString() ||
                      msg?.sender?.toString();

                    const isOwnMessage =
                      senderId === user?._id?.toString();

                    return (
                      <div
                        key={msg._id}
                        className={`flex ${
                          isOwnMessage ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`
                            max-w-[78%]
                            rounded-2xl
                            px-3.5
                            py-2
                            text-[13.5px]
                            leading-relaxed
                            ${
                              isOwnMessage
                                ? "rounded-br-sm bg-blue-600 text-white shadow-sm"
                                : "rounded-bl-sm border border-slate-200 bg-white text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                            }
                          `}
                        >
                          <p>{msg.message}</p>

                          <div
                            className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                              isOwnMessage ? "text-blue-100" : "text-slate-400"
                            }`}
                          >
                            <span>{formatTime(msg.createdAt)}</span>
                            {isOwnMessage && (
                              <CheckCheck
                                className={`h-3.5 w-3.5 ${
                                  msg.isRead ? "text-white" : "text-blue-200"
                                }`}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-3.5 py-3 dark:border-slate-800 dark:bg-slate-900">
                      {[0, 1, 2].map((index) => (
                        <span
                          key={index}
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
                          style={{
                            animationDelay: `${index * 120}ms`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* ==================================
                  INPUT AREA
              ================================== */}

              <div className="flex items-end gap-2 border-t border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900 px-3 py-3">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message to patient..."
                  rows={1}
                  className="
                    max-h-24
                    flex-1
                    resize-none
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-3
                    py-2
                    text-[13.5px]
                    text-slate-700
                    placeholder:text-slate-400
                    focus:border-blue-500
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-100
                    dark:border-slate-700
                    dark:bg-slate-800
                    dark:text-slate-100
                    dark:focus:ring-blue-900/40
                  "
                />

                <button
                  type="button"
                  onClick={handleSend}
                  disabled={
                    !input.trim() ||
                    !selectedConversationId ||
                    !isConnected ||
                    currentConversation?.status === "closed"
                  }
                  className="
                    mb-0.5
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-600
                    text-white
                    transition
                    hover:bg-blue-700
                    disabled:cursor-not-allowed
                    disabled:bg-slate-200
                    disabled:text-slate-400
                    dark:disabled:bg-slate-800
                    dark:disabled:text-slate-600
                  "
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default DoctorChat;
