"use client";

import type React from "react";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  sendSTKPaymentPrompt,
  getAvailableSlots,
  getAvailableDates,
} from "../../lib/payment";
import { db } from "../../lib/db";

const clinics = [
  { id: "clinic-001", name: "TB Wing A - Nairobi Central Hospital" },
  { id: "clinic-002", name: "TB Wing B - Mombasa County Hospital" },
];

export default function ReferralForm() {
  const [formData, setFormData] = useState({
    patientName: "",
    patientPhone: "", // Patient's actual phone number
    stkPhoneNumber: "", // Phone number to receive STK prompt (can be different)
    patientId: "patient-001",
    sendingClinic: "clinic-001",
    receivingClinic: "clinic-002",
    referralDate: "",
    referralTime: "",
    reason: "",
  });

  const [stkSent, setStkSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [error, setError] = useState("");

  const handleClinicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "receivingClinic") {
      const dates = getAvailableDates(value, new Date(), 30);
      setAvailableDates(dates);
      setFormData((prev) => ({ ...prev, referralDate: "" }));
      setAvailableSlots([]);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, referralDate: value, referralTime: "" }));

    if (value && formData.receivingClinic) {
      const slots = getAvailableSlots(formData.receivingClinic, value);
      setAvailableSlots(slots.available);

      if (slots.isFull) {
        setError(
          "This clinic is fully booked for this date. Please select another date.",
        );
      } else {
        setError("");
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    if (name === "receivingClinic") {
      handleClinicChange(e as React.ChangeEvent<HTMLSelectElement>);
    } else if (name === "referralDate") {
      handleDateChange(e as React.ChangeEvent<HTMLInputElement>);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Create booking in database
      const bookingId = `booking-${Date.now()}`;
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      const booking = {
        id: bookingId,
        referralId: `referral-${Date.now()}`,
        patientId: formData.patientId,
        patientPhone: formData.patientPhone, // Store patient phone
        stkPhoneNumber: formData.stkPhoneNumber, // Store STK phone
        clinicId: formData.receivingClinic,
        slotId: `slot-${formData.referralTime}`,
        bookingDate: formData.referralDate,
        bookingTime: formData.referralTime,
        status: "pending-payment",
        paymentStatus: "pending",
        paymentAmount: 50,
        mpesaTransactionId: undefined,
        stkSentCount: 0, // Initialize STK sent counter
        createdAt: new Date(),
        expiresAt,
        updatedAt: new Date(),
      };

      db.bookings.set(bookingId, booking);
      console.log("[v0] Booking created:", booking);

      // Send STK payment prompt to the STK phone number
      const result = await sendSTKPaymentPrompt(
        bookingId,
        formData.stkPhoneNumber,
        50,
      );

      if (result.success) {
        booking.stkSentCount = 1;
        db.bookings.set(bookingId, booking);

        setStkSent(true);
        alert(`Referral created! ${result.message}`);

        // Reset form
        setFormData({
          patientName: "",
          patientPhone: "",
          stkPhoneNumber: "",
          patientId: "patient-001",
          sendingClinic: "clinic-001",
          receivingClinic: "clinic-002",
          referralDate: "",
          referralTime: "",
          reason: "",
        });

        // Auto-reset after 3 seconds
        setTimeout(() => setStkSent(false), 3000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to create referral. Please try again.");
      console.error("[v0] Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-8 max-w-3xl">
      <h2 className="text-2xl font-bold mb-6 text-warning">
        Create Inter-Facility Referral
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Patient Name
            </label>
            <input
              type="text"
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              className="input-base"
              placeholder="Patient full name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Patient Phone Number
            </label>
            <input
              type="tel"
              name="patientPhone"
              value={formData.patientPhone}
              onChange={handleChange}
              className="input-base"
              placeholder="+254712345678"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Phone Number for STK Prompt
          </label>
          <input
            type="tel"
            name="stkPhoneNumber"
            value={formData.stkPhoneNumber}
            onChange={handleChange}
            className="input-base"
            placeholder="+254712345678 (can be different from patient phone)"
            required
          />
          <p className="text-xs text-text-secondary mt-1">
            This is the phone that will receive the M-Pesa STK push
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Sending Clinic
            </label>
            <select
              name="sendingClinic"
              value={formData.sendingClinic}
              onChange={handleChange}
              className="input-base"
            >
              {clinics.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Receiving Clinic
            </label>
            <select
              name="receivingClinic"
              value={formData.receivingClinic}
              onChange={handleChange}
              className="input-base"
            >
              {clinics.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Referral Date
          </label>
          {availableDates.length > 0 ? (
            <select
              name="referralDate"
              value={formData.referralDate}
              onChange={(e) => handleDateChange(e as any)}
              className="input-base"
              required
            >
              <option value="">Select a date</option>
              {availableDates.map((date) => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="date"
              name="referralDate"
              value={formData.referralDate}
              onChange={(e) => handleDateChange(e)}
              className="input-base"
              required
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Available Time Slot
          </label>
          {availableSlots.length > 0 ? (
            <select
              name="referralTime"
              value={formData.referralTime}
              onChange={handleChange}
              className="input-base"
              required
            >
              <option value="">Select a time</option>
              {availableSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          ) : (
            <div className="text-text-secondary text-sm p-3 bg-surface rounded border border-border">
              Select a date first to see available times
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Reason for Referral
          </label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            className="input-base min-h-25"
            placeholder="Medical reason for referral"
            required
          />
        </div>

        {error && (
          <div className="bg-error bg-opacity-10 border border-error text-error p-3 rounded">
            {error}
          </div>
        )}

        {stkSent && (
          <div className="bg-success bg-opacity-10 border border-success p-4 rounded">
            <p className="text-success font-medium">STK sent successfully</p>
            <p className="text-sm text-text-secondary mt-1">
              Waiting for payment confirmation...
            </p>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading || stkSent}
          className="w-full bg-warning hover:opacity-90 text-white mt-6 disabled:opacity-50"
        >
          {loading ? "Processing..." : "Send STK Payment Prompt"}
        </Button>
      </form>
    </Card>
  );
}
