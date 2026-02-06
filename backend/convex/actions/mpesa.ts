"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";

// Helper function to get Daraja OAuth token
async function getDarajaOAuthToken(
  consumerKey: string,
  consumerSecret: string
): Promise<string> {
  const auth = btoa(`${consumerKey}:${consumerSecret}`);
  
  const tokenResponse = await fetch(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      method: "GET",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json"
      }
    }
  );

  if (!tokenResponse.ok) {
    throw new Error(`OAuth token failed: ${tokenResponse.status}`);
  }

  const tokenData = await tokenResponse.json();
  if (!tokenData.access_token) {
    throw new Error("No access token in response");
  }

  return tokenData.access_token;
}

// Generate Kenya timestamp (UTC+3)
function generateKenyaTimestamp(): string {
  const now = new Date();
  const kenyaTime = new Date(now.getTime() + (3 * 60 * 60 * 1000));
  return kenyaTime.toISOString().replace(/[-:T.]/g, "").slice(0, -5);
}

// Main STK Push Action
export const initiateSTKPush = action({
  args: {
    phoneNumber: v.string(),
    amount: v.number(),
    referralId: v.string(),
    patientName: v.string(),
    useTestCallback: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    console.log("=== STK PUSH ACTION START ===");
    
    try {
      // Step 1: Get environment variables
      const consumerKey = process.env.DARAJA_CONSUMER_KEY;
      const consumerSecret = process.env.DARAJA_CONSUMER_SECRET;
      const shortcode = process.env.DARAJA_SHORTCODE;
      const passkey = process.env.DARAJA_PASSKEY;
      let callbackUrl = process.env.DARAJA_CALLBACK_URL;
      
      if (args.useTestCallback) {
        callbackUrl = "https://webhook.site/test-callback";
      }
      
      console.log("Environment check:", {
        hasConsumerKey: !!consumerKey,
        hasConsumerSecret: !!consumerSecret,
        hasShortcode: !!shortcode,
        hasPasskey: !!passkey,
        hasCallbackUrl: !!callbackUrl,
        callbackUrl
      });
      
      if (!consumerKey || !consumerSecret || !shortcode || !passkey || !callbackUrl) {
        throw new Error("Missing required environment variables");
      }

      // Step 2: Get OAuth token
      console.log("=== STEP 1: GETTING OAUTH TOKEN ===");
      const accessToken = await getDarajaOAuthToken(consumerKey, consumerSecret);
      console.log("OAuth token received successfully");

      // Step 3: Generate timestamp and password
      console.log("=== STEP 2: GENERATING PASSWORD ===");
      const timestamp = generateKenyaTimestamp();
      const passwordString = `${shortcode}${passkey}${timestamp}`;
      const password = btoa(passwordString);
      
      console.log("Timestamp:", timestamp);
      console.log("Password generated successfully");

      // Step 4: Create STK payload
      console.log("=== STEP 3: SENDING STK PUSH ===");
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

      console.log("STK Payload:", JSON.stringify(stkPayload, null, 2));

      // Step 5: Send STK push
      const stkResponse = await fetch(
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(stkPayload)
        }
      );

      console.log("STK Response Status:", stkResponse.status);
      console.log("STK Response OK:", stkResponse.ok);

      const stkData = await stkResponse.json();
      console.log("STK Response Body:", JSON.stringify(stkData, null, 2));

      // Step 6: Analyze response
      const result = {
        success: stkResponse.ok && stkData.ResponseCode === "0",
        apiResponse: stkData,
        analysis: {
          responseCode: stkData.ResponseCode,
          responseDesc: stkData.ResponseDescription,
          checkoutRequestId: stkData.CheckoutRequestID,
          merchantRequestId: stkData.MerchantRequestID,
          customerMessage: stkData.CustomerMessage
        },
        requestDetails: {
          phoneNumber: args.phoneNumber,
          amount: args.amount,
          callbackUrl,
          timestamp
        }
      };

      console.log("=== RESULT ===");
      console.log("Success:", result.success);
      console.log("Response Code:", result.analysis.responseCode);
      console.log("Response Desc:", result.analysis.responseDesc);

      if (result.success) {
        console.log("🎉 STK PUSH SENT SUCCESSFULLY!");
        console.log("📱 SMS should arrive at:", args.phoneNumber);
      } else {
        console.log("❌ STK PUSH FAILED");
      }

      return result;

    } catch (error) {
      console.error("STK Push Action Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      };
    }
  }
});
