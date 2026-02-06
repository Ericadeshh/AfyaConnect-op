# 🔍 M-Pesa Integration Analysis - Issues Found

## ❌ **Critical Issues Identified:**

### 1. **Callback URL Problem**
- **Current**: `https://mydomain.com/mpesa-express-simulate/`
- **Issue**: This is a **placeholder domain** that likely doesn't exist
- **Impact**: M-Pesa cannot send callbacks → No payment confirmations

### 2. **Network Request Issues**
- **Problem**: "Network does not get any response"
- **Root Cause**: Convex mutations might be timing out or failing silently

### 3. **Missing Error Handling**
- **Issue**: No detailed logging of actual API responses
- **Impact**: Cannot debug what's happening with M-Pesa API

## 🔧 **Immediate Fixes Needed:**

### **Fix 1: Use Working Callback URL**
```bash
# Option A: Use ngrok for testing
npx ngrok http 3000
# Then update:
npx convex env set DARAJA_CALLBACK_URL "https://abc123.ngrok.io/api/stk-callback"

# Option B: Use public callback service
npx convex env set DARAJA_CALLBACK_URL "https://webhook.site/your-unique-url"
```

### **Fix 2: Add Detailed Debugging**
Let me create a debug version that logs everything:

```typescript
export const debugSTKPush = mutation({
  args: { phoneNumber: v.string(), amount: v.number() },
  handler: async (ctx, args) => {
    console.log("=== DEBUG STK PUSH START ===");
    
    // Log all environment variables
    console.log("Consumer Key:", process.env.DARAJA_CONSUMER_KEY?.substring(0, 10) + "...");
    console.log("Consumer Secret:", process.env.DARAJA_CONSUMER_SECRET?.substring(0, 5) + "...");
    console.log("Shortcode:", process.env.DARAJA_SHORTCODE);
    console.log("Passkey:", process.env.DARAJA_PASSKEY?.substring(0, 10) + "...");
    console.log("Callback URL:", process.env.DARAJA_CALLBACK_URL);
    
    try {
      // Step 1: OAuth Token
      console.log("=== STEP 1: GETTING OAUTH TOKEN ===");
      const authString = `${process.env.DARAJA_CONSUMER_KEY}:${process.env.DARAJA_CONSUMER_SECRET}`;
      const auth = btoa(authString);
      console.log("Auth string length:", auth.length);
      
      const tokenResponse = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
        method: "GET",
        headers: { "Authorization": `Basic ${auth}` }
      });
      
      console.log("Token Response Status:", tokenResponse.status);
      console.log("Token Response Headers:", Object.fromEntries(tokenResponse.headers.entries()));
      
      const tokenData = await tokenResponse.json();
      console.log("Token Response Body:", JSON.stringify(tokenData, null, 2));
      
      if (!tokenData.access_token) {
        throw new Error("No access token received");
      }
      
      // Step 2: STK Push
      console.log("=== STEP 2: SENDING STK PUSH ===");
      const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, -5);
      const passwordString = `${process.env.DARAJA_SHORTCODE}${process.env.DARAJA_PASSKEY}${timestamp}`;
      const password = btoa(passwordString);
      
      console.log("Timestamp:", timestamp);
      console.log("Password String:", passwordString);
      console.log("Password (base64):", password);
      
      const stkPayload = {
        BusinessShortCode: process.env.DARAJA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: args.amount,
        PartyA: args.phoneNumber,
        PartyB: process.env.DARAJA_SHORTCODE,
        PhoneNumber: args.phoneNumber,
        CallBackURL: process.env.DARAJA_CALLBACK_URL,
        AccountReference: "DEBUG_TEST",
        TransactionDesc: "Debug STK Push"
      };
      
      console.log("STK Payload:", JSON.stringify(stkPayload, null, 2));
      
      const stkResponse = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(stkPayload)
      });
      
      console.log("STK Response Status:", stkResponse.status);
      console.log("STK Response Headers:", Object.fromEntries(stkResponse.headers.entries()));
      
      const stkData = await stkResponse.json();
      console.log("STK Response Body:", JSON.stringify(stkData, null, 2));
      
      return {
        success: stkResponse.ok,
        debug: {
          tokenStatus: tokenResponse.status,
          stkStatus: stkResponse.status,
          tokenData: tokenData,
          stkData: stkData,
          payload: stkPayload
        }
      };
      
    } catch (error) {
      console.error("DEBUG ERROR:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      };
    }
  }
});
```

### **Fix 3: Test with Known Working Values**
```bash
# Test with official Daraja test values
npx convex env set DARAJA_CALLBACK_URL "https://webhook.site/your-unique-id"
```

## 🧪 **Debugging Steps:**

1. **Run debug mutation** to see exactly what's happening
2. **Check callback URL** - make sure it's accessible
3. **Verify phone number** - use `254708374149` for testing
4. **Monitor Convex logs** for detailed API responses

## 🎯 **Most Likely Issues:**

1. **Callback URL not accessible** → M-Pesa rejects request
2. **Network timeout** → Convex mutation timing out
3. **Invalid credentials** → API rejecting request

**Run the debug version first to see exactly what's happening!**
