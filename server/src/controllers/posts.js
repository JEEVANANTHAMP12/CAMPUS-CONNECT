const Post = require('../models/Post');
const Notification = require('../models/Notification');

exports.createPost = async (req, res) => {
  try {
    const { title, content, club, department, boardType, media } = req.body;
    const post = await Post.create({
      title, content, author: req.user.id, club, department,
      boardType: boardType || 'general', media: media || []
    });
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const { club, department, boardType, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (club) query.club = club;
    if (department) query.department = department;
    if (boardType) query.boardType = boardType;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    const skip = (page - 1) * limit;
    const posts = await Post.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit))
      .populate('author', 'name profileImage role')
      .populate('club', 'name logo')
      .populate('comments.author', 'name profileImage');
    const total = await Post.countDocuments(query);
    res.status(200).json({ success: true, data: posts, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name profileImage role')
      .populate('club', 'name logo')
      .populate('comments.author', 'name profileImage');
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.status(200).json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const updated = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    const idx = post.likes.indexOf(req.user.id);
    if (idx > -1) {
      post.likes.splice(idx, 1);
    } else {
      post.likes.push(req.user.id);
      if (post.author.toString() !== req.user.id) {
        await Notification.create({
          user: post.author,
          title: 'Post Liked',
          message: `${req.user.name} liked your post "${post.title}"`,
          type: 'achievement',
          referenceId: post._id,
          referenceModel: 'Post'
        });
      }
    }
    await post.save();
    res.status(200).json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    post.comments.push({ author: req.user.id, content: req.body.content });
    await post.save();
    if (post.author.toString() !== req.user.id) {
      await Notification.create({
        user: post.author,
        title: 'New Comment',
        message: `${req.user.name} commented on your post "${post.title}"`,
        type: 'achievement',
        referenceId: post._id,
        referenceModel: 'Post'
      });
    }
    const populated = await Post.findById(post._id).populate('comments.author', 'name profileImage');
    res.status(200).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.reportPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    post.isReported = true;
    post.reportedBy = req.user.id;
    await post.save();
    res.status(200).json({ success: true, message: 'Post reported' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.pinPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    post.isPinned = !post.isPinned;
    await post.save();
    res.status(200).json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
