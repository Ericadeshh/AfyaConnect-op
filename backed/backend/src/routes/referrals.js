const express = require('express');
const Referral = require('../models/Referral');
const Physician = require('../models/Physician');
const { auth, authorize } = require('../middleware/auth');
const { validateReferral } = require('../middleware/validation');
const logger = require('../utils/logger');

const router = express.Router();

// @route   POST /api/referrals
// @desc    Create new referral
// @access  Private (Physician only)
router.post('/', auth, authorize('physician'), validateReferral, async (req, res) => {
  try {
    // Get physician data
    const physician = await Physician.findOne({ userId: req.user._id });
    if (!physician) {
      return res.status(404).json({
        success: false,
        message: 'Physician profile not found'
      });
    }

    const referral = new Referral({
      ...req.body,
      physicianId: physician._id
    });

    await referral.save();
    await referral.populate('physicianId');

    logger.info(`Referral created by physician ${physician._id}:`, referral._id);

    res.status(201).json({
      success: true,
      message: 'Referral created successfully',
      data: referral
    });
  } catch (error) {
    logger.error('Create referral error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating referral'
    });
  }
});

// @route   GET /api/referrals
// @desc    Get referrals (filtered by role)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query;
    let query = {};

    // Filter by role
    if (req.user.role === 'physician') {
      const physician = await Physician.findOne({ userId: req.user._id });
      if (!physician) {
        return res.status(404).json({
          success: false,
          message: 'Physician profile not found'
        });
      }
      query.physicianId = physician._id;
    }

    // Add filters
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: {
        path: 'physicianId',
        populate: {
          path: 'userId',
          select: 'fullName email'
        }
      }
    };

    const referrals = await Referral.paginate(query, options);

    res.json({
      success: true,
      data: referrals
    });
  } catch (error) {
    logger.error('Get referrals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching referrals'
    });
  }
});

// @route   GET /api/referrals/:id
// @desc    Get single referral
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const referral = await Referral.findById(req.params.id)
      .populate({
        path: 'physicianId',
        populate: {
          path: 'userId',
          select: 'fullName email'
        }
      });

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: 'Referral not found'
      });
    }

    // Check permissions
    if (req.user.role === 'physician') {
      const physician = await Physician.findOne({ userId: req.user._id });
      if (referral.physicianId._id.toString() !== physician._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    res.json({
      success: true,
      data: referral
    });
  } catch (error) {
    logger.error('Get referral error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching referral'
    });
  }
});

// @route   PUT /api/referrals/:id
// @desc    Update referral
// @access  Private (Admin or owning physician)
router.put('/:id', auth, async (req, res) => {
  try {
    const referral = await Referral.findById(req.params.id);
    if (!referral) {
      return res.status(404).json({
        success: false,
        message: 'Referral not found'
      });
    }

    // Check permissions
    if (req.user.role === 'physician') {
      const physician = await Physician.findOne({ userId: req.user._id });
      if (referral.physicianId.toString() !== physician._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    // Update fields
    const allowedUpdates = [
      'patientPhone', 'stkPhoneNumber', 'patientDateOfBirth', 
      'patientNationalId', 'bookedDate', 'bookedTime', 'status',
      'biodataCode', 'completedAt', 'paidAt'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        referral[field] = req.body[field];
      }
    });

    await referral.save();

    res.json({
      success: true,
      message: 'Referral updated successfully',
      data: referral
    });
  } catch (error) {
    logger.error('Update referral error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating referral'
    });
  }
});

// @route   GET /api/referrals/token/:token
// @desc    Get referral by token
// @access  Public
router.get('/token/:token', async (req, res) => {
  try {
    const referral = await Referral.findOne({ referralToken: req.params.token })
      .populate({
        path: 'physicianId',
        populate: {
          path: 'userId',
          select: 'fullName'
        }
      });

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: 'Referral not found'
      });
    }

    res.json({
      success: true,
      data: referral
    });
  } catch (error) {
    logger.error('Get referral by token error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching referral'
    });
  }
});

module.exports = router;
