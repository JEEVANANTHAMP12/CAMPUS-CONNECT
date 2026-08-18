const User = require('../models/User');
const Club = require('../models/Club');
const Event = require('../models/Event');
const Post = require('../models/Post');
const Job = require('../models/Job');
const Achievement = require('../models/Achievement');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalClubs = await Club.countDocuments({ isActive: true });
    const totalEvents = await Event.countDocuments();
    const totalPosts = await Post.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalAchievements = await Achievement.countDocuments();
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    const usersByDept = await User.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const recentEvents = await Event.find().sort({ createdAt: -1 }).limit(5)
      .populate('club', 'name').populate('createdBy', 'name');
    const pendingApprovals = await Event.countDocuments({ isVerified: false });
    const pendingJobVerifications = await Job.countDocuments({ isVerified: false });
    const reportedPosts = await Post.countDocuments({ isReported: true });
    res.status(200).json({
      success: true,
      data: {
        totalUsers, totalClubs, totalEvents, totalPosts, totalJobs, totalAchievements,
        usersByRole, usersByDept, recentEvents, pendingApprovals, pendingJobVerifications, reportedPosts
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getEngagementMetrics = async (req, res) => {
  try {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsers = await User.countDocuments({ createdAt: { $gte: last30Days } });
    const newEvents = await Event.countDocuments({ createdAt: { $gte: last30Days } });
    const newPosts = await Post.countDocuments({ createdAt: { $gte: last30Days } });
    const newAchievements = await Achievement.countDocuments({ createdAt: { $gte: last30Days } });
    const topClubs = await Club.aggregate([
      { $project: { name: 1, memberCount: { $size: '$members' } } },
      { $sort: { memberCount: -1 } },
      { $limit: 5 }
    ]);
    res.status(200).json({
      success: true,
      data: { newUsers, newEvents, newPosts, newAchievements, topClubs }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getReportedContent = async (req, res) => {
  try {
    const reportedPosts = await Post.find({ isReported: true })
      .populate('author', 'name profileImage')
      .populate('reportedBy', 'name')
      .populate('club', 'name');
    res.status(200).json({ success: true, data: reportedPosts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.moderatePost = async (req, res) => {
  try {
    const { action } = req.body;
    if (action === 'delete') {
      await Post.findByIdAndDelete(req.params.id);
      res.status(200).json({ success: true, message: 'Post deleted' });
    } else if (action === 'dismiss') {
      await Post.findByIdAndUpdate(req.params.id, { isReported: false, reportedBy: null });
      res.status(200).json({ success: true, message: 'Report dismissed' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.approvePendingEvents = async (req, res) => {
  try {
    const events = await Event.find({ isApproved: false })
      .populate('club', 'name').populate('createdBy', 'name');
    res.status(200).json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.approvePendingJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ isVerified: false }).populate('postedBy', 'name');
    res.status(200).json({ success: true, data: jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
