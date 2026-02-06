import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Create a notification
export const createNotification = mutation({
  args: {
    userId: v.string(),
    type: v.union(
      v.literal("booking"),
      v.literal("payment"),
      v.literal("overdue"),
      v.literal("rescheduled"),
      v.literal("referral")
    ),
    title: v.string(),
    message: v.string(),
    metadata: v.optional(v.object({
      bookingId: v.optional(v.string()),
      referralId: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert("notifications", {
      ...args,
      isRead: false,
    });
    return notificationId;
  },
});

// Get notifications for user
export const getUserNotifications = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Get unread count for user
export const getUnreadCount = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => q.eq("userId", args.userId).eq("isRead", false))
      .collect();
    
    return unreadNotifications.length;
  },
});

// Mark notification as read
export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, { isRead: true });
  },
});

// Mark all notifications as read for user
export const markAllAsRead = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => q.eq("userId", args.userId).eq("isRead", false))
      .collect();
    
    for (const notification of unreadNotifications) {
      await ctx.db.patch(notification._id, { isRead: true });
    }
    
    return unreadNotifications.length;
  },
});
