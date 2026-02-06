"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { db } from "../../lib/db";

interface CompletedReferralsProps {
  physician: any;
  token: string;
  onBack: () => void;
}

export default function CompletedReferralsPage({
  physician,
  token,
  onBack,
}: CompletedReferralsProps) {
  const [selectedReferral, setSelectedReferral] = useState<any>(null);

  const completedReferrals = useMemo(() => {
    return Array.from(db.referrals.values()).filter(
      (ref: any) =>
        ref.physicianId === physician.id &&
        (ref.status === "Completed" ||
          ref.status === "confirmed" ||
          ref.status === "paid" ||
          ref.status === "completed"),
    );
  }, [physician.id]);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-primary">
            Completed Referrals
          </h1>
          <Button onClick={onBack} variant="outline">
            Back to Dashboard
          </Button>
        </div>

        {completedReferrals.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-text-secondary text-lg">
              No completed referrals yet
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {completedReferrals.map((referral: any) => (
              <Card
                key={referral.id}
                className="p-6 cursor-pointer hover:shadow-lg transition-all border-l-4 border-green-500"
              >
                <div className="flex justify-between items-start">
                  <div className="grow">
                    <h3 className="text-lg font-bold text-primary mb-2">
                      {referral.patientName}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-text-secondary">Referring Doctor</p>
                        <p className="font-medium">{physician.fullName}</p>
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
                        <p className="text-text-secondary">Date Sent</p>
                        <p className="font-medium">
                          {new Date(referral.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {referral.completedAt && (
                        <div>
                          <p className="text-text-secondary">Date Completed</p>
                          <p className="font-medium">
                            {new Date(
                              referral.completedAt,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {referral.status === "paid" ? "Paid" : "Completed"}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => setSelectedReferral(referral)}
                  className="mt-4 bg-green-500 hover:bg-green-600 text-white"
                >
                  View Full Details
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
                    Test Results
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
                    Referral Status
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-text-secondary">
                        Receiving Facility
                      </p>
                      <p className="font-medium">
                        {selectedReferral.receivingFacility}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">Status</p>
                      <p className="font-medium text-green-600">Completed</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">Date Sent</p>
                      <p className="font-medium">
                        {new Date(
                          selectedReferral.createdAt,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    {selectedReferral.completedAt && (
                      <div>
                        <p className="text-sm text-text-secondary">
                          Date Completed
                        </p>
                        <p className="font-medium">
                          {new Date(
                            selectedReferral.completedAt,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    )}
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
