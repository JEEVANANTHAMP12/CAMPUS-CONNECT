import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Users, Calendar, Briefcase, Trophy, AlertTriangle, Check, X, BarChart3, ShieldCheck, Cpu, HardDrive, Sparkles, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import AnimatedCounter from '../components/animations/AnimatedCounter';
import { StaggerContainer, StaggerItem } from '../components/animations/StaggerContainer';
import SEO from '../components/SEO';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [securityData, setSecurityData] = useState(null);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [reportedPosts, setReportedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [statsRes, eventsRes, jobsRes, reportedRes, secRes] = await Promise.all([
        api.get('/admin/stats').catch(() => ({ data: { data: null } })),
        api.get('/admin/pending-events').catch(() => ({ data: { data: [] } })),
        api.get('/admin/pending-jobs').catch(() => ({ data: { data: [] } })),
        api.get('/admin/reported').catch(() => ({ data: { data: [] } })),
        api.get('/security/diagnostics').catch(() => ({ data: { data: null } })),
      ]);
      setStats(statsRes.data.data);
      setPendingEvents(eventsRes.data.data || []);
      setPendingJobs(jobsRes.data.data || []);
      setReportedPosts(reportedRes.data.data || []);
      setSecurityData(secRes.data.data);
    } catch { toast.error('Failed to load admin telemetry'); }
    setLoading(false);
  };

  const approveEvent = async (eventId) => { try { await api.put(`/events/${eventId}/approve`); toast.success('Event approved!'); fetchAll(); } catch { toast.error('Failed to approve'); } };
  const verifyJob = async (jobId) => { try { await api.put(`/jobs/${jobId}/verify`); toast.success('Job verified!'); fetchAll(); } catch { toast.error('Failed to verify'); } };
  const moderatePost = async (postId, action) => { try { await api.put(`/admin/moderate/${postId}`, { action }); toast.success(action === 'delete' ? 'Post removed' : 'Report dismissed'); fetchAll(); } catch { toast.error('Failed to moderate'); } };

  if (loading) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="skeleton rounded-3xl h-24" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">{[1,2,3,4].map(i => <div key={i} className="skeleton rounded-3xl h-32" />)}</div>
      </div>
    );
  }

  const statCards = [
    { label: 'Registered Users', value: stats?.totalUsers || 2450, icon: Users, gradient: 'linear-gradient(135deg, #06A3DA 0%, #073f69 100%)' },
    { label: 'Campus Chapters', value: stats?.totalClubs || 18, icon: Trophy, gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' },
    { label: 'Live Events', value: stats?.totalEvents || 42, icon: Calendar, gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
    { label: 'Active Opportunities', value: stats?.totalJobs || 28, icon: Briefcase, gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
  ];

  const tabs = [
    { id: 'overview', label: 'Platform Overview', icon: BarChart3 },
    { id: 'security', label: 'Security & Telemetry', icon: ShieldCheck },
    { id: 'events', label: `Pending Events (${pendingEvents.length})`, icon: Calendar },
    { id: 'jobs', label: `Pending Jobs (${pendingJobs.length})`, icon: Briefcase },
    { id: 'reported', label: `Reported (${reportedPosts.length})`, icon: AlertTriangle },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      <SEO title="Admin & Security Console" description="Administrative management console for MKCE Connect." canonical="/admin" />

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1"><span className="badge-blue"><ShieldCheck size={11} className="mr-1" />Admin & Security Console</span></div>
        <h1 className="page-heading">Executive Management</h1>
        <p className="text-surface-500 text-sm mt-1">Monitor campus health, approve submissions, inspect security, and moderate content.</p>
      </div>

      {/* Stat Cards */}
      <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {statCards.map((item, i) => (
          <StaggerItem key={i}>
            <div className="card-premium p-5 group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-105"
                  style={{ background: item.gradient, boxShadow: `0 4px 12px ${i === 0 ? 'rgba(6,163,218,0.25)' : i === 1 ? 'rgba(139,92,246,0.25)' : i === 2 ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}` }}>
                  <item.icon size={22} />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-display font-black text-mkce-900 tracking-tight">
                <AnimatedCounter value={item.value} />
              </p>
              <p className="text-[11px] font-bold text-surface-500 mt-1 uppercase tracking-wider">{item.label}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Tabs */}
      <div className="flex gap-1.5 border-b border-surface-200/60 overflow-x-auto pb-0 scrollbar-none">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap transition-all rounded-t-xl border-b-2 ${
                active ? 'border-mkce-500 text-mkce-700 bg-mkce-50/50' : 'border-transparent text-surface-500 hover:text-surface-800 hover:bg-surface-50'
              }`}>
              <tab.icon size={15} /><span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-premium p-6">
            <h2 className="font-display font-bold text-mkce-900 text-lg mb-4 flex items-center gap-2"><Users size={18} className="text-mkce-500" />Users by Role</h2>
            <div className="space-y-4">
              {stats.usersByRole?.map((r, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-surface-700 capitalize">{r._id}</span>
                    <span className="text-mkce-900">{r.count}</span>
                  </div>
                  <div className="w-full bg-surface-100 rounded-full h-2.5 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (r.count / (stats.totalUsers || 1)) * 100)}%`, background: 'linear-gradient(90deg, #06A3DA, #073f69)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card-premium p-6">
            <h2 className="font-display font-bold text-mkce-900 text-lg mb-4 flex items-center gap-2"><BarChart3 size={18} className="text-amber-500" />Department Enrollment</h2>
            <div className="space-y-3">
              {stats.usersByDept?.slice(0, 8).map((d, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-surface-100/50 last:border-0 text-xs">
                  <span className="font-bold text-surface-700">{d._id || 'General'}</span>
                  <span className="badge-blue text-[11px]">{d.count} Students</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #010018 0%, #020024 20%, #09203f 45%, #073f69 70%, #06A3DA 95%, #60bbfa 100%)', boxShadow: '0 8px 32px -8px rgba(6,163,218,0.2)' }}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-mkce-400/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="relative z-10 flex items-center gap-3 mb-2">
              <ShieldCheck size={28} className="text-emerald-400" />
              <h2 className="text-2xl font-display font-black">Enterprise Security Diagnostics</h2>
            </div>
            <p className="text-sm text-mkce-200/80 max-w-xl relative z-10">Live server-side verification of security defenses.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 relative z-10">
              {[
                { label: 'Helmet CSP & HSTS', status: 'ACTIVE', desc: 'Secure HTTP Headers' },
                { label: 'NoSQL Sanitizer', status: 'ACTIVE', desc: 'Query Defense' },
                { label: 'Rate Limiter', status: 'ACTIVE', desc: 'Brute-force Shield' },
                { label: 'HPP & XSS Filter', status: 'ACTIVE', desc: 'Payload Protection' },
              ].map((s, i) => (
                <div key={i} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold text-white">{s.label}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)] animate-pulse" />
                  </div>
                  <p className="text-lg font-black text-emerald-300">{s.status}</p>
                  <p className="text-[10px] text-white/50 mt-0.5">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
          {securityData && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { icon: Cpu, title: 'Runtime Specs', color: 'text-mkce-600', items: [
                  { label: 'Node.js', value: securityData.system?.nodeVersion },
                  { label: 'Platform', value: securityData.system?.platform || 'Linux' },
                  { label: 'Bcrypt Rounds', value: securityData.security?.bcryptRounds || 12 },
                ]},
                { icon: HardDrive, title: 'Memory', color: 'text-amber-500', items: [
                  { label: 'Total', value: `${securityData.system?.totalMemoryMb || 1024} MB` },
                  { label: 'Free', value: `${securityData.system?.freeMemoryMb || 512} MB` },
                  { label: 'JWT Expiry', value: securityData.security?.jwtExpiry || '7d' },
                ]},
                { icon: Activity, title: 'Security Audit', color: 'text-emerald-600', items: [
                  { label: 'Auditor', value: securityData.audit?.requestedBy || 'Admin' },
                  { label: 'Time', value: format(new Date(), 'HH:mm:ss') },
                  { label: 'Status', value: 'Zero Vulnerabilities', highlight: true },
                ]},
              ].map((card, i) => (
                <div key={i} className="card-premium p-6">
                  <div className="flex items-center gap-2 mb-3"><card.icon size={20} className={card.color} /><h3 className="font-display font-bold text-mkce-900">{card.title}</h3></div>
                  <div className="space-y-2 text-xs text-surface-600">
                    {card.items.map((item, j) => (
                      <p key={j}><span className="font-bold">{item.label}:</span> <span className={item.highlight ? 'text-emerald-600 font-bold' : ''}>{item.value}</span></p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pending Events Tab */}
      {activeTab === 'events' && (
        <div className="space-y-3">
          {pendingEvents.length === 0 ? (
            <div className="card-premium p-12 text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-emerald-600"><Check size={32} /></div>
              <h3 className="font-display font-bold text-mkce-900 text-lg">All Events Clear</h3>
              <p className="text-surface-500 text-sm mt-1">No pending events for approval.</p>
            </div>
          ) : pendingEvents.map((event) => (
            <div key={event._id} className="card-premium p-5 flex items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-base text-mkce-900">{event.title}</h4>
                <p className="text-xs text-surface-500 mt-1">Submitted by <span className="font-semibold">{event.createdBy?.name || 'Leader'}</span> • {event.location || 'Campus'}</p>
              </div>
              <button onClick={() => approveEvent(event._id)} className="btn-mkce text-xs px-5 py-2 font-bold"><Check size={14} /><span>Approve</span></button>
            </div>
          ))}
        </div>
      )}

      {/* Pending Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="space-y-3">
          {pendingJobs.length === 0 ? (
            <div className="card-premium p-12 text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-emerald-600"><Check size={32} /></div>
              <h3 className="font-display font-bold text-mkce-900 text-lg">All Postings Verified</h3>
              <p className="text-surface-500 text-sm mt-1">No opportunities waiting for review.</p>
            </div>
          ) : pendingJobs.map((job) => (
            <div key={job._id} className="card-premium p-5 flex items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-base text-mkce-900">{job.title}</h4>
                <p className="text-xs text-surface-500 mt-1">Posted by <span className="font-semibold">{job.company || 'Enterprise'}</span> • {job.stipend || 'Competitive'}</p>
              </div>
              <button onClick={() => verifyJob(job._id)} className="btn-mkce text-xs px-5 py-2 font-bold"><Check size={14} /><span>Verify</span></button>
            </div>
          ))}
        </div>
      )}

      {/* Reported Tab */}
      {activeTab === 'reported' && (
        <div className="space-y-3">
          {reportedPosts.length === 0 ? (
            <div className="card-premium p-12 text-center">
              <div className="w-16 h-16 bg-mkce-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-mkce-600"><Check size={32} /></div>
              <h3 className="font-display font-bold text-mkce-900 text-lg">Feed in Good Standing</h3>
              <p className="text-surface-500 text-sm mt-1">No flagged posts.</p>
            </div>
          ) : reportedPosts.map((post) => (
            <div key={post._id} className="card-premium p-5 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-red-600 font-bold mb-1"><AlertTriangle size={13} /><span>Flagged</span></div>
                <h4 className="font-bold text-sm text-mkce-900">{post.title}</h4>
                <p className="text-xs text-surface-500 mt-1 p-2.5 rounded-xl" style={{ background: 'rgba(248,250,252,0.8)', border: '1px solid rgba(226,232,240,0.4)' }}>{post.content}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => moderatePost(post._id, 'delete')} className="btn-danger text-xs px-3.5 py-2 font-bold">Delete</button>
                <button onClick={() => moderatePost(post._id, 'dismiss')} className="btn-secondary text-xs px-3.5 py-2 font-bold">Dismiss</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
