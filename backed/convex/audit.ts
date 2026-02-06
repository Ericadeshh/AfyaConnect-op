import { MutationCtx } from "./_generated/server";
import { v } from "convex/values";

/**
 * Log an action to the audit_logs table.
 * 
 * @param ctx The mutation context
 * @param action The action being performed (e.g., "create_referral")
 * @param details JSON-serializable object with more information
 * @param resourceId Optional ID of the resource being acted upon
 */
export async function logAudit(
    ctx: MutationCtx,
    action: string,
    details: any,
    resourceId?: string
) {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    await ctx.db.insert("audit_logs", {
        userId,
        action,
        resourceId,
        details,
        timestamp: Date.now(),
    });
}
