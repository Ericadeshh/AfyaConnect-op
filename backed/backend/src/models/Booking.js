const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  referralId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Referral'
  },
  patientId: {
    type: String,
    required: true
  },
  patientPhone: {
    type: String,
    required: true
  },
  stkPhoneNumber: {
    type: String,
    required: true
  },
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    required: true
  },
  slotId: {
    type: String,
    required: true
  },
  bookingDate: {
    type: Date,
    required: true
  },
  bookingTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending-payment', 'confirmed', 'completed', 'cancelled', 'expired'],
    default: 'pending-payment'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentAmount: {
    type: Number,
    required: true,
    min: 0
  },
  mpesaTransactionId: String,
  stkSentCount: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    required: true
  },
  notes: String
}, {
  timestamps: true
});

// Indexes
bookingSchema.index({ patientId: 1 });
bookingSchema.index({ clinicId: 1, bookingDate: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ expiresAt: 1 });
bookingSchema.index({ mpesaTransactionId: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
