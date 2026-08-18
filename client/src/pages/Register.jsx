import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

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
      toast.success('Welcome to MKCE Connect!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #020024 0%, #09203f 40%, #073f69 70%, #06A3DA 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-32 right-16 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-16 left-16 w-72 h-72 bg-gold rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
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
            Join<br/>
            <span className="text-mkce-400">MKCE Connect</span>
          </h1>
          <p className="text-lg text-mkce-200/80 leading-relaxed max-w-md mb-8">
            Be part of the most active campus community at M. Kumarasamy College of Engineering, Karur.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { num: '11+', label: 'UG Programmes' },
              { num: '6+', label: 'PG Programmes' },
              { num: '50+', label: 'Student Clubs' },
              { num: '2608', label: 'TNEA Code' }
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <p className="text-xl font-bold text-gold">{stat.num}</p>
                <p className="text-xs text-mkce-200/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-white overflow-y-auto">
        <div className="w-full max-w-md animate-slide-up">
          <div className="lg:hidden mb-8 text-center">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center font-display font-bold text-xl text-white mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, #06A3DA 0%, #073f69 100%)' }}>
              MK
            </div>
            <h1 className="text-2xl font-display font-bold text-mkce-800">MKCE Connect</h1>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-display font-bold text-mkce-800">Create your account</h2>
            <p className="text-surface-500 mt-1 text-sm">Join the MKCE campus community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-mkce-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required
                  className="input-mkce pl-11" placeholder="John Doe" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-mkce-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required
                  className="input-mkce pl-11" placeholder="you@mkce.ac.in" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-mkce-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm({...form, password: e.target.value})} required
                  className="input-mkce pl-11 pr-11" placeholder="Min 6 characters" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-mkce-700 mb-1.5">Role</label>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="input-mkce cursor-pointer">
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="leader">Club Leader</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-mkce-700 mb-1.5">Department</label>
                <input type="text" value={form.department} onChange={e => setForm({...form, department: e.target.value})}
                  className="input-mkce" placeholder="CSE" />
              </div>
            </div>

            {form.role === 'student' && (
              <div>
                <label className="block text-sm font-semibold text-mkce-700 mb-1.5">Year</label>
                <input type="number" value={form.year} onChange={e => setForm({...form, year: e.target.value})}
                  className="input-mkce" placeholder="3" min="1" max="5" />
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-mkce w-full flex items-center justify-center gap-2 py-3 mt-2 relative overflow-hidden shimmer-btn">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-surface-500">
            Already have an account?{' '}
            <Link to="/login" className="text-mkce-600 font-semibold hover:text-mkce-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
