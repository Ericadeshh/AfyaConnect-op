const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  dateOfBirth: {
    type: Date
  },
  nationalId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  emergencyContact: {
    name: String,
    phoneNumber: String,
    relationship: String
  },
  medicalHistory: [{
    condition: String,
    diagnosedDate: Date,
    notes: String
  }]
}, {
  timestamps: true
});

// Indexes
patientSchema.index({ userId: 1 });
patientSchema.index({ nationalId: 1 });

module.exports = mongoose.model('Patient', patientSchema);
