const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a job title'],
    },
    description: {
      type: String,
      required: [true, 'Please add a job description'],
    },
    company: {
      type: String,
    },
    domain: {
      type: String,
    },
    location: {
      type: String,
    },
    stipend: {
      type: String,
    },
    deadline: {
      type: Date,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    department: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    applicants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        appliedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ['pending', 'accepted', 'rejected'],
          default: 'pending',
        },
      },
    ],
    type: {
      type: String,
      enum: ['internship', 'job'],
      default: 'internship',
    },
  },
  {
    timestamps: true,
  }
);

JobSchema.index({ deadline: 1, isVerified: 1 });
JobSchema.index({ domain: 1, type: 1 });

module.exports = mongoose.model('Job', JobSchema);
