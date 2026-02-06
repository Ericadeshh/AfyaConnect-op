import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Test direct STK push to Daraja endpoint
export const testDirectSTKPush = mutation({
  args: {
    phoneNumber: v.string(),
    amount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      const consumerKey = process.env.DARAJA_CONSUMER_KEY;
      const consumerSecret = process.env.DARAJA_CONSUMER_SECRET;
      const shortcode = process.env.DARAJA_SHORTCODE;
      const passkey = process.env.DARAJA_PASSKEY;
      const callbackUrl = process.env.DARAJA_CALLBACK_URL;

      // Step 1: Get OAuth token
      const authString = `${consumerKey}:${consumerSecret}`;
      const auth = btoa(authString);
      
      console.log("=== OAuth Request ===");
      console.log("URL: https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials");
      console.log("Auth Basic:", auth);
      
      const tokenResponse = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
        method: "GET",
        headers: { 
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/json"
        }
      });

      const tokenData = await tokenResponse.json();
      console.log("OAuth Response:", JSON.stringify(tokenData, null, 2));

      if (!tokenData.access_token) {
        throw new Error("Failed to get access token");
      }

      // Step 2: Generate timestamp and password
      const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, -5);
      const passwordString = `${shortcode}${passkey}${timestamp}`;
      const password = btoa(passwordString);

      // Step 3: Prepare STK payload
      const stkPayload = {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: args.amount || 1,
        PartyA: args.phoneNumber,
        PartyB: shortcode,
        PhoneNumber: args.phoneNumber,
        CallBackURL: callbackUrl,
        AccountReference: "UzimacareTest",
        TransactionDesc: "Uzimacare Payment Test"
      };

      console.log("=== STK Push Request ===");
      console.log("URL: https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest");
      console.log("Method: POST");
      console.log("Headers:", {
        "Authorization": `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json"
      });
      console.log("Body:", JSON.stringify(stkPayload, null, 2));

      // Step 4: Send STK push
      const stkResponse = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(stkPayload)
      });

      const stkData = await stkResponse.json();

      console.log("=== STK Push Response ===");
      console.log("Status:", stkResponse.status);
      console.log("Headers:", {
          "content-type": stkResponse.headers.get("content-type"),
          "status": stkResponse.status
        });
      console.log("Body:", JSON.stringify(stkData, null, 2));

      return {
        success: stkResponse.ok,
        status: stkResponse.status,
        statusText: stkResponse.statusText,
        data: stkData,
        requestPayload: stkPayload,
        debug: {
          timestamp,
          passwordGenerated: password,
          accessTokenReceived: !!tokenData.access_token
        }
      };

    } catch (error) {
      console.error("Direct STK Test Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      };
    }
  }
});
