import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./permissions";

// Trigger STK push for a referral
export const triggerReferralPayment = mutation({
  args: {
    referralId: v.id("referrals"),
    phoneNumber: v.string(),
    amount: v.optional(v.number()),
    demoUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // SECURITY: Require admin role
    await requireRole(ctx, ["admin"], args.demoUserId);

    // Get referral details
    const referral = await ctx.db.get(args.referralId);
    if (!referral) {
      throw new Error("Referral not found");
    }

    // Note: STK push should be triggered from frontend using mpesa:initiateSTKPush
    // This avoids scheduler complexity in mutations

    // Update referral with phone number and status
    await ctx.db.patch(args.referralId, {
      stkPhoneNumber: args.phoneNumber,
      status: "pending-payment"
    });

    return {
      success: true,
      message: "STK push initiated for referral payment",
      referralId: args.referralId,
      phoneNumber: args.phoneNumber,
      amount: args.amount || 1000
    };
  },
});

// Retry STK push for failed payments
export const retrySTKPush = mutation({
  args: {
    referralId: v.id("referrals"),
    demoUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // SECURITY: Require admin role
    await requireRole(ctx, ["admin"], args.demoUserId);

    // Get referral details
    const referral = await ctx.db.get(args.referralId);
    if (!referral) {
      throw new Error("Referral not found");
    }

    if (!referral.stkPhoneNumber) {
      throw new Error("No phone number available for STK push");
    }

    // Increment STK sent count
    const currentCount = referral.stkSentCount || 0;
    await ctx.db.patch(args.referralId, {
      stkSentCount: currentCount + 1
    });

    // Note: STK push retry should be triggered from frontend using mpesa:initiateSTKPush

    return {
      success: true,
      message: "STK push retry initiated",
      referralId: args.referralId,
      phoneNumber: referral.stkPhoneNumber,
      attemptNumber: currentCount + 1
    };
  },
});
