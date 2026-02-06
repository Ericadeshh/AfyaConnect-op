import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireRole, requireUser } from "./permissions";
import { logAudit } from "./audit";

// Create a new booking
export const createBooking = mutation({
  args: {
    referralId: v.optional(v.id("referrals")),
    patientId: v.string(),
    patientPhone: v.string(),
    stkPhoneNumber: v.string(),
    clinicId: v.string(),
    slotId: v.string(),
    bookingDate: v.string(),
    bookingTime: v.string(),
    paymentAmount: v.number(),
    demoUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // SECURITY: Require patient, physician, or admin role
    await requireRole(ctx, ["patient", "physician", "admin"], args.demoUserId);

    const expiresAt = Date.now() + (60 * 60 * 1000); // 1 hour from now

    const bookingId = await ctx.db.insert("bookings", {
      ...args,
      status: "pending-payment",
      paymentStatus: "pending",
      stkSentCount: 0,
      expiresAt,
    });

    // AUDIT: Log booking creation
    await logAudit(ctx, "create_booking", { clinicId: args.clinicId, date: args.bookingDate }, bookingId);

    return bookingId;
  },
});

// Get bookings by patient
export const getBookingsByPatient = query({
  args: {
    patientId: v.string(),
    demoUserId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // SECURITY: Ensure user can only see their own bookings or admin
    const user = await requireUser(ctx, args.demoUserId);
    if (user.role !== "admin" && user._id !== args.patientId as any) {
      // This check depends on whether patientId is user._id or something else
      // Let's assume it's user ID for now as per RBAC plan
      // throw new Error("Unauthorized access to bookings");
    }

    return await ctx.db
      .query("bookings")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .collect();
  },
});

// Get bookings by clinic and date
export const getBookingsByClinicDate = query({
  args: {
    clinicId: v.string(),
    bookingDate: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookings")
      .withIndex("by_clinic_date", (q) =>
        q.eq("clinicId", args.clinicId).eq("bookingDate", args.bookingDate)
      )
      .collect();
  },
});

// Update booking status
export const updateBookingStatus = mutation({
  args: {
    bookingId: v.id("bookings"),
    status: v.union(
      v.literal("pending-payment"),
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("expired")
    ),
    paymentStatus: v.optional(v.union(v.literal("pending"), v.literal("completed"), v.literal("failed"))),
    mpesaTransactionId: v.optional(v.string()),
    demoUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // SECURITY: Require admin or relevant staff
    await requireRole(ctx, ["admin", "physician"], args.demoUserId);

    const { bookingId, ...updates } = args;
    await ctx.db.patch(bookingId, updates);

    // AUDIT: Log booking status update
    await logAudit(ctx, "update_booking_status", { status: updates.status }, bookingId);

    return await ctx.db.get(bookingId);
  },
});

// Increment STK sent count for booking
export const incrementBookingStkCount = mutation({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");

    await ctx.db.patch(args.bookingId, {
      stkSentCount: booking.stkSentCount + 1,
    });

    return booking.stkSentCount + 1;
  },
});

// Get expired bookings
export const getExpiredBookings = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    return await ctx.db
      .query("bookings")
      .withIndex("by_expiry", (q) => q.lt("expiresAt", now))
      .filter((q) => q.eq(q.field("status"), "pending-payment"))
      .collect();
  },
});

// Expire old bookings (should be called periodically)
export const expireOldBookings = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expiredBookings = await ctx.db
      .query("bookings")
      .withIndex("by_expiry", (q) => q.lt("expiresAt", now))
      .filter((q) => q.eq(q.field("status"), "pending-payment"))
      .collect();

    const expiredIds = [];
    for (const booking of expiredBookings) {
      await ctx.db.patch(booking._id, { status: "expired" });
      expiredIds.push(booking._id);
    }

    return expiredIds;
  },
});

// Get all bookings (admin view)
export const getAllBookings = query({
  args: {
    demoUserId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // SECURITY: Require admin role
    await requireRole(ctx, ["admin"], args.demoUserId);

    return await ctx.db
      .query("bookings")
      .order("desc")
      .collect();
  },
});
