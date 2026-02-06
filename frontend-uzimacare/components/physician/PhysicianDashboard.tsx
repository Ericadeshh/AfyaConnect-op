"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CreateReferralPage from "./create-referral";
import PendingReferralsPage from "./pending-referrals";
import CompletedReferralsPage from "./completed-referrals";

interface PhysicianDashboardProps {
  user: any;
  onLogout: () => void;
}

type PhysicianPage = "dashboard" | "create" | "pending" | "completed";

export default function PhysicianDashboard({
  user,
  onLogout,
}: PhysicianDashboardProps) {
  const [currentPage, setCurrentPage] = useState<PhysicianPage>("dashboard");

  if (currentPage === "create") {
    return (
      <CreateReferralPage
        physician={user}
        onBack={() => setCurrentPage("dashboard")}
        token={""}
      />
    );
  }

  if (currentPage === "pending") {
    return (
      <PendingReferralsPage
        physician={user}
        onBack={() => setCurrentPage("dashboard")}
        token={""}
      />
    );
  }

  if (currentPage === "completed") {
    return (
      <CompletedReferralsPage
        physician={user}
        onBack={() => setCurrentPage("dashboard")}
        token={""}
      />
    );
  }

  return (
    <div className="bg-linear-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">
              Physician Portal
            </h1>
            <p className="text-lg text-text-secondary">
              {(() => {
                const raw = String(user?.fullName || "");
                const name = raw.replace(/^Dr\.?\s*/i, "");
                return `Welcome, Dr. ${name}`;
              })()}
            </p>
            <p className="text-sm text-text-secondary">{user.hospital}</p>
          </div>
          <Button onClick={onLogout} variant="outline" className="bg-white">
            Logout
          </Button>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create New Referral */}
          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-500"
            onClick={() => setCurrentPage("create")}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Create New Referral</h3>
              <p className="text-text-secondary mb-4 grow">
                Send patient referral to another facility
              </p>
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                Create
              </Button>
            </div>
          </Card>

          {/* Pending Referrals */}
          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-yellow-500"
            onClick={() => setCurrentPage("pending")}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Pending Referrals</h3>
              <p className="text-text-secondary mb-4 grow">
                Awaiting administration approval and forwarding
              </p>
              <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white">
                View
              </Button>
            </div>
          </Card>

          {/* Completed Referrals */}
          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-green-500"
            onClick={() => setCurrentPage("completed")}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Completed Referrals</h3>
              <p className="text-text-secondary mb-4 grow">
                Successfully delivered to receiving facilities
              </p>
              <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                View
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
