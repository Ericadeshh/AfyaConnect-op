// Payment processing and booking expiry logic

import { db } from "./db";

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  message: string;
}

interface BookingExpiryCheck {
  expiredBookings: any[];
  activeBookings: any[];
}

// Simulate STK push to patient
export async function sendSTKPaymentPrompt(
  bookingId: string,
  phoneNumber: string,
  amount: number,
): Promise<PaymentResult> {
  console.log(`[v0] Sending STK to ${phoneNumber} for KSH ${amount}`);

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock success rate of 95%
  const isSuccessful = Math.random() > 0.05;

  if (isSuccessful) {
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Update booking with transaction ID
    const booking = db.bookings.get(bookingId);
    if (booking) {
      booking.mpesaTransactionId = transactionId;
      booking.updatedAt = new Date();
      db.bookings.set(bookingId, booking);
    }

    return {
      success: true,
      transactionId,
      message: `STK prompt sent to ${phoneNumber}. Patient has 1 hour to complete payment.`,
    };
  }

  return {
    success: false,
    message: `Failed to send STK prompt. Please try again.`,
  };
}

// Confirm payment manually (in production, this would be webhook from M-Pesa)
export async function confirmPayment(
  bookingId: string,
): Promise<PaymentResult> {
  const booking = db.bookings.get(bookingId);

  if (!booking) {
    return { success: false, message: "Booking not found" };
  }

  if (booking.paymentStatus === "completed") {
    return { success: false, message: "Payment already completed" };
  }

  // Update booking status
  booking.paymentStatus = "completed";
  booking.status = "confirmed";
  booking.updatedAt = new Date();
  db.bookings.set(bookingId, booking);

  // Create notification
  const notification = {
    id: `notif-${Date.now()}`,
    userId: booking.patientId,
    type: "payment",
    title: "Payment Confirmed",
    message: `Your booking at clinic on ${booking.bookingDate} has been confirmed.`,
    isRead: false,
    createdAt: new Date(),
  };
  db.notifications.set(notification.id, notification);

  return {
    success: true,
    message: "Payment confirmed. Booking is now active.",
  };
}

// Check and expire old bookings (should run periodically)
export function checkAndExpireBookings(): BookingExpiryCheck {
  const now = new Date();
  const expiredBookings: any[] = [];
  const activeBookings: any[] = [];

  db.bookings.forEach((booking) => {
    // Only check pending payment bookings
    if (booking.status === "pending-payment" && booking.expiresAt) {
      const expirationTime = new Date(booking.expiresAt);

      if (now > expirationTime) {
        // Expire the booking
        booking.status = "expired";
        booking.updatedAt = new Date();
        db.bookings.set(booking.id, booking);
        expiredBookings.push(booking);

        // Create notification for patient
        const notification = {
          id: `notif-${Date.now()}-${booking.id}`,
          userId: booking.patientId,
          type: "booking",
          title: "Booking Expired",
          message: `Your booking for ${booking.bookingDate} has expired due to non-payment.`,
          isRead: false,
          createdAt: new Date(),
        };
        db.notifications.set(notification.id, notification);
      } else {
        activeBookings.push(booking);
      }
    }
  });

  return { expiredBookings, activeBookings };
}

// Get available slots for a clinic on a specific date
export function getAvailableSlots(
  clinicId: string,
  date: string,
  maxPerDay = 15,
) {
  const allSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
  ];

  // Count confirmed bookings for this clinic on this date
  let confirmedCount = 0;
  const bookedTimes = new Set<string>();

  db.bookings.forEach((booking) => {
    if (
      booking.clinicId === clinicId &&
      booking.bookingDate === date &&
      booking.status === "confirmed"
    ) {
      confirmedCount++;
      bookedTimes.add(booking.bookingTime);
    }
  });

  const available = allSlots.filter((time) => !bookedTimes.has(time));

  return {
    available: available.slice(0, maxPerDay - confirmedCount),
    isFull: confirmedCount >= maxPerDay,
    availableCount: Math.max(0, maxPerDay - confirmedCount),
  };
}

// Get dates with available slots
export function getAvailableDates(
  clinicId: string,
  startDate: Date,
  daysAhead = 30,
): string[] {
  const available: string[] = [];
  const maxPerDay = db.clinics.get(clinicId)?.maxPatientsPerDay || 15;

  for (let i = 0; i < daysAhead; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const dateStr = date.toISOString().split("T")[0];
    const slots = getAvailableSlots(clinicId, dateStr, maxPerDay);

    if (slots.available.length > 0) {
      available.push(dateStr);
    }
  }

  return available;
}

// Move overbooked patients to next available date
export function redistributeOverbookedBookings(clinicId: string, date: string) {
  const maxPerDay = db.clinics.get(clinicId)?.maxPatientsPerDay || 15;
  const overbookedCount = 0;

  const bookingsOnDate = Array.from(db.bookings.values()).filter(
    (b) =>
      b.clinicId === clinicId &&
      b.bookingDate === date &&
      b.status === "confirmed",
  );

  // If over capacity, move excess to next available date
  if (bookingsOnDate.length > maxPerDay) {
    const excess = bookingsOnDate.slice(maxPerDay);

    excess.forEach((booking) => {
      // Find next available date
      const nextDates = getAvailableDates(clinicId, new Date(date), 7);

      if (nextDates.length > 0) {
        booking.bookingDate = nextDates[0];
        booking.status = "pending-payment";
        booking.expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        db.bookings.set(booking.id, booking);

        // Notify patient
        const notification = {
          id: `notif-${Date.now()}`,
          userId: booking.patientId,
          type: "rescheduled",
          title: "Booking Rescheduled",
          message: `Your booking has been moved to ${nextDates[0]} due to clinic capacity.`,
          isRead: false,
          createdAt: new Date(),
        };
        db.notifications.set(notification.id, notification);
      }
    });
  }

  return overbookedCount;
}
