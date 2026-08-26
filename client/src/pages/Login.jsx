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
    <div className="min-h-screen flex bg-white overflow-hidden font-sans text-zinc-900">
      <SEO
        title="Student & Faculty Login"
        description="Sign in to your MKCE Connect account to explore campus chapters, hackathons, and placement drives at M. Kumarasamy College of Engineering."
        keywords="MKCE Login, MKCE Portal Login, Student Login Karur, MKCE Connect Sign In"
        canonical="/login"
      />

      {/* Left Panel - Institutional Branding in Solid Pitch Black */}
      <div
        className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-12 text-white bg-black border-r border-zinc-800"
      >
        {/* Subtle ambient geometry */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-zinc-800/40 rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-13 h-13 rounded-2xl flex items-center justify-center font-display font-black text-2xl text-black bg-white border border-white shadow-md"
            >
              MK
            </div>
            <div>
              <h2 className="font-display font-black text-xl tracking-tight text-white">MKCE Connect</h2>
              <p className="text-xs text-zinc-400 font-semibold tracking-wider uppercase">Digital Campus Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-zinc-900 border border-zinc-700 text-zinc-200">
            <ShieldCheck size={14} className="text-white" />
            <span>End-to-End Encrypted</span>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 my-auto max-w-lg">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold mb-5 bg-zinc-900 border border-zinc-700 text-zinc-200">
            <Sparkles size={13} className="text-white" />
            <span>Unified Campus Ecosystem</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-display font-black leading-tight mb-5 tracking-tight text-white">
            Connect. Collaborate.<br />
            <span className="text-zinc-400">
              Accelerate Your Future.
            </span>
          </h1>
          <p className="text-base text-zinc-300 leading-relaxed mb-8">
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
              <div key={i} className="rounded-2xl p-4 bg-zinc-900/90 border border-zinc-800">
                <p className="text-xl font-black text-white tracking-tight">{stat.num}</p>
                <p className="text-xs text-zinc-400 font-semibold mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer badges */}
        <div className="relative z-10 flex items-center gap-4 text-xs text-zinc-400 font-semibold">
          <span>NAAC 'A' Grade</span>
          <span className="w-1 h-1 rounded-full bg-zinc-600" />
          <span>NBA Accredited</span>
          <span className="w-1 h-1 rounded-full bg-zinc-600" />
          <span>Autonomous</span>
          <span className="w-1 h-1 rounded-full bg-zinc-600" />
          <span>Anna University</span>
        </div>
      </div>

      {/* Right Panel - Login Form in Clean White */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative overflow-y-auto bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md space-y-6"
        >
          {/* Mobile Header */}
          <div className="lg:hidden text-center space-y-2">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-black text-2xl text-white bg-black mx-auto border border-zinc-800 shadow-md"
            >
              MK
            </div>
            <h1 className="text-2xl font-display font-black text-black tracking-tight">MKCE Connect</h1>
            <p className="text-xs text-zinc-500 font-medium">M. Kumarasamy College of Engineering</p>
          </div>

          <div className="text-left">
            <h2 className="text-2xl lg:text-3xl font-display font-black text-black tracking-tight">
              Sign In to Your Account
            </h2>
            <p className="text-zinc-500 text-sm mt-1.5 font-medium">
              Enter your student or faculty credentials to access the campus portal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-black uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
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
              <label className="block text-xs font-bold text-black uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-zinc-300 text-black focus:ring-black" />
                <span className="text-xs text-zinc-600 font-medium">Remember me</span>
              </label>
              <a href="#" className="text-xs font-bold text-black hover:underline transition-all">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-mkce w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2"
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
              <div className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-white text-zinc-400 font-medium">New to MKCE Connect?</span>
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
          <div className="flex items-center justify-center gap-6 pt-4 border-t border-zinc-100">
            {[
              { icon: ShieldCheck, label: 'Secure Login' },
              { icon: CheckCircle2, label: '256-bit SSL' },
              { icon: Award, label: 'NAAC Verified' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-zinc-400">
                <item.icon size={13} className="text-zinc-600" />
                <span className="text-[10px] font-bold">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
