import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mail, Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck,
  GraduationCap, Building2, ChevronRight, ChevronLeft, CheckCircle2,
  Sparkles, Trophy, Rocket, Briefcase, Zap, Check, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerConfetti } from '../components/animations/Confetti';
import SEO from '../components/SEO';

const DEPARTMENTS = [
  { id: 'AI', label: 'Artificial Intelligence', short: 'AI' },
  { id: 'IT', label: 'Information Technology', short: 'IT' },
  { id: 'CSE', label: 'Computer Science & Engineering', short: 'CSE' },
  { id: 'MECH', label: 'Mechanical Engineering', short: 'MECH' },
  { id: 'CIVIL', label: 'Civil Engineering', short: 'CIVIL' },
  { id: 'CSBS', label: 'Computer Science & Business Systems', short: 'CSBS' },
  { id: 'MBA', label: 'Master of Business Administration', short: 'MBA' },
  { id: 'MCA', label: 'Master of Computer Applications', short: 'MCA' },
  { id: 'CYBER', label: 'Cybersecurity', short: 'Cyber' },
  { id: 'FE', label: 'Freshman Engineering', short: 'FE' },
  { id: 'ECE', label: 'Electronics & Communication Engg', short: 'ECE' },
  { id: 'EEE', label: 'Electrical & Electronics Engg', short: 'EEE' },
  { id: 'VLSI', label: 'VLSI Design & Technology', short: 'VLSI' },
];

const SUGGESTED_SKILLS = [
  'Full Stack Web', 'Python & AI', 'React / Next.js', 'Machine Learning',
  'Cybersecurity', 'Cloud / DevOps', 'Mobile App Dev', 'Data Analytics',
  'Embedded & IoT', 'UI/UX Design', 'Competitive Coding', 'Blockchain'
];

