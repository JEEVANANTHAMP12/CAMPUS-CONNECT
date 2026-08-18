const express = require('express');
const router = express.Router();
const { createAchievement, getAchievements, getAchievement, deleteAchievement, likeAchievement, addComment, highlightAchievement, getTopAchievers } = require('../controllers/achievements');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getAchievements);
router.get('/top-achievers', getTopAchievers);
router.post('/', createAchievement);
router.get('/:id', getAchievement);
router.delete('/:id', deleteAchievement);
router.post('/:id/like', likeAchievement);
router.post('/:id/comment', addComment);
router.put('/:id/highlight', authorize('admin', 'hod', 'leader'), highlightAchievement);

module.exports = router;
