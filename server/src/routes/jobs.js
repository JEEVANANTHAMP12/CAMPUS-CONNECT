const express = require('express');
const router = express.Router();
const { createJob, getJobs, getJob, updateJob, deleteJob, applyToJob, verifyJob, getPendingJobs, recommendJobs } = require('../controllers/jobs');
const { protect, authorize } = require('../middleware/auth');
const { actionLimiter } = require('../middleware/rateLimit');
const validate = require('../middleware/validate');
const { jobCreateRules, idParam } = require('../validators/resources');

router.use(protect);
router.get('/', getJobs);
router.post('/', authorize('faculty', 'hod', 'admin', 'leader'), actionLimiter, jobCreateRules, validate, createJob);
router.get('/pending', authorize('admin', 'hod'), getPendingJobs);
router.get('/recommend', recommendJobs);
router.get('/:id', idParam, validate, getJob);
router.put('/:id', idParam, validate, actionLimiter, updateJob);
router.delete('/:id', idParam, validate, actionLimiter, deleteJob);
router.post('/:id/apply', idParam, validate, actionLimiter, applyToJob);
router.put('/:id/verify', authorize('admin', 'hod'), idParam, validate, actionLimiter, verifyJob);

module.exports = router;
