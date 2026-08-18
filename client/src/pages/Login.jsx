import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

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
    <div className="min-h-screen flex">
      {/* Left Panel - MKCE Branding */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #020024 0%, #09203f 40%, #073f69 70%, #06A3DA 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-gold rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center font-display font-bold text-2xl text-white"
                style={{ background: 'linear-gradient(135deg, #06A3DA 0%, #073f69 100%)' }}>
                MK
              </div>
              <div>
                <h2 className="font-display font-bold text-xl">MKCE Connect</h2>
                <p className="text-xs text-mkce-300 tracking-wider uppercase">Campus Platform</p>
              </div>
            </div>
            <h1 className="text-4xl xl:text-5xl font-display font-bold leading-tight mb-4">
              Welcome to<br/>
              <span className="text-mkce-400">M. Kumarasamy College</span><br/>
              <span className="text-mkce-400">of Engineering</span>
            </h1>
            <p className="text-lg text-mkce-200/80 leading-relaxed max-w-md mb-8">
              Your digital campus hub for clubs, events, opportunities, and achievements. 
              Connect with the MKCE community.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { num: '25+', label: 'Years of Excellence' },
              { num: '15,100+', label: 'Alumni Network' },
              { num: '97.9%', label: 'Placement Rate' },
              { num: 'NIRF', label: 'Ranked Institution' }
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <p className="text-xl font-bold text-gold">{stat.num}</p>
                <p className="text-xs text-mkce-200/70">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-6 text-xs text-mkce-300/60">
            <span>NAAC 'A' Grade</span>
            <span className="w-1 h-1 bg-mkce-400 rounded-full"></span>
            <span>NBA Accredited</span>
            <span className="w-1 h-1 bg-mkce-400 rounded-full"></span>
            <span>Autonomous</span>
            <span className="w-1 h-1 bg-mkce-400 rounded-full"></span>
            <span>Anna University</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md animate-slide-up">
          <div className="lg:hidden mb-8 text-center">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center font-display font-bold text-xl text-white mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, #06A3DA 0%, #073f69 100%)' }}>
              MK
            </div>
            <h1 className="text-2xl font-display font-bold text-mkce-800">MKCE Connect</h1>
            <p className="text-xs text-surface-400 mt-1">M. Kumarasamy College of Engineering</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-display font-bold text-mkce-800">Sign in to your account</h2>
            <p className="text-surface-500 mt-1 text-sm">Access the MKCE campus platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-mkce-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="input-mkce pl-11" placeholder="you@mkce.ac.in" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-mkce-700 mb-2">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  className="input-mkce pl-11 pr-11" placeholder="Enter your password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-mkce w-full flex items-center justify-center gap-2 py-3 relative overflow-hidden shimmer-btn">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-surface-500">
            New to MKCE Connect?{' '}
            <Link to="/register" className="text-mkce-600 font-semibold hover:text-mkce-700">Create account</Link>
          </p>

          <div className="mt-8 p-4 bg-surface-50 rounded-xl border border-surface-200">
            <p className="text-[11px] font-semibold text-surface-500 mb-2 uppercase tracking-wider">Quick Demo Access</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { role: 'Admin', email: 'admin@campus.edu', pass: 'admin123' },
                { role: 'Student', email: 'student@campus.edu', pass: 'student123' },
                { role: 'Leader', email: 'leader@campus.edu', pass: 'leader123' },
                { role: 'HOD', email: 'hod@campus.edu', pass: 'hod123' },
              ].map((d) => (
                <button key={d.role} onClick={() => { setEmail(d.email); setPassword(d.pass); }}
                  className="px-3 py-2.5 bg-white rounded-lg border border-surface-200 hover:border-mkce-400 hover:bg-mkce-50 transition-all text-left">
                  <span className="block text-xs font-bold text-mkce-700">{d.role}</span>
                  <span className="block text-[10px] text-surface-400 truncate">{d.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