export default function Register() {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    year: '',
    skills: ['Full Stack Web', 'Python & AI'],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Password strength checks
  const password = form.password;
  const hasLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUpperLower = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const strengthScore = [hasLength, hasNumber, hasUpperLower, hasSpecial].filter(Boolean).length;
  const getStrengthMeta = () => {
    if (!password) return { label: 'Enter password', color: 'bg-slate-200', text: 'text-slate-400', width: 'w-0' };
    if (strengthScore <= 1) return { label: 'Weak', color: 'bg-rose-500', text: 'text-rose-600', width: 'w-1/4' };
    if (strengthScore === 2) return { label: 'Fair', color: 'bg-amber-500', text: 'text-amber-600', width: 'w-2/4' };
    if (strengthScore === 3) return { label: 'Good', color: 'bg-indigo-500', text: 'text-indigo-600', width: 'w-3/4' };
    return { label: 'Strong & Secure', color: 'bg-emerald-500', text: 'text-emerald-600', width: 'w-full' };
  };

  const strengthMeta = getStrengthMeta();

  const handleDomainQuickFill = () => {
    if (!form.email) {
      setForm({ ...form, email: '@mkce.ac.in' });
      return;
    }
    if (!form.email.includes('@')) {
      setForm({ ...form, email: `${form.email}@mkce.ac.in` });
    } else if (form.email.endsWith('@')) {
      setForm({ ...form, email: `${form.email}mkce.ac.in` });
    }
  };

  const toggleSkill = (skill) => {
    const exists = form.skills.includes(skill);
    if (exists) {
      setForm({ ...form, skills: form.skills.filter((s) => s !== skill) });
    } else {
      if (form.skills.length >= 6) {
        toast.error('You can select up to 6 key skill tags.');
        return;
      }
      setForm({ ...form, skills: [...form.skills, skill] });
    }
  };

  const validateStep1 = () => {
    if (!form.name.trim()) {
      toast.error('Please enter your full name.');
      return false;
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      toast.error('Please enter a valid college email address.');
      return false;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!form.year) {
      toast.error('Please select your current academic year.');
      return false;
    }
    if (!form.department) {
      toast.error('Please select your department.');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!termsAccepted) {
      toast.error('Please accept the campus community guidelines and terms.');
      return;
    }
    setLoading(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        department: form.department,
        year: Number(form.year),
        skills: form.skills,
      });
      triggerConfetti({ particleCount: 120, spread: 85 });
      toast.success('Account created! Welcome to MKCE Connect.', { duration: 3500 });
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row bg-slate-950 text-slate-900 font-sans selection:bg-indigo-600 selection:text-white overflow-hidden">
      <SEO
        title="Student SaaS Onboarding & Account Registration"
        description="Join MKCE Connect to access student chapters, hackathons, AI discussions, and top campus placement drives."
        keywords="MKCE Registration, Student Sign Up, Autonomous College Portal, Karur Engineering Hub"
        canonical="/register"
      />

      {/* ================= LEFT SAAS GROWTH PILLARS PANEL (50% Split) ================= */}
      <div className="hidden lg:flex lg:w-1/2 h-full relative overflow-hidden flex-col justify-between auth-panel-gradient text-white p-8 xl:p-12 2xl:p-14 select-none">
        {/* Ambient background glows */}
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] bg-indigo-500/25 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-20 -right-24 w-[380px] h-[380px] bg-purple-500/20 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-[380px] h-[380px] bg-sky-500/15 rounded-full blur-[120px] pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-display font-black text-lg bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-lg shadow-indigo-500/30 border border-white/20">
              MK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-black text-base tracking-tight text-white">MKCE Connect</h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-500/30 border border-indigo-400/40 text-indigo-200">
                  Student
                </span>
              </div>
              <p className="text-[11px] text-indigo-200/70 font-medium">Digital Campus Community</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold bg-white/10 backdrop-blur-md border border-white/15 text-indigo-100">
            <ShieldCheck size={13} className="text-emerald-400" />
            <span>Verified Student Onboarding</span>
          </div>
        </div>

        {/* Center Content / Growth Pillars */}
        <div className="relative z-10 my-auto py-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-4 bg-indigo-500/20 backdrop-blur-md border border-indigo-400/30 text-indigo-100 shadow-inner">
              <Rocket size={13} className="text-amber-300" />
              <span>Elevate Your Engineering Journey</span>
            </div>

            <h1 className="text-3xl xl:text-4xl 2xl:text-[2.6rem] font-display font-black leading-[1.18] mb-3 tracking-tight">
              Build Projects, Get Certified & <span className="bg-gradient-to-r from-indigo-300 via-sky-200 to-indigo-200 bg-clip-text text-transparent">Land Dream Careers.</span>
            </h1>
            <p className="text-sm xl:text-base text-indigo-100/75 leading-relaxed mb-6 max-w-lg">
              Your official digital identity connects you instantly to faculty mentors, recruiters, and technical campus chapters.
            </p>

            {/* Growth Pillars Cards */}
            <div className="space-y-2.5 mb-5">
              {[
                {
                  icon: Briefcase,
                  title: 'Direct Placement Pipelines',
                  desc: 'Pre-screened referral drives with Zoho, TCS, Kaar Tech & high-growth tech startups.',
                  tag: '98% Placement Rate'
                },
                {
                  icon: Trophy,
                  title: '50+ Student Tech Chapters',
                  desc: 'Collaborate in Google Developer Groups, IEEE, CSI & Robotics Club hackathons.',
                  tag: 'Active Hackathons'
                },
                {
                  icon: Sparkles,
                  title: 'Verified Digital Portfolios',
                  desc: 'Showcase peer-reviewed projects and faculty-endorsed skill badges to top recruiters.',
                  tag: 'Verifiable Badges'
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.08 * (i + 1) }}
                  className="flex items-start gap-3 p-3 xl:p-3.5 rounded-2xl bg-white/[0.07] backdrop-blur-md border border-white/10"
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/30 border border-indigo-400/30 flex items-center justify-center shrink-0 mt-0.5 text-indigo-200">
                    <item.icon size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-white">{item.title}</h3>
                      <span className="text-[10px] font-semibold text-sky-300 bg-sky-500/20 px-2 py-0.5 rounded-md">
                        {item.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-indigo-200/70 leading-relaxed mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Live Registration Social Proof Ticker */}
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span>⚡ <strong>140+ students</strong> registered this week from 11 academic departments.</span>
            </div>
          </motion.div>
        </div>

        {/* Footer Accreditations */}
        <div className="relative z-10 flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-3 border-t border-white/10 text-xs text-indigo-200/60 font-semibold">
          <span>NAAC 'A' Grade</span>
          <span className="text-white/20">•</span>
          <span>NBA Accredited</span>
          <span className="text-white/20">•</span>
          <span>Autonomous Institution</span>
        </div>
      </div>

      {/* ================= RIGHT 3-STEP PROGRESSIVE ONBOARDING PANEL (50% Split) ================= */}
      <div className="flex-1 lg:w-1/2 h-full flex flex-col justify-between p-6 sm:p-10 lg:p-10 xl:p-12 2xl:p-14 overflow-y-auto lg:overflow-hidden bg-slate-50 border-l border-slate-200/80">
        {/* Mobile Brand Top (Hidden on Desktop) */}
        <div className="lg:hidden flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-sm bg-indigo-600 text-white">
              MK
            </div>
            <div>
              <h2 className="font-display font-bold text-xs text-slate-900 leading-tight">MKCE Connect</h2>
              <p className="text-[10px] text-slate-500">Student Sign Up</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
            Step {currentStep} of 3
          </span>
        </div>

        <div className="my-auto max-w-[440px] xl:max-w-[460px] w-full mx-auto flex flex-col">
          {/* Header & Step Indicator */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
                <Zap size={12} className="text-indigo-600" />
                <span>Onboarding Stage {currentStep} of 3</span>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {currentStep === 1 ? 'Credentials' : currentStep === 2 ? 'Academic Stream' : 'Skills & Goals'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight leading-tight">
              {currentStep === 1 && 'Create your campus login'}
              {currentStep === 2 && 'Select your academic stream'}
              {currentStep === 3 && 'Choose your skills & goals'}
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
              {currentStep === 1 && 'Provide your institutional credentials for secure single sign-on.'}
              {currentStep === 2 && 'This personalizes your technical club feeds and placement alerts.'}
              {currentStep === 3 && 'Pick top tech stacks to match with hackathons and peer projects.'}
            </p>

            {/* Stepper Progress Bar */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s <= currentStep ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm auth-card-shadow">
            <form onSubmit={handleSubmit} noValidate>
              <AnimatePresence mode="wait">
                {/* ---------------- STEP 1: CREDENTIALS ---------------- */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-3.5"
                  >
                    {/* Full Name */}
                    <div>
                      <label htmlFor="reg-name" className="block text-xs font-bold text-slate-700 mb-1">
                        Full Legal Name
                      </label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center justify-center">
                          <User size={17} />
                        </div>
                        <input
                          id="reg-name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          required
                          style={{ paddingLeft: '2.85rem' }}
                          className="input-auth py-2.5 text-sm"
                          placeholder="e.g. Anand Kumar"
                        />
                      </div>
                    </div>

                    {/* Email with Domain Auto-Fill */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label htmlFor="reg-email" className="block text-xs font-bold text-slate-700">
                          College Email Address
                        </label>
                        <button
                          type="button"
                          onClick={handleDomainQuickFill}
                          className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md transition-colors"
                        >
                          + @mkce.ac.in
                        </button>
                      </div>
                      <div className="relative flex items-center">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center justify-center">
                          <Mail size={17} />
                        </div>
                        <input
                          id="reg-email"
                          name="email"
                          type="email"
                          autoComplete="username"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          required
                          style={{ paddingLeft: '2.85rem' }}
                          className="input-auth py-2.5 text-sm"
                          placeholder="rollno@mkce.ac.in"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label htmlFor="reg-password" className="block text-xs font-bold text-slate-700 mb-1">
                        Create Password
                      </label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center justify-center">
                          <Lock size={17} />
                        </div>
                        <input
                          id="reg-password"
                          name="new-password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                          required
                          style={{ paddingLeft: '2.85rem', paddingRight: '2.85rem' }}
                          className="input-auth-with-action py-2.5 text-sm"
                          placeholder="At least 8 characters"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 flex items-center justify-center"
                        >
                          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>

                      {/* Compact Password Strength Meter */}
                      {form.password && (
                        <div className="mt-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-medium">Security Strength:</span>
                            <span className={`font-bold ${strengthMeta.text}`}>{strengthMeta.label}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className={`h-full ${strengthMeta.color} ${strengthMeta.width} transition-all duration-300`} />
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                            <span className={`flex items-center gap-1 ${hasLength ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                              <Check size={12} /> 8+ Characters
                            </span>
                            <span className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                              <Check size={12} /> Contains Number
                            </span>
                            <span className={`flex items-center gap-1 ${hasUpperLower ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                              <Check size={12} /> Upper & Lowercase
                            </span>
                            <span className={`flex items-center gap-1 ${hasSpecial ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                              <Check size={12} /> Special Symbol
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="btn-auth w-full py-3 text-sm mt-1 font-bold flex items-center justify-center gap-2 shadow-md"
                    >
                      <span>Continue to Academic Info</span>
                      <ArrowRight size={16} />
                    </button>
                  </motion.div>
                )}

                {/* ---------------- STEP 2: ACADEMIC PROFILE ---------------- */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-3.5"
                  >
                    {/* Academic Year Pills */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Current Academic Year
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {['1', '2', '3', '4'].map((yr) => {
                          const isSelected = form.year === yr;
                          return (
                            <button
                              key={yr}
                              type="button"
                              onClick={() => setForm({ ...form, year: yr })}
                              className={`py-2.5 px-1.5 rounded-xl text-center border font-bold transition-all ${
                                isSelected
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                              }`}
                            >
                              <div className="text-sm">Year {yr}</div>
                              <div className={`text-[10px] font-normal ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                                {yr === '1' ? 'Freshman' : yr === '2' ? 'Sophomore' : yr === '3' ? 'Pre-Final' : 'Final Year'}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Department Grid */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Department & Branch
                      </label>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                        {DEPARTMENTS.map((dept) => {
                          const isSelected = form.department === dept.id;
                          return (
                            <button
                              key={dept.id}
                              type="button"
                              onClick={() => setForm({ ...form, department: dept.id })}
                              className={`p-2.5 rounded-xl text-left border transition-all ${
                                isSelected
                                  ? 'bg-indigo-50/80 border-indigo-500 ring-1 ring-indigo-500'
                                  : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className={`text-xs font-bold ${isSelected ? 'text-indigo-700' : 'text-slate-800'}`}>
                                  {dept.short}
                                </span>
                                {isSelected && <CheckCircle2 size={13} className="text-indigo-600" />}
                              </div>
                              <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                {dept.label}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="py-3 px-4 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5"
                      >
                        <ChevronLeft size={16} />
                        <span>Back</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        className="btn-auth flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-md"
                      >
                        <span>Continue to Skills</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ---------------- STEP 3: SKILLS & GOALS ---------------- */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-3.5"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-bold text-slate-700">
                          Select Interests & Goals (Max 6)
                        </label>
                        <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                          {form.skills.length} / 6 selected
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
                        {SUGGESTED_SKILLS.map((skill) => {
                          const isSelected = form.skills.includes(skill);
                          return (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => toggleSkill(skill)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                isSelected
                                  ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-600/30'
                                  : 'bg-slate-100 hover:bg-slate-200/70 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {skill} {isSelected && '✓'}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Summary Pill */}
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-0.5">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        <span>Ready to launch student workspace</span>
                      </div>
                      <p className="text-[11px] truncate">
                        <strong>{form.name || 'Student'}</strong> • {form.department || 'General'} (Year {form.year || '1'})
                      </p>
                    </div>

                    {/* Terms Agreement */}
                    <label className="flex items-start gap-2.5 cursor-pointer select-none pt-0.5">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-colors"
                      />
                      <span className="text-xs text-slate-500 leading-relaxed">
                        I agree to the <strong>Campus Community Guidelines</strong>, academic honor code, and privacy policy.
                      </span>
                    </label>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="py-3 px-4 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5"
                      >
                        <ChevronLeft size={16} />
                        <span>Back</span>
                      </button>
                      <button
                        type="submit"
                        disabled={loading || !termsAccepted}
                        className="btn-auth flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-md"
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            <span>Creating Workspace...</span>
                          </div>
                        ) : (
                          <>
                            <span>Complete & Launch</span>
                            <Rocket size={16} />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>

          {/* Sign In Link */}
          <div className="mt-3 text-center">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 w-full py-3 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50/80 rounded-xl transition-all duration-200 border border-slate-200/90 shadow-sm hover:border-slate-300"
            >
              <span>Already have an account? Sign in</span>
              <ChevronRight size={15} className="text-slate-400" />
            </Link>
          </div>

          {/* Trust Guarantees */}
          <div className="flex items-center justify-center gap-5 pt-4 text-slate-500">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <ShieldCheck size={13} className="text-emerald-600" />
              <span>Verified Portal</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <Sparkles size={13} className="text-indigo-600" />
              <span>Smart Match</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <GraduationCap size={13} className="text-slate-600" />
              <span>Autonomous MKCE</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 pt-3">
          © {new Date().getFullYear()} M. Kumarasamy College of Engineering. All rights reserved.
        </div>
      </div>
    </div>
  );
}



