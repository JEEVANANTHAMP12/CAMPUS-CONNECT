import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles, Award, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome to MKCE Connect!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-50 overflow-hidden font-sans">
      <SEO
        title="Student & Faculty Login"
        description="Sign in to your MKCE Connect account to explore campus chapters, hackathons, and placement drives at M. Kumarasamy College of Engineering."
        keywords="MKCE Login, MKCE Portal Login, Student Login Karur, MKCE Connect Sign In"
        canonical="/login"
      />

      {/* Left Panel - Institutional Branding */}
      <div
        className="hidden lg:flex lg:w-[54%] relative overflow-hidden flex-col justify-between p-12 text-white"
        style={{
          background: 'linear-gradient(135deg, #010018 0%, #020024 20%, #09203f 45%, #073f69 70%, #06A3DA 95%, #60bbfa 100%)',
        }}
      >
        {/* Ambient glows */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-mkce-500/12 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gold/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-mkce-400/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-black text-2xl text-white border border-white/15"
              style={{
                background: 'linear-gradient(135deg, #06A3DA 0%, #073f69 100%)',
                boxShadow: '0 4px 20px rgba(6,163,218,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
            >
              MK
            </div>
            <div>
              <h2 className="font-display font-extrabold text-xl tracking-tight text-white">MKCE Connect</h2>
              <p className="text-xs text-mkce-300/70 font-medium tracking-wider uppercase">Digital Campus Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)' }}>
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>End-to-End Encrypted</span>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 my-auto max-w-lg">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold mb-5"
            style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(191,227,254,0.9)' }}>
            <Sparkles size={13} className="text-gold" />
            <span>Unified Campus Ecosystem</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-display font-black leading-tight mb-5 tracking-tight">
            Connect. Collaborate.<br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #93d3fd, #ffffff, #f9d423)' }}>
              Accelerate Your Future.
            </span>
          </h1>
          <p className="text-base text-mkce-100/75 leading-relaxed mb-8">
            Experience the unified hub for technical clubs, peer discussions, verified achievements, and career opportunities at M. Kumarasamy College of Engineering.
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { num: '25+', label: 'Years of Academic Excellence' },
              { num: '15,000+', label: 'Global Alumni Network' },
              { num: '97.9%', label: 'Industry Placement Rate' },
              { num: 'NIRF Ranked', label: 'Autonomous Institution' },
            ].map((stat, i) => (
              <div key={i} className="rounded-xl p-3.5"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                <p className="text-lg font-black text-gold-light tracking-tight">{stat.num}</p>
                <p className="text-xs text-white/65 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer badges */}
        <div className="relative z-10 flex items-center gap-4 text-xs text-mkce-200/60 font-medium">
          <span>NAAC 'A' Grade</span>
          <span className="w-1 h-1 rounded-full bg-white/30" />
          <span>NBA Accredited</span>
          <span className="w-1 h-1 rounded-full bg-white/30" />
          <span>Autonomous</span>
          <span className="w-1 h-1 rounded-full bg-white/30" />
          <span>Anna University</span>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md space-y-6"
        >
          {/* Mobile Header */}
          <div className="lg:hidden text-center space-y-2">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-black text-2xl text-white mx-auto border border-white/15"
              style={{
                background: 'linear-gradient(135deg, #06A3DA 0%, #073f69 100%)',
                boxShadow: '0 4px 20px rgba(6,163,218,0.35)',
              }}
            >
              MK
            </div>
            <h1 className="text-2xl font-display font-black text-mkce-900 tracking-tight">MKCE Connect</h1>
            <p className="text-xs text-surface-500">M. Kumarasamy College of Engineering</p>
          </div>

          <div className="text-left">
            <h2 className="text-2xl lg:text-3xl font-display font-black text-mkce-900 tracking-tight">
              Sign In to Your Account
            </h2>
            <p className="text-surface-500 text-sm mt-1.5">
              Enter your student or faculty credentials to access the campus portal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-mkce-800 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-mkce pl-11"
                  placeholder="name@mkce.ac.in"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-mkce-800 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-mkce pl-11 pr-11"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-mkce-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-surface-300 text-mkce-600 focus:ring-mkce-500" />
                <span className="text-xs text-surface-600 font-medium">Remember me</span>
              </label>
              <a href="#" className="text-xs font-semibold text-mkce-600 hover:text-mkce-700 transition-colors">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-mkce w-full py-3 text-sm font-bold flex items-center justify-center gap-2 shimmer-btn"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <>
                  <span>Sign In to Campus Portal</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-200/60" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-surface-50 text-surface-400 font-medium">New to MKCE Connect?</span>
            </div>
          </div>

          <Link
            to="/register"
            className="btn-secondary w-full py-3 text-sm font-bold flex items-center justify-center gap-2"
          >
            <span>Create Your Account</span>
            <ArrowRight size={15} />
          </Link>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-6 pt-4">
            {[
              { icon: ShieldCheck, label: 'Secure Login' },
              { icon: CheckCircle2, label: '256-bit SSL' },
              { icon: Award, label: 'NAAC Verified' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-surface-400">
                <item.icon size={13} />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
