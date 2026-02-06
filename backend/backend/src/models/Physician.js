const mongoose = require('mongoose');

const physicianSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  licenseId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  hospital: {
    type: String,
    required: true,
    trim: true
  },
  specialization: {
    type: String,
    trim: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDate: {
    type: Date
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
physicianSchema.index({ userId: 1 });
physicianSchema.index({ licenseId: 1 });
physicianSchema.index({ hospital: 1 });

module.exports = mongoose.model('Physician', physicianSchema);
