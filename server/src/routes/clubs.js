const express = require('express');
const router = express.Router();
const { createClub, getClubs, getClub, updateClub, deleteClub, joinClub, leaveClub, addMember, removeMember, getClubAnalytics } = require('../controllers/clubs');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getClubs);
router.post('/', authorize('leader', 'sub_leader', 'admin', 'hod'), createClub);
router.get('/:id', getClub);
router.put('/:id', updateClub);
router.delete('/:id', deleteClub);
router.post('/:id/join', joinClub);
router.post('/:id/leave', leaveClub);
router.post('/:id/members', addMember);
router.delete('/:id/members/:memberId', removeMember);
router.get('/:id/analytics', getClubAnalytics);

module.exports = router;
