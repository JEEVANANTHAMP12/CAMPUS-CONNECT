const express = require('express');
const router = express.Router();
const { createPost, getPosts, getPost, updatePost, deletePost, likePost, addComment, reportPost, pinPost } = require('../controllers/posts');
const { protect, authorize } = require('../middleware/auth');
const { actionLimiter } = require('../middleware/rateLimit');
const validate = require('../middleware/validate');
const { postCreateRules, commentRules, idParam } = require('../validators/resources');

router.use(protect);
router.get('/', getPosts);
router.post('/', actionLimiter, postCreateRules, validate, createPost);
router.get('/:id', idParam, validate, getPost);
router.put('/:id', idParam, validate, actionLimiter, updatePost);
router.delete('/:id', idParam, validate, actionLimiter, deletePost);
router.post('/:id/like', idParam, validate, actionLimiter, likePost);
router.post('/:id/comment', idParam, validate, actionLimiter, commentRules, validate, addComment);
router.post('/:id/report', idParam, validate, actionLimiter, reportPost);
router.put('/:id/pin', authorize('leader', 'sub_leader', 'admin'), idParam, validate, actionLimiter, pinPost);

module.exports = router;
