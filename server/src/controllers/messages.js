const Message = require('../models/Message');
const Notification = require('../models/Notification');

exports.getConversations = async (req, res) => {
  try {
    const messages = await Message.aggregate([
      { $match: { $or: [{ sender: req.user.id }, { receiver: req.user.id }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ['$sender', req.user.id] }, '$receiver', '$sender']
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [{ $and: [{ $eq: ['$receiver', req.user.id] }, { $eq: ['$isRead', false] }] }, 1, 0]
            }
          }
        }
      },
      { $sort: { 'lastMessage.createdAt': -1 } }
    ]);
    const User = require('../models/User');
    const populated = await Message.populate(messages, {
      path: '_id',
      model: User,
      select: 'name profileImage'
    });
    res.status(200).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: userId },
        { sender: userId, receiver: req.user.id }
      ]
    }).sort({ createdAt: 1 }).populate('sender', 'name profileImage');
    await Message.updateMany(
      { sender: userId, receiver: req.user.id, isRead: false },
      { isRead: true }
    );
    res.status(200).json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { receiver, content } = req.body;
    const message = await Message.create({
      sender: req.user.id, receiver, content, messageType: 'direct'
    });
    const populated = await Message.findById(message._id).populate('sender', 'name profileImage');
    await Notification.create({
      user: receiver,
      title: 'New Message',
      message: `You have a new message from ${req.user.name}`,
      type: 'message',
      referenceId: message._id,
      referenceModel: 'Message'
    });
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getGroupMessages = async (req, res) => {
  try {
    const { clubId } = req.params;
    const messages = await Message.find({ club: clubId, messageType: 'group' })
      .sort({ createdAt: 1 }).populate('sender', 'name profileImage');
    res.status(200).json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.sendGroupMessage = async (req, res) => {
  try {
    const { club, content } = req.body;
    const message = await Message.create({
      sender: req.user.id, club, content, messageType: 'group'
    });
    const populated = await Message.findById(message._id).populate('sender', 'name profileImage');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user.id, isRead: false },
      { isRead: true }
    );
    res.status(200).json({ success: true, message: 'Messages marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
