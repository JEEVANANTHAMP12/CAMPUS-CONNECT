const Job = require('../models/Job');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.createJob = async (req, res) => {
  try {
    const { title, description, company, domain, location, stipend, deadline, department, type } = req.body;
    const job = await Job.create({
      title, description, company, domain, location, stipend,
      deadline, department, type: type || 'internship',
      postedBy: req.user.id
    });
    if (req.user.role === 'admin' || req.user.role === 'hod') {
      job.isVerified = true;
      job.verifiedBy = req.user.id;
      await job.save();
    }
    res.status(201).json({ success: true, data: job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const { department, domain, type, verified, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (department) query.department = department;
    if (domain) query.domain = domain;
    if (type) query.type = type;
    if (verified === 'true') query.isVerified = true;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { domain: { $regex: search, $options: 'i' } }
      ];
    }
    const skip = (page - 1) * limit;
    const jobs = await Job.find(query).sort({ deadline: 1 }).skip(skip).limit(parseInt(limit))
      .populate('postedBy', 'name profileImage')
      .populate('verifiedBy', 'name');
    const total = await Job.countDocuments(query);
    res.status(200).json({ success: true, data: jobs, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name profileImage')
      .populate('verifiedBy', 'name')
      .populate('applicants.user', 'name profileImage skills department');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.status(200).json({ success: true, data: job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const updated = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await Job.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.applyToJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    const alreadyApplied = job.applicants.find(a => a.user.toString() === req.user.id);
    if (alreadyApplied) {
      return res.status(400).json({ success: false, message: 'Already applied' });
    }
    job.applicants.push({ user: req.user.id, appliedAt: new Date() });
    await job.save();
    await User.findByIdAndUpdate(req.user.id, { $push: { appliedJobs: job._id } });
    await Notification.create({
      user: job.postedBy,
      title: 'New Job Application',
      message: `${req.user.name} applied for "${job.title}"`,
      type: 'job',
      referenceId: job._id,
      referenceModel: 'Job'
    });
    res.status(200).json({ success: true, message: 'Applied successfully', data: job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, {
      isVerified: true, verifiedBy: req.user.id
    }, { new: true });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    await Notification.create({
      user: job.postedBy,
      title: 'Job Verified',
      message: `Your job listing "${job.title}" has been verified`,
      type: 'job',
      referenceId: job._id,
      referenceModel: 'Job'
    });
    res.status(200).json({ success: true, data: job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPendingJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ isVerified: false })
      .populate('postedBy', 'name');
    res.status(200).json({ success: true, data: jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.recommendJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const userSkills = user.skills || [];
    const jobs = await Job.find({
      isVerified: true,
      deadline: { $gte: new Date() },
      $or: [
        { domain: { $in: userSkills } },
        { title: { $regex: userSkills.join('|'), $options: 'i' } }
      ]
    }).limit(10).populate('postedBy', 'name');
    res.status(200).json({ success: true, data: jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
