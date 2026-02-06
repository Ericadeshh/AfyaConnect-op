const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  referralId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Referral'
  },
  phoneNumber: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  mpesaTransactionId: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  stkRequestId: String,
  errorMessage: String,
  mpesaReceiptNumber: String,
  transactionDate: Date,
  paymentMethod: {
    type: String,
    default: 'mpesa'
  }
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ referralId: 1 });
paymentSchema.index({ phoneNumber: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ mpesaTransactionId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
