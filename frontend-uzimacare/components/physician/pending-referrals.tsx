"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { db } from "../../lib/db";

interface PendingReferralsProps {
  physician: any;
  token: string;
  onBack: () => void;
}

export default function PendingReferralsPage({
  physician,
  token,
  onBack,
}: PendingReferralsProps) {
  const [selectedReferral, setSelectedReferral] = useState<any>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const handler = () => setTick((t) => t + 1);
    if (typeof window !== "undefined") {
      window.addEventListener("referral:created", handler as EventListener);
      window.addEventListener("referral:completed", handler as EventListener);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("referral:created", handler as EventListener);
        window.removeEventListener("referral:completed", handler as EventListener);
      }
    };
  }, []);

  const pendingReferrals = useMemo(() => {
    return Array.from(db.referrals.values()).filter(
      (ref: any) => {
        if (ref.physicianId !== physician.id) return false;
        const s = (ref.status || "").toString().toLowerCase();
        return (
          s === "pending-admin" ||
          s === "pending admin approval" ||
          s === "pending-payment" ||
          s === "awaiting-biodata" ||
          s === "awaiting biodata"
        );
      },
    );
  }, [physician.id, tick]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Routine":
        return "bg-green-100 text-green-800";
      case "Urgent":
        return "bg-yellow-100 text-yellow-800";
      case "Emergency":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-primary">Pending Referrals</h1>
          <Button onClick={onBack} variant="outline">
            Back to Dashboard
          </Button>
        </div>

        {pendingReferrals.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-text-secondary text-lg">No pending referrals</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingReferrals.map((referral: any) => (
              <Card
                key={referral.id}
                className="p-6 cursor-pointer hover:shadow-lg transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold text-primary mb-2">
                      {referral.patientName}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-text-secondary">
                          Referring Hospital
                        </p>
                        <p className="font-medium">
                          {referral.referringHospital}
                        </p>
                      </div>
                      <div>
                        <p className="text-text-secondary">
                          Receiving Facility
                        </p>
                        <p className="font-medium">
                          {referral.receivingFacility}
                        </p>
                      </div>
                      <div>
                        <p className="text-text-secondary">Created</p>
                        <p className="font-medium">
                          {new Date(referral.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(referral.priority)}`}
                    >
                      {referral.priority}
                    </span>
                    <p className="text-sm text-yellow-600 font-medium mt-2">
                      Pending Administration Approval
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setSelectedReferral(referral)}
                  className="mt-4 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  View Details
                </Button>
              </Card>
            ))}
          </div>
        )}

        {selectedReferral && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl p-8 max-h-screen overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-primary">
                  Referral Details
                </h2>
                <button
                  onClick={() => setSelectedReferral(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-primary mb-3">
                    Patient Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-text-secondary">
                        Patient Name
                      </p>
                      <p className="font-medium">
                        {selectedReferral.patientName}
                      </p>
                    </div>
                    {selectedReferral.patientId && (
                      <div>
                        <p className="text-sm text-text-secondary">
                          Patient ID
                        </p>
                        <p className="font-medium">
                          {selectedReferral.patientId}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-primary mb-3">
                    Medical History
                  </h3>
                  <p className="text-sm whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                    {selectedReferral.medicalHistory}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-primary mb-3">
                    Lab Results
                  </h3>
                  <p className="text-sm whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                    {selectedReferral.labResults}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-primary mb-3">
                    Reason for Referral
                  </h3>
                  <p className="text-sm whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                    {selectedReferral.diagnosis}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-primary mb-3">
                    Referral Metadata
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-text-secondary">
                        Referring Hospital
                      </p>
                      <p className="font-medium">
                        {selectedReferral.referringHospital}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">
                        Receiving Facility
                      </p>
                      <p className="font-medium">
                        {selectedReferral.receivingFacility}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">Priority</p>
                      <p className="font-medium">{selectedReferral.priority}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">Status</p>
                      <p className="font-medium text-yellow-600">
                        {selectedReferral.status}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    onClick={() => setSelectedReferral(null)}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
