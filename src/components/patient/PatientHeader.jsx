import { useEffect, useState } from "react";
import {
  Bell,
  Menu,
  Search,
  CheckCheck,
  X,
  Check,
  Trash2,
  Loader2,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { usePatientUI } from "../../context/PatientUIContext";
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  removeNotification,
} from "../../redux/slice/notificationSlice";

const PatientHeader = () => {
  const dispatch = useDispatch();
  const { openSidebar } = usePatientUI();
  const [showNotifications, setShowNotifications] = useState(false);

  const { notifications = [], loading: notificationsLoading } = useSelector(
    (state) => state.notification
  );
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const handleMarkAsRead = async (id) => {
    if (!id) return;
    try {
      await dispatch(markAsRead(id)).unwrap();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await dispatch(markAllAsRead()).unwrap();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const handleDeleteNotification = async (id) => {
    if (!id) return;
    try {
      await dispatch(removeNotification(id)).unwrap();
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const formatNotificationTime = (date) => {
    if (!date) return "";
    const notificationDate = new Date(date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return notificationDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#77af9c]/20 bg-white/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          <button
            onClick={openSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-[#d7fff1]/40 hover:text-[#285943] lg:hidden"
          >
            <Menu className="h-4.5 w-4.5" />
          </button>
          <div className="hidden md:flex">
            <div className="flex h-9 w-72 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-xs transition-colors focus-within:border-[#77af9c] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#77af9c]/15">
              <Search className="h-3.5 w-3.5 text-[#77af9c]" />
              <input
                type="text"
                placeholder="Search appointments, records..."
                className="w-full bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden text-right sm:block">
              <p className="text-xs font-bold text-slate-800">
                {user.fullName || user.name || "Patient"}
              </p>
              <p className="text-[11px] font-medium text-[#77af9c]">
                Patient Portal
              </p>
            </div>
          )}

          <div className="relative">
            <button
              onClick={() => setShowNotifications((prev) => !prev)}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:border-[#77af9c] hover:bg-[#d7fff1]/30 hover:text-[#285943]"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#285943] px-1 text-[9px] font-bold text-[#aafcb8] ring-2 ring-white tabular-nums">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 top-11 z-50 w-88 overflow-hidden rounded-2xl border border-[#77af9c]/20 bg-white shadow-xl shadow-slate-900/10">
                  <div className="flex items-center justify-between border-b border-slate-100 bg-[#d7fff1]/40 px-4 py-3">
                    <div>
                      <h3 className="text-sm font-bold text-[#285943]">
                        Notifications
                      </h3>
                      <p className="mt-0.5 text-xs text-[#77af9c]">
                        {unreadCount > 0
                          ? `${unreadCount} unread update${unreadCount > 1 ? "s" : ""}`
                          : "You're completely up to date"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          title="Mark all as read"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#285943] transition hover:bg-[#aafcb8]/50"
                        >
                          <CheckCheck className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {notificationsLoading ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-[#285943]" />
                        <p className="mt-3 text-xs text-slate-400">Loading notifications...</p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d7fff1] text-[#285943]">
                          <Bell className="h-5 w-5" />
                        </div>
                        <h4 className="mt-3 text-sm font-semibold text-slate-700">No new notices</h4>
                        <p className="mt-1 text-xs text-slate-400">All recent care updates are cleared.</p>
                      </div>
                    ) : (
                      <div>
                        {notifications.map((item) => (
                          <div
                            key={item._id}
                            className={`group relative border-b border-slate-100 px-4 py-3 transition hover:bg-[#d7fff1]/20 ${
                              !item.isRead ? "bg-[#d7fff1]/35" : "bg-white"
                            }`}
                          >
                            <div className="flex gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#d7fff1] text-[#285943]">
                                <Bell className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1 pr-5">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className={`text-xs ${!item.isRead ? "font-bold text-[#285943]" : "font-medium text-slate-700"}`}>
                                    {item.title}
                                  </h4>
                                  {!item.isRead && (
                                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#285943]" />
                                  )}
                                </div>
                                <p className="mt-0.5 text-xs text-slate-500">{item.message}</p>
                                <div className="mt-2 flex items-center justify-between">
                                  <span className="text-[10px] text-[#77af9c]">
                                    {formatNotificationTime(item.createdAt)}
                                  </span>
                                  <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                                    {!item.isRead && (
                                      <button
                                        onClick={() => handleMarkAsRead(item._id)}
                                        className="flex h-6 w-6 items-center justify-center rounded-md text-[#285943] hover:bg-[#aafcb8]/50"
                                      >
                                        <Check className="h-3 w-3" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleDeleteNotification(item._id)}
                                      className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default PatientHeader;