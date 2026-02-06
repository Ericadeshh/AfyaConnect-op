# Permissions Fix Documentation

## Issue: "Insufficient Permissions" Error

### Problem Description
The application was throwing an **"Insufficient permissions"** error when Convex queries required `physician` or `admin` roles. The error occurred because:

1. The permission system uses a **demo authentication bypass** (since real Convex Auth isn't fully integrated)
2. The frontend was passing the **wrong ID** (`physician._id` from the `physicians` table) instead of the correct ID (`physician.userId` from the `users` table)
3. Some Convex functions were missing the `demoUserId` parameter needed for the bypass

---

## Root Cause Analysis

### Authentication Flow
```
Frontend Login → Returns userData with ID → Frontend passes ID as demoUserId → Convex looks up user in DB
```

### The Problem
- **Physicians table** has `_id` (physician record ID) and `userId` (linked users table ID)
- **Users table** has `_id` (user ID) with `role` field
- Frontend was using `physician._id` but permission system needed `physician.userId`

---

## Changes Made

### Backend (Convex)

#### 1. `convex/permissions.ts` - Added Logging
```typescript
// Added console.log in requireUser to trace auth flow
console.log("requireUser check:", { 
    realUserId: await getAuthUserId(ctx), 
    demoUserId, 
    resolvedUserId: userId 
});

// Added console.log in requireRole to trace role checks
console.log("requireRole check:", {
    userId: user._id,
    userRole: user.role,
    requiredRoles: roles
});

// Improved error message to include current role
throw new Error(`Insufficient permissions. Required roles: ${roles.join(", ")}. Current role: ${user.role}`);
```

#### 2. `convex/referrals.ts` - Added Security Guards

| Function | Changes |
|----------|---------|
| `getReferralsByStatus` | Added `demoUserId` arg, added `requireRole` check |
| `getCompletedReferrals` | Added `demoUserId` arg, added `requireRole` check |
| `incrementStkCount` | Added `demoUserId` arg, added `requireRole` check for admin |

---

### Frontend (Next.js)

#### 3. `components/auth/physician-login.tsx`
```typescript
// BEFORE: Only had physician's _id
const userData = {
  id: physician._id,
  // ...
};

// AFTER: Added userId (the users table ID)
const userData = {
  userId: physician.userId,  // ← KEY FIX
  id: physician._id,
  // ...
};
```

#### 4. All Physician Components - Use `userId` instead of `id`

| Component | Change |
|-----------|--------|
| `physician/dashboard.tsx` | `demoUserId: user?.userId` |
| `physician/pending-referrals.tsx` | `demoUserId: physician.userId` |
| `physician/completed-referrals.tsx` | `demoUserId: physician.userId` |
| `physician/create-referral.tsx` | `demoUserId: physician.userId` |

#### 5. Admin Components - Pass user prop

| Component | Changes |
|-----------|---------|
| `admin/pending-physician-referrals.tsx` | Added `user` prop, pass `demoUserId` to all mutations |
| `admin/completed-referrals.tsx` | Added `user` prop, pass `demoUserId` to query |
| `admin/dashboard.tsx` | Pass `user={user}` to child components |

---

## How the Demo Auth Bypass Works

```typescript
// In permissions.ts
export async function requireUser(ctx, demoUserId?: string) {
    // 1. Try real Convex auth first
    let userId = await getAuthUserId(ctx);

    // 2. If no real auth, use demoUserId bypass
    if (!userId && demoUserId) {
        userId = demoUserId as Id<"users">;
    }

    // 3. Look up user in database
    const user = await ctx.db.get(userId);
    
    // 4. Return user document (includes role)
    return user;
}

export async function requireRole(ctx, roles: Role[], demoUserId?: string) {
    const user = await requireUser(ctx, demoUserId);
    
    // Check if user's role is in allowed roles
    if (!roles.includes(user.role)) {
        throw new Error("Insufficient permissions");
    }
    return user;
}
```

---

## Verification Checklist

### ✅ Backend
- [ ] `convex/permissions.ts` has logging enabled
- [ ] All secured Convex functions accept `demoUserId` parameter
- [ ] All secured functions call `requireRole()` with `demoUserId`

### ✅ Frontend  
- [ ] Physician login returns `userId` (users table ID)
- [ ] All Convex queries/mutations pass `demoUserId: userId`
- [ ] Admin components receive and pass `user` prop

### ✅ Testing
- [ ] Log in as physician → Can view referrals
- [ ] Log in as admin → Can view pending referrals
- [ ] Check Convex dashboard logs for auth traces

---

## Debugging Tips

### Check Convex Dashboard Logs
Look for these log entries:
```
requireUser check: { realUserId: null, demoUserId: "...", resolvedUserId: "..." }
requireRole check: { userId: "...", userRole: "physician", requiredRoles: ["physician", "admin"] }
```

### Common Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| "Not authenticated" | `demoUserId` not passed | Add `demoUserId` to query/mutation call |
| "User not found" | Wrong ID type passed | Use `userId` (users table) not `id` (physicians table) |
| "Insufficient permissions" | User has wrong role | Check user's role in database |

---

## Future Improvements

1. **Real Authentication**: Integrate proper Convex Auth with JWT tokens
2. **Role Claims**: Store roles in JWT claims for faster checks
3. **Error Boundaries**: Add React error boundaries to catch permission errors gracefully
4. **Access Denied UI**: Show friendly "Access Denied" messages instead of errors
