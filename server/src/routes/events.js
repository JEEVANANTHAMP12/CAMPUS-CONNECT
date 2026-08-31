const express = require('express');
const router = express.Router();
const { createEvent, getEvents, getEvent, updateEvent, deleteEvent, rsvpEvent, cancelRsvp, approveEvent, getPendingEvents, getEventAnalytics } = require('../controllers/events');
const { protect, authorize } = require('../middleware/auth');
const { actionLimiter } = require('../middleware/rateLimit');
const validate = require('../middleware/validate');
const { eventCreateRules, idParam } = require('../validators/resources');

router.use(protect);
router.get('/', getEvents);
router.post('/', actionLimiter, eventCreateRules, validate, createEvent);
router.get('/pending', authorize('admin', 'hod'), getPendingEvents);
router.get('/:id', idParam, validate, getEvent);
router.put('/:id', idParam, validate, actionLimiter, updateEvent);
router.delete('/:id', idParam, validate, actionLimiter, deleteEvent);
router.post('/:id/rsvp', idParam, validate, actionLimiter, rsvpEvent);
router.post('/:id/cancel-rsvp', idParam, validate, actionLimiter, cancelRsvp);
router.put('/:id/approve', authorize('admin', 'hod'), idParam, validate, actionLimiter, approveEvent);
router.get('/:id/analytics', idParam, validate, getEventAnalytics);

module.exports = router;
