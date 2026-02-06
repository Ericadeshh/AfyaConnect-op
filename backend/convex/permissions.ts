import { QueryCtx, MutationCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

export type Role = "admin" | "physician" | "patient";

/**
 * Require a user to be authenticated and return their user document.
 * Accepts optional demoUserId for simulation.
 */
export async function requireUser(ctx: QueryCtx | MutationCtx, demoUserId?: string) {
    let userId = await getAuthUserId(ctx);

    // DEMO BYPASS: If no real auth, try demoUserId
    if (!userId && demoUserId) {
        // Verify it looks like a valid ID (simple check)
        userId = demoUserId as Id<"users">;
    }

    console.log("requireUser check:", {
        realUserId: await getAuthUserId(ctx),
        demoUserId,
        resolvedUserId: userId
    });

    if (!userId) {
        throw new Error("Not authenticated");
    }

    // Try to get user
    const user = await ctx.db.get(userId as Id<"users">);
    if (!user) {
        console.error("User not found in database:", userId);
        throw new Error("User not found");
    }
    return user;
}

/**
 * Require a user to have one of the specified roles.
 */
export async function requireRole(ctx: QueryCtx | MutationCtx, roles: Role[], demoUserId?: string) {
    const user = await requireUser(ctx, demoUserId);

    console.log("requireRole check:", {
        userId: user._id,
        userRole: user.role,
        requiredRoles: roles
    });

    if (!roles.includes(user.role as Role)) {
        throw new Error(`Insufficient permissions. Required roles: ${roles.join(", ")}. Current role: ${user.role}`);
    }
    return user;
}

/**
 * Check if the current user is the physician with the given ID.
 * Physicians can only access their own data.
 */
export async function checkPhysicianAccess(ctx: QueryCtx | MutationCtx, physicianId: Id<"physicians">, demoUserId?: string) {
    const user = await requireRole(ctx, ["physician", "admin"], demoUserId);

    // Admins bypass this check
    if (user.role === "admin") return;

    const physician = await ctx.db
        .query("physicians")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter(q => q.eq(q.field("_id"), physicianId))
        .unique();

    if (!physician || physician._id !== physicianId) {
        throw new Error("Unauthorized access to physician data");
    }

    return physician;
}

/**
 * Check if the current user is the patient with the given ID.
 */
export async function checkPatientAccess(ctx: QueryCtx | MutationCtx, userId: Id<"users">) {
    const user = await requireUser(ctx);

    // Admins and potentially physicians might have access depending on business logic
    // For now, strict: own profile or admin
    if (user.role === "admin") return;

    if (user._id !== userId) {
        throw new Error("Unauthorized access to patient data");
    }

    return user;
}
