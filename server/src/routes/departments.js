const express = require('express');
const router = express.Router();
const {
  getDepartments,
  createDepartment,
  updateDepartment,
  assignHOD,
  deleteDepartment,
} = require('../controllers/departments');
const { protect, authorize } = require('../middleware/auth');
const { actionLimiter } = require('../middleware/rateLimit');
const validate = require('../middleware/validate');
const { idParam, departmentCreateRules, departmentUpdateRules, assignHodRules } = require('../validators/resources');

router.use(protect);

// GET /api/departments - Accessible to all authenticated users (and admin/hod)
router.get('/', getDepartments);

// Admin-only endpoints
router.post('/', authorize('admin'), actionLimiter, departmentCreateRules, validate, createDepartment);
router.put('/:id', authorize('admin'), idParam, departmentUpdateRules, validate, actionLimiter, updateDepartment);
router.put('/:id/assign-hod', authorize('admin'), idParam, assignHodRules, validate, actionLimiter, assignHOD);
router.delete('/:id', authorize('admin'), idParam, validate, actionLimiter, deleteDepartment);

module.exports = router;
