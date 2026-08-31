const express = require('express');
const router = express.Router();
const { createAchievement, getAchievements, getAchievement, deleteAchievement, likeAchievement, addComment, highlightAchievement, getTopAchievers } = require('../controllers/achievements');
const { protect, authorize } = require('../middleware/auth');
const { actionLimiter } = require('../middleware/rateLimit');
const validate = require('../middleware/validate');
const { achievementCreateRules, commentRules, idParam } = require('../validators/resources');

router.use(protect);
router.get('/', getAchievements);
router.get('/top-achievers', getTopAchievers);
router.post('/', actionLimiter, achievementCreateRules, validate, createAchievement);
router.get('/:id', idParam, validate, getAchievement);
router.delete('/:id', idParam, validate, actionLimiter, deleteAchievement);
router.post('/:id/like', idParam, validate, actionLimiter, likeAchievement);
router.post('/:id/comment', idParam, validate, actionLimiter, commentRules, validate, addComment);
router.put('/:id/highlight', authorize('admin', 'hod', 'leader'), idParam, validate, actionLimiter, highlightAchievement);

module.exports = router;
