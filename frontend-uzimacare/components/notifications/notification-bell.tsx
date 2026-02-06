"use client";

import { useState, useEffect } from "react";
import {
  getUserNotifications,
  markAsRead,
  getUnreadCount,
} from "../../lib/notifications";

interface NotificationBellProps {
  userId: string;
}

export default function NotificationBell({ userId }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const notifs = getUserNotifications(userId);
    setNotifications(notifs);
    setUnreadCount(getUnreadCount(userId));

    // Refresh every 10 seconds
    const interval = setInterval(() => {
      const updated = getUserNotifications(userId);
      setNotifications(updated);
      setUnreadCount(getUnreadCount(userId));
    }, 10000);

    return () => clearInterval(interval);
  }, [userId]);

  const handleNotificationClick = (notifId: string) => {
    markAsRead(notifId);
    const updated = getUserNotifications(userId);
    setNotifications(updated);
    setUnreadCount(getUnreadCount(userId));
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "payment":
        return "text-success";
      case "booking":
        return "text-accent";
      case "overdue":
        return "text-error";
      case "rescheduled":
        return "text-warning";
      default:
        return "text-primary";
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-surface rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <svg
          className="w-6 h-6 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-error text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-border rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-primary">Notifications</h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-text-secondary">
                No notifications
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif.id)}
                  className={`p-4 border-b border-border cursor-pointer hover:bg-surface transition-colors ${
                    !notif.isRead ? "bg-primary bg-opacity-5" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 ${getIconColor(notif.type)}`}>
                      {notif.type === "payment" && (
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                      )}
                      {notif.type === "booking" && (
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
                        </svg>
                      )}
                      {notif.type === "overdue" && (
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-text">
                        {notif.title}
                      </p>
                      <p className="text-xs text-text-secondary mt-1">
                        {notif.message}
                      </p>
                      <p className="text-xs text-text-muted mt-2">
                        {new Date(notif.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
