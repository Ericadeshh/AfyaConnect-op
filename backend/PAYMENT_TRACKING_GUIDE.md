# 📊 Payment Status Tracking System

## ✅ **Complete Payment Tracking Implemented**

### **1. Payment Tracking Queries (`paymentTracking.ts`)**

#### **Get Payments by Referral**
```javascript
const payments = await convex.query("paymentTracking:getPaymentsByReferral", {
  referralId: "your_referral_id",
  demoUserId: "admin_id"
});
```

#### **Get All Pending Payments**
```javascript
const pendingPayments = await convex.query("paymentTracking:getPendingPayments", {
  demoUserId: "admin_id"
});
```

#### **Get Payment Statistics**
```javascript
const stats = await convex.query("paymentTracking:getPaymentStats", {
  demoUserId: "admin_id"
});
// Returns: { total, pending, completed, failed, totalAmount }
```

#### **Get Payments by Phone Number**
```javascript
const phonePayments = await convex.query("paymentTracking:getPaymentsByPhone", {
  phoneNumber: "254748623870",
  demoUserId: "admin_id"
});
```

### **2. Payment Status Updates**

#### **Update Payment Status (Manual)**
```javascript
const updatedPayment = await convex.mutation("paymentTracking:updatePaymentStatus", {
  stkRequestId: "checkout_request_id",
  status: "completed",
  mpesaTransactionId: "MPESA_RECEIPT_NUMBER",
  amount: 1000
});
```

#### **Retry Failed Payment**
```javascript
const retryResult = await convex.mutation("paymentTracking:retryFailedPayment", {
  paymentId: "payment_id",
  demoUserId: "admin_id"
});
```

### **3. M-Pesa Callback Handling**

#### **Callback Endpoint**
- **URL**: `/api/stk-callback`
- **Method**: `POST`
- **Purpose**: Receives M-Pesa payment confirmations

#### **Manual Status Update**
- **URL**: `/api/update-payment-status`
- **Method**: `POST`
- **Purpose**: Manual payment status updates

### **4. Payment Status Flow**

```
STK Push Initiated → Payment Record Created (status: pending)
                      ↓
                 M-Pesa Callback Received
                      ↓
              ┌─────────────────┐
              │                 │
        ResultCode = 0    ResultCode ≠ 0
              │                 │
        Status: completed   Status: failed
              │                 │
        Update referral      Log error
        status: "paid"
```

### **5. Database Schema**

#### **Payments Table**
```typescript
{
  referralId: Id<"referrals">,
  phoneNumber: string,
  amount: number,
  status: "pending" | "completed" | "failed",
  stkRequestId: string,
  mpesaTransactionId?: string,
  errorMessage?: string
}
```

#### **Referrals Table (Updated)**
```typescript
{
  // ... existing fields
  stkPhoneNumber?: string,
  stkSentCount?: number,
  paidAt?: number,  // Timestamp when paid
}
```

### **6. Frontend Integration**

#### **Payment Status Component**
```javascript
const PaymentStatus = ({ referralId }) => {
  const [payments, setPayments] = useState([]);
  
  useEffect(() => {
    const loadPayments = async () => {
      const paymentData = await convex.query("paymentTracking:getPaymentsByReferral", {
        referralId,
        demoUserId: user.id
      });
      setPayments(paymentData);
    };
    
    loadPayments();
    // Poll for updates every 30 seconds
    const interval = setInterval(loadPayments, 30000);
    return () => clearInterval(interval);
  }, [referralId]);

  return (
    <div>
      {payments.map(payment => (
        <div key={payment._id}>
          Status: {payment.status}
          Amount: KES {payment.amount}
          {payment.mpesaTransactionId && (
            <div>Receipt: {payment.mpesaTransactionId}</div>
          )}
        </div>
      ))}
    </div>
  );
};
```

#### **Payment Monitoring Dashboard**
```javascript
const PaymentDashboard = () => {
  const [stats, setStats] = useState({});
  const [pendingPayments, setPendingPayments] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const [statsData, pendingData] = await Promise.all([
        convex.query("paymentTracking:getPaymentStats"),
        convex.query("paymentTracking:getPendingPayments")
      ]);
      setStats(statsData);
      setPendingPayments(pendingData);
    };

    loadData();
    const interval = setInterval(loadData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2>Payment Statistics</h2>
      <div>Total Payments: {stats.total}</div>
      <div>Pending: {stats.pending}</div>
      <div>Completed: {stats.completed}</div>
      <div>Failed: {stats.failed}</div>
      <div>Total Amount: KES {stats.totalAmount}</div>
      
      <h2>Pending Payments</h2>
      {pendingPayments.map(payment => (
        <div key={payment._id}>
          {payment.phoneNumber} - KES {payment.amount}
        </div>
      ))}
    </div>
  );
};
```

### **7. Testing Payment Tracking**

#### **Test Complete Flow**
```javascript
// 1. Trigger STK push
const stkResult = await convex.mutation("mpesa:initiateSTKPush", {
  phoneNumber: "254708374149",
  amount: 1000,
  referralId: "test_referral",
  patientName: "Test Patient"
});

// 2. Check payment status
const payments = await convex.query("paymentTracking:getPaymentsByReferral", {
  referralId: "test_referral"
});

// 3. Manually update status (for testing)
await convex.mutation("paymentTracking:updatePaymentStatus", {
  stkRequestId: stkResult.checkoutRequestId,
  status: "completed",
  mpesaTransactionId: "TEST12345",
  amount: 1000
});
```

## ✅ **Payment Tracking Complete!**

Your system now has:
- ✅ Real-time payment status tracking
- ✅ Automatic referral status updates
- ✅ Payment statistics and analytics
- ✅ Failed payment retry mechanism
- ✅ M-Pesa callback handling
- ✅ Frontend integration ready

**The payment tracking system is fully integrated and ready for production!** 🚀
