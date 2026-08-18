import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Users, Calendar, Briefcase, MessageSquare, Trophy, AlertTriangle, Check, X, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [reportedPosts, setReportedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [statsRes, eventsRes, jobsRes, reportedRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/pending-events'),
        api.get('/admin/pending-jobs'),
        api.get('/admin/reported')
      ]);
      setStats(statsRes.data.data);
      setPendingEvents(eventsRes.data.data);
      setPendingJobs(jobsRes.data.data);
      setReportedPosts(reportedRes.data.data);
    } catch (err) {
      toast.error('Failed to load admin data');
    }
    setLoading(false);
  };

  const approveEvent = async (eventId) => {
    try {
      await api.put(`/events/${eventId}/approve`);
      toast.success('Event approved!');
      fetchAll();
    } catch (err) {
      toast.error('Failed to approve event');
    }
  };

  const verifyJob = async (jobId) => {
    try {
      await api.put(`/jobs/${jobId}/verify`);
      toast.success('Job verified!');
      fetchAll();
    } catch (err) {
      toast.error('Failed to verify job');
    }
  };

  const moderatePost = async (postId, action) => {
    try {
      await api.put(`/admin/moderate/${postId}`, { action });
      toast.success(action === 'delete' ? 'Post deleted' : 'Report dismissed');
      fetchAll();
    } catch (err) {
      toast.error('Failed to moderate post');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-mkce-200 border-t-mkce-600 rounded-full animate-spin"></div>
          <p className="text-sm text-surface-400 font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Clubs',
      value: stats?.totalClubs || 0,
      icon: Trophy,
      color: 'from-purple-500 to-purple-600'
    },
    {
      label: 'Events',
      value: stats?.totalEvents || 0,
      icon: Calendar,
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      label: 'Jobs',
      value: stats?.totalJobs || 0,
      icon: Briefcase,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'events', label: `Pending Events (${pendingEvents.length})`, icon: Calendar },
    { id: 'jobs', label: `Pending Jobs (${pendingJobs.length})`, icon: Briefcase },
    { id: 'reported', label: `Reported (${reportedPosts.length})`, icon: AlertTriangle }
  ];

  const maxRoleCount = stats?.usersByRole?.length
    ? Math.max(...stats.usersByRole.map(r => r.count))
    : 1;

  const roleBarColors = [
    'bg-mkce-500',
    'bg-gold-500',
    'bg-emerald-500',
    'bg-purple-500',
    'bg-orange-500'
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="text-surface-500 mt-1">Platform overview and moderation</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {statCards.map((item, i) => (
          <div key={i} className="card p-4 lg:p-5 group hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                <item.icon size={18} className="text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-surface-900">{item.value}</p>
            <p className="text-xs text-surface-500 font-medium mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 border-b border-surface-200 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'text-mkce-600 border-b-2 border-mkce-600'
                : 'text-surface-400 hover:text-surface-600'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="p-5 border-b border-surface-100">
              <h2 className="section-title flex items-center gap-2">
                <Users size={18} className="text-mkce-500" />
                Users by Role
              </h2>
            </div>
            <div className="p-5 space-y-4">
              {stats.usersByRole?.map((r, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-surface-700 capitalize">{r._id}</span>
                    <span className="text-sm font-semibold text-surface-900">{r.count}</span>
                  </div>
                  <div className="w-full bg-surface-100 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${roleBarColors[i % roleBarColors.length]}`}
                      style={{ width: `${(r.count / maxRoleCount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {(!stats.usersByRole || stats.usersByRole.length === 0) && (
                <p className="text-sm text-surface-400 text-center py-4">No role data available</p>
              )}
            </div>
          </div>

          <div className="card">
            <div className="p-5 border-b border-surface-100">
              <h2 className="section-title flex items-center gap-2">
                <BarChart3 size={18} className="text-gold-500" />
                Users by Department
              </h2>
            </div>
            <div className="p-5 space-y-3">
              {stats.usersByDept?.slice(0, 8).map((d, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-surface-50 last:border-0"
                >
                  <span className="text-sm text-surface-700 font-medium">{d._id || 'N/A'}</span>
                  <span className="badge-primary text-xs">{d.count}</span>
                </div>
              ))}
              {(!stats.usersByDept || stats.usersByDept.length === 0) && (
                <p className="text-sm text-surface-400 text-center py-4">No department data available</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="space-y-3">
          {pendingEvents.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar size={32} className="text-emerald-500" />
              </div>
              <h3 className="section-title mb-2">All Clear</h3>
              <p className="text-surface-500">No pending events to review</p>
            </div>
          ) : (
            pendingEvents.map(event => (
              <div key={event._id} className="card p-4 flex items-center justify-between gap-4 hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar size={20} className="text-emerald-500" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-medium text-surface-900 truncate">{event.title}</h4>
                    <p className="text-sm text-surface-500">
                      By {event.createdBy?.name || 'Unknown'} &middot; Club: {event.club?.name || 'N/A'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => approveEvent(event._id)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors flex-shrink-0"
                >
                  <Check size={16} />
                  Approve
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="space-y-3">
          {pendingJobs.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Briefcase size={32} className="text-orange-500" />
              </div>
              <h3 className="section-title mb-2">All Clear</h3>
              <p className="text-surface-500">No pending jobs to verify</p>
            </div>
          ) : (
            pendingJobs.map(job => (
              <div key={job._id} className="card p-4 flex items-center justify-between gap-4 hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Briefcase size={20} className="text-orange-500" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-medium text-surface-900 truncate">{job.title}</h4>
                    <p className="text-sm text-surface-500">
                      By {job.postedBy?.name || 'Unknown'} &middot; {job.company || 'N/A'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => verifyJob(job._id)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors flex-shrink-0"
                >
                  <Check size={16} />
                  Verify
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'reported' && (
        <div className="space-y-3">
          {reportedPosts.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 bg-mkce-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={32} className="text-mkce-500" />
              </div>
              <h3 className="section-title mb-2">No Reports</h3>
              <p className="text-surface-500">No reported posts to moderate</p>
            </div>
          ) : (
            reportedPosts.map(post => (
              <div key={post._id} className="card p-5 hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
                      <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Reported</span>
                    </div>
                    <h4 className="font-medium text-surface-900">{post.title}</h4>
                    <p className="text-sm text-surface-500 mt-1">
                      By {post.author?.name || 'Unknown'} &middot; Reported by {post.reportedBy?.name || 'Unknown'}
                    </p>
                    {post.content && (
                      <p className="text-sm text-surface-600 mt-2 line-clamp-2 bg-surface-50 rounded-lg p-3">
                        {post.content}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => moderatePost(post._id, 'delete')}
                      className="btn-danger text-sm px-3 py-2 flex items-center gap-1.5"
                    >
                      <X size={14} />
                      Delete
                    </button>
                    <button
                      onClick={() => moderatePost(post._id, 'dismiss')}
                      className="btn-secondary text-sm px-3 py-2 flex items-center gap-1.5"
                    >
                      <Check size={14} />
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
