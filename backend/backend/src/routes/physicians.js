const express = require('express');
const Physician = require('../models/Physician');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const { validatePhysician } = require('../middleware/validation');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/physicians
// @desc    Get all physicians
// @access  Private (Admin only)
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { isVerified, hospital, page = 1, limit = 10 } = req.query;
    let query = {};

    if (isVerified !== undefined) query.isVerified = isVerified === 'true';
    if (hospital) query.hospital = new RegExp(hospital, 'i');

    const physicians = await Physician.find(query)
      .populate('userId', 'fullName email phoneNumber isActive')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Physician.countDocuments(query);

    res.json({
      success: true,
      data: {
        physicians,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    logger.error('Get physicians error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching physicians'
    });
  }
});

// @route   GET /api/physicians/:id
// @desc    Get single physician
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const physician = await Physician.findById(req.params.id)
      .populate('userId', 'fullName email phoneNumber isActive');

    if (!physician) {
      return res.status(404).json({
        success: false,
        message: 'Physician not found'
      });
    }

    res.json({
      success: true,
      data: physician
    });
  } catch (error) {
    logger.error('Get physician error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching physician'
    });
  }
});

// @route   PUT /api/physicians/:id
// @desc    Update physician
// @access  Private (Admin or own profile)
router.put('/:id', auth, async (req, res) => {
  try {
    const physician = await Physician.findById(req.params.id);
    if (!physician) {
      return res.status(404).json({
        success: false,
        message: 'Physician not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && physician.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const allowedUpdates = ['hospital', 'specialization'];
    if (req.user.role === 'admin') {
      allowedUpdates.push('isVerified', 'licenseId');
    }

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        physician[field] = req.body[field];
      }
    });

    // If admin is verifying, add verification details
    if (req.user.role === 'admin' && req.body.isVerified === true && !physician.isVerified) {
      physician.verificationDate = new Date();
      physician.verifiedBy = req.user._id;
    }

    await physician.save();

    res.json({
      success: true,
      message: 'Physician updated successfully',
      data: physician
    });
  } catch (error) {
    logger.error('Update physician error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating physician'
    });
  }
});

// @route   GET /api/physicians/license/:licenseId
// @desc    Get physician by license ID
// @access  Public
router.get('/license/:licenseId', async (req, res) => {
  try {
    const physician = await Physician.findOne({ licenseId: req.params.licenseId })
      .populate('userId', 'fullName email');

    if (!physician) {
      return res.status(404).json({
        success: false,
        message: 'Physician not found'
      });
    }

    res.json({
      success: true,
      data: physician
    });
  } catch (error) {
    logger.error('Get physician by license error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching physician'
    });
  }
});

module.exports = router;
