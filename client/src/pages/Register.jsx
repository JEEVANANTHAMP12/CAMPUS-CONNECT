import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles, Building } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { triggerConfetti } from '../components/animations/Confetti';
import SEO from '../components/SEO';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', year: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      triggerConfetti({ particleCount: 100, spread: 80 });
      toast.success('Account created! Welcome to MKCE Connect.');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white overflow-hidden font-sans text-zinc-900">
      <SEO
        title="Student Onboarding & Account Registration"
        description="Register for MKCE Connect to access campus clubs, hackathon registrations, peer discussions, and career opportunities."
        keywords="MKCE Registration, Join MKCE Connect, Student Sign Up Karur"
        canonical="/register"
      />

      {/* Left Panel - Branding in Solid Pitch Black */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-12 text-white bg-black border-r border-zinc-800">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-zinc-800/40 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-2xl flex items-center justify-center font-display font-black text-2xl text-black bg-white border border-white shadow-md">
              MK
            </div>
            <div>
              <h2 className="font-display font-black text-xl tracking-tight text-white">MKCE Connect</h2>
              <p className="text-xs text-zinc-400 font-semibold tracking-wider uppercase">Student & Faculty Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-zinc-900 border border-zinc-700 text-zinc-200">
            <ShieldCheck size={14} className="text-white" /><span>Secure Registration</span>
          </div>
        </div>

        <div className="relative z-10 my-auto max-w-lg">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold mb-5 bg-zinc-900 border border-zinc-700 text-zinc-200">
            <Sparkles size={13} className="text-white" /><span>Autonomous Engineering Campus Hub</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-display font-black leading-tight mb-5 tracking-tight text-white">
            Build Your Future at<br />
            <span className="text-zinc-400">
              M. Kumarasamy College
            </span>
          </h1>
          <p className="text-base text-zinc-300 leading-relaxed mb-8">
            Create your digital identity to unlock collaborative club memberships, hackathons, job drives, and skill verifications.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { num: '50+', label: 'Active Student Chapters' },
              { num: '100% Verified', label: 'Campus Achievements' },
              { num: 'Top Tier', label: 'Faculty Mentorship' },
              { num: '2608', label: 'TNEA Counseling Code' },
            ].map((stat, i) => (
              <div key={i} className="rounded-2xl p-4 bg-zinc-900/90 border border-zinc-800">
                <p className="text-xl font-black text-white tracking-tight">{stat.num}</p>
                <p className="text-xs text-zinc-400 font-semibold mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-xs text-zinc-400 font-semibold">
          <span>NAAC 'A' Grade</span><span className="w-1 h-1 rounded-full bg-zinc-600" />
          <span>NBA Accredited</span><span className="w-1 h-1 rounded-full bg-zinc-600" />
          <span>Autonomous</span>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative overflow-y-auto bg-white">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md space-y-5">
          {/* Mobile Header */}
          <div className="lg:hidden text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-black text-2xl text-white bg-black mx-auto border border-zinc-800 shadow-md">MK</div>
            <h1 className="text-2xl font-display font-black text-black tracking-tight">MKCE Connect</h1>
            <p className="text-xs text-zinc-500 font-medium">M. Kumarasamy College of Engineering</p>
          </div>

          <div>
            <h2 className="text-2xl font-display font-black text-black tracking-tight">Create Student Account</h2>
            <p className="text-zinc-500 text-sm mt-1 font-medium">Student registration only — staff & HOD accounts are created by admin.</p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
              <ShieldCheck size={12} /> Student Registration
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">Full Name</label>
              <div className="relative"><User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="input-mkce pl-11" placeholder="e.g. Anand Kumar" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative"><Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="input-mkce pl-11" placeholder="name@mkce.ac.in" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative"><Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} className="input-mkce pl-11 pr-11" placeholder="Minimum 8 characters" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">Year</label>
              <select value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="input-mkce cursor-pointer font-medium">
                <option value="">Select Year</option>
                <option value="1">Year 1</option><option value="2">Year 2</option><option value="3">Year 3</option><option value="4">Year 4</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">Department</label>
              <div className="relative"><Building size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input type="text" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="input-mkce pl-11" placeholder="e.g. CSE / IT / ECE / MECH" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-mkce w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 mt-3">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Create Account</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center text-xs text-zinc-500 font-medium">
            Already have an account? <Link to="/login" className="font-bold text-black hover:underline transition-all">Sign in instead</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
