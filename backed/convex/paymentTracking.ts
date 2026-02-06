import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./permissions";

// Get payments by referral ID
export const getPaymentsByReferral = query({
  args: {
    referralId: v.id("referrals"),
    demoUserId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // SECURITY: Require physician or admin
    await requireRole(ctx, ["physician", "admin"], args.demoUserId);

    return await ctx.db
      .query("payments")
      .withIndex("by_referral", (q) => q.eq("referralId", args.referralId))
      .order("desc")
      .collect();
  },
});

// Get payment by STK request ID
export const getPaymentByStkRequestId = query({
  args: {
    stkRequestId: v.string(),
    demoUserId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // SECURITY: Require physician or admin
    await requireRole(ctx, ["physician", "admin"], args.demoUserId);

    return await ctx.db
      .query("payments")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .filter((q) => q.eq(q.field("stkRequestId"), args.stkRequestId))
      .first();
  },
});

// Get all pending payments
export const getPendingPayments = query({
  args: {
    demoUserId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // SECURITY: Require admin role
    await requireRole(ctx, ["admin"], args.demoUserId);

    return await ctx.db
      .query("payments")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
  },
});

// Update payment status (for M-Pesa callbacks)
export const updatePaymentStatus = mutation({
  args: {
    stkRequestId: v.string(),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed")),
    mpesaTransactionId: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    amount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Find payment by STK request ID
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .filter((q) => q.eq(q.field("stkRequestId"), args.stkRequestId))
      .first();

    if (!payment) {
      throw new Error("Payment not found");
    }

    // Update payment status
    const updateData: any = {
      status: args.status,
    };

    if (args.mpesaTransactionId) {
      updateData.mpesaTransactionId = args.mpesaTransactionId;
    }

    if (args.errorMessage) {
      updateData.errorMessage = args.errorMessage;
    }

    if (args.amount) {
      updateData.amount = args.amount;
    }

    await ctx.db.patch(payment._id, updateData);

    // If payment completed, update referral status
    if (args.status === "completed" && payment.referralId) {
      await ctx.db.patch(payment.referralId, {
        status: "paid",
        paidAt: Date.now(),
      });
    }

    return await ctx.db.get(payment._id);
  },
});

// Get payment statistics
export const getPaymentStats = query({
  args: {
    demoUserId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // SECURITY: Require admin role
    await requireRole(ctx, ["admin"], args.demoUserId);

    const allPayments = await ctx.db.query("payments").collect();

    const stats = {
      total: allPayments.length,
      pending: allPayments.filter(p => p.status === "pending").length,
      completed: allPayments.filter(p => p.status === "completed").length,
      failed: allPayments.filter(p => p.status === "failed").length,
      totalAmount: allPayments
        .filter(p => p.status === "completed")
        .reduce((sum, p) => sum + p.amount, 0),
    };

    return stats;
  },
});

// Get payments by phone number
export const getPaymentsByPhone = query({
  args: {
    phoneNumber: v.string(),
    demoUserId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // SECURITY: Require admin role
    await requireRole(ctx, ["admin"], args.demoUserId);

    return await ctx.db
      .query("payments")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .order("desc")
      .collect();
  },
});

// Retry failed payment
export const retryFailedPayment = mutation({
  args: {
    paymentId: v.id("payments"),
    demoUserId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // SECURITY: Require admin role
    await requireRole(ctx, ["admin"], args.demoUserId);

    const payment = await ctx.db.get(args.paymentId);
    if (!payment) {
      throw new Error("Payment not found");
    }

    if (payment.status !== "failed") {
      throw new Error("Can only retry failed payments");
    }

    // Reset payment to pending
    await ctx.db.patch(args.paymentId, {
      status: "pending",
      errorMessage: undefined,
    });

    return {
      success: true,
      message: "Payment reset to pending, retry STK push from frontend",
      paymentId: args.paymentId,
    };
  },
});
