# 🚀 **Frontend Integration Guide**

## 📱 **How to Call the STK Push Action**

### **React/TypeScript Implementation**
```typescript
import { ConvexClient } from "convex/browser";

const convex = new ConvexClient("https://fearless-kudu-656.convex.cloud");

export async function triggerSTKPush(referralId: string, phoneNumber: string, amount: number, patientName: string) {
  try {
    console.log("🚀 Triggering STK Push...");
    
    // Step 1: Call the ACTION (external API calls)
    const stkResult = await convex.action("actions/mpesa:initiateSTKPush", {
      phoneNumber,
      amount,
      referralId,
      patientName,
      useTestCallback: true // Use webhook.site for testing
    });

    if (!stkResult.success) {
      throw new Error(stkResult.error || "STK Push failed");
    }

    console.log("✅ STK Push sent successfully!");
    console.log("📱 SMS should arrive at:", phoneNumber);
    console.log("🔍 Checkout Request ID:", stkResult.analysis.checkoutRequestId);

    // Step 2: Record in database (optional - for tracking)
    const dbResult = await convex.mutation("mutations/mpesa:recordSTKPush", {
      referralId,
      phoneNumber,
      amount,
      stkRequestId: stkResult.analysis.checkoutRequestId
    });

    console.log("💾 Database updated:", dbResult);

    return {
      success: true,
      stkResult,
      dbResult,
      message: "STK Push initiated and recorded successfully"
    };

  } catch (error) {
    console.error("❌ STK Push failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
```

### **Usage Example**
```typescript
// In your React component
const handlePayment = async () => {
  const result = await triggerSTKPush(
    "referral_123",
    "254708374149", // Daraja test number
    1000,
    "John Doe"
  );
  
  if (result.success) {
    alert("📱 Check your phone for M-Pesa prompt!");
  } else {
    alert("❌ Payment failed: " + result.error);
  }
};
```

## 📊 **Folder Structure**
```
convex/
├── actions/
│   └── mpesa.ts          # External API calls (fetch allowed)
├── mutations/
│   └── mpesa.ts          # Database operations
├── queries/
│   └── payments.ts       # Payment status queries
└── _generated/
    └── api.d.ts          # Auto-generated types
```

## 🔍 **Where to Find Logs**
- **Convex Dashboard**: https://dashboard.convex.dev/d/fearless-kudu-656
- **Functions Tab**: Select `actions/mpesa:initiateSTKPush`
- **Logs Section**: Real-time execution logs
- **NOT in browser console** for external API calls
