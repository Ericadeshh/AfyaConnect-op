"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { db } from "../../lib/db";
import { sendSTKPaymentPrompt } from "../../lib/payment";

export default function PendingPhysicianReferrals() {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [selectedReferral, setSelectedReferral] = useState<any>(null);
  const [showBiodataModal, setShowBiodataModal] = useState(false);
  const [showEditPhoneModal, setShowEditPhoneModal] = useState(false);
  const [biodataForm, setBiodataForm] = useState({
    patientPhone: "",
    stkPhoneNumber: "",
    patientDateOfBirth: "",
    patientNationalId: "",
    bookedDate: "",
  });
  const [editPhoneData, setEditPhoneData] = useState({
    patientPhone: "",
    stkPhoneNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState<string | null>(null);
  // Generate 6-char alphanumeric token
  const generateToken = (length = 6) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let out = "";
    for (let i = 0; i < length; i++) {
      out += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return out;
  };
  const [biodataCode, setBiodataCode] = useState<string | null>(null);

  const generateBiodataCode = (length = 6) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  useEffect(() => {
    loadReferrals();
    const interval = setInterval(() => {
      loadReferrals();
    }, 3000);
    // Listen for immediate referral creation events from physician UI
    const handler = (e: any) => {
      loadReferrals();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("referral:created", handler as EventListener);
    }

    return () => {
      clearInterval(interval);
      if (typeof window !== "undefined") {
        window.removeEventListener("referral:created", handler as EventListener);
      }
    };
  }, []);

  const loadReferrals = () => {
    const all = Array.from(db.referrals.values());

    // Track existing tokens to avoid collisions
    const existingTokens = new Set<string>();
    all.forEach((r: any) => {
      if (r.referralToken) existingTokens.add(r.referralToken);
    });

    const filtered = all
      .filter(
        (ref) =>
          ref.status === "pending-admin" ||
          ref.status === "awaiting-biodata" ||
          ref.status === "pending-payment",
      )
      .map((ref) => {
        // For pending-admin referrals, ensure a single token per patient MRN-
        if (ref.status === "pending-admin") {
          const pid = ref.patientId;
          if (pid && String(pid).startsWith("MRN-")) {
            // find any existing referral with same patientId that already has a token
            const existing = all.find(
              (r2: any) => r2.patientId === pid && r2.referralToken,
            );
            if (existing) {
              if (!ref.referralToken) {
                ref.referralToken = existing.referralToken;
                db.referrals.set(ref.id, ref);
              }
            } else {
              if (!ref.referralToken) {
                let token = generateToken();
                while (existingTokens.has(token)) token = generateToken();
                existingTokens.add(token);
                ref.referralToken = token;
                db.referrals.set(ref.id, ref);
              }
            }
          } else {
            // For other referrals without MRN-, ensure they have a token too
            if (!ref.referralToken) {
              let token = generateToken();
              while (existingTokens.has(token)) token = generateToken();
              existingTokens.add(token);
              ref.referralToken = token;
              db.referrals.set(ref.id, ref);
            }
          }
        }

        return ref;
      });

    setReferrals(filtered);
  };

  const handleStartBiodata = (referral: any) => {
    setSelectedReferral(referral);
    setBiodataForm({
      patientPhone: referral.patientPhone || "",
      stkPhoneNumber: referral.stkPhoneNumber || "",
      patientDateOfBirth: referral.patientDateOfBirth || "",
      patientNationalId: referral.patientNationalId || "",
      bookedDate: referral.bookedDate || "",
    });
    setShowBiodataModal(true);
    setBiodataCode(generateBiodataCode());
  };

  const handleSaveBiodata = async () => {
    if (!selectedReferral) return;
    if (!biodataForm.patientPhone || !biodataForm.stkPhoneNumber) {
      alert("Please fill in patient phone and STK phone number");
      return;
    }

    setLoading(true);
    try {
      const referral = db.referrals.get(selectedReferral.id);
      if (referral) {
        referral.patientPhone = biodataForm.patientPhone;
        referral.stkPhoneNumber = biodataForm.stkPhoneNumber;
        referral.patientDateOfBirth = biodataForm.patientDateOfBirth;
        referral.patientNationalId = biodataForm.patientNationalId;
        referral.bookedDate = biodataForm.bookedDate;
        referral.status = "pending-payment";
        referral.updatedAt = new Date();

        // Send STK prompt
        const stkResult = await sendSTKPaymentPrompt(
          referral.id,
          biodataForm.stkPhoneNumber,
          50,
        );

        if (stkResult.success) {
          // attach generated code to referral for tracking
          referral.biodataCode = biodataCode || null;
          referral.stkSentCount = 1;
          db.referrals.set(referral.id, referral);
          loadReferrals();
          setShowBiodataModal(false);
          setSelectedReferral(null);
          setBiodataCode(null);
          alert("Biodata saved and STK prompt sent successfully!");
        } else {
          alert("Failed to send STK prompt");
        }
      }
    } catch (err) {
      console.log("[v0] Error:", err);
      alert("Error processing referral");
    } finally {
      setLoading(false);
    }
  };

  const handleEditPhone = (referral: any) => {
    setSelectedReferral(referral);
    setEditPhoneData({
      patientPhone: referral.patientPhone || "",
      stkPhoneNumber: referral.stkPhoneNumber || "",
    });
    setShowEditPhoneModal(true);
  };

  const handleSaveEditPhone = async () => {
    if (!selectedReferral) return;

    setLoading(true);
    try {
      const referral = db.referrals.get(selectedReferral.id);
      if (referral) {
        referral.patientPhone = editPhoneData.patientPhone;
        referral.stkPhoneNumber = editPhoneData.stkPhoneNumber;
        referral.updatedAt = new Date();
        db.referrals.set(referral.id, referral);
        loadReferrals();
        setShowEditPhoneModal(false);
        setSelectedReferral(null);
        alert("Phone numbers updated successfully");
      }
    } catch (err) {
      alert("Error updating phone numbers");
    } finally {
      setLoading(false);
    }
  };

  const handleResendSTK = async (referral: any) => {
    if (!referral.stkPhoneNumber) {
      alert("STK phone number not set");
      return;
    }

    setResending(referral.id);
    try {
      const result = await sendSTKPaymentPrompt(
        referral.id,
        referral.stkPhoneNumber,
        50,
      );

      if (result.success) {
        const updated = db.referrals.get(referral.id);
        if (updated) {
          updated.stkSentCount = (updated.stkSentCount || 0) + 1;
          db.referrals.set(referral.id, updated);
          loadReferrals();
        }
        alert(`STK resent successfully to ${referral.stkPhoneNumber}`);
      } else {
        alert(`Failed to resend STK: ${result.message}`);
      }
    } catch (err) {
      alert("Error resending STK");
    } finally {
      setResending(null);
    }
  };

  const handleConfirmPayment = (referral: any) => {
    const updated = db.referrals.get(referral.id);
    if (updated) {
      updated.status = "paid";
      updated.updatedAt = new Date();
      updated.paidAt = new Date();
      updated.completedAt = new Date();
      db.referrals.set(referral.id, updated);
      // notify listeners so completed list updates immediately
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("referral:completed", { detail: updated }));
      }
      loadReferrals();
      alert("Referral confirmed and moved to completed referrals!");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Routine":
        return "bg-success bg-opacity-10 text-success";
      case "Urgent":
        return "bg-warning bg-opacity-10 text-warning";
      case "Emergency":
        return "bg-error bg-opacity-10 text-error";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-warning mb-6">
        Pending Physician Referrals
      </h2>

      {referrals.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-text-secondary">
            No pending referrals at the moment
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {referrals.map((referral) => (
            <Card key={referral.id} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-text-secondary mb-1">
                    Patient Name
                  </p>
                  <p className="font-semibold">{referral.patientName}</p>
                  <p className="text-xs text-text-secondary">
                    ID: {referral.patientId || "N/A"}
                  </p>
                </div>
                <div className="flex items-center">
                  {referral.referralToken && (
                    <div className="ml-auto text-sm font-mono bg-gray-100 text-gray-800 px-2 py-1 rounded">
                      {referral.referralToken}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs text-text-secondary mb-1">
                    Referral Type
                  </p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(referral.priority)}`}
                  >
                    {referral.priority}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-text-secondary mb-1">Status</p>
                  <p className="font-semibold">
                    {referral.status === "pending-admin" &&
                      "Awaiting Administration Action"}
                    {referral.status === "awaiting-biodata" &&
                      "Awaiting Biodata"}
                    {referral.status === "pending-payment" && "Pending Payment"}
                    {referral.status === "confirmed" && "Confirmed"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 py-4 border-t border-b border-border">
                <div>
                  <p className="text-xs text-text-secondary mb-1">From</p>
                  <p className="text-sm">{referral.referringHospital}</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary mb-1">To</p>
                  <p className="text-sm">{referral.receivingFacility}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-text-secondary mb-2">
                  Medical History & Test Results
                </p>
                <details className="text-sm">
                  <summary className="cursor-pointer font-medium text-primary">
                    View Medical Details
                  </summary>
                  <div className="mt-2 p-3 bg-surface rounded space-y-2">
                    <div>
                      <p className="font-medium text-xs">History:</p>
                      <p className="text-xs text-text-secondary">
                        {referral.medicalHistory}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-xs">Lab Results:</p>
                      <p className="text-xs text-text-secondary">
                        {referral.labResults}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-xs">Diagnosis:</p>
                      <p className="text-xs text-text-secondary">
                        {referral.diagnosis}
                      </p>
                    </div>
                  </div>
                </details>
              </div>

              {referral.status !== "pending-admin" && (
                <div className="mb-4 p-3 bg-surface rounded space-y-2">
                  <p className="text-xs font-semibold">Payment Information</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-text-secondary">Patient Phone:</p>
                      <p className="font-mono">{referral.patientPhone}</p>
                    </div>
                    <div>
                      <p className="text-text-secondary">STK Phone:</p>
                      <p className="font-mono">{referral.stkPhoneNumber}</p>
                    </div>
                  </div>
                  {referral.bookedDate && (
                    <div className="text-xs">
                      <p className="text-text-secondary">Booked: {referral.bookedDate}</p>
                    </div>
                  )}
                  {referral.status === "pending-payment" && (
                    <p className="text-xs text-warning">
                      STK sent {referral.stkSentCount} time(s)
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                {referral.status === "pending-admin" && (
                  <Button
                    onClick={() => handleStartBiodata(referral)}
                    className="bg-warning text-white hover:opacity-90"
                  >
                    Add Biodata & Send STK
                  </Button>
                )}

                {referral.status === "pending-payment" && (
                  <>
                    <Button
                      onClick={() => handleResendSTK(referral)}
                      disabled={resending === referral.id}
                      className="btn-secondary text-xs"
                    >
                      {resending === referral.id ? "Sending..." : "Resend STK"}
                    </Button>
                    <Button
                      onClick={() => handleEditPhone(referral)}
                      className="btn-secondary text-xs"
                    >
                      Edit Phone Numbers
                    </Button>
                    <Button
                      onClick={() => handleConfirmPayment(referral)}
                      className="bg-success text-white hover:opacity-90 text-xs"
                    >
                      Mark as Paid
                    </Button>
                  </>
                )}

                {referral.status === "confirmed" && (
                  <div className="text-xs text-success font-semibold">
                    ✓ Referral Completed
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Biodata Modal */}
      {showBiodataModal && selectedReferral && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-2xl w-full bg-background">
            <h3 className="text-lg font-bold mb-4">
              Add Patient Biodata & Send STK
            </h3>
              {biodataCode && (
                <p className="text-sm font-mono mb-2">
                  Referral Code: <span className="font-bold">{biodataCode}</span>
                </p>
              )}
            <p className="text-xs text-text-secondary mb-4">
              Patient: {selectedReferral.patientName}
            </p>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Patient Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={biodataForm.patientPhone}
                    onChange={(e) =>
                      setBiodataForm({
                        ...biodataForm,
                        patientPhone: e.target.value,
                      })
                    }
                    className="input-base"
                    placeholder="+254712345678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone for STK Prompt *
                  </label>
                  <input
                    type="tel"
                    value={biodataForm.stkPhoneNumber}
                    onChange={(e) =>
                      setBiodataForm({
                        ...biodataForm,
                        stkPhoneNumber: e.target.value,
                      })
                    }
                    className="input-base"
                    placeholder="+254712345678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={biodataForm.patientDateOfBirth}
                    onChange={(e) =>
                      setBiodataForm({
                        ...biodataForm,
                        patientDateOfBirth: e.target.value,
                      })
                    }
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    National ID
                  </label>
                  <input
                    type="text"
                    value={biodataForm.patientNationalId}
                    onChange={(e) =>
                      setBiodataForm({
                        ...biodataForm,
                        patientNationalId: e.target.value,
                      })
                    }
                    className="input-base"
                    placeholder="e.g., 12345678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Booked Date
                  </label>
                  <input
                    type="date"
                    value={biodataForm.bookedDate}
                    onChange={(e) =>
                      setBiodataForm({
                        ...biodataForm,
                        bookedDate: e.target.value,
                      })
                    }
                    className="input-base"
                  />
                </div>
                
              </div>
            </div>

            <div className="flex gap-2 mt-6 justify-end">
              <Button
                onClick={() => setShowBiodataModal(false)}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveBiodata}
                className="bg-warning text-white hover:opacity-90"
                disabled={loading}
              >
                {loading ? "Processing..." : "Send STK Prompt"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Phone Modal */}
      {showEditPhoneModal && selectedReferral && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-md w-full bg-background">
            <h3 className="text-lg font-bold mb-4">Edit Phone Numbers</h3>
            <p className="text-xs text-text-secondary mb-4">
              Referral: {selectedReferral.patientName}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Patient Phone Number
                </label>
                <input
                  type="tel"
                  value={editPhoneData.patientPhone}
                  onChange={(e) =>
                    setEditPhoneData({
                      ...editPhoneData,
                      patientPhone: e.target.value,
                    })
                  }
                  className="input-base"
                  placeholder="+254712345678"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  STK Receiving Phone Number
                </label>
                <input
                  type="tel"
                  value={editPhoneData.stkPhoneNumber}
                  onChange={(e) =>
                    setEditPhoneData({
                      ...editPhoneData,
                      stkPhoneNumber: e.target.value,
                    })
                  }
                  className="input-base"
                  placeholder="+254712345678"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6 justify-end">
              <Button
                onClick={() => setShowEditPhoneModal(false)}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEditPhone}
                className="bg-warning text-white hover:opacity-90"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
