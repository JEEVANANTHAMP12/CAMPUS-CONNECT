const Event = require('../models/Event');
const Club = require('../models/Club');
const Notification = require('../models/Notification');

exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, location, club, targetAudience, department } = req.body;
    const event = await Event.create({
      title, description, date, location, club,
      department, createdBy: req.user.id,
      targetAudience: targetAudience || 'all'
    });
    if (club) {
      const clubData = await Club.findById(club);
      if (clubData && (clubData.leader.toString() === req.user.id || req.user.role === 'admin')) {
        event.isApproved = true;
        await event.save();
      }
    }
    if (req.user.role === 'admin' || req.user.role === 'hod') {
      event.isApproved = true;
      await event.save();
    }
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const { department, club, upcoming, page = 1, limit = 20 } = req.query;
    const query = { isApproved: true };
    if (department) query.department = department;
    if (club) query.club = club;
    if (upcoming === 'true') query.date = { $gte: new Date() };
    const skip = (page - 1) * limit;
    const events = await Event.find(query).sort({ date: 1 }).skip(skip).limit(parseInt(limit))
      .populate('club', 'name logo')
      .populate('createdBy', 'name profileImage');
    const total = await Event.countDocuments(query);
    res.status(200).json({ success: true, data: events, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('club', 'name logo description')
      .populate('createdBy', 'name profileImage')
      .populate('attendees', 'name profileImage');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.status(200).json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.rsvpEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.attendees.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'Already RSVPed' });
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
        referenceModel: 'Event'
      });
    }
    res.status(200).json({ success: true, message: 'RSVPed', data: event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.cancelRsvp = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    event.attendees = event.attendees.filter(a => a.toString() !== req.user.id);
    await event.save();
    res.status(200).json({ success: true, message: 'RSVP cancelled', data: event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.approveEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, {
      isApproved: true, approvedBy: req.user.id
    }, { new: true });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    await Notification.create({
      user: event.createdBy,
      title: 'Event Approved',
      message: `Your event "${event.title}" has been approved`,
      type: 'event',
      referenceId: event._id,
      referenceModel: 'Event'
    });
    res.status(200).json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPendingEvents = async (req, res) => {
  try {
    const events = await Event.find({ isApproved: false })
      .populate('club', 'name')
      .populate('createdBy', 'name');
    res.status(200).json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getEventAnalytics = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.status(200).json({
      success: true,
      data: {
        rsvpCount: event.attendees.length,
        totalComments: event.comments?.length || 0,
        date: event.date,
        location: event.location
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
