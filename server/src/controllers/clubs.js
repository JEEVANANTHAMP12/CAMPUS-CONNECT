const Club = require('../models/Club');
const User = require('../models/User');
const Event = require('../models/Event');
const Post = require('../models/Post');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { pick, escapeRegex } = require('../utils/pick');

const canManageClub = (club, user) => {
  const uid = user.id.toString();
  return (
    club.leader?.toString() === uid ||
    club.subLeaders?.some((s) => s.toString() === uid) ||
    user.role === 'admin' ||
    user.role === 'hod'
  );
};

exports.createClub = asyncHandler(async (req, res) => {
  const data = pick(req.body, ['name', 'description', 'department', 'activities']);
  const club = await Club.create({
    ...data,
    leader: req.user.id,
    members: [req.user.id],
    activities: data.activities || [],
  });
  await User.findByIdAndUpdate(req.user.id, {
    $addToSet: { clubs: club._id },
    role: req.user.role === 'student' ? 'leader' : req.user.role,
  });
  res.status(201).json({ success: true, data: club });
});

exports.getClubs = asyncHandler(async (req, res) => {
  const { department, search, page = 1, limit = 20 } = req.query;
  const query = { isActive: true };
  if (department) query.department = department;
  if (search) query.name = { $regex: escapeRegex(search), $options: 'i' };
  const skip = (page - 1) * limit;
  const [clubs, total] = await Promise.all([
    Club.find(query)
      .skip(skip)
      .limit(parseInt(limit, 10))
      .populate('leader', 'name profileImage')
      .populate('members', 'name profileImage'),
    Club.countDocuments(query),
  ]);
  res.status(200).json({
    success: true,
    data: clubs,
    total,
    pages: Math.ceil(total / limit),
  });
});

exports.getClub = asyncHandler(async (req, res) => {
  const club = await Club.findById(req.params.id)
    .populate('leader', 'name profileImage email')
    .populate('subLeaders', 'name profileImage')
    .populate('members', 'name profileImage department year');
  if (!club || !club.isActive) throw ApiError.notFound('Club not found');
  res.status(200).json({ success: true, data: club });
});

exports.updateClub = asyncHandler(async (req, res) => {
  const club = await Club.findById(req.params.id);
  if (!club) throw ApiError.notFound('Club not found');
  if (!canManageClub(club, req.user)) throw ApiError.forbidden();
  const updates = pick(req.body, ['name', 'description', 'department', 'activities', 'logo']);
  const updated = await Club.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: updated });
});

exports.deleteClub = asyncHandler(async (req, res) => {
  const club = await Club.findById(req.params.id);
  if (!club) throw ApiError.notFound('Club not found');
  if (club.leader.toString() !== req.user.id && req.user.role !== 'admin') {
    throw ApiError.forbidden();
  }
  club.isActive = false;
  await club.save();
  res.status(200).json({ success: true, message: 'Club deactivated' });
});

exports.joinClub = asyncHandler(async (req, res) => {
  const club = await Club.findById(req.params.id);
  if (!club || !club.isActive) throw ApiError.notFound('Club not found');
  if (club.members.some((m) => m.toString() === req.user.id)) {
    throw ApiError.badRequest('Already a member');
  }
  club.members.push(req.user.id);
  await club.save();
  await User.findByIdAndUpdate(req.user.id, { $addToSet: { clubs: club._id } });
  res.status(200).json({ success: true, message: 'Joined club', data: club });
});

exports.leaveClub = asyncHandler(async (req, res) => {
  const club = await Club.findById(req.params.id);
  if (!club) throw ApiError.notFound('Club not found');
  if (club.leader.toString() === req.user.id) {
    throw ApiError.badRequest('Club leader cannot leave. Transfer leadership first');
  }
  club.members = club.members.filter((m) => m.toString() !== req.user.id);
  club.subLeaders = club.subLeaders.filter((m) => m.toString() !== req.user.id);
  await club.save();
  await User.findByIdAndUpdate(req.user.id, { $pull: { clubs: club._id } });
  res.status(200).json({ success: true, message: 'Left club', data: club });
});

exports.addMember = asyncHandler(async (req, res) => {
  const club = await Club.findById(req.params.id);
  if (!club) throw ApiError.notFound('Club not found');
  if (!canManageClub(club, req.user)) throw ApiError.forbidden();
  const user = await User.findById(req.body.userId);
  if (!user) throw ApiError.notFound('User not found');
  if (club.members.some((m) => m.toString() === user.id)) {
    throw ApiError.badRequest('Already a member');
  }
  club.members.push(user._id);
  await club.save();
  await User.findByIdAndUpdate(user._id, { $addToSet: { clubs: club._id } });
  res.status(200).json({ success: true, message: 'Member added', data: club });
});

exports.removeMember = asyncHandler(async (req, res) => {
  const club = await Club.findById(req.params.id);
  if (!club) throw ApiError.notFound('Club not found');
  if (!canManageClub(club, req.user)) throw ApiError.forbidden();
  if (club.leader.toString() === req.params.memberId) {
    throw ApiError.badRequest('Cannot remove the club leader');
  }
  club.members = club.members.filter((m) => m.toString() !== req.params.memberId);
  club.subLeaders = club.subLeaders.filter((m) => m.toString() !== req.params.memberId);
  await club.save();
  await User.findByIdAndUpdate(req.params.memberId, { $pull: { clubs: club._id } });
  res.status(200).json({ success: true, message: 'Member removed', data: club });
});

exports.getClubAnalytics = asyncHandler(async (req, res) => {
  const club = await Club.findById(req.params.id);
  if (!club) throw ApiError.notFound('Club not found');
  const [events, posts, totalLikes] = await Promise.all([
    Event.countDocuments({ club: club._id }),
    Post.countDocuments({ club: club._id }),
    Post.aggregate([
      { $match: { club: club._id } },
      { $project: { likesCount: { $size: '$likes' } } },
      { $group: { _id: null, total: { $sum: '$likesCount' } } },
    ]),
  ]);
  res.status(200).json({
    success: true,
    data: {
      memberCount: club.members.length,
      eventCount: events,
      postCount: posts,
      totalLikes: totalLikes[0]?.total || 0,
    },
  });
});
