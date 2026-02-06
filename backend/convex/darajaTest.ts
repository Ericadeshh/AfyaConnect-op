import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Test Daraja API connection and credentials
export const testDarajaConnection = mutation({
  args: {},
  handler: async (ctx) => {
    try {
      // Get environment variables
      const consumerKey = process.env.DARAJA_CONSUMER_KEY;
      const consumerSecret = process.env.DARAJA_CONSUMER_SECRET;
      const shortcode = process.env.DARAJA_SHORTCODE;
      const passkey = process.env.DARAJA_PASSKEY;

      // Log environment variables (without exposing secrets)
      console.log("Environment variables check:");
      console.log("Consumer Key exists:", !!consumerKey);
      console.log("Consumer Secret exists:", !!consumerSecret);
      console.log("Shortcode exists:", !!shortcode);
      console.log("Passkey exists:", !!passkey);

      if (!consumerKey || !consumerSecret) {
        throw new Error("Missing Daraja API credentials");
      }

      // Test OAuth token generation (browser-compatible base64 encoding)
      const authString = `${consumerKey}:${consumerSecret}`;
      const auth = btoa(authString);
      
      const response = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
        method: "GET",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        message: "Daraja API connection successful",
        accessToken: data.access_token ? "Token received successfully" : "No token received",
        expiresIn: data.expires_in
      };

    } catch (error) {
      console.error("Daraja API test failed:", error);
      return {
        success: false,
        message: "Daraja API connection failed",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
});
