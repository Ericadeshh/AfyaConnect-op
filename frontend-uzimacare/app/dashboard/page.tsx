// app/dashboard/page.tsx
"use client";

import { useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "@convex/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import AdminDashboard from "@/components/admin/AdminDashboard";
import PhysicianDashboard from "@/components/physician/PhysicianDashboard";
import PatientDashboard from "@/components/patient/PatientDashboard";

export default function Dashboard() {
  const { isLoading: isAuthLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.getCurrentUser);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  if (isAuthLoading || user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  console.log("[DASHBOARD] User role received:", user.role);

  switch (user.role) {
    case "admin":
      return (
        <AdminDashboard user={user} onLogout={() => router.push("/login")} />
      );
    case "physician":
      return (
        <PhysicianDashboard
          user={user}
          onLogout={() => router.push("/login")}
        />
      );
    case "patient":
      return (
        <PatientDashboard user={user} onLogout={() => router.push("/login")} />
      );
    default:
      return <div>Unknown role: {user.role}</div>;
  }
}
