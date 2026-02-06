"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { sendSTKPaymentPrompt } from "../../lib/payment";
import { db } from "../../lib/db";

export default function ReferralsList() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    patientPhone: "",
    stkPhoneNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState<string | null>(null);

  // Load bookings on mount
  useEffect(() => {
    const allBookings = Array.from(db.bookings.values());
    setBookings(allBookings);
  }, []);

  const handleResendSTK = async (bookingId: string, stkPhone: string) => {
    setResending(bookingId);
    try {
      const result = await sendSTKPaymentPrompt(bookingId, stkPhone, 50);

      if (result.success) {
        const booking = db.bookings.get(bookingId);
        if (booking) {
          booking.stkSentCount = (booking.stkSentCount || 0) + 1;
          db.bookings.set(bookingId, booking);
          setBookings(Array.from(db.bookings.values()));
        }
        alert(`STK resent successfully to ${stkPhone}`);
      } else {
        alert(`Failed to resend STK: ${result.message}`);
      }
    } catch (err) {
      alert("Error resending STK");
    } finally {
      setResending(null);
    }
  };

  const handleEditPhones = (booking: any) => {
    setSelectedBooking(booking);
    setEditData({
      patientPhone: booking.patientPhone,
      stkPhoneNumber: booking.stkPhoneNumber,
    });
    setShowEditModal(true);
  };

  const handleSavePhones = async () => {
    if (!selectedBooking) return;

    setLoading(true);
    try {
      const booking = db.bookings.get(selectedBooking.id);
      if (booking) {
        booking.patientPhone = editData.patientPhone;
        booking.stkPhoneNumber = editData.stkPhoneNumber;
        booking.updatedAt = new Date();
        db.bookings.set(booking.id, booking);
        setBookings(Array.from(db.bookings.values()));
      }
      setShowEditModal(false);
      alert("Phone numbers updated successfully");
    } catch (err) {
      alert("Error updating phone numbers");
    } finally {
      setLoading(false);
    }
  };

  const getAllBookings = () => {
    return Array.from(db.bookings.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  };

  const allBookings = getAllBookings();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-warning mb-6">All Referrals</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-border">
              <th className="text-left p-4 font-semibold">Patient</th>
              <th className="text-left p-4 font-semibold">Patient Phone</th>
              <th className="text-left p-4 font-semibold">STK Phone</th>
              <th className="text-left p-4 font-semibold">Date & Time</th>
              <th className="text-left p-4 font-semibold">Status</th>
              <th className="text-left p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {allBookings.map((booking) => (
              <tr
                key={booking.id}
                className="border-b border-border hover:bg-surface"
              >
                <td className="p-4">
                  <div>
                    <p className="font-medium">Patient #{booking.patientId}</p>
                    <p className="text-xs text-text-secondary">
                      {booking.id.slice(-6)}
                    </p>
                  </div>
                </td>
                <td className="p-4 text-sm font-mono">
                  {booking.patientPhone}
                </td>
                <td className="p-4 text-sm font-mono">
                  {booking.stkPhoneNumber}
                </td>
                <td className="p-4 text-sm">
                  {booking.bookingDate} {booking.bookingTime}
                </td>
                <td className="p-4">
                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium block ${
                        booking.status === "pending-payment"
                          ? "bg-warning bg-opacity-10 text-warning"
                          : booking.status === "confirmed"
                            ? "bg-success bg-opacity-10 text-success"
                            : "bg-error bg-opacity-10 text-error"
                      }`}
                    >
                      {booking.status}
                    </span>
                    <p className="text-xs text-text-secondary mt-1">
                      STK sent: {booking.stkSentCount || 0}x
                    </p>
                  </div>
                </td>
                <td className="p-4 space-y-2">
                  {booking.status === "pending-payment" && (
                    <>
                      <Button
                        size="sm"
                        className="btn-secondary text-xs w-full"
                        onClick={() =>
                          handleResendSTK(booking.id, booking.stkPhoneNumber)
                        }
                        disabled={resending === booking.id}
                      >
                        {resending === booking.id ? "Sending..." : "Resend STK"}
                      </Button>
                      <Button
                        size="sm"
                        className="btn-secondary text-xs w-full"
                        onClick={() => handleEditPhones(booking)}
                      >
                        Edit Phones
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showEditModal && selectedBooking && (
        <Card className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-md w-full bg-background">
            <h3 className="text-lg font-bold mb-4">Edit Phone Numbers</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Patient Phone Number
                </label>
                <input
                  type="tel"
                  value={editData.patientPhone}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      patientPhone: e.target.value,
                    }))
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
                  value={editData.stkPhoneNumber}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      stkPhoneNumber: e.target.value,
                    }))
                  }
                  className="input-base"
                  placeholder="+254712345678"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSavePhones}
                  disabled={loading}
                  className="flex-1 bg-warning text-white hover:opacity-90"
                >
                  {loading ? "Saving..." : "Save"}
                </Button>
                <Button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </Card>
      )}
    </div>
  );
}
