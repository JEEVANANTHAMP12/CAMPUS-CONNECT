const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a post title'],
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: [true, 'Please add post content'],
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please add an author'],
    },
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
    },
    department: {
      type: String,
      trim: true,
    },
    boardType: {
      type: String,
      enum: ['general', 'department', 'club', 'career', 'anonymous'],
      default: 'general',
    },
    media: [
      {
        type: String,
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        content: {
          type: String,
          required: true,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isPinned: {
      type: Boolean,
      default: false,
    },
    isReported: {
      type: Boolean,
      default: false,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

PostSchema.index({ createdAt: -1, boardType: 1 });
PostSchema.index({ club: 1, createdAt: -1 });
PostSchema.index({ isReported: 1 });

module.exports = mongoose.model('Post', PostSchema);
