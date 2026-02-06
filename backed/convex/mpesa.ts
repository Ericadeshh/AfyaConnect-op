import { action } from "./_generated/server";
import { v } from "convex/values";

// STK Push action for M-Pesa payments
export const initiateSTKPush = action({
  args: {
    phoneNumber: v.string(),
    amount: v.number(),
    referralId: v.id("referrals"),
    patientName: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Get environment variables
      const consumerKey = process.env.DARAJA_CONSUMER_KEY;
      const consumerSecret = process.env.DARAJA_CONSUMER_SECRET;
      const shortcode = process.env.DARAJA_SHORTCODE;
      const passkey = process.env.DARAJA_PASSKEY;
      const callbackUrl = process.env.DARAJA_CALLBACK_URL;

      if (!consumerKey || !consumerSecret || !shortcode || !passkey) {
        throw new Error("Missing Daraja API credentials");
      }

      // Step 1: Get OAuth token
      const authString = `${consumerKey}:${consumerSecret}`;
      const auth = btoa(authString);
      
      const tokenResponse = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
        method: "GET",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/json"
        }
      });

      if (!tokenResponse.ok) {
        throw new Error("Failed to get OAuth token");
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Step 2: Generate timestamp and password
      const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, -5);
      const passwordString = `${shortcode}${passkey}${timestamp}`;
      const password = btoa(passwordString);

      // Step 3: Initiate STK Push
      const stkPayload = {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: args.amount,
        PartyA: args.phoneNumber,
        PartyB: shortcode,
        PhoneNumber: args.phoneNumber,
        CallBackURL: callbackUrl,
        AccountReference: args.referralId,
        TransactionDesc: `Payment for ${args.patientName} - Referral ${args.referralId}`
      };

      const stkResponse = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(stkPayload)
      });

      if (!stkResponse.ok) {
        throw new Error(`STK Push failed: ${stkResponse.status}`);
      }

      const stkData = await stkResponse.json();

      // Return API response (no database operations in action)
      return {
        success: true,
        message: "STK Push initiated successfully",
        merchantRequestId: stkData.MerchantRequestID,
        checkoutRequestId: stkData.CheckoutRequestID,
        responseCode: stkData.ResponseCode,
        responseDescription: stkData.ResponseDescription,
        // Include data for database operations to be handled separately
        referralData: {
          referralId: args.referralId,
          phoneNumber: args.phoneNumber,
          amount: args.amount,
          stkRequestId: stkData.CheckoutRequestID
        }
      };

    } catch (error) {
      console.error("STK Push failed:", error);
      return {
        success: false,
        message: "STK Push failed",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
});
