const mongoose = require('mongoose');

const ClubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a club name'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
    },
    department: {
      type: String,
    },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    subLeaders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    activities: [
      {
        type: String,
      },
    ],
    achievements: [
      {
        type: String,
      },
    ],
    logo: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Club', ClubSchema);
