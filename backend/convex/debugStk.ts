import { action } from "./_generated/server";
import { v } from "convex/values";

// Debug STK Push with detailed logging
export const debugSTKPush = action({
  args: { 
    phoneNumber: v.string(), 
    amount: v.number(),
    useTestCallback: v.optional(v.boolean())
  },
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
      const consumerKey = process.env.DARAJA_CONSUMER_KEY;
      const consumerSecret = process.env.DARAJA_CONSUMER_SECRET;
      
      if (!consumerKey || !consumerSecret) {
        throw new Error("Missing consumer key or secret");
      }
      
      const authString = `${consumerKey}:${consumerSecret}`;
      const auth = btoa(authString);
      console.log("Auth string length:", auth.length);
      
      const tokenResponse = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
        method: "GET",
        headers: { 
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/json"
        }
      });
      
      console.log("Token Response Status:", tokenResponse.status);
      console.log("Token Response OK:", tokenResponse.ok);
      console.log("Token Response Content-Type:", tokenResponse.headers.get("content-type"));
      
      // Get response text first to check if it's valid JSON
      const responseText = await tokenResponse.text();
      console.log("Token Response Text:", responseText);
      
      let tokenData;
      try {
        tokenData = JSON.parse(responseText);
        console.log("Token Response Body:", JSON.stringify(tokenData, null, 2));
      } catch (parseError) {
        console.error("Failed to parse token response as JSON:", parseError);
        throw new Error(`Invalid JSON response from OAuth: ${responseText}`);
      }
      
      if (!tokenData.access_token) {
        throw new Error("No access token received: " + JSON.stringify(tokenData));
      }
      
      // Step 2: STK Push
      console.log("=== STEP 2: SENDING STK PUSH ===");
      const shortcode = process.env.DARAJA_SHORTCODE;
      const passkey = process.env.DARAJA_PASSKEY;
      let callbackUrl = process.env.DARAJA_CALLBACK_URL;
      
      // Use webhook.site for testing if requested
      if (args.useTestCallback) {
        callbackUrl = "https://webhook.site/your-unique-id";
        console.log("Using test callback URL:", callbackUrl);
      }
      
      if (!shortcode || !passkey || !callbackUrl) {
        throw new Error("Missing shortcode, passkey, or callback URL");
      }
      
      // Generate proper timestamp in Kenya timezone (UTC+3)
      const now = new Date();
      // Convert to Kenya time (UTC+3)
      const kenyaTime = new Date(now.getTime() + (3 * 60 * 60 * 1000));
      const timestamp = kenyaTime.toISOString().replace(/[-:T.]/g, "").slice(0, -5);
      const passwordString = `${shortcode}${passkey}${timestamp}`;
      const password = btoa(passwordString);
      
      console.log("Timestamp:", timestamp);
      console.log("Password String:", passwordString);
      console.log("Password (base64):", password);
      
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
      console.log("STK Response OK:", stkResponse.ok);
      console.log("STK Response Status Text:", stkResponse.statusText);
      
      const stkData = await stkResponse.json();
      console.log("STK Response Body:", JSON.stringify(stkData, null, 2));
      
      // Analyze response
      const analysis = {
        oauthSuccess: tokenResponse.ok,
        stkSuccess: stkResponse.ok,
        responseCode: stkData.ResponseCode,
        responseDesc: stkData.ResponseDescription,
        checkoutRequestId: stkData.CheckoutRequestID,
        merchantRequestId: stkData.MerchantRequestID,
        customerMessage: stkData.CustomerMessage
      };
      
      console.log("=== ANALYSIS ===");
      console.log("OAuth Success:", analysis.oauthSuccess);
      console.log("STK Success:", analysis.stkSuccess);
      console.log("Response Code:", analysis.responseCode);
      console.log("Response Desc:", analysis.responseDesc);
      
      return {
        success: stkResponse.ok && analysis.responseCode === "0",
        analysis,
        debug: {
          tokenStatus: tokenResponse.status,
          stkStatus: stkResponse.status,
          tokenData: tokenData,
          stkData: stkData,
          payload: stkPayload,
          environment: {
            hasConsumerKey: !!consumerKey,
            hasConsumerSecret: !!consumerSecret,
            hasShortcode: !!shortcode,
            hasPasskey: !!passkey,
            hasCallbackUrl: !!callbackUrl,
            callbackUrl
          }
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
