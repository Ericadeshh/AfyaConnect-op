import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

// Simple M-Pesa STK Push Callback Handler
export const mpesaCallback = httpAction(async (ctx, request) => {
  try {
    const body = await request.json();
    
    console.log("M-Pesa Callback received:", JSON.stringify(body, null, 2));

    // Extract callback data
    const { Body } = body;
    const { stkCallback } = Body;
    
    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata
    } = stkCallback;

    // Log payment result for manual processing
    console.log("Payment Result:", {
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      MerchantRequestID
    });

    if (CallbackMetadata && CallbackMetadata.Item) {
      const items = CallbackMetadata.Item;
      const amountItem = items.find((item: any) => item.Name === "Amount");
      const mpesaReceiptItem = items.find((item: any) => item.Name === "MpesaReceiptNumber");
      const phoneNumberItem = items.find((item: any) => item.Name === "PhoneNumber");
      
      console.log("Payment Details:", {
        amount: amountItem?.Value,
        mpesaReceipt: mpesaReceiptItem?.Value,
        phoneNumber: phoneNumberItem?.Value
      });
    }

    // For now, just acknowledge receipt
    // In production, you would update the database here
    // or use a separate mutation to handle the update

    return new Response(
      JSON.stringify({
        ResultCode: 0,
        ResultDesc: "Callback received successfully"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("M-Pesa Callback error:", error);
    
    return new Response(
      JSON.stringify({
        ResultCode: 1,
        ResultDesc: "Callback processing failed"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
});

// Manual payment status update endpoint
export const updatePaymentStatus = httpAction(async (ctx, request) => {
  try {
    const body = await request.json();
    
    console.log("Manual payment status update:", body);

    // This endpoint can be called manually to update payment status
    // based on the callback logs

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment status update logged"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("Manual payment update error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: "Update failed"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
});

// HTTP Routes
const http = httpRouter();

http.route({
  path: "/api/stk-callback",
  method: "POST",
  handler: mpesaCallback,
});

http.route({
  path: "/api/update-payment-status",
  method: "POST",
  handler: updatePaymentStatus,
});

export default http;
