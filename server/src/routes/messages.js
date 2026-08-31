const express = require('express');
const router = express.Router();
const { getConversations, getMessages, sendMessage, getGroupMessages, sendGroupMessage, markAsRead } = require('../controllers/messages');
const { protect } = require('../middleware/auth');
const { actionLimiter } = require('../middleware/rateLimit');
const validate = require('../middleware/validate');
const { messageRules, groupMessageRules, userIdParam, clubIdParam } = require('../validators/resources');

router.use(protect);
router.get('/conversations', getConversations);
router.get('/group/:clubId', clubIdParam, validate, getGroupMessages);
router.post('/group', actionLimiter, groupMessageRules, validate, sendGroupMessage);
router.put('/read/:userId', userIdParam, validate, markAsRead);
router.get('/:userId', userIdParam, validate, getMessages);
router.post('/', actionLimiter, messageRules, validate, sendMessage);

module.exports = router;
