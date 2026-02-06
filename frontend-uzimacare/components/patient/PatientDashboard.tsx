"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, FileText, CheckCircle2 } from "lucide-react";

interface PatientDashboardProps {
  user: any;
  onLogout: () => void;
}

type PatientView = "overview" | "upcoming" | "history" | "referrals";

export default function PatientDashboard({
  user,
  onLogout,
}: PatientDashboardProps) {
  const [currentView, setCurrentView] = useState<PatientView>("overview");

  // Mock data – replace with real queries later
  const upcoming = 2;
  const completed = 7;

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-1">
              Patient Portal
            </h1>
            <p className="text-lg text-muted-foreground">
              Welcome back, {user?.fullName || "Patient"}
            </p>
          </div>
          <Button variant="outline" onClick={onLogout}>
            Logout
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Upcoming Appointments
                </p>
                <p className="text-3xl font-bold">{upcoming}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Completed Visits
                </p>
                <p className="text-3xl font-bold">{completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Pending Referrals
                </p>
                <p className="text-3xl font-bold">1</p>
              </div>
              <FileText className="h-8 w-8 text-amber-500 opacity-80" />
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Next Appointment
                </p>
                <p className="text-xl font-semibold mt-1">Tomorrow 10:30 AM</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500 opacity-80" />
            </div>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-3 mb-8 border-b pb-4">
          <Button
            variant={currentView === "overview" ? "default" : "outline"}
            onClick={() => setCurrentView("overview")}
          >
            Overview
          </Button>
          <Button
            variant={currentView === "upcoming" ? "default" : "outline"}
            onClick={() => setCurrentView("upcoming")}
          >
            Upcoming Appointments
          </Button>
          <Button
            variant={currentView === "history" ? "default" : "outline"}
            onClick={() => setCurrentView("history")}
          >
            Visit History
          </Button>
          <Button
            variant={currentView === "referrals" ? "default" : "outline"}
            onClick={() => setCurrentView("referrals")}
          >
            My Referrals
          </Button>
        </div>

        {/* Content area – placeholder for real components */}
        {currentView === "overview" && (
          <Card className="p-8 text-center py-16">
            <h2 className="text-2xl font-semibold mb-4">
              Your Health Journey at a Glance
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Here you can view upcoming appointments, track referrals, see past
              visit summaries, and manage your profile.
            </p>
          </Card>
        )}

        {currentView === "upcoming" && (
          <Card className="p-8">
            <h2 className="text-2xl font-semibold mb-6">
              Upcoming Appointments
            </h2>
            <p className="text-muted-foreground">
              No upcoming appointments at the moment.
            </p>
            {/* → Add real list component later */}
          </Card>
        )}

        {/* Add similar blocks for history & referrals */}
      </div>
    </div>
  );
}
