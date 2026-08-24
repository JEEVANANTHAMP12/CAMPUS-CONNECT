const Post = require('../models/Post');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { pick, escapeRegex } = require('../utils/pick');

exports.createPost = asyncHandler(async (req, res) => {
  const data = pick(req.body, ['title', 'content', 'club', 'department', 'boardType', 'media']);
  const post = await Post.create({
    ...data,
    author: req.user.id,
    department: data.department || req.user.department || undefined,
    boardType: data.boardType || 'general',
    media: data.media || [],
  });
  const populated = await Post.findById(post._id)
    .populate('author', 'name profileImage role department')
    .populate('club', 'name logo')
    .populate('comments.author', 'name profileImage');
  res.status(201).json({ success: true, data: populated });
});

exports.getPosts = asyncHandler(async (req, res) => {
  const { club, department, boardType, page = 1, limit = 50, search } = req.query;
  const query = {};
  if (club) query.club = club;
  if (department) query.department = department;
  if (boardType && boardType !== 'all') query.boardType = boardType;
  if (search) {
    const safe = escapeRegex(search);
    query.$or = [
      { title: { $regex: safe, $options: 'i' } },
      { content: { $regex: safe, $options: 'i' } },
    ];
  }
  const skip = (page - 1) * limit;
  const [posts, total] = await Promise.all([
    Post.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .populate('author', 'name profileImage role department')
      .populate('club', 'name logo')
      .populate('comments.author', 'name profileImage'),
    Post.countDocuments(query),
  ]);
  res.status(200).json({
    success: true,
    data: posts,
    total,
    pages: Math.ceil(total / limit),
  });
});

exports.getPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate('author', 'name profileImage role department')
    .populate('club', 'name logo')
    .populate('comments.author', 'name profileImage');
  if (!post) throw ApiError.notFound('Post not found');
  res.status(200).json({ success: true, data: post });
});

exports.updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw ApiError.notFound('Post not found');
  if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
    throw ApiError.forbidden();
  }
  const updates = pick(req.body, ['title', 'content', 'media', 'boardType']);
  const updated = await Post.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  })
    .populate('author', 'name profileImage role department')
    .populate('club', 'name logo')
    .populate('comments.author', 'name profileImage');
  res.status(200).json({ success: true, data: updated });
});

exports.deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw ApiError.notFound('Post not found');
  if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
    throw ApiError.forbidden();
  }
  await Post.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Post deleted' });
});

exports.likePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw ApiError.notFound('Post not found');
  const idx = post.likes.findIndex((id) => id.toString() === req.user.id);
  if (idx > -1) {
    post.likes.splice(idx, 1);
  } else {
    post.likes.push(req.user.id);
    if (post.author.toString() !== req.user.id) {
      await Notification.create({
        user: post.author,
        title: 'Post Liked! ❤️',
        message: `${req.user.name} liked your post "${post.title}"`,
        type: 'achievement',
        referenceId: post._id,
        referenceModel: 'Post',
      });
    }
  }
  await post.save();
  const populated = await Post.findById(post._id)
    .populate('author', 'name profileImage role department')
    .populate('club', 'name logo')
    .populate('comments.author', 'name profileImage');
  res.status(200).json({ success: true, data: populated });
});

exports.addComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw ApiError.notFound('Post not found');
  if (!req.body.content || !req.body.content.trim()) {
    throw ApiError.badRequest('Comment content cannot be empty');
  }
  post.comments.push({ author: req.user.id, content: req.body.content.trim() });
  await post.save();
  if (post.author.toString() !== req.user.id) {
    await Notification.create({
      user: post.author,
      title: 'New Discussion Reply',
      message: `${req.user.name} commented on your post "${post.title}"`,
      type: 'achievement',
      referenceId: post._id,
      referenceModel: 'Post',
    });
  }
  const populated = await Post.findById(post._id)
    .populate('author', 'name profileImage role department')
    .populate('club', 'name logo')
    .populate('comments.author', 'name profileImage');
  res.status(200).json({ success: true, data: populated });
});

exports.reportPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw ApiError.notFound('Post not found');
  post.isReported = true;
  post.reportedBy = req.user.id;
  await post.save();
  res.status(200).json({ success: true, message: 'Post reported for admin moderation' });
});

exports.pinPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw ApiError.notFound('Post not found');
  post.isPinned = !post.isPinned;
  await post.save();
  const populated = await Post.findById(post._id)
    .populate('author', 'name profileImage role department')
    .populate('club', 'name logo')
    .populate('comments.author', 'name profileImage');
  res.status(200).json({ success: true, data: populated });
});
