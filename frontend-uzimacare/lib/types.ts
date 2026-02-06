// Core data types for Uzimacare

export type UserRole = "patient" | "admin" | "physician";

export interface User {
  id: string;
  role: UserRole;
  email?: string;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Patient extends User {
  phoneNumber: string;
  fullName: string;
  dateOfBirth: string;
  nationalId: string;
}

export interface Clinic {
  id: string;
  name: string;
  facilityName: string;
  location: string;
  maxPatientsPerDay: number;
  createdAt: Date;
}

export interface ClinicSlot {
  id: string;
  clinicId: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:MM-HH:MM format
  isAvailable: boolean;
  createdAt: Date;
}

export interface PatientRecord {
  id: string;
  patientId: string;
  facilityId: string;
  condition: string; // Generic condition field instead of TB-specific
  diagnosisDetails: string; // Generic diagnosis instead of TB diagnosis
  testResults: string; // Generic test results
  treatmentPlan: string; // Generic treatment instead of regimen
  lastVisitDate: Date;
  nextExpectedVisit: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Referral {
  id: string;
  patientId: string;
  sendingPhysicianId: string;
  sendingClinicId: string;
  receivingClinicId: string;
  referralDate: Date;
  reason: string;
  status: "pending" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  referralId: string;
  patientId: string;
  patientPhone: string; // added patient phone number
  stkPhoneNumber: string; // added separate STK receiving phone number
  clinicId: string;
  slotId: string;
  bookingDate: string;
  bookingTime: string;
  status:
    | "pending-payment"
    | "confirmed"
    | "completed"
    | "cancelled"
    | "expired";
  paymentStatus: "pending" | "completed" | "failed";
  paymentAmount: number; // KSH
  mpesaTransactionId?: string;
  stkSentCount: number; // track how many times STK was sent
  createdAt: Date;
  expiresAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: "booking" | "payment" | "overdue" | "rescheduled";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface Physician extends User {
  licenseId: string;
  fullName: string;
  email: string;
  hospital: string;
  specialization?: string;
  createdAt: Date;
}

export interface PhysicianReferral {
  id: string;
  physicianId: string;
  patientName: string;
  patientId?: string;
  medicalHistory: string;
  testResults: string;
  referringHospital: string;
  receivingFacility: string;
  priority: "Routine" | "Urgent" | "Emergency";
  status:
    | "pending-admin"
    | "awaiting-biodata"
    | "pending-payment"
    | "confirmed"
    | "cancelled";
  patientPhone?: string;
  stkPhoneNumber?: string;
  patientDateOfBirth?: string;
  patientNationalId?: string;
  bookedSlot?: string;
  bookedDate?: string;
  bookingId?: string;
  stkSentCount: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
