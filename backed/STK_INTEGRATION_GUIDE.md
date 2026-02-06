# 🎯 STK Push Integration Guide for Referrals

## ✅ **Integration Complete**

### **1. Automatic STK Trigger**
When referral status changes to `pending-payment`, the system now logs the phone number for STK push.

### **2. Manual STK Trigger Functions**

#### **`triggerReferralPayment`**
- **Purpose**: Manually trigger STK push for a referral
- **Usage**: 
```javascript
convex.mutation("referralPayments:triggerReferralPayment", {
  referralId: "your_referral_id",
  phoneNumber: "254748623870",
  amount: 1000,
  demoUserId: "admin_user_id"
});
```

#### **`retrySTKPush`**
- **Purpose**: Retry STK push for failed payments
- **Usage**:
```javascript
convex.mutation("referralPayments:retrySTKPush", {
  referralId: "your_referral_id",
  demoUserId: "admin_user_id"
});
```

### **3. Direct STK Push**
Use the existing `mpesa:initiateSTKPush` for direct STK requests:
```javascript
convex.mutation("mpesa:initiateSTKPush", {
  phoneNumber: "254748623870",
  amount: 1000,
  referralId: "your_referral_id",
  patientName: "John Doe"
});
```

## 🔄 **Workflow Integration**

### **Step 1: Update Referral Status**
```javascript
// Set referral to pending-payment with phone number
convex.mutation("referrals:updateReferralStatus", {
  referralId: "referral_id",
  status: "pending-payment",
  stkPhoneNumber: "254748623870",
  demoUserId: "admin_id"
});
```

### **Step 2: Trigger STK Push**
```javascript
// Trigger payment request
convex.mutation("referralPayments:triggerReferralPayment", {
  referralId: "referral_id",
  phoneNumber: "254748623870",
  amount: 1000
});
```

### **Step 3: Handle Payment Completion**
When M-Pesa callback is received, update referral status:
```javascript
convex.mutation("referrals:updateReferralStatus", {
  referralId: "referral_id",
  status: "paid"
});
```

## 📱 **Frontend Integration**

### **Payment Button Component**
```javascript
const handlePayment = async (referralId, phoneNumber) => {
  try {
    // Update status first
    await convex.mutation("referrals:updateReferralStatus", {
      referralId,
      status: "pending-payment",
      stkPhoneNumber: phoneNumber
    });

    // Trigger STK push
    const result = await convex.mutation("mpesa:initiateSTKPush", {
      phoneNumber,
      amount: 1000,
      referralId,
      patientName: referral.patientName
    });

    if (result.success) {
      alert("STK push sent! Please check your phone.");
    }
  } catch (error) {
    alert("Payment failed: " + error.message);
  }
};
```

## 🔍 **Payment Status Tracking**

### **Check Payment Status**
```javascript
// Get referral with payment info
const referral = await convex.query("referrals:getReferral", {
  referralId: "referral_id"
});

// Check payment records
const payments = await convex.query("payments:getByReferral", {
  referralId: "referral_id"
});
```

## 🎯 **Complete Payment Flow**

1. **Referral Created** → `pending-admin`
2. **Admin Approves** → `awaiting-biodata`
3. **Biodata Complete** → `pending-payment`
4. **STK Push Sent** → Patient receives M-Pesa prompt
5. **Payment Complete** → `paid`
6. **Appointment Booked** → `confirmed`

## ✅ **Ready for Production!**

All STK push functionality is now integrated into the referral workflow.
