import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  Calendar, Users, Briefcase, Trophy, TrendingUp, Clock,
  ArrowUpRight, Award, Sparkles, Zap, ShieldCheck, ChevronRight,
  BookOpen, Rocket, CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import AnimatedCounter from '../components/animations/AnimatedCounter';
import { StaggerContainer, StaggerItem } from '../components/animations/StaggerContainer';
import SEO from '../components/SEO';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [recentAchievements, setRecentAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [eventsRes, achievementsRes, statsRes] = await Promise.all([
          api.get('/events?upcoming=true&limit=5'),
          api.get('/achievements?limit=5'),
          api.get('/admin/stats').catch(() => null),
        ]);
        setRecentEvents(eventsRes.data.data || []);
        setRecentAchievements(achievementsRes.data.data || []);
        if (statsRes?.data?.data) {
          setStats(statsRes.data.data);
        } else {
          setStats({ totalUsers: 2450, totalClubs: 18, totalEvents: 42, totalJobs: 28 });
        }
      } catch (err) {
        setStats({ totalUsers: 2450, totalClubs: 18, totalEvents: 42, totalJobs: 28 });
      }
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

  const formatDateSafely = (dateString, formatPattern = 'MMM dd') => {
    try { return format(new Date(dateString), formatPattern); } catch { return ''; }
  };

  if (loading) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Skeleton Hero */}
        <div className="skeleton rounded-3xl h-56 sm:h-64" />
        {/* Skeleton Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1,2,3,4].map(i => <div key={i} className="skeleton rounded-2xl h-32" />)}
        </div>
        {/* Skeleton Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[1,2,3].map(i => <div key={i} className="skeleton rounded-2xl h-40" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      <SEO
        title="Campus Hub & Dashboard"
        description="Access MKCE Connect dashboard for live student clubs, upcoming technical symposiums, career placement opportunities, and verified college achievements at M. Kumarasamy College of Engineering."
        keywords="MKCE Connect, MKCE Dashboard, M. Kumarasamy College of Engineering, Student Portal, Engineering Events, Placement Drives Karur"
        canonical="/"
      />

      {/* ==================== PREMIUM HERO BANNER ==================== */}
      <div
        className="rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #010018 0%, #020024 20%, #09203f 45%, #073f69 70%, #06A3DA 95%, #60bbfa 100%)',
          boxShadow: '0 8px 32px -8px rgba(6,163,218,0.2), 0 24px 48px -12px rgba(2,0,36,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Ambient glow orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-mkce-400/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gold/8 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-48 h-48 bg-mkce-500/10 rounded-full blur-[60px] pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(191,227,254,0.9)',
            }}>
            <Sparkles size={13} className="text-gold" />
            <span>M. Kumarasamy College of Engineering Digital Campus</span>
          </div>

          <p className="text-mkce-200/80 text-sm font-medium">{getGreeting()},</p>
          <h1 className="text-2xl sm:text-4xl font-display font-black tracking-tight mt-1 mb-3 leading-tight">
            {user?.name || 'Engineer'}!
          </h1>
          <p className="text-mkce-100/70 text-sm sm:text-base leading-relaxed mb-7 max-w-xl">
            Welcome to your unified campus portal &mdash; connect with student chapters, participate in upcoming technical events, discover career placements, and showcase achievements.
          </p>

          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
              style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Award size={13} className="text-gold" />
              {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student'}
            </span>
            {user?.department && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {user.department}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-300"
              style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              System Online
            </span>
          </div>
        </div>
      </div>

      {/* ==================== METRICS GRID ==================== */}
      {stats && (
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {[
            { label: 'Active Students', value: stats.totalUsers || 2450, icon: Users, gradient: 'from-mkce-500 to-mkce-700', iconBg: 'rgba(6,163,218,0.1)' },
            { label: 'Student Chapters', value: stats.totalClubs || 18, icon: Zap, gradient: 'from-emerald-500 to-emerald-700', iconBg: 'rgba(16,185,129,0.1)' },
            { label: 'Live Events', value: stats.totalEvents || 42, icon: Calendar, gradient: 'from-amber-400 to-amber-600', iconBg: 'rgba(245,158,11,0.1)' },
            { label: 'Opportunities', value: stats.totalJobs || 28, icon: Briefcase, gradient: 'from-purple-500 to-purple-700', iconBg: 'rgba(139,92,246,0.1)' },
          ].map((item, i) => (
            <StaggerItem key={i}>
              <div className="card-premium p-5 group cursor-default">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${item.gradient.includes('mkce') ? '#06A3DA, #073f69' : item.gradient.includes('emerald') ? '#10b981, #059669' : item.gradient.includes('amber') ? '#f59e0b, #d97706' : '#8b5cf6, #7c3aed'})`,
                      boxShadow: `0 4px 12px ${item.gradient.includes('mkce') ? 'rgba(6,163,218,0.25)' : item.gradient.includes('emerald') ? 'rgba(16,185,129,0.25)' : item.gradient.includes('amber') ? 'rgba(245,158,11,0.25)' : 'rgba(139,92,246,0.25)'}`,
                    }}
                  >
                    <item.icon size={22} className="text-white" />
                  </div>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-surface-400 group-hover:text-mkce-600 group-hover:bg-mkce-50/50 transition-all duration-200">
                    <ArrowUpRight size={15} />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-display font-black text-mkce-900 tracking-tight leading-none">
                  <AnimatedCounter value={item.value} />
                </p>
                <p className="text-[11px] font-bold text-surface-500 mt-1.5 uppercase tracking-wider">{item.label}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      {/* ==================== QUICK ACTIONS ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { to: '/clubs', icon: Users, title: 'Student Chapters', desc: 'Join engineering clubs, technical symposiums, and project groups', gradient: 'linear-gradient(135deg, #073f69 0%, #06A3DA 100%)' },
          { to: '/jobs', icon: Briefcase, title: 'Career Opportunities', desc: 'Browse verified campus internships, placements, and research projects', gradient: 'linear-gradient(135deg, #0b5a3c 0%, #10b981 100%)' },
          { to: '/discussions', icon: TrendingUp, title: 'Peer Forum', desc: 'Collaborate with departmental peers and exchange technical insights', gradient: 'linear-gradient(135deg, #92400e 0%, #f59e0b 100%)' },
        ].map((item, i) => (
          <Link
            key={i}
            to={item.to}
            className="block rounded-2xl p-6 text-white relative overflow-hidden group h-full transition-all duration-300 hover:-translate-y-1"
            style={{
              background: item.gradient,
              boxShadow: '0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/[0.06] rounded-full -translate-y-1/2 translate-x-1/2 blur-lg pointer-events-none" />
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
                  <item.icon size={22} />
                </div>
                <h3 className="font-display font-bold text-lg tracking-tight">{item.title}</h3>
                <p className="text-white/75 text-xs sm:text-sm mt-1.5 leading-relaxed">{item.desc}</p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-white/80 mt-4 group-hover:translate-x-1 transition-transform duration-200">
                <span>Enter Hub</span>
                <ChevronRight size={14} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ==================== FEEDS: EVENTS & ACHIEVEMENTS ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Events */}
        <div className="card-premium p-6 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-surface-100 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-mkce-50 flex items-center justify-center text-mkce-600">
                <Calendar size={18} />
              </div>
              <h2 className="font-display font-bold text-mkce-900 text-lg">Upcoming Events</h2>
            </div>
            <Link to="/events" className="text-xs font-bold text-mkce-600 hover:text-mkce-700 flex items-center gap-1 group transition-colors">
              View All <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
          <div className="divide-y divide-surface-100/60 flex-1">
            {recentEvents.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center justify-center h-full">
                <div className="w-12 h-12 rounded-2xl bg-surface-100 flex items-center justify-center text-surface-400 mb-2.5">
                  <Calendar size={22} />
                </div>
                <p className="text-surface-600 text-sm font-semibold">No upcoming events</p>
                <p className="text-surface-400 text-xs mt-0.5">Check back later or propose a new event!</p>
              </div>
            ) : (
              recentEvents.map((event) => (
                <Link to="/events" key={event._id} className="flex items-center gap-4 py-3.5 hover:bg-surface-50/60 px-2 rounded-xl transition-colors group">
                  <div
                    className="w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 text-white font-display group-hover:scale-105 transition-transform"
                    style={{
                      background: 'linear-gradient(135deg, #06A3DA 0%, #073f69 100%)',
                      boxShadow: '0 2px 8px rgba(6,163,218,0.2)',
                    }}
                  >
                    <span className="text-[9px] uppercase font-bold tracking-wider opacity-80">{formatDateSafely(event.date, 'MMM')}</span>
                    <span className="text-sm font-black leading-none">{formatDateSafely(event.date, 'dd')}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-mkce-900 truncate group-hover:text-mkce-600 transition-colors">{event.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-surface-500">
                      <span className="flex items-center gap-1">
                        <Clock size={11} className="text-surface-400" />
                        {formatDateSafely(event.date, 'h:mm a')}
                      </span>
                      {event.location && <span className="truncate max-w-[140px]">• {event.location}</span>}
                    </div>
                  </div>
                  <ArrowUpRight size={15} className="text-surface-300 group-hover:text-mkce-500 transition-colors shrink-0" />
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Achievements */}
        <div className="card-premium p-6 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-surface-100 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
                <Trophy size={18} />
              </div>
              <h2 className="font-display font-bold text-mkce-900 text-lg">Recent Hall of Fame</h2>
            </div>
            <Link to="/achievements" className="text-xs font-bold text-mkce-600 hover:text-mkce-700 flex items-center gap-1 group transition-colors">
              View All <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
          <div className="divide-y divide-surface-100/60 flex-1">
            {recentAchievements.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center justify-center h-full">
                <div className="w-12 h-12 rounded-2xl bg-surface-100 flex items-center justify-center text-surface-400 mb-2.5">
                  <Trophy size={22} />
                </div>
                <p className="text-surface-600 text-sm font-semibold">No achievements posted yet</p>
                <p className="text-surface-400 text-xs mt-0.5">Be the first to share a milestone!</p>
              </div>
            ) : (
              recentAchievements.map((a) => (
                <div key={a._id} className="py-3.5 hover:bg-surface-50/60 px-2 rounded-xl transition-colors group">
                  <div className="flex items-start gap-3.5">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white group-hover:scale-105 transition-transform"
                      style={{
                        background: 'linear-gradient(135deg, #f7ce58 0%, #d89a06 100%)',
                        boxShadow: '0 2px 8px rgba(216,154,6,0.25)',
                      }}
                    >
                      <Trophy size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-mkce-900 truncate">{a.title}</h3>
                      <p className="text-xs text-surface-500 mt-0.5">by <span className="font-semibold text-mkce-700">{a.user?.name || 'Student'}</span></p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-surface-400">
                        <span className="text-mkce-600 font-semibold">{a.likes?.length || 0} Kudos</span>
                        <span>•</span>
                        <span>{a.comments?.length || 0} Comments</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
