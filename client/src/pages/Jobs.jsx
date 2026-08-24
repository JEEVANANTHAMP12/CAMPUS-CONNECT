import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, MapPin, Building2, Briefcase, GraduationCap, X, Sparkles, CheckCircle2, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { StaggerContainer, StaggerItem } from '../components/animations/StaggerContainer';
import { triggerConfetti } from '../components/animations/Confetti';
import SEO from '../components/SEO';

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ type: '', domain: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', company: '', domain: '', location: '', stipend: '', deadline: '', type: 'internship' });

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.type) params.append('type', filter.type);
      if (filter.domain) params.append('domain', filter.domain);
      const res = await api.get(`/jobs?${params.toString()}`);
      setJobs(res.data.data);
    } catch { toast.error('Failed to load opportunities'); }
    setLoading(false);
  };

  const createJob = async (e) => {
    e.preventDefault();
    try {
      await api.post('/jobs', form);
      triggerConfetti({ particleCount: 75, spread: 65 });
      toast.success('Opportunity posted successfully!');
      setShowCreate(false);
      setForm({ title: '', description: '', company: '', domain: '', location: '', stipend: '', deadline: '', type: 'internship' });
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post opportunity');
    }
  };

  const applyToJob = async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/apply`);
      triggerConfetti({ particleCount: 80, spread: 70 });
      toast.success('Application submitted successfully!');
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application');
    }
  };

  const filtered = jobs.filter((j) => j.title.toLowerCase().includes(search.toLowerCase()) || j.company?.toLowerCase().includes(search.toLowerCase()) || j.domain?.toLowerCase().includes(search.toLowerCase()));
  const canPostJob = ['faculty', 'hod', 'admin', 'leader'].includes(user?.role);

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      <SEO title="Career Opportunities & Campus Placement Drives" description="Explore software engineering internships, core placement drives, and research fellowships for MKCE engineering students." keywords="MKCE Placements, Engineering Jobs Karur, College Internships Tamil Nadu, Campus Placement Drives" canonical="/jobs" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-blue"><Sparkles size={11} className="mr-1" />Career & Placement Cell</span>
          </div>
          <h1 className="page-heading">Opportunities & Internships</h1>
          <p className="text-surface-500 text-sm mt-1">Browse verified campus placement drives, summer internships, and research roles.</p>
        </div>
        {canPostJob && (
          <button onClick={() => setShowCreate(true)} className="btn-mkce flex items-center gap-2 self-start sm:self-auto shimmer-btn">
            <Plus size={18} /><span>Post Opportunity</span>
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="input-mkce pl-11 py-3" placeholder="Search roles, companies (e.g. Amazon, Zoho, Bosch)..." />
        </div>
        <select value={filter.type} onChange={(e) => setFilter({ ...filter, type: e.target.value })} className="input-mkce sm:w-44 cursor-pointer">
          <option value="">All Types</option>
          <option value="internship">Internships</option>
          <option value="job">Full-time Roles</option>
        </select>
      </div>

      {/* Post Modal */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
            <motion.div initial={{ opacity: 0, scale: 0.97, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 20 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-3xl w-full max-w-lg overflow-hidden" style={{ boxShadow: '0 24px 64px -12px rgba(0,0,0,0.2)' }}>
              <div className="p-6 border-b border-surface-100 text-white flex items-center justify-between"
                style={{ background: 'linear-gradient(135deg, #09203f 0%, #073f69 50%, #06A3DA 100%)' }}>
                <div>
                  <h2 className="font-display font-bold text-lg">Post Career Opportunity</h2>
                  <p className="text-xs text-mkce-200/80 mt-0.5">Publish job requirements or internship openings</p>
                </div>
                <button onClick={() => setShowCreate(false)} className="p-1 text-white/60 hover:text-white"><X size={20} /></button>
              </div>
              <form onSubmit={createJob} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto scrollbar-thin">
                <div>
                  <label className="block text-xs font-bold text-mkce-900 uppercase tracking-wider mb-2">Role Title</label>
                  <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="input-mkce" placeholder="e.g., Associate Software Engineer" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-mkce-900 uppercase tracking-wider mb-2">Company / Organization</label>
                  <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required className="input-mkce" placeholder="e.g. Zoho Corporation" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-mkce-900 uppercase tracking-wider mb-2">Domain</label>
                    <input type="text" value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} className="input-mkce" placeholder="e.g. AI / Web / Cloud" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-mkce-900 uppercase tracking-wider mb-2">Location</label>
                    <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input-mkce" placeholder="Chennai / Remote" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-mkce-900 uppercase tracking-wider mb-2">Stipend / Package</label>
                    <input type="text" value={form.stipend} onChange={(e) => setForm({ ...form, stipend: e.target.value })} className="input-mkce" placeholder="e.g. ₹25,000/mo or 8 LPA" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-mkce-900 uppercase tracking-wider mb-2">Type</label>
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-mkce cursor-pointer">
                      <option value="internship">Internship</option>
                      <option value="job">Full-time Job</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-mkce-900 uppercase tracking-wider mb-2">Description & Requirements</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required className="input-mkce resize-none" placeholder="Describe skill requirements, eligibility criteria, etc." rows={3} />
                </div>
                <div className="flex gap-3 pt-3">
                  <button type="submit" className="btn-mkce flex-1 py-3 text-sm">Publish Opportunity</button>
                  <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1 py-3 text-sm">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Jobs List */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="skeleton rounded-3xl h-40" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-premium p-12 text-center">
          <div className="w-16 h-16 bg-mkce-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-mkce-600">
            <Briefcase size={32} />
          </div>
          <h3 className="font-display font-bold text-mkce-900 text-lg">No Opportunities Found</h3>
          <p className="text-surface-500 text-sm mt-1">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <StaggerContainer className="space-y-4">
          {filtered.map((job) => {
            const hasApplied = job.applicants?.some((a) => a.user?._id === user?.id || a.user === user?.id || a?.user?.id === user?.id);
            return (
              <StaggerItem key={job._id}>
                <div className="card-premium p-6 sm:p-7">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-white"
                        style={{
                          background: job.type === 'internship' ? 'linear-gradient(135deg, #06A3DA 0%, #073f69 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          boxShadow: job.type === 'internship' ? '0 4px 12px rgba(6,163,218,0.25)' : '0 4px 12px rgba(16,185,129,0.25)',
                        }}>
                        {job.type === 'internship' ? <GraduationCap size={26} /> : <Briefcase size={26} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="font-display font-extrabold text-lg sm:text-xl text-mkce-900">{job.title}</h3>
                          <span className={`badge-mkce ${job.type === 'internship' ? 'badge-blue' : 'badge-green'}`}>
                            {job.type === 'internship' ? 'Internship' : 'Full-Time'}
                          </span>
                          {job.domain && <span className="badge-gold">{job.domain}</span>}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs sm:text-sm text-surface-500 flex-wrap">
                          {job.company && (
                            <span className="flex items-center gap-1.5 font-semibold text-mkce-800">
                              <Building2 size={15} className="text-mkce-500" />{job.company}
                            </span>
                          )}
                          {job.location && (
                            <span className="flex items-center gap-1.5 font-medium">
                              <MapPin size={14} className="text-amber-500" />{job.location}
                            </span>
                          )}
                          {job.stipend && (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/80 text-xs">{job.stipend}</span>
                          )}
                        </div>
                        <p className="text-surface-600 text-xs sm:text-sm mt-3 leading-relaxed">{job.description}</p>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-surface-100/60 flex-shrink-0">
                      <span className="text-xs text-surface-400 font-medium">{job.applicants?.length || 0} Applicants</span>
                      {hasApplied ? (
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200/80">
                          <CheckCircle2 size={15} />Applied
                        </span>
                      ) : (
                        <button onClick={() => applyToJob(job._id)} className="btn-mkce text-xs px-6 py-2.5 font-bold">
                          <span>Quick Apply</span><Send size={13} />
                        </button>
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
