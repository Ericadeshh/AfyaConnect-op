const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  facilityName: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  maxPatientsPerDay: {
    type: Number,
    required: true,
    min: 1,
    default: 15
  },
  contactPhone: {
    type: String,
    trim: true
  },
  contactEmail: {
    type: String,
    lowercase: true,
    trim: true
  },
  operatingHours: {
    monday: { start: String, end: String },
    tuesday: { start: String, end: String },
    wednesday: { start: String, end: String },
    thursday: { start: String, end: String },
    friday: { start: String, end: String },
    saturday: { start: String, end: String },
    sunday: { start: String, end: String }
  },
  services: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
clinicSchema.index({ location: 1 });
clinicSchema.index({ isActive: 1 });
clinicSchema.index({ facilityName: 'text', name: 'text' });

module.exports = mongoose.model('Clinic', clinicSchema);
