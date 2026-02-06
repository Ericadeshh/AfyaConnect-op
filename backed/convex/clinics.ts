import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./permissions";
import { logAudit } from "./audit";

// Create a new clinic
export const createClinic = mutation({
  args: {
    name: v.string(),
    facilityName: v.string(),
    location: v.string(),
    maxPatientsPerDay: v.number(),
    contactPhone: v.optional(v.string()),
    demoUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // SECURITY: Require admin role
    await requireRole(ctx, ["admin"], args.demoUserId);

    const clinicId = await ctx.db.insert("clinics", {
      ...args,
      isActive: true,
    });

    // AUDIT: Log clinic creation
    await logAudit(ctx, "create_clinic", { name: args.name }, clinicId);

    return clinicId;
  },
});

// Get all active clinics
export const getActiveClinics = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("clinics")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

// Get clinic by ID
export const getClinicById = query({
  args: { clinicId: v.id("clinics") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.clinicId);
  },
});

// Update clinic
export const updateClinic = mutation({
  args: {
    clinicId: v.id("clinics"),
    name: v.optional(v.string()),
    facilityName: v.optional(v.string()),
    location: v.optional(v.string()),
    maxPatientsPerDay: v.optional(v.number()),
    contactPhone: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    demoUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // SECURITY: Require admin role
    await requireRole(ctx, ["admin"], args.demoUserId);

    const { clinicId, ...updates } = args;
    await ctx.db.patch(clinicId, updates);

    // AUDIT: Log clinic update
    await logAudit(ctx, "update_clinic", updates, clinicId);

    return await ctx.db.get(clinicId);
  },
});

// Get available slots for a clinic on a date
export const getAvailableSlots = query({
  args: {
    clinicId: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const allSlots = [
      "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
      "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
    ];

    // Get confirmed bookings for this clinic on this date
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_clinic_date", (q) =>
        q.eq("clinicId", args.clinicId).eq("bookingDate", args.date)
      )
      .filter((q) => q.eq(q.field("status"), "confirmed"))
      .collect();

    const bookedTimes = new Set(bookings.map(b => b.bookingTime));
    const availableSlots = allSlots.filter(slot => !bookedTimes.has(slot));

    // Get clinic capacity
    const clinic = await ctx.db
      .query("clinics")
      .filter((q) => q.eq(q.field("_id"), args.clinicId))
      .unique();

    const maxPerDay = clinic?.maxPatientsPerDay || 15;
    const confirmedCount = bookings.length;

    return {
      available: availableSlots.slice(0, maxPerDay - confirmedCount),
      isFull: confirmedCount >= maxPerDay,
      availableCount: Math.max(0, maxPerDay - confirmedCount),
      bookedCount: confirmedCount,
    };
  },
});

// Get available dates for a clinic
export const getAvailableDates = query({
  args: {
    clinicId: v.string(),
    daysAhead: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const daysAhead = args.daysAhead || 30;
    const availableDates: string[] = [];
    const today = new Date();

    // Get clinic info
    const clinic = await ctx.db
      .query("clinics")
      .filter((q) => q.eq(q.field("_id"), args.clinicId))
      .unique();

    const maxPerDay = clinic?.maxPatientsPerDay || 15;

    for (let i = 1; i <= daysAhead; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      const dateStr = date.toISOString().split('T')[0];

      // Check how many bookings exist for this date
      const bookings = await ctx.db
        .query("bookings")
        .withIndex("by_clinic_date", (q) =>
          q.eq("clinicId", args.clinicId).eq("bookingDate", dateStr)
        )
        .filter((q) => q.eq(q.field("status"), "confirmed"))
        .collect();

      if (bookings.length < maxPerDay) {
        availableDates.push(dateStr);
      }
    }

    return availableDates;
  },
});
