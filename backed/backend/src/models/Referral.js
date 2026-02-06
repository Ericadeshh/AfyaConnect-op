const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  physicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Physician',
    required: true
  },
  patientName: {
    type: String,
    required: true,
    trim: true
  },
  patientId: {
    type: String,
    trim: true
  },
  medicalHistory: {
    type: String,
    required: true
  },
  labResults: {
    type: String,
    required: true
  },
  diagnosis: {
    type: String,
    required: true
  },
  referringHospital: {
    type: String,
    required: true,
    trim: true
  },
  receivingFacility: {
    type: String,
    required: true,
    trim: true
  },
  priority: {
    type: String,
    enum: ['Routine', 'Urgent', 'Emergency'],
    default: 'Routine'
  },
  status: {
    type: String,
    enum: [
      'pending-admin',
      'awaiting-biodata', 
      'pending-payment',
      'confirmed',
      'paid',
      'completed',
      'cancelled'
    ],
    default: 'pending-admin'
  },
  referralToken: {
    type: String,
    unique: true,
    sparse: true
  },
  patientPhone: String,
  stkPhoneNumber: String,
  patientDateOfBirth: Date,
  patientNationalId: String,
  bookedDate: Date,
  bookedTime: String,
  stkSentCount: {
    type: Number,
    default: 0
  },
  completedAt: Date,
  paidAt: Date,
  biodataCode: String,
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    uploadDate: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Indexes
referralSchema.index({ physicianId: 1 });
referralSchema.index({ status: 1 });
referralSchema.index({ referralToken: 1 });
referralSchema.index({ patientId: 1 });
referralSchema.index({ priority: 1 });
referralSchema.index({ createdAt: -1 });

// Generate referral token before saving
referralSchema.pre('save', function(next) {
  if (!this.referralToken && this.isNew) {
    this.referralToken = generateToken();
  }
  next();
});

function generateToken(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

module.exports = mongoose.model('Referral', referralSchema);
