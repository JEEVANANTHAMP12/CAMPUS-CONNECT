const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please add a user'],
    },
    title: {
      type: String,
      required: [true, 'Please add a notification title'],
    },
    message: {
      type: String,
      required: [true, 'Please add a notification message'],
    },
    type: {
      type: String,
      enum: ['event', 'message', 'achievement', 'club', 'job', 'admin', 'system'],
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'referenceModel',
    },
    referenceModel: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', NotificationSchema);
