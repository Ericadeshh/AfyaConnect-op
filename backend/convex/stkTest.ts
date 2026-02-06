import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Simple STK test with hardcoded values
export const testSTKPush = mutation({
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

      console.log("=== STK Push Debug ===");
      console.log("Consumer Key:", consumerKey?.substring(0, 10) + "...");
      console.log("Shortcode:", shortcode);
      console.log("Passkey:", passkey?.substring(0, 10) + "...");
      console.log("Callback URL:", callbackUrl);

      if (!consumerKey || !consumerSecret || !shortcode || !passkey) {
        throw new Error("Missing credentials");
      }

      // Get OAuth token
      const authString = `${consumerKey}:${consumerSecret}`;
      const auth = btoa(authString);
      
      const tokenResponse = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
        method: "GET",
        headers: { "Authorization": `Basic ${auth}` }
      });

      const tokenData = await tokenResponse.json();
      console.log("Token received:", !!tokenData.access_token);

      // Generate timestamp and password
      const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, -5);
      const passwordString = `${shortcode}${passkey}${timestamp}`;
      const password = btoa(passwordString);

      console.log("Timestamp:", timestamp);
      console.log("Password generated:", password.substring(0, 20) + "...");

      // STK Payload
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
        AccountReference: "TestPayment",
        TransactionDesc: "Uzimacare Test Payment"
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

      const stkData = await stkResponse.json();
      console.log("STK Response:", JSON.stringify(stkData, null, 2));

      return {
        success: stkResponse.ok,
        data: stkData,
        payload: stkPayload
      };

    } catch (error) {
      console.error("STK Test Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
});
