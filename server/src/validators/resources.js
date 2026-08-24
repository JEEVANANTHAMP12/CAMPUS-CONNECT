const { body, query } = require('express-validator');
const { mongoId, pagination } = require('./common');

exports.clubCreateRules = [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Club name is required'),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('department').optional().trim().isLength({ max: 80 }),
  body('activities').optional().isArray({ max: 20 }),
];

exports.clubUpdateRules = [
  body('name').optional().trim().isLength({ min: 2, max: 80 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('department').optional().trim().isLength({ max: 80 }),
  body('activities').optional().isArray({ max: 20 }),
  body('logo').optional().isString().isLength({ max: 500 }),
];

exports.eventCreateRules = [
  body('title').trim().isLength({ min: 2, max: 120 }).withMessage('Title is required'),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('location').optional().trim().isLength({ max: 200 }),
  body('club').optional().isMongoId(),
  body('department').optional().trim().isLength({ max: 80 }),
  body('targetAudience').optional().isIn(['club', 'department', 'all']),
];

exports.postCreateRules = [
  body('title').trim().isLength({ min: 2, max: 160 }).withMessage('Title is required'),
  body('content').trim().isLength({ min: 1, max: 5000 }).withMessage('Content is required'),
  body('club').optional().isMongoId(),
  body('department').optional().trim().isLength({ max: 80 }),
  body('boardType').optional().isIn(['club', 'department', 'general']),
];

exports.commentRules = [
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Comment is required'),
];

exports.jobCreateRules = [
  body('title').trim().isLength({ min: 2, max: 120 }).withMessage('Title is required'),
  body('description').trim().isLength({ min: 10, max: 5000 }).withMessage('Description is required'),
  body('company').optional().trim().isLength({ max: 120 }),
  body('domain').optional().trim().isLength({ max: 80 }),
  body('location').optional().trim().isLength({ max: 120 }),
  body('stipend').optional().trim().isLength({ max: 80 }),
  body('deadline').optional().isISO8601(),
  body('department').optional().trim().isLength({ max: 80 }),
  body('type').optional().isIn(['internship', 'job']),
];

exports.achievementCreateRules = [
  body('title').trim().isLength({ min: 2, max: 160 }).withMessage('Title is required'),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('club').optional().isMongoId(),
  body('department').optional().trim().isLength({ max: 80 }),
];

exports.messageRules = [
  body('receiver').isMongoId().withMessage('Valid receiver is required'),
  body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Message is required'),
];

exports.groupMessageRules = [
  body('club').isMongoId().withMessage('Valid club is required'),
  body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Message is required'),
];

exports.roleRules = [
  body('role').isIn(['student', 'faculty', 'hod', 'admin', 'leader', 'sub_leader']),
];

exports.moderateRules = [
  body('action').isIn(['delete', 'dismiss']),
];

exports.idParam = [mongoId('id')];
exports.userIdParam = [mongoId('userId')];
exports.memberIdParam = [mongoId('id'), mongoId('memberId')];
exports.clubIdParam = [mongoId('clubId')];
exports.pageQuery = pagination;
exports.searchQuery = [query('search').optional().trim().isLength({ max: 80 })];
