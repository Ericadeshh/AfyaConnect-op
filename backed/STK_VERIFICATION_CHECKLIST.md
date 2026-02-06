# ✅ **STK Push Verification Checklist**

## 🧪 **Step-by-Step Testing**

### **1. Convex Action Test**
```bash
# Go to Convex Dashboard: https://dashboard.convex.dev/d/fearless-kudu-656
# Select: actions/mpesa:initiateSTKPush
# Arguments:
{
  "phoneNumber": "254708374149",
  "amount": 1,
  "referralId": "test_referral_123",
  "patientName": "Test Patient",
  "useTestCallback": true
}
```

### **2. Expected Logs Output**
```
=== STK PUSH ACTION START ===
Environment check: { hasConsumerKey: true, hasConsumerSecret: true, ... }
=== STEP 1: GETTING OAUTH TOKEN ===
OAuth token received successfully
=== STEP 2: GENERATING PASSWORD ===
Timestamp: 20260128125945
Password generated successfully
=== STEP 3: SENDING STK PUSH ===
STK Response Status: 200
STK Response OK: true
STK Response Body: { "ResponseCode": "0", "ResponseDescription": "Success", ... }
=== RESULT ===
Success: true
🎉 STK PUSH SENT SUCCESSFULLY!
📱 SMS should arrive at: 254708374149
```

### **3. SMS Verification**
- ✅ **Phone**: `254708374149` (Daraja test number)
- ✅ **Message**: "Enter M-Pesa PIN for KES 1.00"
- ✅ **Timeout**: Should arrive within 30 seconds

### **4. Database Verification**
```bash
# After successful STK, check database:
convex.query("paymentTracking:getPaymentsByReferral", {
  referralId: "test_referral_123",
  demoUserId: "admin_id"
});
```

## 🔍 **Debugging Steps**

### **If STK Push Fails:**
1. **Check Convex logs** for detailed error messages
2. **Verify environment variables** in Convex dashboard
3. **Confirm timestamp format** (14 digits, Kenya time)
4. **Validate phone number** (254708374149 for sandbox)

### **If No SMS Received:**
1. **Check ResponseCode**: Must be "0" for success
2. **Use test number**: 254708374149 (guaranteed to work)
3. **Verify sandbox credentials**: Use real Daraja keys
4. **Check callback URL**: Must be accessible

## 📊 **Success Indicators**

### ✅ **Convex Action Success**
- Status: `200 OK`
- ResponseCode: `"0"`
- ResponseDescription: `"Success. Request accepted for processing"`
- CheckoutRequestID: Generated transaction ID

### ✅ **M-Pesa SMS Success**
- SMS arrives at test number
- Prompt shows correct amount
- PIN entry works
- Transaction completes

### ✅ **Database Success**
- Payment record created
- Referral updated with STK details
- Status tracking enabled

## 🚨 **Common Issues & Solutions**

| Issue | Cause | Solution |
|-------|-------|----------|
| "Can't use fetch()" | Wrong function type | Use `action` not `mutation` |
| "Invalid Timestamp" | Wrong timezone/format | Use Kenya UTC+3 timestamp |
| "Bad Request" | Invalid credentials | Check Daraja keys |
| No SMS received | Wrong phone number | Use 254708374149 |
| Empty response | Network timeout | Check Convex logs |

## 🎯 **Production Readiness**

### **Before Going Live:**
1. ✅ Replace webhook.site with real callback URL
2. ✅ Use production Daraja endpoints
3. ✅ Add error handling for timeouts
4. ✅ Implement payment status monitoring
5. ✅ Add retry logic for failed requests

### **Monitoring Setup:**
- Convex function logs
- M-Pesa callback processing
- Payment status tracking
- Error rate monitoring
