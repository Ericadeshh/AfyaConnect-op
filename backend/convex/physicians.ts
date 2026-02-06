import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Create physician profile
export const createPhysician = mutation({
  args: {
    userId: v.id("users"),
    licenseId: v.string(),
    hospital: v.string(),
    specialization: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const physicianId = await ctx.db.insert("physicians", {
      ...args,
      isVerified: true, // Auto-verify for demo
    });
    return physicianId;
  },
});

// Get physician by user ID
export const getPhysicianByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("physicians")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

// Get physician by license ID
export const getPhysicianByLicense = query({
  args: { licenseId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("physicians")
      .withIndex("by_license", (q) => q.eq("licenseId", args.licenseId))
      .unique();
  },
});

// Get all physicians
export const getAllPhysicians = query({
  args: {},
  handler: async (ctx) => {
    const physicians = await ctx.db.query("physicians").collect();
    
    // Join with user data
    const physiciansWithUsers = await Promise.all(
      physicians.map(async (physician) => {
        const user = await ctx.db.get(physician.userId);
        return {
          ...physician,
          user,
        };
      })
    );
    
    return physiciansWithUsers;
  },
});

// Update physician profile
export const updatePhysician = mutation({
  args: {
    physicianId: v.id("physicians"),
    hospital: v.optional(v.string()),
    specialization: v.optional(v.string()),
    isVerified: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { physicianId, ...updates } = args;
    await ctx.db.patch(physicianId, updates);
    return await ctx.db.get(physicianId);
  },
});
