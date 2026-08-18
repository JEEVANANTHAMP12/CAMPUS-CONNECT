const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add an event title'],
    },
    description: {
      type: String,
    },
    date: {
      type: Date,
      required: [true, 'Please add an event date'],
    },
    location: {
      type: String,
    },
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
    },
    department: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    targetAudience: {
      type: String,
      enum: ['club', 'department', 'all'],
      default: 'all',
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reminders: [
      {
        sent: {
          type: Boolean,
          default: false,
        },
        date: {
          type: Date,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Event', EventSchema);
