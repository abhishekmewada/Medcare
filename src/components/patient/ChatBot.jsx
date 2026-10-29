
import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

import {
  MessageCircle,
  X,
  Send,
  Minus,
  Paperclip,
  Circle,
  ArrowLeft,
   Calendar,
  Plus,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";

import {
  fetchConversations,
  fetchConversation,
  fetchMessages,
  fetchContacts,
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

// Helper to resolve the doctor participant in patient chat
const getDoctorParticipant = (conv, currentUserId) => {
  if (!conv) return null;
  if (conv.doctor && typeof conv.doctor === "object") return conv.doctor;
  const otherFromParticipants = conv.participants?.find(
    (p) => (p?._id || p)?.toString() !== currentUserId?.toString()
  );
  if (otherFromParticipants && typeof otherFromParticipants === "object") {
    return otherFromParticipants;
  }
  return conv.doctor || null;
};

const ChatBot = () => {
  const dispatch = useDispatch();

  const {
    conversations,
    contacts,
    contactsLoading,
    currentConversation,
    selectedConversationId,
    messages,
    messagesLoading,
  } = useSelector((state) => state.chat);

  const user = useSelector(
    (state) => state.auth.user
  );

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] =
    useState(false);
  const [activeTab, setActiveTab] =
    useState("chats"); // "chats" | "doctors"

  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] =
    useState(socket.connected);

  const [isTyping, setIsTyping] =
    useState(false);

  const [unreadCount, setUnreadCount] =
    useState(0);

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
  // FETCH CONVERSATIONS & CONTACTS
  // ==========================================

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    dispatch(fetchConversations());
    dispatch(fetchContacts());
  }, [isOpen, dispatch]);

  // ==========================================
  // OPEN SELECTED CONVERSATION
  // ==========================================

  useEffect(() => {
    if (!selectedConversationId) {
      return;
    }

    dispatch(
      fetchConversation(
        selectedConversationId
      )
    );

    dispatch(
      fetchMessages(
        selectedConversationId
      )
    );

    dispatch(
      markConversationAsRead(
        selectedConversationId
      )
    );

    joinConversation(
      selectedConversationId
    );

    return () => {
      leaveConversation(
        selectedConversationId
      );

      setIsTyping(false);
    };
  }, [
    selectedConversationId,
    dispatch,
  ]);

  // ==========================================
  // RECEIVE NEW MESSAGE
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

      const isOwnMessage =
        senderId === currentUserId;

      dispatch(addMessage(message));

      if (
        selectedConversationId &&
        messageConversationId ===
          selectedConversationId.toString()
      ) {
        if (!isOwnMessage) {
          if (!isOpen || isMinimized) {
            setUnreadCount(
              (prev) => prev + 1
            );
          } else {
            readChatMessage(message._id);

            dispatch(
              markMessageAsRead(
                message._id
              )
            );
          }
        }

        setIsTyping(false);
      } else {
        if (!isOwnMessage) {
          setUnreadCount(
            (prev) => prev + 1
          );
        }
      }
    };

    socket.on(
      "chat:message",
      handleNewMessage
    );

    return () => {
      socket.off(
        "chat:message",
        handleNewMessage
      );
    };
  }, [
    selectedConversationId,
    dispatch,
    isOpen,
    isMinimized,
    user?._id,
  ]);

  // ==========================================
  // TYPING
  // ==========================================

  useEffect(() => {
    if (!selectedConversationId) {
      return;
    }

    const handleTyping = (data) => {
      if (
        data?.conversationId?.toString() !==
        selectedConversationId?.toString()
      ) {
        return;
      }

      if (
        data?.userId?.toString() ===
        user?._id?.toString()
      ) {
        return;
      }

      setIsTyping(true);
    };

    const handleStopTyping = (data) => {
      if (
        data?.conversationId?.toString() !==
        selectedConversationId?.toString()
      ) {
        return;
      }

      setIsTyping(false);
    };

    socket.on(
      "chat:typing",
      handleTyping
    );

    socket.on(
      "chat:stopTyping",
      handleStopTyping
    );

    return () => {
      socket.off(
        "chat:typing",
        handleTyping
      );

      socket.off(
        "chat:stopTyping",
        handleStopTyping
      );
    };
  }, [
    selectedConversationId,
    user?._id,
  ]);

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
    if (isOpen && !isMinimized) {
 
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isOpen, isMinimized]);

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
  // KEYBOARD
  // ==========================================

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      handleSend();

      return;
    }

    if (!selectedConversationId) {
      return;
    }

    startTyping(
      selectedConversationId
    );

    clearTimeout(
      typingTimeoutRef.current
    );

    typingTimeoutRef.current =
      setTimeout(() => {
        stopTyping(
          selectedConversationId
        );
      }, 1000);
  };

  // ==========================================
  // FORMAT TIME
  // ==========================================

  const formatTime = (date) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // ==========================================
  // GET SENDER ID
  // ==========================================

  const getSenderId = (message) => {
    return (
      message?.sender?._id ||
      message?.sender
    );
  };

  // ==========================================
  // SELECT CONVERSATION
  // ==========================================

  const handleSelectConversation = (
    conversation
  ) => {
    dispatch(
      selectConversation(
        conversation._id
      )
    );

    setIsOpen(true);
    setIsMinimized(false);
    setUnreadCount(0);
  };

  // ==========================================
  // SELECT CONTACT (DOCTOR)
  // ==========================================

  const handleSelectContact = async (contact) => {
    try {
      const result = await dispatch(
        getOrCreateConversation({
          doctorId: contact.doctorId || contact.doctor?._id,
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
      console.error("Failed to start conversation:", err);
    }
  };

  // ==========================================
  // BACK TO CONVERSATIONS
  // ==========================================

  const handleBack = () => {
    dispatch(selectConversation(null));

    setIsTyping(false);
    setInput("");
  };

  // ==========================================
  // CLOSE CHAT
  // ==========================================

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const totalUnread =
    unreadCount +
    conversations.reduce(
      (sum, c) => sum + (c.unreadCount || 0),
      0
    );

  const currentDoctor = getDoctorParticipant(currentConversation, user?._id);

  // ==========================================
  // FLOATING BUTTON
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
          z-100
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-full
          bg-slate-900/60
          text-white
          shadow-xl
          shadow-slate-900/20
          transition
          duration-200 
          hover:scale-105
          hover:bg-slate-800
          active:scale-95 
        "
        aria-label="Open chat"
      >
        <MessageCircle
          className="h-6 w-6"
          strokeWidth={1.8}
        />

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
              font-semibold
              text-white
              ring-2
              ring-white
            "
          >
            {totalUnread > 9
              ? "9+"
              : totalUnread}
          </span>
        )}
      </button>
    );
  }

  // ==========================================
  // CHAT WIDGET
  // ==========================================

  return (
    <div  
      className={`
        fixed
        bottom-6
        right-6
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
        ${
          isMinimized
            ? "h-19  md:w-60 w-55 "
            : "h-90 md:h-85 lg:h-90 lg:w-130 md:w-90 w-60  "
        }
      `}
    >
      {/* ======================================
          HEADER
      ====================================== */}

      <div
        className="
          flex 
          items-center
          justify-between
          border-b
          border-slate-100
          bg-slate-900
          px-4
          py-3.5
          
        "
      >
        <div className="flex items-center gap-3">
          {selectedConversationId && (
            <button
              type="button"
              onClick={handleBack}
              className="
                rounded-md
                p-1.5
                text-slate-300
                transition
                hover:bg-slate-800
                hover:text-white
              "
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}

          <div
            className="
              relative
              flex
              h-9
              w-9
              items-center
              justify-center
              overflow-hidden
              rounded-full
              bg-slate-700
              text-white
            "
          >
            {currentDoctor?.avatar ? (
              <img
                src={resolveAvatarUrl(currentDoctor.avatar)}
                alt={currentDoctor.fullName || "Doctor"}
                className="h-full w-full object-cover"
              />
            ) : (
              <MessageCircle className="h-4 w-4" />
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

          <div>
            <p
              className="
                text-[15px]
                font-semibold
                leading-tight
                text-white
              "
            >
              {selectedConversationId
                ? currentDoctor?.fullName || "Doctor"
                : "Messages"}
            </p>

            <p
              className="
                text-[11.5px]
                leading-tight
                text-slate-300
              "
            >
              {selectedConversationId
                ? isTyping
                  ? `${currentDoctor?.fullName?.split(" ")[0] || "Doctor"} is typing...`
                  : isConnected
                  ? currentDoctor?.specialty || "Online"
                  : "Connecting..."
                : `${conversations.length} ${
                    conversations.length ===
                    1
                      ? "conversation"
                      : "conversations"
                  }`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() =>
              setIsMinimized(
                (value) => !value
              )
            }
            className="
              rounded-md
              p-1.5
              text-slate-300
              transition
              hover:bg-slate-800
              hover:text-white
            "
            aria-label="Minimize chat"
          >
            <Minus className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="
              rounded-md
              p-1.5
              text-slate-300
              transition
              hover:bg-slate-800
              hover:text-white
            "
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* ====================================
              CONVERSATION LIST & DOCTORS TABS
          ==================================== */}

          {!selectedConversationId ? (
            <div className="flex flex-1 flex-col overflow-hidden bg-slate-50">
              {/* TAB SWITCHER */}
              <div className="flex border-b border-slate-200  bg-white px-2 pt-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab("chats")}
                  className={`flex-1 pb-2.5 pt-1 text-xs font-semibold border-b-2 transition  ${
                    activeTab === "chats"
                      ? "border-slate-900 text-slate-900"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Chats ({conversations.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("doctors")}
                  className={`flex-1 pb-2.5 pt-1 text-xs font-semibold border-b-2 transition  ${
                    activeTab === "doctors"
                      ? "border-slate-900 text-slate-900"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Booked Doctors ({contacts.length})
                </button>
              </div>

              {/* TAB CONTENT */}
              <div className="flex-1 overflow-y-auto">
                {activeTab === "chats" ? (
                  conversations.length === 0 ? (
                    <div
                      className="
                        flex
                        h-full
                        flex-col
                        items-center
                        justify-center
                        px-6
                        text-center
                        text-slate-400
                      "
                    >
                      <MessageCircle
                        className="mb-3 h-9 w-9 text-slate-300"
                        strokeWidth={1.25}
                      />

                      <p className="text-sm font-semibold text-slate-700">
                        No conversations yet
                      </p>

                      <p className="mt-1 text-xs text-slate-400 max-w-55">
                        Start chatting with any doctor from your booked appointments.
                      </p>

                      {contacts.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setActiveTab("doctors")}
                          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-medium text-white shadow-sm hover:bg-slate-800 transition"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Choose a Doctor ({contacts.length})
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 bg-white">
                      {conversations.map((conversation) => {
                        const doctor = getDoctorParticipant(conversation, user?._id);
                        const unread = conversation.unreadCount || 0;

                        return (
                          <button
                            type="button"
                            key={conversation._id}
                            onClick={() =>
                              handleSelectConversation(conversation)
                            }
                            className="
                              flex
                              w-full
                              items-center
                              gap-3
                              px-4
                              py-3.5
                              text-left
                              transition
                              hover:bg-slate-50
                            "
                          >
                            <div
                              className="
                                flex
                                h-10
                                w-10
                                shrink-0
                                items-center
                                justify-center
                                overflow-hidden
                                rounded-full
                                bg-slate-100
                                text-slate-500
                              "
                            >
                              {doctor?.avatar ? (
                                <img
                                  src={resolveAvatarUrl(doctor.avatar)}
                                  alt={doctor.fullName || "Doctor"}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <MessageCircle className="h-5 w-5" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="truncate text-sm font-semibold text-slate-800">
                                  {doctor?.fullName || "Doctor"}
                                </p>

                                {conversation.lastMessageAt && (
                                  <span className="shrink-0 text-[10px] text-slate-400">
                                    {formatTime(conversation.lastMessageAt)}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center justify-between gap-2 mt-0.5">
                                <p className="truncate text-xs text-slate-500">
                                  {conversation.lastMessage || "Start conversation"}
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
                ) : (
                  /* ELIGIBLE DOCTORS TAB */
                  contactsLoading ? (
                    <div className="flex h-full items-center justify-center text-xs text-slate-400">
                      Loading eligible doctors...
                    </div>
                  ) : contacts.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center px-6 text-center text-slate-400">
                      <Calendar
                        className="mb-3 h-9 w-9 text-slate-300"
                        strokeWidth={1.25}
                      />
                      <p className="text-sm font-semibold text-slate-700">
                        No booked doctors found
                      </p>
                      <p className="mt-1 text-xs text-slate-400 max-w-55">
                        You can chat with doctors once you have booked an appointment with them.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 bg-white">
                      <div className="bg-slate-50 px-4 py-2 text-[11px] font-medium text-slate-500">
                        Doctors with your booked appointments
                      </div>
                      {contacts.map((contact) => (
                        <button
                          type="button"
                          key={contact.doctorId || contact.doctor?._id}
                          onClick={() => handleSelectContact(contact)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-blue-600 font-semibold text-sm">
                            {contact.doctor?.avatar ? (
                              <img
                                src={resolveAvatarUrl(contact.doctor.avatar)}
                                alt={contact.doctor.fullName || "Doctor"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              (contact.doctor?.fullName || "Dr")[0]
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {contact.doctor?.fullName || "Doctor"}
                            </p>
                            <p className="truncate text-xs font-medium text-blue-600">
                              {contact.doctor?.specialty || "Specialist"}
                            </p>
                            {contact.appointment && (
                              <span className="mt-0.5 inline-block text-[10.5px] text-slate-400">
                                {contact.appointment.appointmentDate
                                  ? new Date(
                                      contact.appointment.appointmentDate
                                    ).toLocaleDateString(undefined, {
                                      month: "short",
                                      day: "numeric",
                                    })
                                  : "Appointment"}{" "}
                                • {contact.appointment.startTime || "Booked"}
                              </span>
                            )}
                          </div>

                          <span className="shrink-0 rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-white shadow-sm hover:bg-slate-800 transition">
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
                  MESSAGES
              ================================== */}

              <div
                className="
                  flex-1
                  space-y-3
                  overflow-y-auto
                  bg-slate-50
                  px-4
                  py-4
                "
              >
                {messagesLoading ? (
                  <div
                    className="
                      flex
                      h-full
                      items-center
                      justify-center
                      text-sm
                      text-slate-400
                    "
                  >
                    Loading messages...
                  </div>
                ) : messages.length ===
                  0 ? (
                  <div
                    className="
                      flex
                      h-full
                      flex-col
                      items-center
                      justify-center
                      gap-2
                      text-center
                      text-slate-400
                    "
                  >
                    <MessageCircle
                      className="h-8 w-8"
                      strokeWidth={1.25}
                    />

                    <p className="text-sm">
                      Start a conversation
                      with your doctor
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const senderId =
                      getSenderId(msg);

                    const isOwnMessage =
                      senderId?.toString() ===
                      user?._id?.toString();

                    return (
                      <div
                        key={msg._id}
                        className={`flex ${
                          isOwnMessage
                            ? "justify-end"
                            : "justify-start"
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
                                ? "rounded-br-sm bg-slate-900 text-white"
                                : "rounded-bl-sm border border-slate-200 bg-white text-slate-700"
                            }
                          `}
                        >
                          <p>
                            {msg.message}
                          </p>

                          <p
                            className="
                              mt-1
                              text-right
                              text-[10px]
                              text-slate-400
                            "
                          >
                            {formatTime(
                              msg.createdAt
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}

                {isTyping && (
                  <div className="flex justify-start">
                    <div
                      className="
                        flex
                        items-center
                        gap-1
                        rounded-2xl
                        rounded-bl-sm
                        border
                        border-slate-200
                        bg-white
                        px-3.5
                        py-3
                      "
                    >
                      {[0, 1, 2].map(
                        (index) => (
                          <span
                            key={index}
                            className="
                              h-1.5
                              w-1.5
                              animate-bounce
                              rounded-full
                              bg-slate-400
                            "
                            style={{
                              animationDelay: `${
                                index * 120
                              }ms`,
                            }}
                          />
                        )
                      )}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* ==================================
                  INPUT
              ================================== */}

              <div
                className="
                  flex
                  items-end
                  gap-2
                  border-t
                  border-slate-100
                  bg-white
                  px-3
                  py-3
                "
              >
                <button
                  type="button"
                  disabled
                  className="
                    mb-1.5
                    cursor-not-allowed
                    rounded-md
                    p-1.5
                    text-slate-300
                  "
                  aria-label="Attach file"
                >
                  <Paperclip className="h-4 w-4" />
                </button>

                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(event) =>
                    setInput(
                      event.target.value
                    )
                  }
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
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
                    focus:border-slate-400
                    focus:outline-none
                    focus:ring-2
                    focus:ring-slate-200
                  "
                />

                <button
                  type="button"
                  onClick={handleSend}
                  disabled={
                    !input.trim() ||
                    !selectedConversationId ||
                    currentConversation?.status ===
                      "closed"
                  }
                  className="
                    mb-0.5
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-slate-900
                    text-white
                    transition
                    hover:bg-slate-800
                    disabled:cursor-not-allowed
                    disabled:bg-slate-200
                    disabled:text-slate-400
                  "
                  aria-label="Send message"
                >
                  <Send
                    className="h-4 w-4"
                    strokeWidth={2}
                  />
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ChatBot;
