import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Handle database operations after STK push
export const recordStkPush = mutation({
  args: {
    referralId: v.id("referrals"),
    phoneNumber: v.string(),
    amount: v.number(),
    stkRequestId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Update referral with STK phone number and increment count
      await ctx.db.patch(args.referralId, {
        stkPhoneNumber: args.phoneNumber,
        stkSentCount: 1
      });

      // Create payment record
      const paymentId = await ctx.db.insert("payments", {
        referralId: args.referralId,
        phoneNumber: args.phoneNumber,
        amount: args.amount,
        status: "pending",
        stkRequestId: args.stkRequestId
      });

      return {
        success: true,
        message: "STK Push recorded successfully",
        paymentId,
        referralUpdated: true
      };

    } catch (error) {
      console.error("Failed to record STK push:", error);
      return {
        success: false,
        message: "Failed to record STK push",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
});

// Complete STK push workflow (call action then record)
export const completeStkPush = mutation({
  args: {
    phoneNumber: v.string(),
    amount: v.number(),
    referralId: v.id("referrals"),
    patientName: v.string(),
    useTestCallback: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    try {
      // Note: In a real implementation, you would need to call the action
      // from the frontend, then call this mutation with the results
      
      // For now, just record the payment (frontend should call the action first)
      return {
        success: true,
        message: "Call mpesa:initiateSTKPush action first, then recordStkPush mutation",
        workflow: [
          "1. Call mpesa:initiateSTKPush action",
          "2. Call recordStkPush mutation with results"
        ]
      };

    } catch (error) {
      console.error("Complete STK push failed:", error);
      return {
        success: false,
        message: "Complete STK push failed",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
});
