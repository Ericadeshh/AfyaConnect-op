// frontend-uzimacare/components/auth/SignInForm.tsx
"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User, Mail, Lock, UserCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { api } from "@convex/api";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const completeProfile = useMutation(api.users.completeUserProfile);
  const router = useRouter();

  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"patient" | "physician" | "admin">(
    "patient",
  );

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const newErrors: typeof errors = {};

    if (touched.email) {
      if (!email.trim()) newErrors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        newErrors.email = "Invalid email format";
    }

    if (touched.password) {
      if (!password.trim()) newErrors.password = "Password is required";
      else if (flow === "signUp" && password.length < 8)
        newErrors.password = "Password must be at least 8 characters";
    }

    if (flow === "signUp") {
      if (touched.fullName && !fullName.trim())
        newErrors.fullName = "Full name is required";
      if (touched.role && !role) newErrors.role = "Role is required";
    }

    setErrors(newErrors);
  }, [email, password, fullName, role, touched, flow]);

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      email: true,
      password: true,
      ...(flow === "signUp" && { fullName: true, role: true }),
    });

    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the errors in the form", {
        position: "top-center",
        duration: 5000,
      });
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append("email", email.trim());
    formData.append("password", password);
    formData.append("flow", flow);

    if (flow === "signUp") {
      formData.append("fullName", fullName.trim());
      formData.append("role", role);
    }

    try {
      await signIn("password", formData);

      toast.success(
        flow === "signIn"
          ? "Signed in successfully!"
          : "Account created! Welcome to UzimaCare.",
        { position: "top-center", duration: 4000 },
      );

      if (flow === "signUp") {
        console.log("[client] Calling completeProfile → role:", role);
        await completeProfile({
          role,
          fullName: fullName.trim() || undefined,
        });
        console.log("[client] completeProfile succeeded");
      }

      await new Promise((resolve) => setTimeout(resolve, 1400));

      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      console.error("Auth error:", error);

      let message = "Something went wrong. Please try again.";
      const errMsg = (error.message || "").toLowerCase();

      if (errMsg.includes("already exists") || errMsg.includes("duplicate")) {
        message = "This email is already registered. Please sign in.";
        setFlow("signIn");
      } else if (
        errMsg.includes("password") &&
        errMsg.includes("requirement")
      ) {
        message =
          "Password must be 8+ chars with uppercase, lowercase & number.";
      } else if (
        errMsg.includes("not found") ||
        errMsg.includes("invalid credentials")
      ) {
        message = "Invalid email or password.";
      } else if (errMsg.includes("email")) {
        message = "Please enter a valid email address.";
      } else if (error instanceof Error && error.message) {
        message = error.message;
      }

      toast.error(message, { position: "top-center", duration: 6000 });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {flow === "signUp" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="fullName"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onBlur={() => handleBlur("fullName")}
                className={cn(
                  "pl-10",
                  errors.fullName &&
                    "border-red-500 focus-visible:ring-red-500",
                )}
                disabled={submitting}
              />
            </div>
            {errors.fullName && touched.fullName && (
              <p className="text-red-500 text-sm">{errors.fullName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select
              value={role}
              onValueChange={(val: "patient" | "physician" | "admin") => {
                setRole(val);
                handleBlur("role");
              }}
              disabled={submitting}
            >
              <SelectTrigger
                className={cn(
                  "pl-10",
                  errors.role && "border-red-500 focus:ring-red-500",
                )}
              >
                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="patient">Patient</SelectItem>
                <SelectItem value="physician">Physician</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && touched.role && (
              <p className="text-red-500 text-sm">{errors.role}</p>
            )}
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => handleBlur("email")}
            className={cn(
              "pl-10",
              errors.email && "border-red-500 focus-visible:ring-red-500",
            )}
            autoComplete="email"
            disabled={submitting}
          />
        </div>
        {errors.email && touched.email ? (
          <p className="text-red-500 text-sm">{errors.email}</p>
        ) : (
          <p className="text-xs text-muted-foreground mt-1">
            Enter a valid email address
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password *</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => handleBlur("password")}
            className={cn(
              "pl-10",
              errors.password && "border-red-500 focus-visible:ring-red-500",
            )}
            autoComplete={
              flow === "signIn" ? "current-password" : "new-password"
            }
            disabled={submitting}
          />
        </div>

        {errors.password && touched.password ? (
          <p className="text-red-500 text-sm">{errors.password}</p>
        ) : (
          flow === "signUp" && (
            <p className="text-xs text-muted-foreground mt-1">
              At least 8 characters, include uppercase, lowercase, number
            </p>
          )
        )}
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {flow === "signIn" ? "Sign In" : "Create Account"}
      </Button>

      <div className="text-center text-sm">
        {flow === "signIn" ? (
          <>
            Don't have an account?{" "}
            <button
              type="button"
              className="text-primary font-medium hover:underline"
              onClick={() => setFlow("signUp")}
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              className="text-primary font-medium hover:underline"
              onClick={() => setFlow("signIn")}
            >
              Sign in
            </button>
          </>
        )}
      </div>
    </form>
  );
}
