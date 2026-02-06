"use client";

import { useState } from "react";
import {
  confirmPayment,
  getAvailableSlots,
  getAvailableDates,
} from "../../lib/payment";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface BookingDetailsProps {
  booking: any;
  onBack: () => void;
}

export default function BookingDetails({
  booking,
  onBack,
}: BookingDetailsProps) {
  const [showReschedule, setShowReschedule] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleShowReschedule = () => {
    const dates = getAvailableDates(booking.clinicId, new Date(), 30);
    setAvailableDates(dates);
    setShowReschedule(true);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    const slots = getAvailableSlots(booking.clinicId, date);
    setAvailableSlots(slots.available);
    setSelectedTime("");
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    const result = await confirmPayment(booking.id);
    setLoading(false);

    if (result.success) {
      alert(result.message);
      onBack();
    } else {
      alert(result.message);
    }
  };

  const handleReschedule = () => {
    if (selectedDate && selectedTime) {
      console.log("[v0] Rescheduling to:", selectedDate, selectedTime);
      alert(`Booking rescheduled to ${selectedDate} at ${selectedTime}`);
      onBack();
    }
  };

  return (
    <div className="space-y-6">
      <Button onClick={onBack} className="btn-secondary">
        Back to Bookings
      </Button>

      <Card className="p-8">
        <h2 className="text-3xl font-bold text-primary mb-6">
          Booking Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Appointment Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-text-secondary">Clinic</p>
                <p className="font-medium">{booking.clinic}</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Date</p>
                <p className="font-medium">{booking.date}</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Time</p>
                <p className="font-medium">{booking.time}</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Amount</p>
                <p className="font-medium text-lg">KSH {booking.amount}</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Status</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    booking.status === "pending-payment"
                      ? "bg-warning bg-opacity-10 text-warning"
                      : "bg-success bg-opacity-10 text-success"
                  }`}
                >
                  {booking.status === "pending-payment"
                    ? "Pending Payment"
                    : "Confirmed"}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Payment Instructions</h3>
            {booking.status === "pending-payment" ? (
              <div className="space-y-4">
                <div className="bg-warning bg-opacity-10 border border-warning p-4 rounded-lg">
                  <p className="text-warning font-medium mb-2">
                    Action Required
                  </p>
                  <p className="text-sm text-text-secondary">
                    Please complete payment within {booking.daysLeft || 1}{" "}
                    day(s) to confirm this booking.
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary mb-2">
                    Pay KSH 50 via MPESA to:
                  </p>
                  <p className="font-mono bg-surface p-3 rounded border border-border">
                    *844#
                  </p>
                </div>
                <Button
                  onClick={handleConfirmPayment}
                  disabled={loading}
                  className="w-full bg-success hover:opacity-90 text-white disabled:opacity-50"
                >
                  {loading ? "Confirming..." : "I Have Paid - Confirm Payment"}
                </Button>
              </div>
            ) : (
              <div className="bg-success bg-opacity-10 border border-success p-4 rounded-lg">
                <p className="text-success font-medium">Payment Confirmed</p>
                <p className="text-sm text-text-secondary mt-2">
                  Your booking is confirmed. Please arrive 10 minutes early.
                </p>
              </div>
            )}
          </div>
        </div>

        {booking.status === "pending-payment" && (
          <div className="mt-8 pt-8 border-t border-border">
            <h3 className="text-lg font-semibold mb-4">Reschedule Booking</h3>
            {!showReschedule ? (
              <Button onClick={handleShowReschedule} className="btn-secondary">
                Reschedule to Different Date
              </Button>
            ) : (
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select New Date
                  </label>
                  <select
                    value={selectedDate}
                    onChange={(e) => handleDateSelect(e.target.value)}
                    className="input-base"
                  >
                    <option value="">Choose a date</option>
                    {availableDates.map((date) => (
                      <option key={date} value={date}>
                        {date}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedDate && availableSlots.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Select Time Slot
                    </label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="input-base"
                    >
                      <option value="">Choose a time</option>
                      {availableSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={handleReschedule}
                    disabled={!selectedDate || !selectedTime}
                    className="flex-1 bg-accent hover:bg-accent-light text-white disabled:opacity-50"
                  >
                    Confirm Reschedule
                  </Button>
                  <Button
                    onClick={() => setShowReschedule(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
