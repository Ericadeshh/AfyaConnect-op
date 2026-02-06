"use client";

import { useState } from "react";
import NotificationBell from "../notifications/notification-bell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PendingPhysicianReferrals from "./pending-physician-referrals";
import CalendarView from "./calendar-view";

interface AdminDashboardProps {
  user: any;
  onLogout: () => void;
}

type AdminView = "overview" | "pending-referrals" | "calendar" | "completed";

export default function AdminDashboard({
  user,
  onLogout,
}: AdminDashboardProps) {
  const [currentView, setCurrentView] = useState<AdminView>("overview");

  return (
    <div className="bg-surface">
      {/* Header */}
      <header className="bg-warning text-white py-6 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-center">
              <span
                className="text-black"
                style={{ WebkitTextStroke: "1px white" }}
              >
                UZ
              </span>
              <span
                className="text-white"
                style={{ WebkitTextStroke: "1px white" }}
              >
                I
              </span>
              <span
                className="text-red-600"
                style={{ WebkitTextStroke: "1px white" }}
              >
                MA
              </span>
              <span
                className="text-white"
                style={{ WebkitTextStroke: "1px white" }}
              >
                C
              </span>
              <span
                className="text-green-600"
                style={{ WebkitTextStroke: "1px white" }}
              >
                A
              </span>
              <span
                className="text-green-600"
                style={{ WebkitTextStroke: "1px white" }}
              >
                RE
              </span>
              <div className="text-sm mt-2">Administration Portal</div>
            </h1>
            <p className="text-amber-100">Referral & Booking Management</p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell userId={user?.id} />
            <Button
              onClick={onLogout}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <Button
            onClick={() => setCurrentView("overview")}
            className={
              currentView === "overview"
                ? "bg-warning text-white"
                : "btn-secondary"
            }
          >
            Overview
          </Button>
          <Button
            onClick={() => setCurrentView("pending-referrals")}
            className={
              currentView === "pending-referrals"
                ? "bg-warning text-white"
                : "btn-secondary"
            }
          >
            Pending Referrals
          </Button>
          <Button
            onClick={() => setCurrentView("calendar")}
            className={
              currentView === "calendar"
                ? "bg-warning text-white"
                : "btn-secondary"
            }
          >
            Calendar
          </Button>
        </div>

        {/* Content */}
        {currentView === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-warning mb-2">
                Total Referrals
              </h3>
              <p className="text-4xl font-bold">156</p>
              <p className="text-text-secondary text-sm mt-2">This month</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-success mb-2">
                Completed
              </h3>
              <p className="text-4xl font-bold">143</p>
              <p className="text-text-secondary text-sm mt-2">
                91.7% completion
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-accent mb-2">
                Pending Approval
              </h3>
              <p className="text-4xl font-bold">8</p>
              <p className="text-text-secondary text-sm mt-2">
                From physicians
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-error mb-2">Expired</h3>
              <p className="text-4xl font-bold">5</p>
              <p className="text-text-secondary text-sm mt-2">
                No payment received
              </p>
            </Card>
          </div>
        )}

        {currentView === "pending-referrals" && <PendingPhysicianReferrals />}
        {currentView === "calendar" && <CalendarView />}
      </main>
    </div>
  );
}
