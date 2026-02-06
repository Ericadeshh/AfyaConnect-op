import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Simulate STK push payment
export const sendSTKPayment = action({
  args: {
    phoneNumber: v.string(),
    amount: v.number(),
    bookingId: v.optional(v.id("bookings")),
    referralId: v.optional(v.id("referrals")),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    transactionId?: string;
    paymentId?: Id<"payments">;
    message: string;
  }> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock success rate of 95%
    const isSuccessful = Math.random() > 0.05;
    
    if (isSuccessful) {
      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create payment record
      const paymentId: Id<"payments"> = await ctx.runMutation(api.payments.createPayment, {
        phoneNumber: args.phoneNumber,
        amount: args.amount,
        bookingId: args.bookingId,
        referralId: args.referralId,
        status: "pending" as const,
        stkRequestId: `STK-${Date.now()}`,
      });
      
      // Update booking or referral with STK count
      if (args.bookingId) {
        await ctx.runMutation(api.bookings.incrementBookingStkCount, {
          bookingId: args.bookingId,
        });
      } else if (args.referralId) {
        await ctx.runMutation(api.referrals.incrementStkCount, {
          referralId: args.referralId,
        });
      }
      
      return {
        success: true,
        transactionId,
        paymentId,
        message: `STK prompt sent to ${args.phoneNumber}. Patient has 1 hour to complete payment.`,
      };
    }
    
    return {
      success: false,
      message: "Failed to send STK prompt. Please try again.",
    };
  },
});

// Create payment record
export const createPayment = mutation({
  args: {
    phoneNumber: v.string(),
    amount: v.number(),
    bookingId: v.optional(v.id("bookings")),
    referralId: v.optional(v.id("referrals")),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed")),
    stkRequestId: v.optional(v.string()),
    mpesaTransactionId: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const paymentId = await ctx.db.insert("payments", args);
    return paymentId;
  },
});

// Confirm payment (simulate M-Pesa callback)
export const confirmPayment = mutation({
  args: {
    paymentId: v.id("payments"),
    mpesaTransactionId: v.string(),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db.get(args.paymentId);
    if (!payment) throw new Error("Payment not found");
    
    // Update payment status
    await ctx.db.patch(args.paymentId, {
      status: "completed",
      mpesaTransactionId: args.mpesaTransactionId,
    });
    
    // Update related booking or referral
    if (payment.bookingId) {
      await ctx.db.patch(payment.bookingId, {
        status: "confirmed",
        paymentStatus: "completed",
        mpesaTransactionId: args.mpesaTransactionId,
      });
    } else if (payment.referralId) {
      await ctx.db.patch(payment.referralId, {
        status: "paid",
        completedAt: Date.now(),
        paidAt: Date.now(),
      });
    }
    
    return payment;
  },
});

// Get payments by booking
export const getPaymentsByBooking = query({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_booking", (q) => q.eq("bookingId", args.bookingId))
      .collect();
  },
});

// Get payments by referral
export const getPaymentsByReferral = query({
  args: { referralId: v.id("referrals") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_referral", (q) => q.eq("referralId", args.referralId))
      .collect();
  },
});

// Get all payments (admin view)
export const getAllPayments = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("payments")
      .order("desc")
      .collect();
  },
});
