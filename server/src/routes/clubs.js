const express = require('express');
const router = express.Router();
const { createClub, getClubs, getClub, updateClub, deleteClub, joinClub, leaveClub, addMember, removeMember, getClubAnalytics } = require('../controllers/clubs');
const { protect, authorize } = require('../middleware/auth');
const { actionLimiter } = require('../middleware/rateLimit');
const validate = require('../middleware/validate');
const { clubCreateRules, clubUpdateRules, idParam } = require('../validators/resources');

router.use(protect);
router.get('/', getClubs);
router.post('/', authorize('leader', 'sub_leader', 'admin', 'hod'), actionLimiter, clubCreateRules, validate, createClub);
router.get('/:id', idParam, validate, getClub);
router.put('/:id', idParam, validate, actionLimiter, clubUpdateRules, validate, updateClub);
router.delete('/:id', idParam, validate, actionLimiter, deleteClub);
router.post('/:id/join', idParam, validate, actionLimiter, joinClub);
router.post('/:id/leave', idParam, validate, actionLimiter, leaveClub);
router.post('/:id/members', idParam, validate, actionLimiter, addMember);
router.delete('/:id/members/:memberId', idParam, validate, actionLimiter, removeMember);
router.get('/:id/analytics', idParam, validate, getClubAnalytics);

module.exports = router;
