const Club = require('../models/Club');
const User = require('../models/User');

exports.createClub = async (req, res) => {
  try {
    const { name, description, department, activities } = req.body;
    const club = await Club.create({
      name, description, department,
      leader: req.user.id,
      activities: activities || []
    });
    await User.findByIdAndUpdate(req.user.id, { $push: { clubs: club._id }, role: 'leader' });
    res.status(201).json({ success: true, data: club });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getClubs = async (req, res) => {
  try {
    const { department, search, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };
    if (department) query.department = department;
    if (search) query.name = { $regex: search, $options: 'i' };
    const skip = (page - 1) * limit;
    const clubs = await Club.find(query).skip(skip).limit(parseInt(limit))
      .populate('leader', 'name profileImage')
      .populate('members', 'name profileImage');
    const total = await Club.countDocuments(query);
    res.status(200).json({ success: true, data: clubs, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('leader', 'name profileImage email')
      .populate('subLeaders', 'name profileImage')
      .populate('members', 'name profileImage department year');
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });
    res.status(200).json({ success: true, data: club });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });
    if (club.leader.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'hod') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const updated = await Club.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });
    if (club.leader.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    club.isActive = false;
    await club.save();
    res.status(200).json({ success: true, message: 'Club deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.joinClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });
    if (club.members.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'Already a member' });
    }
    club.members.push(req.user.id);
    await club.save();
    await User.findByIdAndUpdate(req.user.id, { $push: { clubs: club._id } });
    res.status(200).json({ success: true, message: 'Joined club', data: club });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.leaveClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });
    club.members = club.members.filter(m => m.toString() !== req.user.id);
    await club.save();
    await User.findByIdAndUpdate(req.user.id, { $pull: { clubs: club._id } });
    res.status(200).json({ success: true, message: 'Left club', data: club });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addMember = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });
    if (club.leader.toString() !== req.user.id && !club.subLeaders.includes(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const user = await User.findById(req.body.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (club.members.includes(user._id)) {
      return res.status(400).json({ success: false, message: 'Already a member' });
    }
    club.members.push(user._id);
    await club.save();
    await User.findByIdAndUpdate(user._id, { $push: { clubs: club._id } });
    res.status(200).json({ success: true, message: 'Member added', data: club });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });
    if (club.leader.toString() !== req.user.id && !club.subLeaders.includes(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    club.members = club.members.filter(m => m.toString() !== req.params.memberId);
    await club.save();
    await User.findByIdAndUpdate(req.params.memberId, { $pull: { clubs: club._id } });
    res.status(200).json({ success: true, message: 'Member removed', data: club });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getClubAnalytics = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });
    const Event = require('../models/Event');
    const Post = require('../models/Post');
    const events = await Event.countDocuments({ club: club._id });
    const posts = await Post.countDocuments({ club: club._id });
    const totalLikes = await Post.aggregate([
      { $match: { club: club._id } },
      { $project: { likesCount: { $size: '$likes' } } },
      { $group: { _id: null, total: { $sum: '$likesCount' } } }
    ]);
    res.status(200).json({
      success: true,
      data: {
        memberCount: club.members.length,
        eventCount: events,
        postCount: posts,
        totalLikes: totalLikes[0]?.total || 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
