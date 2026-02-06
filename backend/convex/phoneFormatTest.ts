import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Test STK with multiple phone number formats
export const testSTKFormats = mutation({
  args: {},
  handler: async (ctx) => {
    const testNumbers = [
      "254748623870",  // Your current format
      "254708374149",  // Alternative format
      "0748623870",    // Local format (might not work)
    ];

    const results = [];

    for (const phoneNumber of testNumbers) {
      try {
        const consumerKey = process.env.DARAJA_CONSUMER_KEY;
        const consumerSecret = process.env.DARAJA_CONSUMER_SECRET;
        const shortcode = process.env.DARAJA_SHORTCODE;
        const passkey = process.env.DARAJA_PASSKEY;
        const callbackUrl = process.env.DARAJA_CALLBACK_URL;

        // Get OAuth token
        const authString = `${consumerKey}:${consumerSecret}`;
        const auth = btoa(authString);
        
        const tokenResponse = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
          method: "GET",
          headers: { "Authorization": `Basic ${auth}` }
        });

        const tokenData = await tokenResponse.json();

        // Generate timestamp and password
        const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, -5);
        const passwordString = `${shortcode}${passkey}${timestamp}`;
        const password = btoa(passwordString);

        // STK Payload
        const stkPayload = {
          BusinessShortCode: shortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: 1,
          PartyA: phoneNumber,
          PartyB: shortcode,
          PhoneNumber: phoneNumber,
          CallBackURL: callbackUrl,
          AccountReference: "FormatTest",
          TransactionDesc: `Testing format: ${phoneNumber}`
        };

        const stkResponse = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${tokenData.access_token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(stkPayload)
        });

        const stkData = await stkResponse.json();

        results.push({
          phoneNumber,
          success: stkResponse.ok,
          responseCode: stkData.ResponseCode,
          responseDescription: stkData.ResponseDescription,
          checkoutRequestId: stkData.CheckoutRequestID
        });

        // Wait 2 seconds between requests
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        results.push({
          phoneNumber,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }

    return {
      message: "Tested multiple phone number formats",
      results
    };
  }
});
