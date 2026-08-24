const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const env = require('../config/env');
const User = require('../models/User');
const Club = require('../models/Club');
const Event = require('../models/Event');
const Post = require('../models/Post');
const Job = require('../models/Job');
const Achievement = require('../models/Achievement');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

const clearDatabase = async () => {
  console.log('🗑️  Clearing existing collections...');
  await Promise.all([
    User.deleteMany({}),
    Club.deleteMany({}),
    Event.deleteMany({}),
    Post.deleteMany({}),
    Job.deleteMany({}),
    Achievement.deleteMany({}),
    Message.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log('✅ Collections cleared successfully.');
};

const seedDatabase = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(env.mongoUri);
    console.log(`Connected to MongoDB: ${mongoose.connection.host}/${mongoose.connection.name}`);

    // Clean old data
    await clearDatabase();

    console.log('🌱 Seeding users across roles and departments...');

    // 1. Users (All passwords >= 8 characters to pass UserSchema minlength validation)
    const [admin, hodCS, hodEC, facultyCS, facultyEC, leaderCode, subleaderCode, leaderRobotics, student1, student2, student3, student4, studentDemo] = await Promise.all([
      User.create({
        name: 'Super Admin',
        email: 'admin@campus.edu',
        password: 'admin123',
        role: 'admin',
        department: 'Administration',
        bio: 'Campus Connect Master Administrator',
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      }),
      User.create({
        name: 'Dr. Alan Turing',
        email: 'hod.cs@campus.edu',
        password: 'hod12345',
        role: 'hod',
        department: 'Computer Science',
        bio: 'Head of Computer Science & Engineering Department. Research in Distributed Systems.',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      }),
      User.create({
        name: 'Dr. Claude Shannon',
        email: 'hod.ec@campus.edu',
        password: 'hod12345',
        role: 'hod',
        department: 'Electronics & Communication',
        bio: 'Head of ECE Department. Research in Information Theory & Signal Processing.',
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      }),
      User.create({
        name: 'Prof. Ada Lovelace',
        email: 'faculty.cs@campus.edu',
        password: 'faculty123',
        role: 'faculty',
        department: 'Computer Science',
        bio: 'Associate Professor, Algorithms & Modern Web Technologies.',
        profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      }),
      User.create({
        name: 'Prof. Nikola Tesla',
        email: 'faculty.ec@campus.edu',
        password: 'faculty123',
        role: 'faculty',
        department: 'Electronics & Communication',
        bio: 'Assistant Professor, Embedded Systems & Robotics Lab Lead.',
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
      }),
      User.create({
        name: 'Alice Johnson',
        email: 'leader@campus.edu',
        password: 'leader123',
        role: 'leader',
        department: 'Computer Science',
        year: 3,
        skills: ['React', 'Node.js', 'System Architecture', 'Event Planning', 'Cloud Native'],
        bio: 'President of Coding Club. Full-stack enthusiast & competitive programmer.',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      }),
      User.create({
        name: 'Alex Rivera',
        email: 'subleader@campus.edu',
        password: 'leader123',
        role: 'sub_leader',
        department: 'Computer Science',
        year: 3,
        skills: ['TypeScript', 'Docker', 'GraphQL', 'Public Speaking'],
        bio: 'Vice-President of Coding Club. Open source contributor.',
        profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
      }),
      User.create({
        name: 'Marcus Chen',
        email: 'leader.robotics@campus.edu',
        password: 'leader123',
        role: 'leader',
        department: 'Electronics & Communication',
        year: 4,
        skills: ['Robotics', 'ROS2', 'Computer Vision', 'Microcontrollers', 'PCB Design'],
        bio: 'Robotics Club Lead. Building autonomous drones and rovers.',
        profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
      }),
      User.create({
        name: 'Bob Smith',
        email: 'student@campus.edu',
        password: 'student123',
        role: 'student',
        department: 'Computer Science',
        year: 3,
        skills: ['React', 'TailwindCSS', 'Node.js', 'MongoDB', 'Python'],
        bio: 'Junior CS student passionate about building scalable web applications & hackathons.',
        profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
      }),
      User.create({
        name: 'Carol Danvers',
        email: 'carol@campus.edu',
        password: 'student123',
        role: 'student',
        department: 'Electronics & Communication',
        year: 2,
        skills: ['Embedded C', 'IoT', 'Arduino', 'Robotics', 'VHDL'],
        bio: 'ECE sophomore building IoT smart agriculture hardware.',
        profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      }),
      User.create({
        name: 'David Kim',
        email: 'dave@campus.edu',
        password: 'student123',
        role: 'student',
        department: 'Computer Science',
        year: 4,
        skills: ['Machine Learning', 'PyTorch', 'Computer Vision', 'NLP', 'FastAPI'],
        bio: 'Senior Year CS. Research in Deep Learning and Generative AI.',
        profileImage: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
      }),
      User.create({
        name: 'Emma Watson',
        email: 'emma@campus.edu',
        password: 'student123',
        role: 'student',
        department: 'Mechanical Engineering',
        year: 2,
        skills: ['3D Modeling', 'AutoCAD', 'SolidWorks', 'Product Design'],
        bio: 'Mechanical Engineering enthusiast focusing on sustainable design.',
        profileImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
      }),
      User.create({
        name: 'Student Demo',
        email: 'demo@campus.edu',
        password: 'password123',
        role: 'student',
        department: 'Computer Science',
        year: 3,
        skills: ['Next.js', 'React', 'TypeScript', 'TailwindCSS', 'Express'],
        bio: 'Demo Student profile with full privileges across all modules.',
        profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      }),
    ]);

    console.log('🏛️  Seeding clubs...');

    // 2. Clubs
    const [codingClub, roboticsClub, aiSociety, designClub] = await Promise.all([
      Club.create({
        name: 'Coding Club',
        description: 'The premier technical club for software engineering, open source, algorithmic problem solving, and building scalable full-stack products.',
        department: 'Computer Science',
        leader: leaderCode._id,
        subLeaders: [subleaderCode._id],
        members: [leaderCode._id, subleaderCode._id, student1._id, student3._id, studentDemo._id],
        activities: [
          'Weekly LeetCode Sprints',
          '36-Hour Annual Hackathons',
          'Open-Source Mentorship Programs',
          'Full-Stack Web Workshops',
        ],
        achievements: [
          'Winner - National Hackathon 2025',
          'Best Technical Club Award 2024',
          '50+ Active Open Source Projects',
        ],
        logo: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=300&q=80',
        isActive: true,
      }),
      Club.create({
        name: 'Robotics & IoT Club',
        description: 'Exploring the frontiers of automation, robotics kinematics, embedded firmware, sensor arrays, and IoT hardware solutions.',
        department: 'Electronics & Communication',
        leader: leaderRobotics._id,
        subLeaders: [],
        members: [leaderRobotics._id, student2._id, student4._id, student1._id],
        activities: [
          'Autonomous Rover Building',
          'Drone Aerodynamics & Flight Controllers',
          'Embedded IoT Sensor Workshops',
          'RoboWars Inter-College League',
        ],
        achievements: [
          '1st Place - International RoboSub Challenge 2025',
          'Published 4 Hardware Patents',
        ],
        logo: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=300&q=80',
        isActive: true,
      }),
      Club.create({
        name: 'AI & Machine Learning Society',
        description: 'Fostering deep research, neural network architectures, generative models, computer vision, and responsible artificial intelligence.',
        department: 'Computer Science',
        leader: student3._id,
        subLeaders: [],
        members: [student3._id, student1._id, leaderCode._id, studentDemo._id],
        activities: [
          'Kaggle Grandmaster Study Circles',
          'Research Paper Dissections',
          'LLM Fine-Tuning Labs',
          'AI for Good Projects',
        ],
        achievements: [
          'Top 10 Global Finish in Kaggle NLP Challenge',
          '3 IEEE Conference Papers Accepted',
        ],
        logo: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=300&q=80',
        isActive: true,
      }),
      Club.create({
        name: 'Design & Innovation Hub',
        description: 'Bridging the gap between engineering and human experience through UI/UX design sprints, 3D industrial prototyping, and brand craft.',
        department: 'Mechanical Engineering',
        leader: student4._id,
        subLeaders: [],
        members: [student4._id, student2._id, studentDemo._id],
        activities: [
          'Figma Design Sprints',
          '3D CAD & Additive Prototyping',
          'Design Systems Architecture',
          'Product Strategy Showcases',
        ],
        achievements: [
          'Best UI/UX Award - Campus Expo 2025',
        ],
        logo: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=300&q=80',
        isActive: true,
      }),
    ]);

    // Attach clubs to users
    await Promise.all([
      User.findByIdAndUpdate(leaderCode._id, { $addToSet: { clubs: codingClub._id } }),
      User.findByIdAndUpdate(subleaderCode._id, { $addToSet: { clubs: codingClub._id } }),
      User.findByIdAndUpdate(leaderRobotics._id, { $addToSet: { clubs: roboticsClub._id } }),
      User.findByIdAndUpdate(student1._id, { $addToSet: { clubs: [codingClub._id, roboticsClub._id, aiSociety._id] } }),
      User.findByIdAndUpdate(student2._id, { $addToSet: { clubs: [roboticsClub._id, designClub._id] } }),
      User.findByIdAndUpdate(student3._id, { $addToSet: { clubs: [aiSociety._id, codingClub._id] } }),
      User.findByIdAndUpdate(student4._id, { $addToSet: { clubs: [designClub._id, roboticsClub._id] } }),
      User.findByIdAndUpdate(studentDemo._id, { $addToSet: { clubs: [codingClub._id, aiSociety._id, designClub._id] } }),
    ]);

    console.log('📅 Seeding events...');

    // 3. Events
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    const [event1, event2, event3, event4, event5, event6] = await Promise.all([
      Event.create({
        title: 'HackCampus 2026: 36-Hour Hackathon',
        description: 'The flagship annual hackathon bringing together over 500+ builders to create next-generation web, mobile, and AI solutions with cash prizes over $10,000.',
        date: new Date(now + 7 * day),
        location: 'CS Main Auditorium & Virtual',
        club: codingClub._id,
        department: 'Computer Science',
        createdBy: leaderCode._id,
        targetAudience: 'all',
        isApproved: true,
        approvedBy: hodCS._id,
        attendees: [student1._id, student2._id, student3._id, studentDemo._id],
        reminders: [{ sent: false, date: new Date(now + 6 * day) }],
      }),
      Event.create({
        title: 'Autonomous Drone & Rover Workshop',
        description: 'Hands-on hardware lab building quadcopter PID controllers, ultrasonic obstacle avoidance, and ROS2 integration from scratch.',
        date: new Date(now + 12 * day),
        location: 'Advanced Robotics Lab, Room 302',
        club: roboticsClub._id,
        department: 'Electronics & Communication',
        createdBy: leaderRobotics._id,
        targetAudience: 'department',
        isApproved: true,
        approvedBy: hodEC._id,
        attendees: [student2._id, student4._id, student1._id],
        reminders: [{ sent: false, date: new Date(now + 11 * day) }],
      }),
      Event.create({
        title: 'Generative AI & LLM Systems Bootcamp',
        description: 'Comprehensive walkthrough of Transformer architectures, Retrieval-Augmented Generation (RAG), and deploying quantized open-weights models locally.',
        date: new Date(now + 18 * day),
        location: 'Turing Hall & Zoom Webinar',
        club: aiSociety._id,
        department: 'Computer Science',
        createdBy: student3._id,
        targetAudience: 'all',
        isApproved: true,
        approvedBy: hodCS._id,
        attendees: [student1._id, studentDemo._id, leaderCode._id],
        reminders: [{ sent: false, date: new Date(now + 17 * day) }],
      }),
      Event.create({
        title: 'Design Systems & 3D Prototyping Workshop',
        description: 'Master component architecture in Figma and translate parametric blueprints to live 3D print prototypes using CAD.',
        date: new Date(now + 4 * day),
        location: 'Design & Innovation Lab',
        club: designClub._id,
        department: 'Mechanical Engineering',
        createdBy: student4._id,
        targetAudience: 'all',
        isApproved: true,
        approvedBy: admin._id,
        attendees: [studentDemo._id, student2._id],
        reminders: [{ sent: false, date: new Date(now + 3 * day) }],
      }),
      Event.create({
        title: 'Inter-College Drone Racing League (Pending)',
        description: 'High-speed FPV drone racing championship with participants from across 15 engineering universities.',
        date: new Date(now + 30 * day),
        location: 'Campus Sports Ground',
        club: roboticsClub._id,
        department: 'Electronics & Communication',
        createdBy: leaderRobotics._id,
        targetAudience: 'all',
        isApproved: false,
        attendees: [],
        reminders: [],
      }),
      Event.create({
        title: 'Web3 & Decentralized Systems Summit (Completed)',
        description: 'Deep dive into smart contracts, consensus protocols, and verifiable computation.',
        date: new Date(now - 10 * day),
        location: 'CS Seminar Hall 1',
        club: codingClub._id,
        department: 'Computer Science',
        createdBy: leaderCode._id,
        targetAudience: 'all',
        isApproved: true,
        approvedBy: hodCS._id,
        attendees: [student1._id, student3._id],
        reminders: [{ sent: true, date: new Date(now - 11 * day) }],
      }),
    ]);

    console.log('💼 Seeding jobs and internships...');

    // 4. Jobs & Internships
    const [job1, job2, job3, job4, job5] = await Promise.all([
      Job.create({
        title: 'Full Stack Engineer Intern',
        description: 'Join our rapid engineering team building cloud-native SaaS platforms. Work with React, Node.js, PostgreSQL, and AWS infrastructure.',
        company: 'CloudScale Technologies',
        domain: 'Web Development',
        location: 'Remote / Bengaluru',
        stipend: '$850 / month',
        deadline: new Date(now + 25 * day),
        department: 'Computer Science',
        postedBy: facultyCS._id,
        isVerified: true,
        verifiedBy: hodCS._id,
        type: 'internship',
        applicants: [
          { user: student1._id, appliedAt: new Date(now - 2 * day), status: 'pending' },
          { user: studentDemo._id, appliedAt: new Date(now - 1 * day), status: 'accepted' },
        ],
      }),
      Job.create({
        title: 'Machine Learning Research Engineer',
        description: 'Full-time position working on edge-device neural net optimization, computer vision pipelines, and multi-modal models.',
        company: 'DeepCognition AI',
        domain: 'Machine Learning',
        location: 'San Francisco, CA / Remote',
        stipend: '$95,000 / year',
        deadline: new Date(now + 40 * day),
        department: 'Computer Science',
        postedBy: hodCS._id,
        isVerified: true,
        verifiedBy: admin._id,
        type: 'job',
        applicants: [
          { user: student3._id, appliedAt: new Date(now - 3 * day), status: 'pending' },
        ],
      }),
      Job.create({
        title: 'Embedded Firmware & IoT Developer Intern',
        description: 'Design low-power RTOS firmware, BLE communication stacks, and sensor acquisition algorithms for smart environmental monitors.',
        company: 'Apex Robotics & Sensors',
        domain: 'Embedded Systems',
        location: 'Austin, TX / On-site',
        stipend: '$1,000 / month',
        deadline: new Date(now + 20 * day),
        department: 'Electronics & Communication',
        postedBy: facultyEC._id,
        isVerified: true,
        verifiedBy: hodEC._id,
        type: 'internship',
        applicants: [
          { user: student2._id, appliedAt: new Date(now - 4 * day), status: 'accepted' },
        ],
      }),
      Job.create({
        title: 'Junior UI/UX & Frontend Designer',
        description: 'Design intuitive design systems, interactive prototypes in Figma, and implement accessible React components.',
        company: 'Vanguard Creative Labs',
        domain: 'Design & Frontend',
        location: 'Remote',
        stipend: '$65,000 / year',
        deadline: new Date(now + 35 * day),
        department: 'Computer Science',
        postedBy: facultyCS._id,
        isVerified: true,
        verifiedBy: hodCS._id,
        type: 'job',
        applicants: [],
      }),
      Job.create({
        title: 'Cloud DevOps & Reliability Intern (Pending)',
        description: 'Assist in Terraform infrastructure-as-code automation, Kubernetes cluster deployments, and Prometheus/Grafana monitoring.',
        company: 'Nova Cloud Systems',
        domain: 'Cloud & DevOps',
        location: 'Remote',
        stipend: '$700 / month',
        deadline: new Date(now + 15 * day),
        department: 'Computer Science',
        postedBy: facultyCS._id,
        isVerified: false,
        type: 'internship',
        applicants: [],
      }),
    ]);

    // Attach applied jobs to users
    await Promise.all([
      User.findByIdAndUpdate(student1._id, { $addToSet: { appliedJobs: job1._id } }),
      User.findByIdAndUpdate(studentDemo._id, { $addToSet: { appliedJobs: job1._id } }),
      User.findByIdAndUpdate(student3._id, { $addToSet: { appliedJobs: job2._id } }),
      User.findByIdAndUpdate(student2._id, { $addToSet: { appliedJobs: job3._id } }),
    ]);

    console.log('🏆 Seeding achievements & badges...');

    // 5. Achievements
    const [ach1, ach2, ach3, ach4] = await Promise.all([
      Achievement.create({
        title: '1st Place Winners - National Smart Campus Hackathon 2025',
        description: 'Developed an automated AI surveillance and energy optimization system using edge inference cameras, securing 1st rank out of 320 university teams.',
        user: student1._id,
        club: codingClub._id,
        department: 'Computer Science',
        media: ['https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80'],
        likes: [leaderCode._id, student2._id, student3._id, studentDemo._id, facultyCS._id],
        comments: [
          { author: leaderCode._id, content: 'Outstanding work team! The judges were completely blown away by the live demo.' },
          { author: facultyCS._id, content: 'Proud of our CS department students representing at the national stage!' },
          { author: studentDemo._id, content: 'Huge congrats Bob! Well deserved!' },
        ],
        badge: '🏆 National Champion',
        isHighlighted: true,
        highlightedBy: admin._id,
      }),
      Achievement.create({
        title: 'IEEE Research Paper Publication: Edge Neural Acceleration',
        description: 'Published peer-reviewed paper titled "Quantized Lightweight Transformers for Real-Time Embedded Vision" at IEEE Transactions on AI.',
        user: student3._id,
        club: aiSociety._id,
        department: 'Computer Science',
        media: ['https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80'],
        likes: [facultyCS._id, hodCS._id, student1._id, leaderCode._id],
        comments: [
          { author: hodCS._id, content: 'Exceptional scientific contribution Dave. Setting a high benchmark for undergraduate research.' },
        ],
        badge: '📜 IEEE Scholar',
        isHighlighted: true,
        highlightedBy: hodCS._id,
      }),
      Achievement.create({
        title: 'Best Autonomous Obstacle Navigation Award',
        description: 'Built a 6-wheeled planetary rover prototype equipped with LiDAR SLAM and real-time path planning at the International Robotics Challenge.',
        user: student2._id,
        club: roboticsClub._id,
        department: 'Electronics & Communication',
        media: ['https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'],
        likes: [leaderRobotics._id, facultyEC._id, student4._id, student1._id],
        comments: [
          { author: leaderRobotics._id, content: 'The rover trajectory was surgical! Proud of you Carol.' },
        ],
        badge: '🤖 Robotics Innovator',
        isHighlighted: false,
      }),
      Achievement.create({
        title: 'Google Summer of Code 2025 Selected Contributor',
        description: 'Selected for GSoC 2025 under the Linux Foundation to implement distributed telemetry and distributed tracing components.',
        user: studentDemo._id,
        club: codingClub._id,
        department: 'Computer Science',
        media: ['https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80'],
        likes: [leaderCode._id, subleaderCode._id, student1._id, student3._id],
        comments: [
          { author: student1._id, content: 'Incredible achievement! Open source for the win!' },
        ],
        badge: '⭐ Open Source Star',
        isHighlighted: true,
        highlightedBy: admin._id,
      }),
    ]);

    // Attach achievements to user profiles
    await Promise.all([
      User.findByIdAndUpdate(student1._id, { $addToSet: { achievements: ach1._id } }),
      User.findByIdAndUpdate(student3._id, { $addToSet: { achievements: ach2._id } }),
      User.findByIdAndUpdate(student2._id, { $addToSet: { achievements: ach3._id } }),
      User.findByIdAndUpdate(studentDemo._id, { $addToSet: { achievements: ach4._id } }),
    ]);

    console.log('💬 Seeding discussion board posts...');

    // 6. Discussion Board Posts
    const [post1, post2, post3, post4, post5] = await Promise.all([
      Post.create({
        title: 'Comprehensive Roadmap & Resources for Placements 2026',
        content: `Hey everyone! With placement season approaching, here is a consolidated list of top resources:\n\n1. **Data Structures & Algorithms**: Striver SDE Sheet, NeetCode 150, Blind 75.\n2. **System Design**: Alex Xu books, ByteByteGo, Designing Data-Intensive Applications.\n3. **Core CS**: OS (Galvin), DBMS (Ramakrishnan), Computer Networks (Kurose & Ross).\n4. **Mock Interviews**: Pramp & peer rounds on campus.\n\nFeel free to ask questions in the comments!`,
        author: student3._id,
        boardType: 'general',
        likes: [student1._id, student2._id, studentDemo._id, leaderCode._id],
        comments: [
          { author: student1._id, content: 'This is super thorough Dave, thanks a lot for putting this together!' },
          { author: studentDemo._id, content: 'Bookmarked! Will definitely practice system design mock rounds.' },
        ],
        isPinned: true,
      }),
      Post.create({
        title: 'HackCampus 2026 Problem Tracks & Guidelines',
        content: `Welcome hackers! The official tracks for HackCampus 2026 are:\n\n🔹 **Track 1: AI & Intelligent Agents**\n🔹 **Track 2: Web3 & Decentralized Protocols**\n🔹 **Track 3: Smart Cities & Sustainable IoT**\n🔹 **Track 4: Open Innovation**\n\nMentors will be available 24/7 during the event. Form your teams of 2-4 and register before the deadline.`,
        author: leaderCode._id,
        club: codingClub._id,
        boardType: 'club',
        likes: [student1._id, subleaderCode._id, studentDemo._id],
        comments: [
          { author: subleaderCode._id, content: 'Looking forward to mentoring the participating teams!' },
          { author: student1._id, content: 'Ready with our project proposal!' },
        ],
        isPinned: true,
      }),
      Post.create({
        title: 'CS 3rd Year Electives Guideline & Faculty Syllabus',
        content: `Dear 3rd Year CS Students,\n\nPlease review the elective curriculum options for next semester: Distributed Cloud Architectures, Deep Learning & Generative Models, and Cryptography & Security. Registration portals will open this Friday.`,
        author: facultyCS._id,
        department: 'Computer Science',
        boardType: 'department',
        likes: [student1._id, student3._id, studentDemo._id],
        comments: [
          { author: student3._id, content: 'Thank you Professor Lovelace for the clear elective syllabus overview.' },
        ],
        isPinned: false,
      }),
      Post.create({
        title: 'Robotics Lab Equipment Upgrades: New 3D Printers & Oscilloscopes',
        content: `Great news! The ECE department has installed 4 new high-precision resin 3D printers and 100MHz Digital Storage Oscilloscopes in Lab 302. Students with active club passes can reserve slots starting Monday.`,
        author: facultyEC._id,
        department: 'Electronics & Communication',
        boardType: 'department',
        likes: [student2._id, leaderRobotics._id, student4._id],
        comments: [
          { author: student2._id, content: 'Awesome! Will be testing our rover PCB boards there next week.' },
        ],
        isPinned: false,
      }),
      Post.create({
        title: 'Looking for React & Tailwind dev for campus collaborative project',
        content: `Hey folks! Working on a peer-to-peer textbook sharing and notes exchange platform for our university. Looking for 1 frontend dev who knows React, Tailwind, and Vite. DM me if interested!`,
        author: studentDemo._id,
        boardType: 'general',
        likes: [student1._id],
        comments: [
          { author: student1._id, content: 'Hey demo! Sounds exciting, pinged you on direct messages.' },
        ],
        isPinned: false,
      }),
    ]);

    console.log('✉️  Seeding direct and group messages...');

    // 7. Messages
    await Promise.all([
      Message.create({
        sender: student1._id,
        receiver: studentDemo._id,
        content: 'Hey! Saw your post about the notes sharing app. I would love to collaborate on the frontend UI.',
        isRead: true,
        messageType: 'direct',
      }),
      Message.create({
        sender: studentDemo._id,
        receiver: student1._id,
        content: 'Awesome Bob! Let us meet tomorrow at the CS library around 4 PM to sketch out the wireframes.',
        isRead: false,
        messageType: 'direct',
      }),
      Message.create({
        sender: leaderCode._id,
        club: codingClub._id,
        content: 'Welcome everyone to the Coding Club channel! Check out the pinned post for HackCampus 2026 tracks.',
        isRead: true,
        messageType: 'group',
      }),
      Message.create({
        sender: subleaderCode._id,
        club: codingClub._id,
        content: 'Workshop slides from the React & Node.js session are now updated in the resources section!',
        isRead: true,
        messageType: 'group',
      }),
      Message.create({
        sender: leaderRobotics._id,
        club: roboticsClub._id,
        content: 'Robotics lab component inventory has been updated. Please log all parts before checking out.',
        isRead: true,
        messageType: 'group',
      }),
    ]);

    console.log('🔔 Seeding system and user notifications...');

    // 8. Notifications
    await Promise.all([
      Notification.create({
        user: studentDemo._id,
        title: 'Job Application Accepted! 🎉',
        message: 'Congratulations! Your application for Full Stack Engineer Intern at CloudScale Technologies was accepted.',
        type: 'job',
        referenceId: job1._id,
        referenceModel: 'Job',
        isRead: false,
      }),
      Notification.create({
        user: studentDemo._id,
        title: 'Achievement Highlighted! 🌟',
        message: 'Your achievement "Google Summer of Code 2025 Selected Contributor" was highlighted on the campus showcase.',
        type: 'achievement',
        referenceId: ach4._id,
        referenceModel: 'Achievement',
        isRead: false,
      }),
      Notification.create({
        user: student1._id,
        title: 'Upcoming Event Reminder',
        message: 'Reminder: HackCampus 2026 starts in 7 days in the CS Main Auditorium.',
        type: 'event',
        referenceId: event1._id,
        referenceModel: 'Event',
        isRead: false,
      }),
      Notification.create({
        user: student3._id,
        title: 'Research Paper Endorsement',
        message: 'Dr. Alan Turing commented on your IEEE Research Publication.',
        type: 'achievement',
        referenceId: ach2._id,
        referenceModel: 'Achievement',
        isRead: true,
      }),
      Notification.create({
        user: admin._id,
        title: 'Event Approval Request',
        message: 'Marcus Chen submitted "Inter-College Drone Racing League" for admin/department approval.',
        type: 'admin',
        referenceId: event5._id,
        referenceModel: 'Event',
        isRead: false,
      }),
    ]);

    console.log('\n================================================================');
    console.log('✨ CAMPUS CONNECT DATABASE SEEDED SUCCESSFULLY! ✨');
    console.log('================================================================');
    console.log('\n🔑 AVAILABLE TEST ACCOUNTS:\n');
    console.table([
      { Role: 'Admin', Email: 'admin@campus.edu', Password: 'admin123', Name: 'Super Admin', Dept: 'Administration' },
      { Role: 'HOD (CS)', Email: 'hod.cs@campus.edu', Password: 'hod12345', Name: 'Dr. Alan Turing', Dept: 'Computer Science' },
      { Role: 'HOD (EC)', Email: 'hod.ec@campus.edu', Password: 'hod12345', Name: 'Dr. Claude Shannon', Dept: 'Electronics & Comm.' },
      { Role: 'Faculty (CS)', Email: 'faculty.cs@campus.edu', Password: 'faculty123', Name: 'Prof. Ada Lovelace', Dept: 'Computer Science' },
      { Role: 'Faculty (EC)', Email: 'faculty.ec@campus.edu', Password: 'faculty123', Name: 'Prof. Nikola Tesla', Dept: 'Electronics & Comm.' },
      { Role: 'Club Leader', Email: 'leader@campus.edu', Password: 'leader123', Name: 'Alice Johnson', Dept: 'Computer Science' },
      { Role: 'Sub-Leader', Email: 'subleader@campus.edu', Password: 'leader123', Name: 'Alex Rivera', Dept: 'Computer Science' },
      { Role: 'Student 1', Email: 'student@campus.edu', Password: 'student123', Name: 'Bob Smith', Dept: 'Computer Science' },
      { Role: 'Student 2', Email: 'carol@campus.edu', Password: 'student123', Name: 'Carol Danvers', Dept: 'Electronics & Comm.' },
      { Role: 'Student 3', Email: 'dave@campus.edu', Password: 'student123', Name: 'David Kim', Dept: 'Computer Science' },
      { Role: 'Demo Student', Email: 'demo@campus.edu', Password: 'password123', Name: 'Student Demo', Dept: 'Computer Science' },
    ]);
    console.log('================================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
