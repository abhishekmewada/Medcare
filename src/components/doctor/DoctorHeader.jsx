import { useState, useEffect } from "react";
import socket from "../../socket/socket";
import {
useDispatch,
useSelector,
} from "react-redux";
 import {
Bell,
Menu,
Moon,
Sun,
} from "lucide-react";

import {
setSidebarOpen,
toggleDarkMode,
} from "../../redux/slice/uiSlice";

import {
fetchNotifications,
addNotification
// markAsRead,
} from "../../redux/slice/notificationSlice";

const DoctorHeader = () => {
  
  const [ newNotification, setNewNotification ] = useState(null)
const dispatch = useDispatch();

// ==========================================
// REDUX STATE
// ==========================================

const user = useSelector(
(state) => state.auth.user
);

const darkMode = useSelector(
(state) => state.ui.darkMode
);

const {
loading: notificationsLoading,
notifications,
} = useSelector(
(state) => state.notification
);

// ==========================================
// LOCAL STATE
// ==========================================

const [notifOpen, setNotifOpen] =
useState(false);

// ==========================================
// FETCH NOTIFICATIONS
// ==========================================

useEffect(() => {
dispatch(fetchNotifications());
// setNotifOpen(false);
}, [dispatch]);

// ==========================================
// UNREAD COUNT
// ==========================================

const unreadCount =
notifications.filter(
(notification) =>
!notification.isRead
).length;

// ==========================================
// DOCTOR NAME
// ==========================================

const doctorName =
user?.fullName ||
user?.name ||
"Doctor";

// ==========================================
// MARK AS READ
// ==========================================

const handleNotificationClick = (
notification
) => {
if (!notification.isRead) {
dispatch(
// markAsRead(notification._id)
);
}
};


// --------------socket
 useEffect(() => {
  console.log("Doctor socket status:", socket.connected);

  const handleConnect = () => {
    console.log("DOCTOR SOCKET CONNECTED:", socket.id);
  };

  const handleConnectError = (error) => {
    console.error("DOCTOR SOCKET ERROR:", error.message);
  };

  socket.on("connect", handleConnect);
  socket.on("connect_error", handleConnectError);

  return () => {
    socket.off("connect", handleConnect);
    socket.off("connect_error", handleConnectError);
  };
}, []);

// sudden popup of sudden notification
useEffect(() => {
  const handleNotification = (notification) => {
    // dispatch(addNotification(notification));

    setNewNotification(notification);

    setTimeout(() => {
      setNewNotification(null);
    }, 100000);
  }
  socket.on("notification:new", handleNotification);
  return() => {
    socket.off("notification:new", handleNotification);
  }
},[])

// 2. Receive notification
 
useEffect(() => {
  const handleNotification = (notification) => {
    console.log(
      " DOCTOR NOTIFICATION RECEIVED:",
      notification
    );

    dispatch(addNotification(notification));
  };

  socket.on("notification:new", handleNotification);

  return () => {
    socket.off("notification:new", handleNotification);
  };
}, [dispatch]);

return ( <header
   className="
     sticky top-0 z-20
     flex h-16
     items-center
     justify-between
     rounded-2xl
     border border-gray-100
     bg-white/20
     px-6 py-4
     shadow-[0_8px_30px_rgba(0,0,0,0.06)]
     backdrop-blur-2xl
     dark:border-gray-800
   "
 >


  {/* ======================================
      LEFT
  ====================================== */}

  <div className="flex items-center gap-3">

    <button
      type="button"
      className="
        text-gray-500
        hover:text-gray-800
        dark:text-gray-400
        lg:hidden
      "
      onClick={() =>
        dispatch(setSidebarOpen(true))
      }
    >
      <Menu size={22} />
    </button>

    <div  >

      <p className="text-xs text-gray-400">
        Welcome back
      </p>

      <p className="
        text-sm
        font-bold
        text-gray-900
        dark:text-white
      ">
        Dr. {doctorName}
      </p>

    </div>

  </div>


  {/* ======================================
      RIGHT
  ====================================== */}

  <div className="flex items-center gap-2">


    {/* Dark mode */}

    <button
      type="button"
      onClick={() =>
        dispatch(toggleDarkMode())
      }
      className="
        rounded-full
        p-2
        text-gray-500
        hover:bg-gray-100
        dark:text-gray-400
        dark:hover:bg-gray-800
      "
      aria-label="Toggle dark mode"
    >

      {darkMode ? (
        <Sun size={19} />
      ) : (
        <Moon size={19} />
      )}

    </button>


    {/* ======================================
        NOTIFICATIONS
    ====================================== */}

    <div className="relative">

      <button
        type="button"
        onClick={() =>
          setNotifOpen(
            (prev) => !prev
          )
        }
        className="
          relative
          rounded-full
          p-2
          text-gray-500
          hover:bg-gray-100
          dark:text-gray-400
          dark:hover:bg-gray-800
        "
        aria-label="Notifications"
      >

        <Bell size={19} />


        {/* UNREAD BADGE */}

        {unreadCount > 0 && (

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
              bg-blue-500
              px-1
              text-[10px]
              font-bold
              text-white
              ring-2
              ring-white
              dark:ring-gray-950
            "
          >

            {unreadCount > 5
              ? "5+"
              : unreadCount}

          </span>

        )}

      </button>

{/* popup of sudden notify */}
{newNotification && (
  <div 
  data-aos="fade-left"
  className="absolute  right-0 top-full mt-3 w-60 z-50">
    <div className="rounded-xl border border-blue-500 bg-blue-50/50 backdrop-blur-md p-4 shadow-xl">
      {/* <p className="font-semibold text-gray-900">
        {newNotification.title}
      </p> */}

      <p className="mt-1 text-sm text-gray-600">
        {newNotification.message}
      </p>
    </div>
  </div>
)}

      {/* ====================================
          DROPDOWN
      ==================================== */}

      {notifOpen && (

        <>

          {/* Outside click */}

          <div
            className="
              fixed
              inset-0
              z-10
            "
            onClick={() =>
              setNotifOpen(false)
            }
          />


          {/* Notification dropdown */}

          <div
            className="
              absolute
              right-0
              z-20
              mt-2
              w-80
              overflow-hidden
              rounded-2xl
              border
              border-gray-100
              bg-white
              shadow-lg
              dark:border-gray-800
              dark:bg-gray-900
            "
          >


            {/* Header */}

            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-gray-100
                px-4
                py-3
                dark:border-gray-800
              "
            >

              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  text-gray-400
                "
              >
                Notifications
              </p>


              {unreadCount > 0 && (

                <span
                  className="
                    rounded-full
                    bg-blue-50
                    px-2
                    py-1
                    text-[10px]
                    font-semibold
                    text-blue-600
                    dark:bg-blue-500/10
                    dark:text-blue-400
                  "
                >
                  {unreadCount} unread
                </span>

              )}

            </div>


            {/* Notifications */}

            <div
              className="
                max-h-80
                overflow-y-auto
                p-2
              "
            >


              {/* Loading */}

              {notificationsLoading && (

                <p
                  className="
                    px-3
                    py-6
                    text-center
                    text-sm
                    text-gray-400
                  "
                >
                  Loading notifications...
                </p>

              )}


              {/* Empty */}

              {!notificationsLoading &&
                notifications.length === 0 && (

                <div
                  className="
                    px-3
                    py-10
                    text-center
                  "
                >

                  <Bell
                    size={28}
                    className="
                      mx-auto
                      mb-2
                      text-gray-300
                    "
                  />

                  <p
                    className="
                      text-sm
                      font-medium
                      text-gray-500
                    "
                  >
                    No notifications yet
                  </p>

                </div>

              )}


              {/* Notification list */}

              {!notificationsLoading &&
                notifications.map(
                  (notification) => (

                  <button
                    key={notification._id}
                    type="button"
                    onClick={() =>
                      handleNotificationClick(
                        notification
                      )
                    }
                    className={`
                      w-full
                      rounded-xl
                      px-3
                      py-3
                      text-left
                      transition
                      hover:bg-gray-50
                      dark:hover:bg-gray-800

                      ${
                        !notification.isRead
                          ? `
                            bg-blue-50/70
                            dark:bg-blue-500/5
                          `
                          : ""
                      }
                    `}
                  >

                    <div
                      className="
                        flex
                        items-start
                        gap-2
                      "
                    >


                      {/* Unread dot */}

                      {!notification.isRead && (

                        <span
                          className="
                            mt-2
                            h-2
                            w-2
                            shrink-0
                            rounded-full
                            bg-blue-500
                          "
                        />

                      )}


                      <div className="min-w-0">

                        <p
                          className="
                            text-sm
                            leading-5
                            text-gray-700
                            dark:text-gray-200
                          "
                        >
                          {notification.message}
                        </p>


                        <p
                          className="
                            mt-1
                            text-xs
                            text-gray-400
                          "
                        >

                          {new Date(
                            notification.createdAt
                          ).toLocaleString(
                            "en-IN",
                            {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }
                          )}

                        </p>

                      </div>

                    </div>

                  </button>

                )
              )}

            </div>

          </div>

        </>

      )}

    </div>

  </div>

</header>


);
};

export default DoctorHeader;
