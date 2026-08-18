const express = require('express');
const router = express.Router();
const { getUsers, getUser, deleteUser, updateUserRole } = require('../controllers/users');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', authorize('admin', 'hod'), getUsers);
router.get('/:id', getUser);
router.delete('/:id', authorize('admin'), deleteUser);
router.put('/:id/role', authorize('admin'), updateUserRole);

module.exports = router;
