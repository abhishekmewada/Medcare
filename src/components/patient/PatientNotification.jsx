import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CalendarCheck,
  CalendarClock,
  CalendarPlus,
  CalendarX,
  CircleAlert,
  CircleDollarSign,
  Clock3,
  FileText,
   Pill,
  RotateCcw,
  Star,
  Trash2,
  X,
} from "lucide-react";

import socket from "../../socket/socket";

import {
  addNotification,
  markAsRead,
  markAllAsRead,
  fetchNotifications,
  removeNotification,
} from "../../redux/slice/notificationSlice";

const PatientNotification = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const notifications = useSelector(
    (state) => state.notification.notifications
  );

  const loading = useSelector(
    (state) => state.notification.loading
  );

  const [isOpen, setIsOpen] = useState(false);

  const notificationRef = useRef(null);

  // ==========================================
  // UNREAD COUNT
  // ==========================================

  const unreadCount = useMemo(() => {
    return notifications.filter(
      (notification) => !notification.isRead
    ).length;
  }, [notifications]);

  // ==========================================
  // REAL-TIME SOCKET NOTIFICATION
  // ==========================================

  useEffect(() => {
    const handleNewNotification = (notification) => {
      dispatch(addNotification(notification));
    };

    socket.on(
      "notification:new",
      handleNewNotification
    );

    return () => {
      socket.off(
        "notification:new",
        handleNewNotification
      );
    };
  }, [dispatch]);

  useEffect(() => {
  dispatch(fetchNotifications({ limit: 10 }))
    .unwrap()
    .then((data) => {
      console.log("PATIENT NOTIFICATIONS:", data);
    })
    .catch((error) => {
      console.error("NOTIFICATION ERROR:", error);
    });
}, [dispatch]);

  // ==========================================
  // CLOSE ON OUTSIDE CLICK
  // ==========================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ==========================================
  // NOTIFICATION ICON
  // ==========================================

  const getNotificationIcon = (type) => {
    switch (type) {
      case "appointment_booked":
        return <CalendarPlus size={18} />;

      case "appointment_confirmed":
        return <CalendarCheck size={18} />;

      case "appointment_cancelled":
        return <CalendarX size={18} />;

      case "appointment_reminder":
        return <CalendarClock size={18} />;

      case "payment_success":
        return <CircleDollarSign size={18} />;

      case "payment_failed":
        return <CircleAlert size={18} />;

      case "payment_refunded":
        return <RotateCcw size={18} />;

      case "prescription_created":
        return <Pill size={18} />;

      case "report_available":
        return <FileText size={18} />;

      case "review_received":
      case "review_reply":
        return <Star size={18} />;

      case "system":
      default:
        return <Bell size={18} />;
    }
  };

  // ==========================================
  // ICON STYLE
  // ==========================================

  const getIconStyle = (type) => {
    switch (type) {
      case "appointment_booked":
      case "appointment_confirmed":
        return "bg-emerald-50 text-emerald-600";

      case "appointment_cancelled":
        return "bg-red-50 text-red-600";

      case "appointment_reminder":
        return "bg-amber-50 text-amber-600";

      case "payment_success":
        return "bg-emerald-50 text-emerald-600";

      case "payment_failed":
        return "bg-red-50 text-red-600";

      case "payment_refunded":
        return "bg-blue-50 text-blue-600";

      case "prescription_created":
        return "bg-purple-50 text-purple-600";

      case "report_available":
        return "bg-cyan-50 text-cyan-600";

      case "review_received":
      case "review_reply":
        return "bg-yellow-50 text-yellow-600";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  // ==========================================
  // TIME FORMAT
  // ==========================================

  const formatTime = (date) => {
    if (!date) return "";

    const createdAt = new Date(date);
    const now = new Date();

    const diff = Math.floor(
      (now.getTime() - createdAt.getTime()) / 1000
    );

    if (diff < 60) {
      return "Just now";
    }

    const minutes = Math.floor(diff / 60);

    if (minutes < 60) {
      return `${minutes} ${
        minutes === 1 ? "minute" : "minutes"
      } ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours} ${
        hours === 1 ? "hour" : "hours"
      } ago`;
    }

    const days = Math.floor(hours / 24);

    if (days === 1) {
      return "Yesterday";
    }

    if (days < 7) {
      return `${days} days ago`;
    }

    return createdAt.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // ==========================================
  // NOTIFICATION CLICK
  // ==========================================

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      dispatch(markAsRead(notification._id));
    }

    // ========================================
    // PATIENT ROUTES
    // ========================================

    switch (notification.type) {
      case "appointment_booked":
      case "appointment_confirmed":
      case "appointment_cancelled":
      case "appointment_reminder":
        navigate("/patient/appointments");
        break;

      case "prescription_created":
        navigate("/patient/prescriptions");
        break;

      case "report_available":
        navigate("/patient/medical-records");
        break;

      case "payment_success":
      case "payment_failed":
      case "payment_refunded":
        navigate("/patient/appointments");
        break;

      case "review_received":
      case "review_reply":
        navigate("/patient/overview");
        break;

      default:
        break;
    }

    setIsOpen(false);
  };

  // ==========================================
  // MARK ALL READ
  // ==========================================

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) return;

    dispatch(markAllAsRead());
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = (event, id) => {
    event.stopPropagation();

    dispatch(removeNotification(id));
  };

  return (
    <div
      ref={notificationRef}
      className="relative"
    >
      {/* ======================================
          NOTIFICATION BUTTON
      ====================================== */}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="
          relative
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-xl
          border
          border-slate-200
          bg-white
          text-slate-600
          transition-all
          duration-200
          hover:border-cyan-200
          hover:bg-cyan-50
          hover:text-cyan-600
          active:scale-95
        "
        aria-label="Notifications"
      >
        <Bell size={20} />

        {unreadCount > 0 && (
          <span
            className="
              absolute
              -right-1
              -top-1
              flex
              min-h-5
              min-w-5
              items-center
              justify-center
              rounded-full
              bg-red-500
              px-1
              text-[10px]
              font-bold
              text-white
              ring-2
              ring-white
            "
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* ======================================
          NOTIFICATION PANEL
      ====================================== */}

      {isOpen && (
        <div
          className="
            absolute
            text-center
            left-1/2
            top-18
             -translate-x-1/2
            top-[calc(100%+12px)]
            z-50
            w-95
            max-w-[calc(100vw-24px)]
            overflow-hidden 
            rounded-2xl
            bg-white
            shadow-[0_20px_60px_rgba(15,23,42,0.15)]
          "
        >
          {/* HEADER */}

          <div
            className="
              flex
              items-center
              justify-between
              border-b
              border-slate-100
              px-5
              py-4
            "
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-900">
                  Notifications
                </h3>

                {unreadCount > 0 && (
                  <span
                    className="
                      rounded-full
                      bg-cyan-50
                      px-2
                      py-0.5
                      text-[11px]
                      font-semibold
                      text-cyan-600
                    "
                  >
                    {unreadCount} new
                  </span>
                )}
              </div>

              <p className="mt-0.5 text-xs text-slate-400">
                Stay updated with your health activities
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="
                  text-xs
                  font-medium
                  text-cyan-600
                  transition-colors
                  hover:text-cyan-700
                "
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* BODY */}

          <div className="max-h-120 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center px-6 py-12">
                <div
                  className="
                    h-8
                    w-8
                    animate-spin
                    rounded-full
                    border-2
                    border-slate-200
                    border-t-cyan-500
                  "
                />

                <p className="mt-3 text-sm text-slate-400">
                  Loading notifications...
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                <div
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-slate-50
                    text-slate-400
                  "
                >
                  <Bell size={24} />
                </div>

                <h4 className="mt-4 text-sm font-semibold text-slate-800">
                  No notifications
                </h4>

                <p className="mt-1 max-w-60 text-xs leading-5 text-slate-400">
                  You're all caught up. New updates will appear here.
                </p>
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() =>
                      handleNotificationClick(notification)
                    }
                    className={`
                      group
                      relative
                      flex
                      cursor-pointer
                      gap-3
                      border-b
                      border-slate-100
                      px-5
                      py-4
                      transition-colors
                      hover:bg-slate-50
                      ${
                        !notification.isRead
                          ? "bg-cyan-50/40"
                          : "bg-white"
                      }
                    `}
                  >
                    {/* UNREAD DOT */}

                    {!notification.isRead && (
                      <span
                        className="
                          absolute
                          left-1.5
                          top-5
                          h-1.5
                          w-1.5
                          rounded-full
                          bg-cyan-500
                        "
                      />
                    )}

                    {/* ICON */}

                    <div
                      className={`
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        ${getIconStyle(
                          notification.type
                        )}
                      `}
                    >
                      {getNotificationIcon(
                        notification.type
                      )}
                    </div>

                    {/* CONTENT */}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          className={`
                            pr-5
                            text-sm
                            leading-5
                            ${
                              notification.isRead
                                ? "font-medium text-slate-700"
                                : "font-semibold text-slate-900"
                            }
                          `}
                        >
                          {notification.title}
                        </h4>

                        <button
                          type="button"
                          onClick={(event) =>
                            handleDelete(
                              event,
                              notification._id
                            )
                          }
                          className="
                            shrink-0
                            rounded-md
                            p-1
                            text-slate-300
                            opacity-0
                            transition-all
                            hover:bg-red-50
                            hover:text-red-500
                            group-hover:opacity-100
                          "
                          aria-label="Delete notification"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                        {notification.message}
                      </p>

                      <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock3 size={11} />

                        <span>
                          {formatTime(
                            notification.createdAt
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FOOTER */}

          {notifications.length > 0 && (
            <div className="border-t border-slate-100 px-5 py-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  text-xs
                  font-medium
                  text-slate-500
                  transition-colors
                  hover:text-cyan-600
                "
              >
                <X size={14} />
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientNotification;