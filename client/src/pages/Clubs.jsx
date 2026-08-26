import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Users, Sparkles, Building, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { StaggerContainer, StaggerItem } from '../components/animations/StaggerContainer';
import { triggerConfetti } from '../components/animations/Confetti';
import SEO from '../components/SEO';

export default function Clubs() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', department: '' });

  useEffect(() => { fetchClubs(); }, []);

  const fetchClubs = async () => {
    try { const res = await api.get('/clubs'); setClubs(res.data.data); }
    catch { toast.error('Failed to load clubs'); }
    setLoading(false);
  };

  const createClub = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/clubs', form);
      triggerConfetti({ particleCount: 90, spread: 70 });
      toast.success('Club created successfully!');
      setShowCreate(false);
      setForm({ name: '', description: '', department: '' });
      fetchClubs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create club');
    }
    setCreating(false);
  };

  const joinClub = async (clubId) => {
    try {
      await api.post(`/clubs/${clubId}/join`);
      triggerConfetti({ particleCount: 70, spread: 60 });
      toast.success('You are now a member of this club!');
      fetchClubs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join club');
    }
  };

  const departments = ['ALL', ...Array.from(new Set(clubs.map((c) => c.department).filter(Boolean)))];

  const filtered = clubs.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase()) || c.department?.toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || c.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const canCreate = user?.role === 'leader' || user?.role === 'admin' || user?.role === 'hod';

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans text-zinc-900">
      <SEO title="Student Clubs & Technical Chapters" description="Discover and join engineering student chapters, robotics clubs, AI research groups, and cultural associations at M. Kumarasamy College of Engineering." keywords="MKCE Clubs, Student Chapters, IEEE MKCE, Robotics Club Karur, Engineering Clubs Tamil Nadu" canonical="/clubs" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-blue"><Sparkles size={11} className="mr-1" />Student Chapters & Guilds</span>
          </div>
          <h1 className="page-heading">Campus Clubs</h1>
          <p className="text-zinc-500 text-sm mt-1">Discover, join, and lead technical & cultural communities at MKCE.</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowCreate(true)} className="btn-mkce flex items-center gap-2 self-start sm:self-auto">
            <Plus size={18} /><span>Create Club</span>
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="input-mkce pl-11 py-3.5" placeholder="Search clubs by name, mission, or department..." />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {departments.map((dept) => (
            <button key={dept} onClick={() => setSelectedDept(dept)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-150 whitespace-nowrap ${
                selectedDept === dept
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-white text-zinc-700 border border-zinc-200 hover:border-black hover:text-black'
              }`}>
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
            <motion.div initial={{ opacity: 0, scale: 0.97, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 20 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-3xl w-full max-w-lg overflow-hidden border border-zinc-200 shadow-2xl">
              <div className="p-6 border-b border-zinc-800 text-white flex items-center justify-between bg-black">
                <div>
                  <h2 className="font-display font-bold text-lg text-white">Create New Campus Club</h2>
                  <p className="text-xs text-zinc-400 mt-0.5 font-medium">Empower fellow students with workshops and initiatives</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white">
                  <Building size={20} />
                </div>
              </div>
              <form onSubmit={createClub} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-black uppercase tracking-wider mb-2">Club Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="input-mkce" placeholder="e.g. AI & Robotics Research Club" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black uppercase tracking-wider mb-2">Description & Goals</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-mkce resize-none" placeholder="Describe what your club aims to achieve..." rows={3} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black uppercase tracking-wider mb-2">Associated Department</label>
                  <input type="text" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="input-mkce" placeholder="e.g. Computer Science and Engineering" />
                </div>
                <div className="flex gap-3 pt-3">
                  <button type="submit" disabled={creating} className="btn-mkce flex-1 py-3">{creating ? 'Registering...' : 'Create Club'}</button>
                  <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1 py-3">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Clubs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="skeleton rounded-3xl h-72" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-premium p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400">
            <Users size={32} />
          </div>
          <h3 className="font-display font-bold text-black text-lg">No clubs found</h3>
          <p className="text-zinc-500 text-sm mt-1 font-medium">Try adjusting your search query or department filter.</p>
        </div>
      ) : (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((club) => {
            const isMember = club.members?.some((m) => m._id === user?.id || m === user?.id || m?.id === user?.id);
            return (
              <StaggerItem key={club._id} className="h-full">
                <div className="card-premium flex flex-col h-full overflow-hidden group">
                  {/* Header Banner */}
                  <div className="h-28 relative flex items-center justify-between px-6 text-white overflow-hidden bg-black border-b border-zinc-800">
                    <div className="relative z-10">
                      <span className="text-3xl font-display font-black tracking-wider text-white">
                        {club.name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    {club.department && (
                      <span className="relative z-10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-900 border border-zinc-700 text-zinc-300">
                        {club.department}
                      </span>
                    )}
                  </div>

                    {/* Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <Link to={`/clubs/${club._id}`}>
                        <h3 className="font-display font-extrabold text-lg text-zinc-900 group-hover:text-black transition-colors line-clamp-1">{club.name}</h3>
                      </Link>
                      <p className="text-xs sm:text-sm text-zinc-500 mt-2 line-clamp-2 leading-relaxed font-medium">
                        {club.description || 'Dedicated to advancing student initiatives, workshops, and competitive projects.'}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-zinc-100">
                      <div className="flex items-center justify-between text-xs text-zinc-500 mb-4">
                        <span className="flex items-center gap-1.5 font-bold text-zinc-800">
                          <Users size={15} className="text-blue-600" />{club.members?.length || 0} Members
                        </span>
                        {isMember && (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <CheckCircle2 size={12} />Member
                          </span>
                        )}
                      </div>
                      {!isMember ? (
                        <button onClick={() => joinClub(club._id)} className="btn-mkce w-full py-2.5 text-xs font-bold">Join Club</button>
                      ) : (
                        <Link to={`/clubs/${club._id}`} className="btn-secondary w-full py-2.5 text-xs font-bold text-center block">
                          <span>Open Club Space</span><ArrowRight size={14} className="inline ml-1" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}
    </div>
  );
}
