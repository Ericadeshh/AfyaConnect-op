import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireRole, checkPhysicianAccess } from "./permissions";
import { logAudit } from "./audit";

// Generate referral token
function generateToken(length = 6): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Create a new referral
export const createReferral = mutation({
  args: {
    physicianId: v.id("physicians"),
    patientName: v.string(),
    patientId: v.optional(v.string()),
    medicalHistory: v.string(),
    labResults: v.string(),
    diagnosis: v.string(),
    referringHospital: v.string(),
    receivingFacility: v.string(),
    priority: v.union(v.literal("Routine"), v.literal("Urgent"), v.literal("Emergency")),
    demoUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // SECURITY: Require physician role
    await requireRole(ctx, ["physician", "admin"], args.demoUserId);

    // Check for existing token for same patient ID
    let token: string | undefined;

    if (args.patientId) {
      const existingReferral = await ctx.db
        .query("referrals")
        .withIndex("by_patient_id", (q) => q.eq("patientId", args.patientId))
        .filter((q) => q.or(
          q.eq(q.field("status"), "pending-admin"),
          q.eq(q.field("status"), "awaiting-biodata")
        ))
        .first();

      if (existingReferral?.referralToken) {
        token = existingReferral.referralToken;
      }
    }

    if (!token) {
      token = generateToken();
    }

    const { demoUserId, ...referralData } = args;
    
    const referralId = await ctx.db.insert("referrals", {
      ...referralData,
      status: "pending-admin",
      referralToken: token,
      stkSentCount: 0,
    });

    // AUDIT: Log referral creation
    await logAudit(ctx, "create_referral", { patientName: args.patientName, priority: args.priority }, referralId);

    return referralId;
  },
});

// Get referrals by physician
export const getReferralsByPhysician = query({
  args: {
    physicianId: v.id("physicians"),
    demoUserId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // SECURITY: Ensure physician can only see their own referrals or admin (with demo bypass)
    await checkPhysicianAccess(ctx, args.physicianId, args.demoUserId);

    return await ctx.db
      .query("referrals")
      .withIndex("by_physician", (q) => q.eq("physicianId", args.physicianId))
      .order("desc")
      .collect();
  },
});

// Get referrals by status
export const getReferralsByStatus = query({
  args: {
    status: v.union(
      v.literal("pending-admin"),
      v.literal("awaiting-biodata"),
      v.literal("pending-payment"),
      v.literal("confirmed"),
      v.literal("paid"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    demoUserId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // SECURITY: Require physician or admin
    await requireRole(ctx, ["physician", "admin"], args.demoUserId);
    return await ctx.db
      .query("referrals")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .collect();
  },
});

// Get all pending referrals for admin
export const getPendingReferrals = query({
  args: {
    demoUserId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // SECURITY: Require admin role
    await requireRole(ctx, ["admin"], args.demoUserId);

    return await ctx.db
      .query("referrals")
      .filter((q) => q.or(
        q.eq(q.field("status"), "pending-admin"),
        q.eq(q.field("status"), "awaiting-biodata"),
        q.eq(q.field("status"), "pending-payment")
      ))
      .order("desc")
      .collect();
  },
});

// Update referral status only
export const updateReferralStatus = mutation({
  args: {
    referralId: v.id("referrals"),
    status: v.union(
      v.literal("pending-admin"),
      v.literal("awaiting-biodata"),
      v.literal("pending-payment"),
      v.literal("confirmed"),
      v.literal("paid"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    demoUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // SECURITY: Require physician or admin
    await requireRole(ctx, ["physician", "admin"], args.demoUserId);

    const { referralId, demoUserId, status } = args;

    // Get referral details before update
    const referral = await ctx.db.get(referralId);
    if (!referral) {
      throw new Error("Referral not found");
    }

    const updates: any = {
      status,
      updatedAt: Date.now(),
    };

    // Add completion timestamp if status is completed or paid
    if (status === "completed" || status === "paid") {
      updates.completedAt = Date.now();
      if (status === "paid") {
        updates.paidAt = Date.now();
      }
    }

    await ctx.db.patch(referralId, updates);

    // AUDIT: Log status update
    await logAudit(ctx, "update_referral_status", { status }, referralId);

    return await ctx.db.get(referralId);
  },
});

// Save biodata and transition to pending-payment
export const saveBiodata = mutation({
  args: {
    referralId: v.id("referrals"),
    patientPhone: v.string(),
    stkPhoneNumber: v.string(),
    patientDateOfBirth: v.optional(v.string()),
    patientNationalId: v.optional(v.string()),
    bookedDate: v.optional(v.string()),
    bookedTime: v.optional(v.string()),
    biodataCode: v.optional(v.string()),
    demoUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // SECURITY: Require admin role
    await requireRole(ctx, ["admin"], args.demoUserId);

    const { referralId, demoUserId, ...biodata } = args;

    const referral = await ctx.db.get(referralId);
    if (!referral) {
      throw new Error("Referral not found");
    }

    // Update biodata fields and transition status
    await ctx.db.patch(referralId, {
      ...biodata,
      status: "pending-payment",
    });

    // AUDIT: Log biodata save
    await logAudit(ctx, "save_biodata", { 
      patientPhone: biodata.patientPhone,
      stkPhoneNumber: biodata.stkPhoneNumber,
      biodataCode: biodata.biodataCode 
    }, referralId);

    return await ctx.db.get(referralId);
  },
});

// Update phone numbers only
export const updatePhoneNumbers = mutation({
  args: {
    referralId: v.id("referrals"),
    patientPhone: v.string(),
    stkPhoneNumber: v.string(),
    demoUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // SECURITY: Require admin role
    await requireRole(ctx, ["admin"], args.demoUserId);

    const { referralId, demoUserId, ...phones } = args;

    const referral = await ctx.db.get(referralId);
    if (!referral) {
      throw new Error("Referral not found");
    }

    await ctx.db.patch(referralId, {
      ...phones,
    });

    // AUDIT: Log phone update
    await logAudit(ctx, "update_phone_numbers", phones, referralId);

    return await ctx.db.get(referralId);
  },
});

// Increment STK sent count
export const incrementStkCount = mutation({
  args: {
    referralId: v.id("referrals"),
    demoUserId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // SECURITY: Require admin role
    await requireRole(ctx, ["admin"], args.demoUserId);

    const referral = await ctx.db.get(args.referralId);
    if (!referral) throw new Error("Referral not found");

    await ctx.db.patch(args.referralId, {
      stkSentCount: (referral.stkSentCount || 0) + 1,
    });

    return referral.stkSentCount || 0 + 1;
  },
});

// Get referral by token
export const getReferralByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("referrals")
      .withIndex("by_token", (q) => q.eq("referralToken", args.token))
      .unique();
  },
});

// Get completed referrals
export const getCompletedReferrals = query({
  args: {
    demoUserId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // SECURITY: Require physician or admin
    await requireRole(ctx, ["physician", "admin"], args.demoUserId);

    return await ctx.db
      .query("referrals")
      .filter((q) => q.or(
        q.eq(q.field("status"), "confirmed"),
        q.eq(q.field("status"), "paid"),
        q.eq(q.field("status"), "completed")
      ))
      .order("desc")
      .collect();
  },
});
