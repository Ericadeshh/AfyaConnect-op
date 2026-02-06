const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Physician = require('../models/Physician');
const Patient = require('../models/Patient');
const { validateRegister, validateLogin } = require('../middleware/validation');
const { auth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', validateRegister, async (req, res) => {
  try {
    const { email, phoneNumber, password, fullName, role, ...additionalData } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        ...(email ? [{ email }] : []),
        ...(phoneNumber ? [{ phoneNumber }] : [])
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or phone number'
      });
    }

    // Create user
    const user = new User({
      email,
      phoneNumber,
      password,
      fullName,
      role
    });

    await user.save();

    // Create role-specific profile
    if (role === 'physician') {
      const physician = new Physician({
        userId: user._id,
        licenseId: additionalData.licenseId,
        hospital: additionalData.hospital,
        specialization: additionalData.specialization
      });
      await physician.save();
    } else if (role === 'patient') {
      const patient = new Patient({
        userId: user._id,
        dateOfBirth: additionalData.dateOfBirth,
        nationalId: additionalData.nationalId,
        emergencyContact: additionalData.emergencyContact
      });
      await patient.save();
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { identifier, password, role } = req.body;

    // Find user by email or phone number
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { phoneNumber: identifier }
      ],
      ...(role && { role })
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Get role-specific data
    let roleData = null;
    if (user.role === 'physician') {
      roleData = await Physician.findOne({ userId: user._id });
    } else if (user.role === 'patient') {
      roleData = await Patient.findOne({ userId: user._id });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        roleData,
        token
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    let roleData = null;
    if (req.user.role === 'physician') {
      roleData = await Physician.findOne({ userId: req.user._id });
    } else if (req.user.role === 'patient') {
      roleData = await Patient.findOne({ userId: req.user._id });
    }

    res.json({
      success: true,
      data: {
        user: req.user,
        roleData
      }
    });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', auth, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;
