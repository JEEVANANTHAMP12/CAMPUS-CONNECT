const { body } = require('express-validator');

const passwordRule = body('password')
  .isLength({ min: 8, max: 128 })
  .withMessage('Password must be 8-128 characters')
  .matches(/[A-Za-z]/)
  .withMessage('Password must contain a letter')
  .matches(/\d/)
  .withMessage('Password must contain a number');

exports.registerRules = [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  passwordRule,
  body('department').optional().trim().isLength({ max: 80 }),
  body('year').optional().isInt({ min: 1, max: 5 }).toInt(),
  body('skills').optional().isArray({ max: 20 }),
  body('skills.*').optional().trim().isLength({ max: 40 }),
];

exports.loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isString().isLength({ min: 1, max: 128 }),
];

exports.updateProfileRules = [
  body('name').optional().trim().isLength({ min: 2, max: 80 }),
  body('department').optional().trim().isLength({ max: 80 }),
  body('year').optional().isInt({ min: 1, max: 5 }).toInt(),
  body('skills').optional().isArray({ max: 20 }),
  body('bio').optional().trim().isLength({ max: 500 }),
  body('profileImage').optional().isURL().withMessage('profileImage must be a valid URL'),
  body('privacySettings').optional().isObject(),
  body('privacySettings.profileVisible').optional().isBoolean(),
  body('privacySettings.achievementsVisible').optional().isBoolean(),
];

exports.updatePasswordRules = [
  body('currentPassword').isString().isLength({ min: 1, max: 128 }),
  body('newPassword')
    .isLength({ min: 8, max: 128 })
    .withMessage('New password must be 8-128 characters')
    .matches(/[A-Za-z]/)
    .withMessage('New password must contain a letter')
    .matches(/\d/)
    .withMessage('New password must contain a number'),
];
