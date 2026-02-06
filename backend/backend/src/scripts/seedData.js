const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Physician = require('../models/Physician');
const Patient = require('../models/Patient');
const Clinic = require('../models/Clinic');
const Referral = require('../models/Referral');

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Physician.deleteMany({});
    await Patient.deleteMany({});
    await Clinic.deleteMany({});
    await Referral.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminUser = new User({
      role: 'admin',
      email: 'admin@uzimacare.ke',
      password: 'password123',
      fullName: 'Admin User',
      isActive: true
    });
    await adminUser.save();
    console.log('Admin user created');

    // Create physician users
    const physician1User = new User({
      role: 'physician',
      email: 'dr.kipchoge@hospital.ke',
      password: 'password123',
      fullName: 'Dr. James Kipchoge',
      isActive: true
    });
    await physician1User.save();

    const physician2User = new User({
      role: 'physician',
      email: 'dr.omondi@hospital.ke',
      password: 'password123',
      fullName: 'Dr. Sarah Omondi',
      isActive: true
    });
    await physician2User.save();

    // Create physician profiles
    const physician1 = new Physician({
      userId: physician1User._id,
      licenseId: '56845',
      hospital: 'Nairobi Central Hospital',
      specialization: 'Internal Medicine',
      isVerified: true
    });
    await physician1.save();

    const physician2 = new Physician({
      userId: physician2User._id,
      licenseId: 'PH-67890',
      hospital: 'Mombasa County Hospital',
      specialization: 'General Practice',
      isVerified: true
    });
    await physician2.save();

    // Create patient user
    const patientUser = new User({
      role: 'patient',
      phoneNumber: '+254712345678',
      password: 'password123',
      fullName: 'John Doe',
      isActive: true
    });
    await patientUser.save();

    const patient = new Patient({
      userId: patientUser._id,
      dateOfBirth: new Date('1990-01-01'),
      nationalId: '12345678',
      emergencyContact: {
        name: 'Jane Doe',
        phoneNumber: '+254712345679',
        relationship: 'Spouse'
      }
    });
    await patient.save();

    // Create clinics
    const clinic1 = new Clinic({
      name: 'TB Wing A',
      facilityName: 'Nairobi Central Hospital',
      location: 'Nairobi',
      maxPatientsPerDay: 15,
      contactPhone: '+254700123456',
      isActive: true,
      services: ['TB Treatment', 'General Medicine', 'X-Ray'],
      operatingHours: {
        monday: { start: '08:00', end: '17:00' },
        tuesday: { start: '08:00', end: '17:00' },
        wednesday: { start: '08:00', end: '17:00' },
        thursday: { start: '08:00', end: '17:00' },
        friday: { start: '08:00', end: '17:00' },
        saturday: { start: '08:00', end: '12:00' },
        sunday: { start: '', end: '' }
      }
    });
    await clinic1.save();

    const clinic2 = new Clinic({
      name: 'TB Wing B',
      facilityName: 'Mombasa County Hospital',
      location: 'Mombasa',
      maxPatientsPerDay: 10,
      contactPhone: '+254700654321',
      isActive: true,
      services: ['TB Treatment', 'Pulmonology', 'Laboratory'],
      operatingHours: {
        monday: { start: '08:00', end: '17:00' },
        tuesday: { start: '08:00', end: '17:00' },
        wednesday: { start: '08:00', end: '17:00' },
        thursday: { start: '08:00', end: '17:00' },
        friday: { start: '08:00', end: '17:00' },
        saturday: { start: '08:00', end: '12:00' },
        sunday: { start: '', end: '' }
      }
    });
    await clinic2.save();

    // Create sample referrals
    const referral1 = new Referral({
      physicianId: physician1._id,
      patientName: 'Margaret Wanjiru',
      patientId: 'MRN-5432',
      medicalHistory: 'Patient presents with persistent cough and fever for 3 weeks. History of recent respiratory illness.',
      labResults: 'Chest imaging shows abnormality in upper right lobe.',
      diagnosis: 'Possible pulmonary infection; specialist consult recommended.',
      referringHospital: 'Nairobi Central Hospital',
      receivingFacility: 'Mombasa County Hospital',
      priority: 'Urgent',
      status: 'pending-admin'
    });
    await referral1.save();

    const referral2 = new Referral({
      physicianId: physician2._id,
      patientName: 'Peter Otieno',
      patientId: 'MRN-9876',
      medicalHistory: 'Patient with chronic cough and weight loss. Requires further evaluation and referral.',
      labResults: 'Sputum test pending; X-ray shows possible infiltrates.',
      diagnosis: 'Suspected pulmonary infection',
      referringHospital: 'Mombasa County Hospital',
      receivingFacility: 'Nairobi Central Hospital',
      priority: 'Routine',
      status: 'pending-admin'
    });
    await referral2.save();

    console.log('Sample data created successfully');
    console.log('\nLogin credentials:');
    console.log('Admin: admin@uzimacare.ke / password123');
    console.log('Physician 1: dr.kipchoge@hospital.ke / password123 (License: 56845)');
    console.log('Physician 2: dr.omondi@hospital.ke / password123 (License: PH-67890)');
    console.log('Patient: +254712345678 / password123');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
