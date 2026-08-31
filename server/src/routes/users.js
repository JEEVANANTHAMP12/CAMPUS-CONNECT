const express = require('express');
const router = express.Router();
const { getUsers, getUser, deleteUser, updateUserRole, toggleUserStatus, createUser } = require('../controllers/users');
const { protect, authorize } = require('../middleware/auth');
const { actionLimiter } = require('../middleware/rateLimit');
const validate = require('../middleware/validate');
const { idParam, roleRules, statusRules } = require('../validators/resources');

router.use(protect);
router.post('/', authorize('admin', 'hod'), actionLimiter, createUser);
router.get('/', authorize('admin', 'hod'), getUsers);
router.get('/:id', idParam, validate, getUser);
router.delete('/:id', authorize('admin'), idParam, validate, actionLimiter, deleteUser);
router.put('/:id/role', authorize('admin'), idParam, validate, actionLimiter, roleRules, validate, updateUserRole);
router.put('/:id/status', authorize('admin', 'hod'), idParam, validate, actionLimiter, statusRules, validate, toggleUserStatus);

module.exports = router;
