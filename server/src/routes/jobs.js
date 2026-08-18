const express = require('express');
const router = express.Router();
const { createJob, getJobs, getJob, updateJob, deleteJob, applyToJob, verifyJob, getPendingJobs, recommendJobs } = require('../controllers/jobs');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getJobs);
router.post('/', authorize('faculty', 'hod', 'admin', 'leader'), createJob);
router.get('/pending', authorize('admin', 'hod'), getPendingJobs);
router.get('/recommend', recommendJobs);
router.get('/:id', getJob);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);
router.post('/:id/apply', applyToJob);
router.put('/:id/verify', authorize('admin', 'hod'), verifyJob);

module.exports = router;
