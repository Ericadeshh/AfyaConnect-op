// Mock database for development (will be replaced with Supabase)
// All data stored in memory - in production, use proper database

interface Database {
  users: Map<string, any>;
  patients: Map<string, any>;
  physicians: Map<string, any>;
  clinics: Map<string, any>;
  slots: Map<string, any>;
  bookings: Map<string, any>;
  referrals: Map<string, any>;
  notifications: Map<string, any>;
}

const db: Database = {
  users: new Map(),
  patients: new Map(),
  physicians: new Map(),
  clinics: new Map(),
  slots: new Map(),
  bookings: new Map(),
  referrals: new Map(),
  notifications: new Map(),
};

// Initialize with demo data
function initializeDemoData() {
  // Check if already initialized to prevent duplicate data
  if (db.users.has("admin-001")) {
    return;
  }

  const clinic1 = {
    id: "clinic-001",
    name: "General Medical Wing",
    facilityName: "Nairobi Central Hospital",
    location: "Nairobi",
    maxPatientsPerDay: 15,
    createdAt: new Date(),
  };

  const clinic2 = {
    id: "clinic-002",
    name: "Specialized Care Wing",
    facilityName: "Mombasa County Hospital",
    location: "Mombasa",
    maxPatientsPerDay: 10,
    createdAt: new Date(),
  };

  db.clinics.set(clinic1.id, clinic1);
  db.clinics.set(clinic2.id, clinic2);

  // Demo Admin
  const admin = {
    id: "admin-001",
    role: "admin",
    fullName: "Admin User",
    email: "admin@uzimacare.ke",
    createdAt: new Date(),
  };

  db.users.set(admin.id, admin);

  // patient demo entry removed — system now retains only physician and admin demo users

  // Demo Physicians
  const physician1 = {
    id: "physician-001",
    role: "physician",
    licenseId: "56845",
    fullName: "Dr. James Kipchoge",
    email: "dr.kipchoge@hospital.ke",
    hospital: "Nairobi Central Hospital",
    specialization: "Internal Medicine",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const physician2 = {
    id: "physician-002",
    role: "physician",
    licenseId: "PH-67890",
    fullName: "Dr. Sarah Omondi",
    email: "dr.omondi@hospital.ke",
    hospital: "Mombasa County Hospital",
    specialization: "General Practice",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  db.physicians.set(physician1.id, physician1);
  db.physicians.set(physician2.id, physician2);
  db.users.set(physician1.id, physician1);
  db.users.set(physician2.id, physician2);

  const referral1 = {
    id: "ref-001",
    physicianId: "physician-001",
    patientName: "Margaret Wanjiru",
    patientId: "MRN-5432",
    medicalHistory:
      "Patient presents with persistent cough and fever for 3 weeks. History of recent respiratory illness.",
    labResults:
      "Chest imaging shows abnormality in upper right lobe.",
    diagnosis: "Possible pulmonary infection; specialist consult recommended.",
    referringHospital: "Nairobi Central Hospital",
    receivingFacility: "Mombasa County Hospital",
    priority: "Urgent",
    status: "pending-admin" as const,
    stkSentCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  db.referrals.set(referral1.id, referral1);
  const referral2 = {
    id: "ref-002",
    physicianId: "physician-002",
    patientName: "Peter Otieno",
    patientId: "MRN-9876",
    medicalHistory:
      "Patient with chronic cough and weight loss. Requires further evaluation and referral.",
    labResults: "Sputum test pending; X-ray shows possible infiltrates.",
    diagnosis: "Suspected pulmonary infection",
    referringHospital: "Mombasa County Hospital",
    receivingFacility: "Nairobi Central Hospital",
    priority: "Routine",
    status: "pending-admin" as const,
    stkSentCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  db.referrals.set(referral2.id, referral2);
}

initializeDemoData();

export { db, initializeDemoData };
