const express = require('express');
const router = express.Router();
const { getConversations, getMessages, sendMessage, getGroupMessages, sendGroupMessage, markAsRead } = require('../controllers/messages');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/conversations', getConversations);
router.get('/:userId', getMessages);
router.post('/', sendMessage);
router.get('/group/:clubId', getGroupMessages);
router.post('/group', sendGroupMessage);
router.put('/read/:userId', markAsRead);

module.exports = router;
