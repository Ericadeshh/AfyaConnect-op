// Notification management utilities

import { db } from "./db";

export interface NotificationAlert {
  id: string;
  userId: string;
  type: "booking" | "payment" | "overdue" | "rescheduled";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export function createNotification(
  userId: string,
  type: NotificationAlert["type"],
  title: string,
  message: string,
): NotificationAlert {
  const notification: NotificationAlert = {
    id: `notif-${Date.now()}`,
    userId,
    type,
    title,
    message,
    isRead: false,
    createdAt: new Date(),
  };

  db.notifications.set(notification.id, notification);
  return notification;
}

export function getUserNotifications(userId: string): NotificationAlert[] {
  const notifications: NotificationAlert[] = [];
  db.notifications.forEach((notif) => {
    if (notif.userId === userId) {
      notifications.push(notif);
    }
  });

  // Return newest first
  return notifications.sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
}

export function markAsRead(notificationId: string) {
  const notif = db.notifications.get(notificationId);
  if (notif) {
    notif.isRead = true;
    db.notifications.set(notificationId, notif);
  }
}

export function markAllAsRead(userId: string) {
  db.notifications.forEach((notif) => {
    if (notif.userId === userId) {
      notif.isRead = true;
    }
  });
}

export function getUnreadCount(userId: string): number {
  let count = 0;
  db.notifications.forEach((notif) => {
    if (notif.userId === userId && !notif.isRead) {
      count++;
    }
  });
  return count;
}
