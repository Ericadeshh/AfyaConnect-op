const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Auth validations
const validateRegister = [
  body('email').optional().isEmail().normalizeEmail(),
  body('phoneNumber').optional().isMobilePhone('any'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('fullName').trim().isLength({ min: 2 }).withMessage('Full name is required'),
  body('role').isIn(['patient', 'physician', 'admin']).withMessage('Invalid role'),
  handleValidationErrors
];

const validateLogin = [
  body('identifier').notEmpty().withMessage('Email or phone number is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

// Referral validations
const validateReferral = [
  body('patientName').trim().isLength({ min: 2 }).withMessage('Patient name is required'),
  body('medicalHistory').trim().isLength({ min: 10 }).withMessage('Medical history is required'),
  body('labResults').trim().isLength({ min: 5 }).withMessage('Lab results are required'),
  body('diagnosis').trim().isLength({ min: 5 }).withMessage('Diagnosis is required'),
  body('referringHospital').trim().notEmpty().withMessage('Referring hospital is required'),
  body('receivingFacility').trim().notEmpty().withMessage('Receiving facility is required'),
  body('priority').isIn(['Routine', 'Urgent', 'Emergency']).withMessage('Invalid priority'),
  handleValidationErrors
];

// Booking validations
const validateBooking = [
  body('patientId').notEmpty().withMessage('Patient ID is required'),
  body('patientPhone').isMobilePhone('any').withMessage('Valid phone number is required'),
  body('stkPhoneNumber').isMobilePhone('any').withMessage('Valid STK phone number is required'),
  body('clinicId').isMongoId().withMessage('Valid clinic ID is required'),
  body('bookingDate').isISO8601().withMessage('Valid booking date is required'),
  body('bookingTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time format required (HH:MM)'),
  body('paymentAmount').isNumeric().isFloat({ min: 0 }).withMessage('Valid payment amount is required'),
  handleValidationErrors
];

// Payment validations
const validatePayment = [
  body('phoneNumber').isMobilePhone('any').withMessage('Valid phone number is required'),
  body('amount').isNumeric().isFloat({ min: 1 }).withMessage('Valid amount is required'),
  handleValidationErrors
];

// Clinic validations
const validateClinic = [
  body('name').trim().isLength({ min: 2 }).withMessage('Clinic name is required'),
  body('facilityName').trim().isLength({ min: 2 }).withMessage('Facility name is required'),
  body('location').trim().isLength({ min: 2 }).withMessage('Location is required'),
  body('maxPatientsPerDay').isInt({ min: 1 }).withMessage('Max patients per day must be at least 1'),
  handleValidationErrors
];

// Physician validations
const validatePhysician = [
  body('licenseId').trim().isLength({ min: 3 }).withMessage('License ID is required'),
  body('hospital').trim().isLength({ min: 2 }).withMessage('Hospital is required'),
  body('specialization').optional().trim().isLength({ min: 2 }),
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateReferral,
  validateBooking,
  validatePayment,
  validateClinic,
  validatePhysician,
  handleValidationErrors
};
