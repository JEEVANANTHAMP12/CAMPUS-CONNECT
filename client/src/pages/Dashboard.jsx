import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Calendar, Users, Briefcase, Trophy, TrendingUp, Clock, ArrowUpRight, Award } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [recentAchievements, setRecentAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [eventsRes, achievementsRes] = await Promise.all([
          api.get('/events?upcoming=true&limit=5'),
          api.get('/achievements?limit=5')
        ]);
        setRecentEvents(eventsRes.data.data);
        setRecentAchievements(achievementsRes.data.data);
        if (user?.role === 'admin' || user?.role === 'hod') {
          const statsRes = await api.get('/admin/stats');
          setStats(statsRes.data.data);
        }
      } catch (err) {}
      setLoading(false);
    };
    fetchDashboard();
  }, [user]);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-3 border-mkce-200 border-t-mkce-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* MKCE Welcome Banner */}
      <div className="rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #020024 0%, #09203f 40%, #073f69 70%, #06A3DA 100%)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div className="relative z-10">
          <p className="text-mkce-200/80 text-sm font-medium mb-1">{getGreeting()},</p>
          <h1 className="text-2xl lg:text-3xl font-display font-bold mb-1">
            {user?.name}!
          </h1>
          <p className="text-mkce-200/60 text-sm mb-4">Welcome to MKCE Connect &mdash; Your campus digital hub</p>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold">
              <Award size={12} className="text-gold" />
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            </span>
            {user?.department && (
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold">
                {user.department}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* MKCE Stat Counters */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Students', value: stats.totalUsers, icon: Users, bg: 'linear-gradient(135deg, #06A3DA 0%, #073f69 100%)' },
            { label: 'Active Clubs', value: stats.totalClubs, icon: Users, bg: 'linear-gradient(135deg, #14895e 0%, #0b5a3c 100%)' },
            { label: 'Events', value: stats.totalEvents, icon: Calendar, bg: 'linear-gradient(135deg, #f7ce58 0%, #d89a06 100%)' },
            { label: 'Opportunities', value: stats.totalJobs, icon: Briefcase, bg: 'linear-gradient(135deg, #8338ec 0%, #5a189a 100%)' }
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-surface-200/80 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: item.bg }}>
                  <item.icon size={20} className="text-white" />
                </div>
                <ArrowUpRight size={16} className="text-surface-300 group-hover:text-mkce-500 transition-colors" />
              </div>
              <p className="text-2xl font-bold text-mkce-800">{item.value}</p>
              <p className="text-xs text-surface-500 font-medium mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { to: '/clubs', icon: Users, title: 'Explore Clubs', desc: 'Discover and join campus clubs', bg: 'linear-gradient(135deg, #073f69 0%, #06A3DA 100%)' },
          { to: '/jobs', icon: Briefcase, title: 'Find Opportunities', desc: 'Browse internships & jobs', bg: 'linear-gradient(135deg, #0b5a3c 0%, #14895e 100%)' },
          { to: '/discussions', icon: TrendingUp, title: 'Join Discussions', desc: 'Share ideas with peers', bg: 'linear-gradient(135deg, #d89a06 0%, #f7ce58 100%)' }
        ].map((item, i) => (
          <Link key={i} to={item.to}
            className="rounded-xl p-5 text-white hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group relative overflow-hidden"
            style={{ background: item.bg }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <item.icon size={20} />
              </div>
              <h3 className="font-display font-bold text-lg">{item.title}</h3>
              <p className="text-white/70 text-sm mt-1">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Events & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-surface-200/80 shadow-card">
          <div className="p-5 border-b border-surface-100 flex items-center justify-between">
            <h2 className="font-display font-bold text-mkce-800 flex items-center gap-2">
              <Calendar size={18} className="text-mkce-500" />
              Upcoming Events
            </h2>
            <Link to="/events" className="text-xs font-semibold text-mkce-600 hover:text-mkce-700 flex items-center gap-1">
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-surface-100">
            {recentEvents.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar size={32} className="mx-auto text-surface-300 mb-2" />
                <p className="text-surface-400 text-sm">No upcoming events</p>
              </div>
            ) : recentEvents.map(event => (
              <Link to="/events" key={event._id}
                className="flex items-center gap-4 p-4 hover:bg-surface-50 transition-colors group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #06A3DA 0%, #073f69 100%)' }}>
                  <Calendar size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-mkce-800 truncate group-hover:text-mkce-600 transition-colors">{event.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-surface-400">
                      <Clock size={12} />
                      {format(new Date(event.date), 'MMM d, h:mm a')}
                    </span>
                    {event.location && <span className="text-xs text-surface-400">{event.location}</span>}
                  </div>
                </div>
                <ArrowUpRight size={16} className="text-surface-300 group-hover:text-mkce-500 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-surface-200/80 shadow-card">
          <div className="p-5 border-b border-surface-100 flex items-center justify-between">
            <h2 className="font-display font-bold text-mkce-800 flex items-center gap-2">
              <Trophy size={18} className="text-gold-mid" />
              Recent Achievements
            </h2>
            <Link to="/achievements" className="text-xs font-semibold text-mkce-600 hover:text-mkce-700 flex items-center gap-1">
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-surface-100">
            {recentAchievements.length === 0 ? (
              <div className="p-8 text-center">
                <Trophy size={32} className="mx-auto text-surface-300 mb-2" />
                <p className="text-surface-400 text-sm">No achievements yet</p>
              </div>
            ) : recentAchievements.map(a => (
              <div key={a._id} className="p-4 hover:bg-surface-50 transition-colors group">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #f7ce58 0%, #d89a06 100%)' }}>
                    <Trophy size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-mkce-800 truncate">{a.title}</h3>
                    <p className="text-xs text-surface-500 mt-0.5">by {a.user?.name}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-surface-400">
                      <span>{a.likes?.length || 0} likes</span>
                      <span>{a.comments?.length || 0} comments</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
