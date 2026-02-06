// Appointment reminder system - automatically generates reminders 2 weeks and 1 day before clinic visits

import { db } from "./db";
import { createNotification } from "./notifications";

export interface ReminderStatus {
  twoWeeksReminderSent: boolean;
  oneDayReminderSent: boolean;
}

export function checkAndSendReminders(patientId: string): ReminderStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const status: ReminderStatus = {
    twoWeeksReminderSent: false,
    oneDayReminderSent: false,
  };

  // Get all confirmed bookings for this patient
  db.bookings.forEach((booking) => {
    if (booking.patientId === patientId && booking.status === "confirmed") {
      const bookingDate = new Date(booking.bookingDate);
      bookingDate.setHours(0, 0, 0, 0);

      // Calculate days until appointment
      const daysUntilAppointment = Math.floor(
        (bookingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysUntilAppointment >= 13 && daysUntilAppointment <= 15) {
        const reminderKey = `reminder-2weeks-${booking.id}`;
        if (!db.notifications.has(reminderKey)) {
          const clinic = db.clinics.get(booking.clinicId);
          const clinicName = clinic?.facilityName || "Your clinic";

          createNotification(
            patientId,
            "booking",
            "Appointment Reminder - 2 Weeks",
            `Your appointment at ${clinicName} is scheduled for ${booking.bookingDate} at ${booking.bookingTime}. Please ensure you arrive on time.`,
          );

          // Mark this reminder as sent
          db.notifications.set(reminderKey, {
            sent: true,
            bookingId: booking.id,
            date: new Date(),
          });
          status.twoWeeksReminderSent = true;
        }
      }

      if (daysUntilAppointment === 1) {
        const reminderKey = `reminder-1day-${booking.id}`;
        if (!db.notifications.has(reminderKey)) {
          const clinic = db.clinics.get(booking.clinicId);
          const clinicName = clinic?.facilityName || "Your clinic";

          createNotification(
            patientId,
            "booking",
            "Appointment Reminder - Tomorrow",
            `Your appointment at ${clinicName} is tomorrow at ${booking.bookingTime}. Please prepare and arrive on time.`,
          );

          // Mark this reminder as sent
          db.notifications.set(reminderKey, {
            sent: true,
            bookingId: booking.id,
            date: new Date(),
          });
          status.oneDayReminderSent = true;
        }
      }
    }
  });

  return status;
}

export function getRemindersSentForBooking(bookingId: string) {
  const twoWeeksKey = `reminder-2weeks-${bookingId}`;
  const oneDayKey = `reminder-1day-${bookingId}`;

  return {
    twoWeeksSent: db.notifications.has(twoWeeksKey),
    oneDaySent: db.notifications.has(oneDayKey),
  };
}
