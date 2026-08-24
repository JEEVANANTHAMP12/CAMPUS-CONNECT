import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles, Building } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { triggerConfetti } from '../components/animations/Confetti';
import SEO from '../components/SEO';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', department: '', year: '' });
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
    <div className="min-h-screen flex bg-surface-50 overflow-hidden font-sans">
      <SEO
        title="Student Onboarding & Account Registration"
        description="Register for MKCE Connect to access campus clubs, hackathon registrations, peer discussions, and career opportunities."
        keywords="MKCE Registration, Join MKCE Connect, Student Sign Up Karur"
        canonical="/register"
      />

      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-12 text-white"
        style={{ background: 'linear-gradient(135deg, #010018 0%, #020024 20%, #09203f 45%, #073f69 70%, #06A3DA 95%, #60bbfa 100%)' }}>
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-mkce-500/12 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gold/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-black text-2xl text-white border border-white/15"
              style={{ background: 'linear-gradient(135deg, #06A3DA 0%, #073f69 100%)', boxShadow: '0 4px 20px rgba(6,163,218,0.35)' }}>
              MK
            </div>
            <div>
              <h2 className="font-display font-extrabold text-xl tracking-tight">MKCE Connect</h2>
              <p className="text-xs text-mkce-300/70 font-medium tracking-wider uppercase">Student & Faculty Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <ShieldCheck size={14} className="text-emerald-400" /><span>Secure Registration</span>
          </div>
        </div>

        <div className="relative z-10 my-auto max-w-lg">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold mb-5"
            style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(191,227,254,0.9)' }}>
            <Sparkles size={13} className="text-gold" /><span>Autonomous Engineering Campus Hub</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-display font-black leading-tight mb-5 tracking-tight">
            Build Your Future at<br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #93d3fd, #ffffff, #f9d423)' }}>
              M. Kumarasamy College
            </span>
          </h1>
          <p className="text-base text-mkce-100/75 leading-relaxed mb-8">
            Create your digital identity to unlock collaborative club memberships, hackathons, job drives, and skill verifications.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { num: '50+', label: 'Active Student Chapters' },
              { num: '100% Verified', label: 'Campus Achievements' },
              { num: 'Top Tier', label: 'Faculty Mentorship' },
              { num: '2608', label: 'TNEA Counseling Code' },
            ].map((stat, i) => (
              <div key={i} className="rounded-xl p-3.5" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-lg font-black text-gold-light tracking-tight">{stat.num}</p>
                <p className="text-xs text-white/65 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-xs text-mkce-200/60 font-medium">
          <span>NAAC 'A' Grade</span><span className="w-1 h-1 rounded-full bg-white/30" />
          <span>NBA Accredited</span><span className="w-1 h-1 rounded-full bg-white/30" />
          <span>Autonomous</span>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md space-y-5">
          {/* Mobile Header */}
          <div className="lg:hidden text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-black text-2xl text-white mx-auto border border-white/15"
              style={{ background: 'linear-gradient(135deg, #06A3DA 0%, #073f69 100%)', boxShadow: '0 4px 20px rgba(6,163,218,0.35)' }}>MK</div>
            <h1 className="text-2xl font-display font-black text-mkce-900 tracking-tight">MKCE Connect</h1>
            <p className="text-xs text-surface-500">M. Kumarasamy College of Engineering</p>
          </div>

          <div>
            <h2 className="text-2xl font-display font-black text-mkce-900 tracking-tight">Create an Account</h2>
            <p className="text-surface-500 text-sm mt-1">Join the student & faculty digital network.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-mkce-800 uppercase tracking-wider mb-1.5">Full Name</label>
              <div className="relative"><User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="input-mkce pl-11" placeholder="e.g. Anand Kumar" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-mkce-800 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative"><Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="input-mkce pl-11" placeholder="name@mkce.ac.in" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-mkce-800 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative"><Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} className="input-mkce pl-11 pr-11" placeholder="Minimum 8 characters" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-mkce-600 transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-mkce-800 uppercase tracking-wider mb-1.5">Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input-mkce cursor-pointer">
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="leader">Club Leader</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-mkce-800 uppercase tracking-wider mb-1.5">Year</label>
                <select value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="input-mkce cursor-pointer">
                  <option value="">Select Year</option>
                  <option value="1">Year 1</option><option value="2">Year 2</option><option value="3">Year 3</option><option value="4">Year 4</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-mkce-800 uppercase tracking-wider mb-1.5">Department</label>
              <div className="relative"><Building size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input type="text" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="input-mkce pl-11" placeholder="e.g. CSE / IT / ECE / MECH" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-mkce w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 shimmer-btn mt-3">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Create Account</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center text-xs text-surface-500">
            Already have an account? <Link to="/login" className="font-bold text-mkce-600 hover:text-mkce-700 transition-colors">Sign in instead</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
