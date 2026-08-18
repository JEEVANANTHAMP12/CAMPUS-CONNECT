const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/../.env' });

const User = require('../models/User');
const Club = require('../models/Club');
const Event = require('../models/Event');
const Post = require('../models/Post');
const Job = require('../models/Job');
const Achievement = require('../models/Achievement');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  await User.deleteMany({});
  await Club.deleteMany({});
  await Event.deleteMany({});
  await Post.deleteMany({});
  await Job.deleteMany({});
  await Achievement.deleteMany({});

  const admin = await User.create({ name: 'Admin User', email: 'admin@campus.edu', password: 'admin123', role: 'admin', department: 'Administration' });
  const hod = await User.create({ name: 'Dr. Smith', email: 'hod@campus.edu', password: 'hod123', role: 'hod', department: 'Computer Science' });
  const faculty = await User.create({ name: 'Prof. Johnson', email: 'faculty@campus.edu', password: 'faculty123', role: 'faculty', department: 'Computer Science' });
  const leader = await User.create({ name: 'Alice Leader', email: 'leader@campus.edu', password: 'leader123', role: 'leader', department: 'Computer Science', year: 3, skills: ['Leadership', 'Event Management'] });
  const student1 = await User.create({ name: 'Bob Student', email: 'student@campus.edu', password: 'student123', role: 'student', department: 'Computer Science', year: 2, skills: ['React', 'Node.js', 'Python'] });
  const student2 = await User.create({ name: 'Carol Student', email: 'carol@campus.edu', password: 'student123', role: 'student', department: 'Electronics', year: 3, skills: ['VLSI', 'Embedded Systems', 'C++'] });
  const student3 = await User.create({ name: 'Dave Student', email: 'dave@campus.edu', password: 'student123', role: 'student', department: 'Computer Science', year: 4, skills: ['Machine Learning', 'TensorFlow', 'Python'] });

  const codingClub = await Club.create({
    name: 'Coding Club', description: 'For passionate coders and developers',
    department: 'Computer Science', leader: leader._id, members: [leader._id, student1._id, student2._id, student3._id],
    activities: ['Hackathons', 'Coding Workshops', 'Project Building']
  });

  const roboticsClub = await Club.create({
    name: 'Robotics Club', description: 'Building the future of automation',
    department: 'Electronics', leader: student2._id, members: [student2._id, student1._id],
    activities: ['Robot Building', 'Arduino Workshops', 'Competitions']
  });

  await User.findByIdAndUpdate(leader._id, { $push: { clubs: codingClub._id } });
  await User.findByIdAndUpdate(student1._id, { $push: { clubs: codingClub._id } });
  await User.findByIdAndUpdate(student2._id, { $push: { clubs: codingClub._id } });

  const event1 = await Event.create({
    title: 'Annual Hackathon 2024', description: '24-hour coding marathon with exciting prizes',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), location: 'CS Auditorium',
    club: codingClub._id, department: 'Computer Science', createdBy: leader._id,
    targetAudience: 'all', isApproved: true, attendees: [student1._id, student2._id]
  });

  const event2 = await Event.create({
    title: 'Arduino Workshop', description: 'Learn Arduino basics and build your first project',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), location: 'Electronics Lab',
    club: roboticsClub._id, department: 'Electronics', createdBy: student2._id,
    targetAudience: 'department', isApproved: true, attendees: [student2._id]
  });

  await Post.create({
    title: 'Best resources for DSA preparation?', content: 'Can anyone recommend good resources for Data Structures and Algorithms? I have placements coming up.',
    author: student1._id, boardType: 'general', likes: [student2._id, student3._id],
    comments: [{ author: student3._id, content: 'Check out Striver SDE sheet and Leetcode patterns' }, { author: student2._id, content: 'Also try the Neetcode roadmap' }]
  });

  await Post.create({
    title: 'Web Dev Workshop Notes', content: 'Here are the notes from our last web development workshop covering React basics, hooks, and state management.',
    author: leader._id, club: codingClub._id, boardType: 'club',
    likes: [student1._id], comments: [{ author: student1._id, content: 'Thanks! Very helpful' }]
  });

  await Job.create({
    title: 'Frontend Developer Intern', description: 'Join our team to build cutting-edge web applications using React and modern technologies.',
    company: 'TechCorp', domain: 'Web Development', location: 'Remote', stipend: '$500/month',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), department: 'Computer Science',
    postedBy: faculty._id, isVerified: true, verifiedBy: hod._id,
    applicants: [{ user: student1._id, appliedAt: new Date(), status: 'pending' }], type: 'internship'
  });

  await Job.create({
    title: 'ML Engineer', description: 'Full-time position for machine learning engineer with experience in NLP and computer vision.',
    company: 'AI Solutions', domain: 'Machine Learning', location: 'On-site', stipend: '$80,000/year',
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), department: 'Computer Science',
    postedBy: hod._id, isVerified: true, verifiedBy: admin._id, applicants: [], type: 'job'
  });

  const ach1 = await Achievement.create({
    title: 'Won Smart India Hackathon 2024', description: 'Our team secured first place in the national level hackathon with our AI-powered healthcare solution.',
    user: student1._id, club: codingClub._id, department: 'Computer Science',
    likes: [leader._id, student2._id, student3._id],
    comments: [{ author: leader._id, content: 'Amazing work! Proud of the team' }, { author: student2._id, content: 'Congratulations Bob!' }],
    isHighlighted: true
  });

  await Achievement.create({
    title: 'Published Research Paper', description: 'Published a paper on "Efficient Neural Network Architectures for Edge Devices" in IEEE conference.',
    user: student3._id, department: 'Computer Science',
    likes: [student1._id, leader._id],
    comments: [{ author: student1._id, content: 'Great achievement Dave!' }]
  });

  await User.findByIdAndUpdate(student1._id, { $push: { achievements: ach1._id } });

  console.log('Seed data created successfully!');
  console.log('\n--- Login Credentials ---');
  console.log('Admin:   admin@campus.edu / admin123');
  console.log('HOD:     hod@campus.edu / hod123');
  console.log('Faculty: faculty@campus.edu / faculty123');
  console.log('Leader:  leader@campus.edu / leader123');
  console.log('Student: student@campus.edu / student123');
  console.log('Student: carol@campus.edu / student123');
  console.log('Student: dave@campus.edu / student123');

  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
