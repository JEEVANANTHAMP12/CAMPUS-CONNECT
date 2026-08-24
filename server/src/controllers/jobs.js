const Job = require('../models/Job');
const User = require('../models/User');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { pick, escapeRegex } = require('../utils/pick');

exports.createJob = asyncHandler(async (req, res) => {
  const data = pick(req.body, [
    'title',
    'description',
    'company',
    'domain',
    'location',
    'stipend',
    'deadline',
    'department',
    'type',
  ]);
  const job = await Job.create({
    ...data,
    type: data.type || 'internship',
    postedBy: req.user.id,
  });
  if (req.user.role === 'admin' || req.user.role === 'hod') {
    job.isVerified = true;
    job.verifiedBy = req.user.id;
    await job.save();
  }
  res.status(201).json({ success: true, data: job });
});

exports.getJobs = asyncHandler(async (req, res) => {
  const { department, domain, type, verified, search, page = 1, limit = 20 } = req.query;
  const query = {};
  if (department) query.department = department;
  if (domain) query.domain = domain;
  if (type) query.type = type;
  if (verified === 'true' || req.user.role === 'student') query.isVerified = true;
  if (search) {
    const safe = escapeRegex(search);
    query.$or = [
      { title: { $regex: safe, $options: 'i' } },
      { company: { $regex: safe, $options: 'i' } },
      { domain: { $regex: safe, $options: 'i' } },
    ];
  }
  const skip = (page - 1) * limit;
  const [jobs, total] = await Promise.all([
    Job.find(query)
      .sort({ deadline: 1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .populate('postedBy', 'name profileImage')
      .populate('verifiedBy', 'name'),
    Job.countDocuments(query),
  ]);
  res.status(200).json({
    success: true,
    data: jobs,
    total,
    pages: Math.ceil(total / limit),
  });
});

exports.getJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id)
    .populate('postedBy', 'name profileImage')
    .populate('verifiedBy', 'name')
    .populate('applicants.user', 'name profileImage skills department');
  if (!job) throw ApiError.notFound('Job not found');
  if (!job.isVerified && req.user.role === 'student' && job.postedBy.toString() !== req.user.id) {
    throw ApiError.notFound('Job not found');
  }
  res.status(200).json({ success: true, data: job });
});

exports.updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw ApiError.notFound('Job not found');
  if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
    throw ApiError.forbidden();
  }
  const updates = pick(req.body, [
    'title',
    'description',
    'company',
    'domain',
    'location',
    'stipend',
    'deadline',
    'department',
    'type',
  ]);
  const updated = await Job.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: updated });
});

exports.deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw ApiError.notFound('Job not found');
  if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
    throw ApiError.forbidden();
  }
  await Job.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Job deleted' });
});

exports.applyToJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw ApiError.notFound('Job not found');
  if (!job.isVerified) throw ApiError.badRequest('Job is not verified yet');
  if (job.deadline && new Date(job.deadline) < new Date()) {
    throw ApiError.badRequest('Application deadline has passed');
  }
  if (job.applicants.some((a) => a.user.toString() === req.user.id)) {
    throw ApiError.badRequest('Already applied');
  }
  job.applicants.push({ user: req.user.id, appliedAt: new Date() });
  await job.save();
  await User.findByIdAndUpdate(req.user.id, { $addToSet: { appliedJobs: job._id } });
  await Notification.create({
    user: job.postedBy,
    title: 'New Job Application',
    message: `${req.user.name} applied for "${job.title}"`,
    type: 'job',
    referenceId: job._id,
    referenceModel: 'Job',
  });
  res.status(200).json({ success: true, message: 'Applied successfully', data: job });
});

exports.verifyJob = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndUpdate(
    req.params.id,
    { isVerified: true, verifiedBy: req.user.id },
    { new: true }
  );
  if (!job) throw ApiError.notFound('Job not found');
  await Notification.create({
    user: job.postedBy,
    title: 'Job Verified',
    message: `Your job listing "${job.title}" has been verified`,
    type: 'job',
    referenceId: job._id,
    referenceModel: 'Job',
  });
  res.status(200).json({ success: true, data: job });
});

exports.getPendingJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ isVerified: false }).populate('postedBy', 'name');
  res.status(200).json({ success: true, data: jobs });
});

exports.recommendJobs = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const userSkills = (user.skills || []).map((s) => s.trim()).filter(Boolean);
  const base = { isVerified: true, deadline: { $gte: new Date() } };
  let jobs;
  if (!userSkills.length) {
    jobs = await Job.find(base).limit(10).populate('postedBy', 'name');
  } else {
    const pattern = userSkills.map(escapeRegex).join('|');
    jobs = await Job.find({
      ...base,
      $or: [
        { domain: { $in: userSkills } },
        { title: { $regex: pattern, $options: 'i' } },
      ],
    })
      .limit(10)
      .populate('postedBy', 'name');
  }
  res.status(200).json({ success: true, data: jobs });
});
