const express = require('express');
const router = express.Router();
const { createPost, getPosts, getPost, updatePost, deletePost, likePost, addComment, reportPost, pinPost } = require('../controllers/posts');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getPosts);
router.post('/', createPost);
router.get('/:id', getPost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);
router.post('/:id/like', likePost);
router.post('/:id/comment', addComment);
router.post('/:id/report', reportPost);
router.put('/:id/pin', authorize('leader', 'sub_leader', 'admin'), pinPost);

module.exports = router;
