const Event = require('../models/Event');
const Club = require('../models/Club');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { pick } = require('../utils/pick');

exports.createEvent = asyncHandler(async (req, res) => {
  const data = pick(req.body, [
    'title',
    'description',
    'date',
    'location',
    'club',
    'targetAudience',
    'department',
  ]);
  const event = await Event.create({
    ...data,
    createdBy: req.user.id,
    targetAudience: data.targetAudience || 'all',
  });

  let autoApprove = req.user.role === 'admin' || req.user.role === 'hod';
  if (!autoApprove && data.club) {
    const clubData = await Club.findById(data.club);
    if (clubData && clubData.leader.toString() === req.user.id) autoApprove = true;
  }
  if (autoApprove) {
    event.isApproved = true;
    event.approvedBy = req.user.id;
    await event.save();
  }

  res.status(201).json({ success: true, data: event });
});

exports.getEvents = asyncHandler(async (req, res) => {
  const { department, club, upcoming, page = 1, limit = 20 } = req.query;
  const query = { isApproved: true };
  if (department) query.department = department;
  if (club) query.club = club;
  if (upcoming === 'true') query.date = { $gte: new Date() };
  const skip = (page - 1) * limit;
  const [events, total] = await Promise.all([
    Event.find(query)
      .sort({ date: 1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .populate('club', 'name logo')
      .populate('createdBy', 'name profileImage'),
    Event.countDocuments(query),
  ]);
  res.status(200).json({
    success: true,
    data: events,
    total,
    pages: Math.ceil(total / limit),
  });
});

exports.getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate('club', 'name logo description')
    .populate('createdBy', 'name profileImage')
    .populate('attendees', 'name profileImage');
  if (!event) throw ApiError.notFound('Event not found');
  res.status(200).json({ success: true, data: event });
});

exports.updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw ApiError.notFound('Event not found');
  if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    throw ApiError.forbidden();
  }
  const updates = pick(req.body, [
    'title',
    'description',
    'date',
    'location',
    'targetAudience',
    'department',
  ]);
  const updated = await Event.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: updated });
});

exports.deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw ApiError.notFound('Event not found');
  if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    throw ApiError.forbidden();
  }
  await Event.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Event deleted' });
});

exports.rsvpEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw ApiError.notFound('Event not found');
  if (!event.isApproved) throw ApiError.badRequest('Event is not approved yet');
  if (event.attendees.some((a) => a.toString() === req.user.id)) {
    throw ApiError.badRequest('Already RSVPed');
  }
  event.attendees.push(req.user.id);
  await event.save();
  if (event.createdBy.toString() !== req.user.id) {
    await Notification.create({
      user: event.createdBy,
      title: 'New RSVP',
      message: `${req.user.name} RSVPed to your event "${event.title}"`,
      type: 'event',
      referenceId: event._id,
      referenceModel: 'Event',
    });
  }
  res.status(200).json({ success: true, message: 'RSVPed', data: event });
});

exports.cancelRsvp = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw ApiError.notFound('Event not found');
  event.attendees = event.attendees.filter((a) => a.toString() !== req.user.id);
  await event.save();
  res.status(200).json({ success: true, message: 'RSVP cancelled', data: event });
});

exports.approveEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndUpdate(
    req.params.id,
    { isApproved: true, approvedBy: req.user.id },
    { new: true }
  );
  if (!event) throw ApiError.notFound('Event not found');
  await Notification.create({
    user: event.createdBy,
    title: 'Event Approved',
    message: `Your event "${event.title}" has been approved`,
    type: 'event',
    referenceId: event._id,
    referenceModel: 'Event',
  });
  res.status(200).json({ success: true, data: event });
});

exports.getPendingEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ isApproved: false })
    .populate('club', 'name')
    .populate('createdBy', 'name');
  res.status(200).json({ success: true, data: events });
});

exports.getEventAnalytics = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw ApiError.notFound('Event not found');
  res.status(200).json({
    success: true,
    data: {
      rsvpCount: event.attendees.length,
      totalComments: event.comments?.length || 0,
      date: event.date,
      location: event.location,
    },
  });
});
