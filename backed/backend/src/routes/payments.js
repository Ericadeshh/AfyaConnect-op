const express = require('express');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Referral = require('../models/Referral');
const { auth, authorize } = require('../middleware/auth');
const { validatePayment } = require('../middleware/validation');
const mpesaService = require('../utils/mpesa');
const logger = require('../utils/logger');

const router = express.Router();

// @route   POST /api/payments/stk-push
// @desc    Initiate STK push payment
// @access  Private
router.post('/stk-push', auth, validatePayment, async (req, res) => {
  try {
    const { phoneNumber, amount, bookingId, referralId } = req.body;

    // Validate booking or referral exists
    let booking, referral;
    if (bookingId) {
      booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }
    }

    if (referralId) {
      referral = await Referral.findById(referralId);
      if (!referral) {
        return res.status(404).json({
          success: false,
          message: 'Referral not found'
        });
      }
    }

    // Create payment record
    const payment = new Payment({
      bookingId,
      referralId,
      phoneNumber,
      amount,
      status: 'pending'
    });

    await payment.save();

    // Initiate STK push
    const accountReference = bookingId || referralId || payment._id.toString();
    const transactionDesc = `Payment for ${booking ? 'booking' : 'referral'} - Uzimacare`;

    try {
      const stkResponse = await mpesaService.initiateSTKPush(
        phoneNumber,
        amount,
        accountReference,
        transactionDesc
      );

      // Update payment with STK request ID
      payment.stkRequestId = stkResponse.CheckoutRequestID;
      await payment.save();

      // Update booking/referral STK count
      if (booking) {
        booking.stkSentCount += 1;
        await booking.save();
      }
      if (referral) {
        referral.stkSentCount += 1;
        await referral.save();
      }

      res.json({
        success: true,
        message: `STK prompt sent to ${phoneNumber}`,
        data: {
          paymentId: payment._id,
          checkoutRequestId: stkResponse.CheckoutRequestID,
          merchantRequestId: stkResponse.MerchantRequestID
        }
      });
    } catch (stkError) {
      payment.status = 'failed';
      payment.errorMessage = stkError.message;
      await payment.save();

      res.status(400).json({
        success: false,
        message: 'Failed to initiate payment',
        error: stkError.message
      });
    }
  } catch (error) {
    logger.error('STK push error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error initiating payment'
    });
  }
});

// @route   POST /api/payments/mpesa/callback
// @desc    M-Pesa callback handler
// @access  Public (M-Pesa webhook)
router.post('/mpesa/callback', async (req, res) => {
  try {
    const { Body } = req.body;
    const { stkCallback } = Body;

    logger.info('M-Pesa callback received:', stkCallback);

    const { CheckoutRequestID, ResultCode, ResultDesc } = stkCallback;

    // Find payment by checkout request ID
    const payment = await Payment.findOne({ stkRequestId: CheckoutRequestID });
    if (!payment) {
      logger.warn('Payment not found for checkout request:', CheckoutRequestID);
      return res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
    }

    if (ResultCode === 0) {
      // Payment successful
      const callbackMetadata = stkCallback.CallbackMetadata?.Item || [];
      const transactionId = callbackMetadata.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
      const transactionDate = callbackMetadata.find(item => item.Name === 'TransactionDate')?.Value;

      payment.status = 'completed';
      payment.mpesaTransactionId = transactionId;
      payment.mpesaReceiptNumber = transactionId;
      payment.transactionDate = new Date(transactionDate?.toString());
      await payment.save();

      // Update related booking or referral
      if (payment.bookingId) {
        await Booking.findByIdAndUpdate(payment.bookingId, {
          status: 'confirmed',
          paymentStatus: 'completed',
          mpesaTransactionId: transactionId
        });
      }

      if (payment.referralId) {
        await Referral.findByIdAndUpdate(payment.referralId, {
          status: 'paid',
          completedAt: new Date(),
          paidAt: new Date()
        });
      }

      logger.info('Payment completed successfully:', payment._id);
    } else {
      // Payment failed
      payment.status = 'failed';
      payment.errorMessage = ResultDesc;
      await payment.save();

      logger.warn('Payment failed:', { paymentId: payment._id, error: ResultDesc });
    }

    res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (error) {
    logger.error('M-Pesa callback error:', error);
    res.status(200).json({ ResultCode: 1, ResultDesc: 'Error processing callback' });
  }
});

// @route   GET /api/payments/:id/status
// @desc    Check payment status
// @access  Private
router.get('/:id/status', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // If payment is still pending and has STK request ID, query M-Pesa
    if (payment.status === 'pending' && payment.stkRequestId) {
      try {
        const stkStatus = await mpesaService.querySTKStatus(payment.stkRequestId);
        
        if (stkStatus.ResultCode === '0') {
          payment.status = 'completed';
          payment.mpesaTransactionId = stkStatus.MpesaReceiptNumber;
          await payment.save();
        } else if (stkStatus.ResultCode !== '1032') { // 1032 means still pending
          payment.status = 'failed';
          payment.errorMessage = stkStatus.ResultDesc;
          await payment.save();
        }
      } catch (queryError) {
        logger.error('STK status query error:', queryError);
      }
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    logger.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error checking payment status'
    });
  }
});

// @route   GET /api/payments
// @desc    Get payments (admin only)
// @access  Private (Admin)
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = status ? { status } : {};

    const payments = await Payment.find(query)
      .populate('bookingId')
      .populate('referralId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      data: {
        payments,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    logger.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching payments'
    });
  }
});

module.exports = router;
