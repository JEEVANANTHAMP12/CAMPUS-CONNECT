import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck,
  GraduationCap, Users, BookOpen, Trophy, Sparkles, CheckCircle2,
  HelpCircle, X, ChevronRight, Star, Building2, Zap, ArrowUpRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';

const TESTIMONIALS = [
  {
    quote: "MKCE Connect accelerated our Google DSC hackathon collaboration with over 450+ student developers across 4 departments.",
    author: "Priya Sundaram",
    role: "GDG Lead & Final Year CSE",
    metric: "450+ Hackers",
    rating: 5,
  },
  {
    quote: "Our placement drive notifications and direct alumni interview preps were 10x smoother through the verified chapters portal.",
    author: "Karthik Raja",
    role: "Placed at Zoho • Batch 2025",
    metric: "₹18 LPA CTC",
    rating: 5,
  },
  {
    quote: "Centralized discussion boards and project peer reviews helped our IEEE chapter secure 3 state-level symposium wins.",
    author: "Deepika Murugan",
    role: "IEEE Student Branch Secretary",
    metric: "3 State Wins",
    rating: 5,
  },
];

const DEMO_PERSONAS = [
  {
    label: "Student",
    badge: "Popular",
    email: "student@mkce.ac.in",
    pass: "Password@123",
    icon: GraduationCap,
  },
  {
    label: "Club Lead",
    badge: "Chapter",
    email: "clublead@mkce.ac.in",
    pass: "Password@123",
    icon: Users,
  },
  {
    label: "Admin / Faculty",
    badge: "Staff",
    email: "admin@mkce.ac.in",
    pass: "Admin@12345",
    icon: ShieldCheck,
  },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [showFacultyHelp, setShowFacultyHelp] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Rotate testimonials every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Please provide your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      toast.success('Welcome back to MKCE Connect!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials. Please verify your login details.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPersona = (persona) => {
    setEmail(persona.email);
    setPassword(persona.pass);
    toast.success(`Loaded ${persona.label} credentials!`, {
      icon: '⚡',
      duration: 2000,
    });
  };

  const handleDomainQuickFill = () => {
    if (!email) {
      setEmail('@mkce.ac.in');
      return;
    }
    if (!email.includes('@')) {
      setEmail(`${email}@mkce.ac.in`);
    } else if (email.endsWith('@')) {
      setEmail(`${email}mkce.ac.in`);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSubmitted(true);
    toast.success('Recovery link dispatched to your registered email.');
  };

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row bg-slate-950 text-slate-900 font-sans selection:bg-indigo-600 selection:text-white overflow-hidden">
      <SEO
        title="Institutional SaaS Login"
        description="Sign in to your MKCE Connect portal to access campus technical clubs, hackathons, verified credentials, and placement drives."
        keywords="MKCE Login, Campus SaaS, MKCE Portal, Engineering Student Login, Placement Drives"
        canonical="/login"
      />

      {/* ================= LEFT SAAS BRANDING & SOCIAL PROOF PANEL (50% Split) ================= */}
      <div className="hidden lg:flex lg:w-1/2 h-full relative overflow-hidden flex-col justify-between auth-panel-gradient text-white p-8 xl:p-12 2xl:p-14 select-none">
        {/* Glow ambient background orbs */}
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] bg-indigo-500/25 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-[380px] h-[380px] bg-purple-500/20 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute -bottom-24 left-1/4 w-[400px] h-[400px] bg-sky-500/15 rounded-full blur-[120px] pointer-events-none" />

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
                  Enterprise
                </span>
              </div>
              <p className="text-[11px] text-indigo-200/70 font-medium">
                M. Kumarasamy College of Engineering
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold bg-white/10 backdrop-blur-md border border-white/15 text-indigo-100 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Online • 99.9%</span>
          </div>
        </div>

        {/* Center Content / SaaS Value Proposition */}
        <div className="relative z-10 my-auto py-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Campus Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-4 bg-indigo-500/20 backdrop-blur-md border border-indigo-400/30 text-indigo-100 shadow-inner">
              <Sparkles size={13} className="text-amber-300" />
              <span>The Autonomous Campus Operating System</span>
            </div>

            <h1 className="text-3xl xl:text-4xl 2xl:text-[2.6rem] font-display font-black leading-[1.18] mb-3 tracking-tight">
              Where Engineering Ambition Meets <span className="bg-gradient-to-r from-indigo-300 via-sky-200 to-indigo-200 bg-clip-text text-transparent">Industry Impact.</span>
            </h1>
            
            <p className="text-sm xl:text-base text-indigo-100/75 leading-relaxed mb-6 max-w-lg">
              Streamline technical club collaborations, hackathons, peer research, and placement drives on a single unified platform.
            </p>

            {/* Live Key Metrics SaaS Bar */}
            <div className="grid grid-cols-3 gap-3 mb-5 p-4 rounded-2xl bg-white/[0.06] backdrop-blur-md border border-white/10">
              <div className="text-left px-2">
                <div className="font-display font-black text-xl xl:text-2xl text-white">10,000+</div>
                <div className="text-xs text-indigo-200/70 font-medium">Students & Alumni</div>
              </div>
              <div className="text-left px-2 border-l border-white/10">
                <div className="font-display font-black text-xl xl:text-2xl text-emerald-300">50+</div>
                <div className="text-xs text-indigo-200/70 font-medium">Active Chapters</div>
              </div>
              <div className="text-left px-2 border-l border-white/10">
                <div className="font-display font-black text-xl xl:text-2xl text-amber-300">98.4%</div>
                <div className="text-xs text-indigo-200/70 font-medium">Placement Track</div>
              </div>
            </div>

            {/* Social Proof & Testimonials Carousel */}
            <div className="relative rounded-2xl p-4.5 xl:p-5 bg-white/[0.08] backdrop-blur-md border border-white/15 shadow-xl">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1 text-amber-300">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} fill="currentColor" />
                  ))}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200/80 bg-white/10 px-2 py-0.5 rounded-md">
                  Verified Member
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-sm font-medium text-white/95 leading-relaxed italic mb-3">
                    "{TESTIMONIALS[activeTestimonial].quote}"
                  </p>
                  <div className="flex items-center justify-between border-t border-white/10 pt-2.5">
                    <div>
                      <div className="text-xs font-bold text-white">{TESTIMONIALS[activeTestimonial].author}</div>
                      <div className="text-[11px] text-indigo-200/70">{TESTIMONIALS[activeTestimonial].role}</div>
                    </div>
                    <span className="text-xs font-bold text-sky-300 bg-sky-500/20 border border-sky-400/30 px-2.5 py-1 rounded-lg">
                      {TESTIMONIALS[activeTestimonial].metric}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Indicators */}
              <div className="flex items-center gap-1.5 mt-3 justify-center">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTestimonial(i)}
                    aria-label={`Slide to testimonial ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeTestimonial === i ? 'w-5 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer Accreditations Bar */}
        <div className="relative z-10 flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-3 border-t border-white/10 text-xs text-indigo-200/60 font-semibold">
          <div className="flex items-center gap-1.5 text-white/90">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>NAAC 'A' Grade</span>
          </div>
          <span className="text-white/20">•</span>
          <span>NBA Accredited</span>
          <span className="text-white/20">•</span>
          <span>Autonomous</span>
          <span className="text-white/20">•</span>
          <span>Anna University</span>
        </div>
      </div>

      {/* ================= RIGHT AUTH FORM PANEL (50% Split) ================= */}
      <div className="flex-1 lg:w-1/2 h-full flex flex-col justify-between p-6 sm:p-10 lg:p-10 xl:p-12 2xl:p-14 overflow-y-auto lg:overflow-hidden bg-slate-50 border-l border-slate-200/80">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="lg:hidden flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-sm bg-indigo-600 text-white">
              MK
            </div>
            <div>
              <h2 className="font-display font-bold text-xs text-slate-900 leading-tight">MKCE Connect</h2>
              <p className="text-[10px] text-slate-500">Campus Portal</p>
            </div>
          </div>
          <div className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
            Live Portal
          </div>
        </div>

        <div className="my-auto max-w-[440px] xl:max-w-[460px] w-full mx-auto flex flex-col">
          {/* Section Heading */}
          <div className="mb-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-2">
              <Zap size={12} className="text-indigo-600" />
              <span>Campus SSO & Authentication</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight leading-tight">
              Welcome back
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
              Sign in to manage your campus chapters, hackathons & placement drives.
            </p>
          </div>

          {/* Quick Demo Persona Selector Tactic */}
          <div className="mb-4 p-3 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between mb-2 px-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles size={12} className="text-indigo-600" />
                Quick Test Personas
              </span>
              <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full">
                1-Click Fill
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_PERSONAS.map((persona, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyPersona(persona)}
                  className="group flex flex-col items-center justify-center p-2 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-indigo-50/70 hover:border-indigo-300 transition-all text-center"
                >
                  <persona.icon size={14} className="text-slate-600 group-hover:text-indigo-600 mb-0.5 transition-colors" />
                  <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-700 leading-tight">{persona.label}</span>
                  <span className="text-[9px] text-slate-400 group-hover:text-indigo-500 font-medium">{persona.badge}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm auth-card-shadow">
            <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
              {/* Email input with quick domain helper */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="login-email" className="block text-xs font-bold text-slate-700">
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
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ paddingLeft: '2.85rem' }}
                    className="input-auth py-2.5 text-sm"
                    placeholder="rollno@mkce.ac.in"
                  />
                </div>
              </div>

              {/* Password input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="login-password" className="block text-xs font-bold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center justify-center">
                    <Lock size={17} />
                  </div>
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ paddingLeft: '2.85rem', paddingRight: '2.85rem' }}
                    className="input-auth-with-action py-2.5 text-sm"
                    placeholder="Enter password"
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
              </div>

              {/* Remember Me & Faculty Help note */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 transition-colors"
                  />
                  <span className="text-xs text-slate-600 font-medium">Keep me signed in</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowFacultyHelp(true)}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors"
                >
                  <HelpCircle size={13} />
                  <span>Faculty help</span>
                </button>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-auth w-full py-3 text-sm mt-1 font-bold flex items-center justify-center gap-2 shadow-md"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <>
                    <span>Sign In to Campus Hub</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* New Account Register Link */}
          <div className="mt-3 text-center">
            <Link
              to="/register"
              className="flex items-center justify-center gap-2 w-full py-3 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50/80 rounded-xl transition-all duration-200 border border-slate-200/90 shadow-sm hover:border-slate-300"
            >
              <span>New student? Create campus account</span>
              <ChevronRight size={15} className="text-slate-400" />
            </Link>
          </div>

          {/* Security & Compliance Trust Bar */}
          <div className="flex items-center justify-center gap-5 pt-4 text-slate-500">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <ShieldCheck size={13} className="text-emerald-600" />
              <span>256-Bit TLS</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <Lock size={13} className="text-indigo-600" />
              <span>Zero-Trust Auth</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <GraduationCap size={13} className="text-slate-600" />
              <span>Autonomous MKCE</span>
            </div>
          </div>
        </div>

        {/* Footer Copyright */}
        <div className="text-center text-xs text-slate-400 pt-3">
          © {new Date().getFullYear()} M. Kumarasamy College of Engineering. All rights reserved.
        </div>
      </div>

      {/* ================= FORGOT PASSWORD MODAL ================= */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative"
            >
              <button
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotSubmitted(false);
                }}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
                <Lock size={22} />
              </div>

              <h3 className="text-lg font-display font-bold text-slate-900 mb-1">
                Reset your password
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Enter your registered college email address (`@mkce.ac.in`) to receive a recovery token.
              </p>

              {forgotSubmitted ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs leading-relaxed space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <CheckCircle2 size={16} />
                    <span>Reset instructions sent!</span>
                  </div>
                  <p>
                    Check your inbox and spam folder for <strong>{forgotEmail}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(false);
                      setForgotSubmitted(false);
                    }}
                    className="mt-2 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors"
                  >
                    Return to Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Registered Email
                    </label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="rollno@mkce.ac.in"
                      className="input-auth py-2.5 text-sm"
                    />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
                    Need instant assistance? Contact IT Helpdesk: <span className="text-indigo-600 font-semibold">ithelpdesk@mkce.ac.in</span>.
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                    >
                      Send Reset Link
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= FACULTY / STAFF HELP DRAWER ================= */}
      <AnimatePresence>
        {showFacultyHelp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative"
            >
              <button
                onClick={() => setShowFacultyHelp(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
                <Building2 size={22} />
              </div>

              <h3 className="text-base font-display font-bold text-slate-900 mb-1.5">
                Faculty & Staff Authentication
              </h3>
              <div className="text-xs text-slate-600 leading-relaxed space-y-3 mb-5">
                <p>
                  Faculty, Club Advisor, and HOD accounts are provisioned directly by the <strong>MKCE Central Admin & Dean Office</strong>.
                </p>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs space-y-1">
                  <div className="font-bold">Protocol:</div>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Sign in using your official institutional email</li>
                    <li>For role upgrades, contact the COE portal coordinator</li>
                    <li>Never share administrative credentials</li>
                  </ul>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowFacultyHelp(false)}
                className="w-full py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-colors"
              >
                Understood
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


