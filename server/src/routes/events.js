const express = require('express');
const router = express.Router();
const { createEvent, getEvents, getEvent, updateEvent, deleteEvent, rsvpEvent, cancelRsvp, approveEvent, getPendingEvents, getEventAnalytics } = require('../controllers/events');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getEvents);
router.post('/', createEvent);
router.get('/pending', authorize('admin', 'hod'), getPendingEvents);
router.get('/:id', getEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);
router.post('/:id/rsvp', rsvpEvent);
router.post('/:id/cancel-rsvp', cancelRsvp);
router.put('/:id/approve', authorize('admin', 'hod'), approveEvent);
router.get('/:id/analytics', getEventAnalytics);

module.exports = router;
