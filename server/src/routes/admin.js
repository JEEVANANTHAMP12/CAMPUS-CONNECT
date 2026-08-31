const express = require('express');
const router = express.Router();
const { getDashboardStats, getEngagementMetrics, getReportedContent, moderatePost, approvePendingEvents, approvePendingJobs } = require('../controllers/admin');
const { protect, authorize } = require('../middleware/auth');
const { actionLimiter } = require('../middleware/rateLimit');
const validate = require('../middleware/validate');
const { idParam, moderateRules } = require('../validators/resources');

router.use(protect);
router.use(authorize('admin', 'hod'));
router.get('/stats', getDashboardStats);
router.get('/engagement', getEngagementMetrics);
router.get('/reported', getReportedContent);
router.put('/moderate/:id', idParam, validate, actionLimiter, moderateRules, validate, moderatePost);
router.get('/pending-events', approvePendingEvents);
router.get('/pending-jobs', approvePendingJobs);

module.exports = router;
