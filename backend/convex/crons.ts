import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";

// Expire old bookings every hour
export const expireBookings = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expiredBookings = await ctx.db
      .query("bookings")
      .withIndex("by_expiry", (q) => q.lt("expiresAt", now))
      .filter((q) => q.eq(q.field("status"), "pending-payment"))
      .collect();
    
    let expiredCount = 0;
    for (const booking of expiredBookings) {
      await ctx.db.patch(booking._id, { status: "expired" });
      
      // Create notification for patient
      await ctx.db.insert("notifications", {
        userId: booking.patientId,
        type: "booking",
        title: "Booking Expired",
        message: `Your booking for ${booking.bookingDate} has expired due to non-payment.`,
        isRead: false,
      });
      
      expiredCount++;
    }
    
    console.log(`Expired ${expiredCount} bookings`);
    return expiredCount;
  },
});

const crons = cronJobs();

// Run every hour to expire old bookings
crons.interval("expire bookings", { hours: 1 }, internal.crons.expireBookings, {});

export default crons;
