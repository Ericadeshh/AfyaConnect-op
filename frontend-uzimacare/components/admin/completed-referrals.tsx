"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from "../../lib/db";

export default function CompletedReferralsPage() {
  const [completed, setCompleted] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    loadCompleted();
    const interval = setInterval(loadCompleted, 3000);
    // listen to referral creation/completion events to refresh immediately
    const handler = () => loadCompleted();
    if (typeof window !== "undefined") {
      window.addEventListener("referral:created", handler as EventListener);
      window.addEventListener("referral:completed", handler as EventListener);
    }
    return () => {
      clearInterval(interval);
      if (typeof window !== "undefined") {
        window.removeEventListener("referral:created", handler as EventListener);
        window.removeEventListener("referral:completed", handler as EventListener);
      }
    };
  }, []);

  const loadCompleted = () => {
    const all = Array.from(db.referrals.values()).filter(
      (r: any) => r.status === "confirmed" || r.status === "paid",
    );
    setCompleted(all);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-warning mb-6">Confirmed / Paid Referrals</h2>

      {completed.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-text-secondary">No completed referrals yet.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {completed.map((ref: any) => (
            <Card key={ref.id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-primary mb-1">
                    {ref.patientName}
                  </h3>
                  <p className="text-sm text-text-secondary">{ref.patientId || "N/A"}</p>
                  <p className="text-xs text-text-secondary mt-2">
                    From: {ref.referringHospital}
                  </p>
                  <p className="text-xs text-text-secondary">To: {ref.receivingFacility}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono">{ref.referralToken || ""}</p>
                <p className="text-xs text-text-secondary">
                  {ref.status === 'paid' ? 'Paid:' : 'Confirmed:'} {ref.completedAt || ref.paidAt || new Date(ref.updatedAt).toLocaleString()}
                </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-text-secondary">History</p>
                  <p className="text-sm whitespace-pre-wrap bg-surface p-3 rounded">{ref.medicalHistory}</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary">Lab Results</p>
                  <p className="text-sm whitespace-pre-wrap bg-surface p-3 rounded">{ref.labResults}</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary">Reason for Referral</p>
                  <p className="text-sm whitespace-pre-wrap bg-surface p-3 rounded">{ref.diagnosis}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={() => { setSelected(ref); }} className="btn-secondary text-xs">View</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-2xl w-full bg-background">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold">Confirmed Referral</h3>
              <button onClick={() => setSelected(null)} className="text-gray-500">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-text-secondary">Patient</p>
                <p className="font-medium">{selected.patientName}</p>
                <p className="text-xs text-text-secondary">{selected.patientId || "N/A"}</p>
              </div>

              <div>
                <p className="text-xs text-text-secondary">Referring Hospital</p>
                <p className="font-medium">{selected.referringHospital}</p>
              </div>

              <div>
                <p className="text-xs text-text-secondary">Receiving Facility</p>
                <p className="font-medium">{selected.receivingFacility}</p>
              </div>

              <div>
                <p className="text-xs text-text-secondary">History</p>
                <p className="text-sm whitespace-pre-wrap bg-surface p-3 rounded">{selected.medicalHistory}</p>
              </div>

              <div>
                <p className="text-xs text-text-secondary">Lab Results</p>
                <p className="text-sm whitespace-pre-wrap bg-surface p-3 rounded">{selected.labResults}</p>
              </div>

              <div>
                <p className="text-xs text-text-secondary">Reason for Referral</p>
                <p className="text-sm whitespace-pre-wrap bg-surface p-3 rounded">{selected.diagnosis}</p>
              </div>

              <div className="flex justify-end mt-4">
                <Button onClick={() => setSelected(null)} className="btn-secondary">Close</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
