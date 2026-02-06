const express = require('express');
const Clinic = require('../models/Clinic');
const { auth, authorize } = require('../middleware/auth');
const { validateClinic } = require('../middleware/validation');
const logger = require('../utils/logger');

const router = express.Router();

// @route   POST /api/clinics
// @desc    Create new clinic
// @access  Private (Admin only)
router.post('/', auth, authorize('admin'), validateClinic, async (req, res) => {
  try {
    const clinic = new Clinic(req.body);
    await clinic.save();

    res.status(201).json({
      success: true,
      message: 'Clinic created successfully',
      data: clinic
    });
  } catch (error) {
    logger.error('Create clinic error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating clinic'
    });
  }
});

// @route   GET /api/clinics
// @desc    Get all clinics
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { location, isActive = true, page = 1, limit = 10, search } = req.query;
    let query = {};

    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (location) query.location = new RegExp(location, 'i');
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { facilityName: new RegExp(search, 'i') },
        { location: new RegExp(search, 'i') }
      ];
    }

    const clinics = await Clinic.find(query)
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Clinic.countDocuments(query);

    res.json({
      success: true,
      data: {
        clinics,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    logger.error('Get clinics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching clinics'
    });
  }
});

// @route   GET /api/clinics/:id
// @desc    Get single clinic
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id);
    
    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: 'Clinic not found'
      });
    }

    res.json({
      success: true,
      data: clinic
    });
  } catch (error) {
    logger.error('Get clinic error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching clinic'
    });
  }
});

// @route   PUT /api/clinics/:id
// @desc    Update clinic
// @access  Private (Admin only)
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const clinic = await Clinic.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: 'Clinic not found'
      });
    }

    res.json({
      success: true,
      message: 'Clinic updated successfully',
      data: clinic
    });
  } catch (error) {
    logger.error('Update clinic error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating clinic'
    });
  }
});

// @route   DELETE /api/clinics/:id
// @desc    Delete clinic (soft delete)
// @access  Private (Admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const clinic = await Clinic.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: 'Clinic not found'
      });
    }

    res.json({
      success: true,
      message: 'Clinic deactivated successfully'
    });
  } catch (error) {
    logger.error('Delete clinic error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting clinic'
    });
  }
});

module.exports = router;
