const cron = require('node-cron');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');

// Run every hour to check for expired bookings
const checkExpiredBookings = cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();
    
    // Find expired bookings
    const expiredBookings = await Booking.find({
      status: 'pending-payment',
      expiresAt: { $lt: now }
    });

    for (const booking of expiredBookings) {
      // Update booking status
      booking.status = 'expired';
      await booking.save();

      // Create notification for patient
      const notification = new Notification({
        userId: booking.patientId,
        type: 'booking',
        title: 'Booking Expired',
        message: `Your booking for ${booking.bookingDate.toDateString()} has expired due to non-payment.`,
        priority: 'high',
        metadata: {
          bookingId: booking._id
        }
      });
      await notification.save();

      logger.info(`Booking ${booking._id} expired and notification sent`);
    }

    if (expiredBookings.length > 0) {
      logger.info(`Processed ${expiredBookings.length} expired bookings`);
    }
  } catch (error) {
    logger.error('Error checking expired bookings:', error);
  }
}, {
  scheduled: false
});

module.exports = { checkExpiredBookings };
