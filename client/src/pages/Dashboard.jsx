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
    <div className="space-y-8 max-w-7xl mx-auto font-sans text-zinc-900">
      <SEO
        title="Campus Hub & Dashboard"
        description="Access MKCE Connect dashboard for live student clubs, upcoming technical symposiums, career placement opportunities, and verified college achievements at M. Kumarasamy College of Engineering."
        keywords="MKCE Connect, MKCE Dashboard, M. Kumarasamy College of Engineering, Student Portal, Engineering Events, Placement Drives Karur"
        canonical="/"
      />

      {/* ==================== PREMIUM HERO BANNER IN SOLID BLACK ==================== */}
      <div
        className="rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden bg-black border border-zinc-800 shadow-xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-zinc-800/30 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4 bg-zinc-900 border border-zinc-700 text-zinc-200">
            <Sparkles size={13} className="text-amber-400" />
            <span>M. Kumarasamy College of Engineering Digital Campus</span>
          </div>

          <p className="text-zinc-400 text-sm font-semibold">{getGreeting()},</p>
          <h1 className="text-2xl sm:text-4xl font-display font-black tracking-tight mt-1 mb-3 leading-tight text-white">
            {user?.name || 'Engineer'}!
          </h1>
          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed mb-7 max-w-xl font-normal">
            Welcome to your unified campus portal &mdash; connect with student chapters, participate in upcoming technical events, discover career placements, and showcase achievements.
          </p>

          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-zinc-900 border border-zinc-700 text-white">
              <Award size={13} className="text-amber-400" />
              {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student'}
            </span>
            {user?.department && (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-zinc-900 border border-zinc-700 text-sky-300">
                {user.department}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-zinc-900 border border-zinc-700 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-xs animate-pulse" />
              System Online
            </span>
          </div>
        </div>
      </div>

      {/* ==================== METRICS GRID ==================== */}
      {stats && (
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {[
            { label: 'Active Students', value: stats.totalUsers || 2450, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
            { label: 'Student Chapters', value: stats.totalClubs || 18, icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
            { label: 'Live Events', value: stats.totalEvents || 42, icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
            { label: 'Opportunities', value: stats.totalJobs || 28, icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
          ].map((item, i) => (
            <StaggerItem key={i}>
              <div className="card-premium p-5 group cursor-default">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs transition-all duration-200 group-hover:scale-105 ${item.bg}`}
                  >
                    <item.icon size={22} className={item.color} />
                  </div>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-black group-hover:bg-zinc-100 transition-all duration-200">
                    <ArrowUpRight size={15} />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-display font-black text-black tracking-tight leading-none">
                  <AnimatedCounter value={item.value} />
                </p>
                <p className="text-[11px] font-bold text-zinc-500 mt-1.5 uppercase tracking-wider">{item.label}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      {/* ==================== QUICK ACTIONS IN HIGH CONTRAST ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { to: '/clubs', icon: Users, title: 'Student Chapters', desc: 'Join engineering clubs, technical symposiums, and project groups' },
          { to: '/jobs', icon: Briefcase, title: 'Career Opportunities', desc: 'Browse verified campus internships, placements, and research projects' },
          { to: '/discussions', icon: TrendingUp, title: 'Peer Forum', desc: 'Collaborate with departmental peers and exchange technical insights' },
        ].map((item, i) => (
          <Link
            key={i}
            to={item.to}
            className="block rounded-3xl p-6 text-white bg-black border border-zinc-800 shadow-md relative overflow-hidden group h-full transition-all duration-200 hover:-translate-y-1 hover:border-zinc-700"
          >
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4 bg-zinc-900 border border-zinc-700 text-white transition-all duration-200 group-hover:scale-105">
                  <item.icon size={20} />
                </div>
                <h3 className="font-display font-black text-lg tracking-tight text-white">{item.title}</h3>
                <p className="text-zinc-400 text-xs sm:text-sm mt-1.5 leading-relaxed font-medium">{item.desc}</p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-zinc-300 mt-4 group-hover:translate-x-1 transition-transform duration-200">
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
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                <Calendar size={18} />
              </div>
              <h2 className="font-display font-bold text-black text-lg">Upcoming Events</h2>
            </div>
            <Link to="/events" className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 group transition-colors">
              View All <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
          <div className="divide-y divide-zinc-100 flex-1">
            {recentEvents.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center justify-center h-full">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 mb-2.5">
                  <Calendar size={22} />
                </div>
                <p className="text-zinc-800 text-sm font-semibold">No upcoming events</p>
                <p className="text-zinc-400 text-xs mt-0.5">Check back later or propose a new event!</p>
              </div>
            ) : (
              recentEvents.map((event) => (
                <Link to="/events" key={event._id} className="flex items-center gap-4 py-3.5 hover:bg-zinc-50 px-2 rounded-xl transition-colors group">
                  <div
                    className="w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 text-white font-display bg-black border border-zinc-800 group-hover:scale-105 transition-transform shadow-xs"
                  >
                    <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-400">{formatDateSafely(event.date, 'MMM')}</span>
                    <span className="text-sm font-black leading-none text-white">{formatDateSafely(event.date, 'dd')}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-zinc-900 truncate group-hover:text-black transition-colors">{event.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                      <span className="flex items-center gap-1 text-zinc-600 font-medium">
                        <Clock size={11} className="text-blue-500" />
                        {formatDateSafely(event.date, 'h:mm a')}
                      </span>
                      {event.location && <span className="truncate max-w-[140px] text-zinc-500">• {event.location}</span>}
                    </div>
                  </div>
                  <ArrowUpRight size={15} className="text-zinc-400 group-hover:text-black transition-colors shrink-0" />
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Achievements */}
        <div className="card-premium p-6 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
                <Trophy size={18} />
              </div>
              <h2 className="font-display font-bold text-black text-lg">Recent Hall of Fame</h2>
            </div>
            <Link to="/achievements" className="text-xs font-bold text-amber-700 hover:text-amber-900 hover:underline flex items-center gap-1 group transition-colors">
              View All <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
          <div className="divide-y divide-zinc-100 flex-1">
            {recentAchievements.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center justify-center h-full">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 mb-2.5">
                  <Trophy size={22} />
                </div>
                <p className="text-zinc-800 text-sm font-semibold">No achievements posted yet</p>
                <p className="text-zinc-400 text-xs mt-0.5">Be the first to share a milestone!</p>
              </div>
            ) : (
              recentAchievements.map((a) => (
                <div key={a._id} className="py-3.5 hover:bg-zinc-50 px-2 rounded-xl transition-colors group">
                  <div className="flex items-start gap-3.5">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-amber-600 bg-amber-50 border border-amber-200 group-hover:scale-105 transition-transform shadow-xs"
                    >
                      <Trophy size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-zinc-900 truncate">{a.title}</h3>
                      <p className="text-xs text-zinc-500 mt-0.5">by <span className="font-bold text-black">{a.user?.name || 'Student'}</span></p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs font-semibold">
                        <span className="text-rose-600 font-bold">{a.likes?.length || 0} Kudos</span>
                        <span className="text-zinc-300">•</span>
                        <span className="text-zinc-500">{a.comments?.length || 0} Comments</span>
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
