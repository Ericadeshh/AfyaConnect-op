import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Seed initial data for development
export const seedInitialData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if data already exists
    const existingUsers = await ctx.db.query("users").collect();
    if (existingUsers.length > 0) {
      return { message: "Data already seeded" };
    }
    
    // Create admin user
    const adminUserId = await ctx.db.insert("users", {
      role: "admin",
      email: "admin@uzimacare.ke",
      fullName: "Admin User",
      isActive: true,
    });
    
    // Create physician users
    const physician1Id = await ctx.db.insert("users", {
      role: "physician",
      email: "dr.kipchoge@hospital.ke",
      fullName: "Dr. James Kipchoge",
      isActive: true,
    });
    
    const physician2Id = await ctx.db.insert("users", {
      role: "physician", 
      email: "dr.omondi@hospital.ke",
      fullName: "Dr. Sarah Omondi",
      isActive: true,
    });
    
    // Create physician profiles
    const physicianProfile1 = await ctx.db.insert("physicians", {
      userId: physician1Id,
      licenseId: "56845",
      hospital: "Nairobi Central Hospital",
      specialization: "Internal Medicine",
      isVerified: true,
    });
    
    const physicianProfile2 = await ctx.db.insert("physicians", {
      userId: physician2Id,
      licenseId: "PH-67890", 
      hospital: "Mombasa County Hospital",
      specialization: "General Practice",
      isVerified: true,
    });
    
    // Create clinics
    const clinic1Id = await ctx.db.insert("clinics", {
      name: "TB Wing A",
      facilityName: "Nairobi Central Hospital",
      location: "Nairobi",
      maxPatientsPerDay: 15,
      contactPhone: "+254700123456",
      isActive: true,
    });
    
    const clinic2Id = await ctx.db.insert("clinics", {
      name: "TB Wing B", 
      facilityName: "Mombasa County Hospital",
      location: "Mombasa",
      maxPatientsPerDay: 10,
      contactPhone: "+254700654321",
      isActive: true,
    });
    
    // Create sample referrals
    const referral1Id = await ctx.db.insert("referrals", {
      physicianId: physicianProfile1,
      patientName: "Margaret Wanjiru",
      patientId: "MRN-5432",
      medicalHistory: "Patient presents with persistent cough and fever for 3 weeks. History of recent respiratory illness.",
      labResults: "Chest imaging shows abnormality in upper right lobe.",
      diagnosis: "Possible pulmonary infection; specialist consult recommended.",
      referringHospital: "Nairobi Central Hospital",
      receivingFacility: "Mombasa County Hospital", 
      priority: "Urgent",
      status: "pending-admin",
      referralToken: "ABC123",
      stkSentCount: 0,
    });
    
    const referral2Id = await ctx.db.insert("referrals", {
      physicianId: physicianProfile2,
      patientName: "Peter Otieno",
      patientId: "MRN-9876",
      medicalHistory: "Patient with chronic cough and weight loss. Requires further evaluation and referral.",
      labResults: "Sputum test pending; X-ray shows possible infiltrates.",
      diagnosis: "Suspected pulmonary infection",
      referringHospital: "Mombasa County Hospital",
      receivingFacility: "Nairobi Central Hospital",
      priority: "Routine", 
      status: "pending-admin",
      referralToken: "XYZ789",
      stkSentCount: 0,
    });
    
    return {
      message: "Initial data seeded successfully",
      adminUserId,
      physician1Id,
      physician2Id,
      clinic1Id,
      clinic2Id,
      referral1Id,
      referral2Id,
    };
  },
});
