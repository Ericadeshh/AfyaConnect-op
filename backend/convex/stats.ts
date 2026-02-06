import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./permissions";

export const getAdminStats = query({
    args: {
        demoUserId: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        // SECURITY: Require admin role
        await requireRole(ctx, ["admin"], args.demoUserId);

        const referrals = await ctx.db.query("referrals").collect();
        const bookings = await ctx.db.query("bookings").collect();

        const total = referrals.length;
        const completed = referrals.filter(r =>
            ["paid", "completed", "confirmed"].includes(r.status)
        ).length;

        // Pending action items for admin
        const pendingReferrals = referrals.filter(r =>
            ["pending-admin", "awaiting-biodata", "pending-payment"].includes(r.status)
        ).length;

        const expired = bookings.filter(b => b.status === "expired" || b.status === "cancelled").length;

        return {
            total,
            completed,
            pending: pendingReferrals,
            expired
        };
    },
});
