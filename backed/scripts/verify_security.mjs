import { ConvexHttpClient } from "convex/browser";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env.local") });

const url = process.env.VITE_CONVEX_URL;
if (!url) {
    console.error("VITE_CONVEX_URL not found in .env.local");
    process.exit(1);
}

const client = new ConvexHttpClient(url);

async function testUnauthenticatedAccess() {
    console.log("\n--- Testing Unauthenticated Access ---");

    const tests = [
        {
            name: "Create Referral (Mutation)",
            type: "mutation",
            function: "referrals:createReferral",
            args: {
                physicianId: "k178m5p3w3f7g9m4a1v1z4n5gs79b291", // Dummy ID
                patientName: "Test",
                medicalHistory: "History",
                labResults: "Results",
                diagnosis: "Diagnosis",
                referringHospital: "Hospital",
                receivingFacility: "Facility",
                priority: "Routine"
            }
        },
        {
            name: "Get Pending Referrals (Query)",
            type: "query",
            function: "referrals:getPendingReferrals",
            args: {}
        },
        {
            name: "Create Clinic (Mutation)",
            type: "mutation",
            function: "clinics:createClinic",
            args: {
                name: "Test Clinic",
                facilityName: "Test Facility",
                location: "Nairobi",
                maxPatientsPerDay: 10
            }
        },
        {
            name: "Get All Bookings (Query)",
            type: "query",
            function: "bookings:getAllBookings",
            args: {}
        },
    ];

    for (const test of tests) {
        try {
            if (test.type === "mutation") {
                await client.mutation(test.function, test.args);
            } else {
                await client.query(test.function, test.args);
            }
            console.error(`❌ FAILED: Unauthenticated user could call ${test.name}!`);
        } catch (error) {
            if (error.message.includes("Not authenticated")) {
                console.log(`✅ PASSED: ${test.name} blocked (Not authenticated).`);
            } else {
                console.log(`⚠️  INFO: ${test.name} failed with message: ${error.message}`);
            }
        }
    }
}

async function runTests() {
    console.log("Starting Security Verification Script...");
    await testUnauthenticatedAccess();

    console.log("\n--- Security Verification Complete ---");
}

runTests().catch(console.error);
