// convex/auth.ts
import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { ConvexError } from "convex/values";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      validatePasswordRequirements: (password) => {
        if (password.length < 8)
          throw new ConvexError("Password must be at least 8 characters.");
        if (!/[A-Z]/.test(password))
          throw new ConvexError("Must contain uppercase letter.");
        if (!/[a-z]/.test(password))
          throw new ConvexError("Must contain lowercase letter.");
        if (!/\d/.test(password))
          throw new ConvexError("Must contain a number.");
        return true;
      },

      profile(params) {
        console.log("[AUTH PROFILE] Received params:", params);

        const email = params.email;
        if (typeof email !== "string" || !email.trim()) {
          throw new ConvexError("Valid email is required.");
        }

        const trimmedEmail = email.trim().toLowerCase();

        if (params.flow === "signUp") {
          console.log("[AUTH PROFILE] signUp → returning only email");
          return {
            email: trimmedEmail,
            // IMPORTANT: Do NOT return name/fullName/role here — schema doesn't allow extras
          };
        }

        // signIn → minimal
        console.log("[AUTH PROFILE] signIn → returning only email");
        return {
          email: trimmedEmail,
        };
      },
    }),
  ],
});
