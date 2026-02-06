import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Handle database operations after successful STK push
export const recordSTKPush = mutation({
  args: {
    referralId: v.id("referrals"),
    phoneNumber: v.string(),
    amount: v.number(),
    stkRequestId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("=== RECORDING STK PUSH ===");
    
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

      console.log("✅ STK Push recorded successfully");
      console.log("Payment ID:", paymentId);
      console.log("Referral ID:", args.referralId);

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
