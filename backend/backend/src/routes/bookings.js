const express = require('express');
const Booking = require('../models/Booking');
const Clinic = require('../models/Clinic');
const { auth, authorize } = require('../middleware/auth');
const { validateBooking } = require('../middleware/validation');
const logger = require('../utils/logger');

const router = express.Router();

// @route   POST /api/bookings
// @desc    Create new booking
// @access  Private
router.post('/', auth, validateBooking, async (req, res) => {
  try {
    const { clinicId, bookingDate, bookingTime, paymentAmount } = req.body;

    // Check if clinic exists
    const clinic = await Clinic.findById(clinicId);
    if (!clinic || !clinic.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Clinic not found or inactive'
      });
    }

    // Check if slot is available
    const existingBooking = await Booking.findOne({
      clinicId,
      bookingDate: new Date(bookingDate),
      bookingTime,
      status: { $in: ['confirmed', 'pending-payment'] }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Time slot is already booked'
      });
    }

    // Check daily capacity
    const bookingsOnDate = await Booking.countDocuments({
      clinicId,
      bookingDate: new Date(bookingDate),
      status: 'confirmed'
    });

    if (bookingsOnDate >= clinic.maxPatientsPerDay) {
      return res.status(400).json({
        success: false,
        message: 'Clinic is fully booked for this date'
      });
    }

    // Create booking with 1 hour expiry
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    const booking = new Booking({
      ...req.body,
      bookingDate: new Date(bookingDate),
      expiresAt
    });

    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    logger.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating booking'
    });
  }
});

// @route   GET /api/bookings
// @desc    Get bookings
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { patientId, clinicId, status, page = 1, limit = 10 } = req.query;
    let query = {};

    // Filter by patient for non-admin users
    if (req.user.role === 'patient' || patientId) {
      query.patientId = patientId || req.user._id;
    }

    if (clinicId) query.clinicId = clinicId;
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('clinicId')
      .populate('referralId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: {
        bookings,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    logger.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching bookings'
    });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('clinicId')
      .populate('referralId');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check permissions
    if (req.user.role === 'patient' && booking.patientId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    logger.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching booking'
    });
  }
});

// @route   PUT /api/bookings/:id
// @desc    Update booking
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check permissions
    if (req.user.role === 'patient' && booking.patientId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const allowedUpdates = ['status', 'paymentStatus', 'mpesaTransactionId', 'notes'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        booking[field] = req.body[field];
      }
    });

    await booking.save();

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: booking
    });
  } catch (error) {
    logger.error('Update booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating booking'
    });
  }
});

// @route   GET /api/bookings/clinic/:clinicId/availability
// @desc    Get available slots for a clinic
// @access  Public
router.get('/clinic/:clinicId/availability', async (req, res) => {
  try {
    const { clinicId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required'
      });
    }

    const clinic = await Clinic.findById(clinicId);
    if (!clinic || !clinic.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Clinic not found or inactive'
      });
    }

    // Standard time slots
    const allSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];

    // Get booked slots for the date
    const bookedSlots = await Booking.find({
      clinicId,
      bookingDate: new Date(date),
      status: { $in: ['confirmed', 'pending-payment'] }
    }).select('bookingTime');

    const bookedTimes = new Set(bookedSlots.map(booking => booking.bookingTime));
    const availableSlots = allSlots.filter(slot => !bookedTimes.has(slot));

    // Check daily capacity
    const confirmedBookings = await Booking.countDocuments({
      clinicId,
      bookingDate: new Date(date),
      status: 'confirmed'
    });

    const remainingCapacity = Math.max(0, clinic.maxPatientsPerDay - confirmedBookings);

    res.json({
      success: true,
      data: {
        availableSlots: availableSlots.slice(0, remainingCapacity),
        totalSlots: allSlots.length,
        bookedSlots: bookedSlots.length,
        maxCapacity: clinic.maxPatientsPerDay,
        remainingCapacity,
        isFull: remainingCapacity === 0
      }
    });
  } catch (error) {
    logger.error('Get availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching availability'
    });
  }
});

module.exports = router;
