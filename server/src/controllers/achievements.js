const Achievement = require('../models/Achievement');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.createAchievement = async (req, res) => {
  try {
    const { title, description, club, department, media } = req.body;
    const achievement = await Achievement.create({
      title, description, user: req.user.id, club, department,
      media: media || []
    });
    await User.findByIdAndUpdate(req.user.id, { $push: { achievements: achievement._id } });
    res.status(201).json({ success: true, data: achievement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAchievements = async (req, res) => {
  try {
    const { department, club, user, page = 1, limit = 20 } = req.query;
    const query = {};
    if (department) query.department = department;
    if (club) query.club = club;
    if (user) query.user = user;
    const skip = (page - 1) * limit;
    const achievements = await Achievement.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit))
      .populate('user', 'name profileImage department')
      .populate('club', 'name logo')
      .populate('comments.author', 'name profileImage');
    const total = await Achievement.countDocuments(query);
    res.status(200).json({ success: true, data: achievements, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id)
      .populate('user', 'name profileImage department')
      .populate('club', 'name logo')
      .populate('comments.author', 'name profileImage');
    if (!achievement) return res.status(404).json({ success: false, message: 'Achievement not found' });
    res.status(200).json({ success: true, data: achievement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    if (!achievement) return res.status(404).json({ success: false, message: 'Achievement not found' });
    if (achievement.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await User.findByIdAndUpdate(achievement.user, { $pull: { achievements: achievement._id } });
    await Achievement.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Achievement deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.likeAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    if (!achievement) return res.status(404).json({ success: false, message: 'Achievement not found' });
    const idx = achievement.likes.indexOf(req.user.id);
    if (idx > -1) {
      achievement.likes.splice(idx, 1);
    } else {
      achievement.likes.push(req.user.id);
      if (achievement.user.toString() !== req.user.id) {
        await Notification.create({
          user: achievement.user,
          title: 'Achievement Liked',
          message: `${req.user.name} liked your achievement "${achievement.title}"`,
          type: 'achievement',
          referenceId: achievement._id,
          referenceModel: 'Achievement'
        });
      }
    }
    await achievement.save();
    res.status(200).json({ success: true, data: achievement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    if (!achievement) return res.status(404).json({ success: false, message: 'Achievement not found' });
    achievement.comments.push({ author: req.user.id, content: req.body.content });
    await achievement.save();
    if (achievement.user.toString() !== req.user.id) {
      await Notification.create({
        user: achievement.user,
        title: 'Achievement Comment',
        message: `${req.user.name} commented on your achievement "${achievement.title}"`,
        type: 'achievement',
        referenceId: achievement._id,
        referenceModel: 'Achievement'
      });
    }
    const populated = await Achievement.findById(achievement._id).populate('comments.author', 'name profileImage');
    res.status(200).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.highlightAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findByIdAndUpdate(req.params.id, {
      isHighlighted: true, highlightedBy: req.user.id
    }, { new: true });
    if (!achievement) return res.status(404).json({ success: false, message: 'Achievement not found' });
    await Notification.create({
      user: achievement.user,
      title: 'Achievement Highlighted',
      message: `Your achievement "${achievement.title}" has been highlighted by an admin`,
      type: 'achievement',
      referenceId: achievement._id,
      referenceModel: 'Achievement'
    });
    res.status(200).json({ success: true, data: achievement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTopAchievers = async (req, res) => {
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const topAchievers = await Achievement.aggregate([
      { $match: { createdAt: { $gte: oneWeekAgo } } },
      {
        $addFields: {
          engagement: { $add: [{ $size: '$likes' }, { $size: '$comments' }] }
        }
      },
      { $sort: { engagement: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userData'
        }
      },
      { $unwind: '$userData' },
      {
        $project: {
          title: 1, engagement: 1, createdAt: 1,
          userName: '$userData.name',
          userProfile: '$userData.profileImage',
          userDept: '$userData.department'
        }
      }
    ]);
    res.status(200).json({ success: true, data: topAchievers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
