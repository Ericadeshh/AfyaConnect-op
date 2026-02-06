// convex/users.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get current logged-in user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});

// Set role & fullName after sign-up
export const completeUserProfile = mutation({
  args: {
    role: v.union(
      v.literal("patient"),
      v.literal("physician"),
      v.literal("admin"),
    ),
    fullName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db.get(userId);
    if (!existing) throw new Error("User document not found");

    if (existing.role) {
      console.log("[completeUserProfile] Role already set, skipping");
      return userId;
    }

    await ctx.db.patch(userId, {
      role: args.role,
      fullName: args.fullName,
      isActive: true,
    });

    console.log("[completeUserProfile] Role set to:", args.role);

    return userId;
  },
});

// Optional – keep if you use them elsewhere
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  },
});

export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    fullName: v.optional(v.string()),
    email: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    await ctx.db.patch(userId, updates);
    return await ctx.db.get(userId);
  },
});
