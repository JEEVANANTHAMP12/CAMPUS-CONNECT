import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Home, Users, Calendar, MessageSquare, Briefcase, Trophy,
  MessageCircle, Shield, Bell, Menu, X, LogOut, Search,
  Zap, CheckCircle, Sparkles, ShieldCheck, GraduationCap,
  ChevronRight, Command, User as UserIcon, PlusCircle, Check
} from 'lucide-react';
import api from '../utils/api';
import socket from '../utils/socket';
import PageTransition from './animations/PageTransition';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      socket.connect();
      socket.emit('user-online', user.id);
      fetchNotifications();
    }
    return () => socket.disconnect();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowNotifications(false);
        setShowUserMenu(false);
        setSearchOpen(false);
        setSidebarOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 80);
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleNotification = (data) => {
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };
    socket.on('notification', handleNotification);
    return () => socket.off('notification', handleNotification);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
    setShowNotifications(false);
    setShowUserMenu(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {}
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {}
  };

  const handleNotificationClick = (n) => {
    setShowNotifications(false);
    if (n.type === 'event') navigate('/events');
    else if (n.type === 'job') navigate('/jobs');
    else if (n.type === 'achievement') navigate('/achievements');
    else if (n.type === 'message') navigate('/messages');
    else if (n.type === 'admin') navigate('/admin');
    else if (n.type === 'club') navigate('/clubs');
    else navigate('/');
  };

  const getRoleInfo = (role) => {
    switch (role) {
      case 'admin':
        return {
          label: 'Super Admin', badge: 'Admin', icon: Shield,
          color: 'from-rose-500/20 to-red-500/10 text-rose-300 border-rose-500/30',
          chipBg: 'bg-rose-50 border-rose-200 text-rose-700',
        };
      case 'hod':
        return {
          label: `HOD (${user?.department || 'Dept'})`, badge: 'HOD', icon: ShieldCheck,
          color: 'from-amber-500/20 to-yellow-500/10 text-amber-300 border-amber-500/30',
          chipBg: 'bg-amber-50 border-amber-200 text-amber-700',
        };
      case 'faculty':
        return {
          label: `Faculty (${user?.department || 'Dept'})`, badge: 'Faculty', icon: GraduationCap,
          color: 'from-indigo-500/20 to-purple-500/10 text-indigo-300 border-indigo-500/30',
          chipBg: 'bg-indigo-50 border-indigo-200 text-indigo-700',
        };
      case 'leader':
        return {
          label: 'Club Leader', badge: 'Lead', icon: Sparkles,
          color: 'from-emerald-500/20 to-green-500/10 text-emerald-300 border-emerald-500/30',
          chipBg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
        };
      case 'sub_leader':
        return {
          label: 'Club Sub-Leader', badge: 'Sub-Lead', icon: Zap,
          color: 'from-teal-500/20 to-cyan-500/10 text-teal-300 border-teal-500/30',
          chipBg: 'bg-teal-50 border-teal-200 text-teal-700',
        };
      case 'student':
      default:
        return {
          label: `Student (${user?.year ? `Year ${user.year}` : 'Student'})`, badge: 'Student', icon: Users,
          color: 'from-mkce-500/20 to-cyan-500/10 text-mkce-300 border-mkce-500/30',
          chipBg: 'bg-mkce-50 border-mkce-200 text-mkce-700',
        };
    }
  };

  const roleInfo = getRoleInfo(user?.role);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home, description: 'Campus feeds & overview' },
    { path: '/clubs', label: 'Student Clubs', icon: Users, description: 'Explore campus chapters' },
    { path: '/events', label: 'Campus Events', icon: Calendar, description: 'Symposiums & hackathons' },
    { path: '/discussions', label: 'Discussion Board', icon: MessageSquare, description: 'Peer & faculty forum' },
    { path: '/jobs', label: 'Opportunities', icon: Briefcase, description: 'Internships & placements' },
    { path: '/achievements', label: 'Wall of Fame', icon: Trophy, description: 'Campus achievements & badges' },
    { path: '/messages', label: 'Messages', icon: MessageCircle, description: 'Direct & club channels' },
  ];

  const getRoleNavItems = () => {
    if (user?.role === 'admin' || user?.role === 'hod') {
      return {
        title: 'Administration', icon: ShieldCheck,
        items: [{ path: '/admin', label: 'Admin Center', icon: Shield, badge: 'Full Access' }],
      };
    }
    if (user?.role === 'faculty') {
      return {
        title: 'Faculty Hub', icon: GraduationCap,
        items: [
          { path: '/jobs', label: 'Post Placement', icon: PlusCircle, badge: 'Faculty' },
          { path: '/discussions', label: 'Dept Notices', icon: MessageSquare, badge: 'Post' },
        ],
      };
    }
    if (user?.role === 'leader' || user?.role === 'sub_leader') {
      return {
        title: 'Club Leadership', icon: Sparkles,
        items: [
          { path: '/clubs', label: 'My Club Hub', icon: Users, badge: 'Manage' },
          { path: '/events', label: 'Host Event', icon: Calendar, badge: 'Create' },
        ],
      };
    }
    return {
      title: 'Student Hub', icon: Users,
      items: [
        { path: '/profile', label: 'My Portfolio', icon: UserIcon, badge: 'Portfolio' },
        { path: '/achievements', label: 'Submit Achievement', icon: Trophy, badge: 'Showcase' },
      ],
    };
  };

  const roleNav = getRoleNavItems();
  const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const searchablePages = [
    { title: 'Dashboard', path: '/', category: 'General', icon: Home },
    { title: 'Student Clubs & Chapters', path: '/clubs', category: 'Clubs', icon: Users },
    { title: 'Upcoming Events & Hackathons', path: '/events', category: 'Events', icon: Calendar },
    { title: 'Discussion Boards', path: '/discussions', category: 'Community', icon: MessageSquare },
    { title: 'Jobs & Internships', path: '/jobs', category: 'Careers', icon: Briefcase },
    { title: 'Achievements & Badges', path: '/achievements', category: 'Achievements', icon: Trophy },
    { title: 'Direct & Group Messages', path: '/messages', category: 'Chat', icon: MessageCircle },
    { title: 'My Profile & Settings', path: '/profile', category: 'User', icon: UserIcon },
    ...(user?.role === 'admin' || user?.role === 'hod' ? [
      { title: 'Admin & Security Center', path: '/admin', category: 'Admin', icon: Shield },
    ] : []),
  ];

  const filteredSearch = searchablePages.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-surface-50 overflow-hidden font-sans">
      {/* Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2.5 focus:bg-mkce-600 focus:text-white focus:rounded-xl focus:shadow-2xl focus:outline-none focus:ring-2 focus:ring-white text-xs font-bold uppercase tracking-wider"
      >
        Skip to main content
      </a>

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ===================== SIDEBAR ===================== */}
      <aside
        id="sidebar-navigation"
        aria-label="Main Platform Navigation"
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[280px] flex flex-col transform transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}`}
        style={{
          background: 'linear-gradient(180deg, #010018 0%, #020024 15%, #09203f 45%, #073f69 85%, #052642 100%)',
          borderRight: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        {/* Brand Header */}
        <div className="px-5 py-4 border-b border-white/[0.06] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-mkce-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl pointer-events-none" />
          <Link
            to="/"
            className="flex items-center gap-3 relative z-10 group"
          >
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center font-display font-black text-xl text-white border border-white/15 transition-all duration-300 group-hover:scale-105 group-hover:border-white/25"
              style={{
                background: 'linear-gradient(135deg, #06A3DA 0%, #073f69 100%)',
                boxShadow: '0 4px 16px rgba(6, 163, 218, 0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
            >
              MK
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-white text-[15px] tracking-tight group-hover:text-mkce-300 transition-colors">
                  MKCE Connect
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)] animate-pulse" />
              </div>
              <p className="text-[10px] text-mkce-300/70 font-medium tracking-wider uppercase">M. Kumarasamy College</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.08] text-gold-light font-bold border border-white/[0.06]">NAAC 'A'</span>
                <span className="text-[9px] text-white/40">Autonomous</span>
              </div>
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-white/50 hover:text-white rounded-xl hover:bg-white/[0.06] absolute top-4 right-4"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin" aria-label="Sidebar Menu">
          <div className="px-3 mb-2.5 mt-1 flex items-center gap-1.5">
            <Sparkles size={10} className="text-mkce-400/70" />
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em]">Platform</span>
          </div>

          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={active ? 'page' : undefined}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group
                  ${active ? 'text-white' : 'text-white/55 hover:text-white/85 hover:bg-white/[0.04]'}`}
                onClick={() => setSidebarOpen(false)}
              >
                {active && (
                  <motion.div
                    layoutId="activeSidebarPill"
                    className="absolute inset-0 rounded-xl border border-mkce-400/25"
                    style={{
                      background: 'linear-gradient(135deg, rgba(6,163,218,0.15) 0%, rgba(6,163,218,0.05) 100%)',
                      boxShadow: '0 0 20px rgba(6,163,218,0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}

                <div
                  className={`relative z-10 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
                    ${active
                      ? 'bg-mkce-500/90 text-white shadow-[0_2px_8px_rgba(6,163,218,0.4)]'
                      : 'bg-white/[0.04] text-white/45 group-hover:bg-white/[0.08] group-hover:text-white/70'
                    }`}
                >
                  <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
                </div>
                <span className="relative z-10 truncate">{item.label}</span>

                {item.path === '/messages' && unreadCount > 0 && (
                  <span className="relative z-10 ml-auto px-2 py-0.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-black rounded-full shadow-sm animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="my-3 mx-3 h-px bg-white/[0.06]" />

          <div className="px-3 mb-2.5 flex items-center gap-1.5">
            <roleNav.icon size={10} className="text-gold/70" />
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em]">{roleNav.title}</span>
          </div>

          {roleNav.items.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.path}
                aria-current={active ? 'page' : undefined}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group
                  ${active ? 'text-white' : 'text-white/55 hover:text-white/85 hover:bg-white/[0.04]'}`}
                onClick={() => setSidebarOpen(false)}
              >
                {active && (
                  <motion.div
                    layoutId="activeRoleSidebarPill"
                    className="absolute inset-0 rounded-xl border border-mkce-400/25"
                    style={{
                      background: 'linear-gradient(135deg, rgba(6,163,218,0.15) 0%, rgba(6,163,218,0.05) 100%)',
                      boxShadow: '0 0 20px rgba(6,163,218,0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <div
                  className={`relative z-10 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
                    ${active
                      ? 'bg-mkce-500/90 text-white shadow-[0_2px_8px_rgba(6,163,218,0.4)]'
                      : 'bg-white/[0.04] text-white/45 group-hover:bg-white/[0.08] group-hover:text-white/70'
                    }`}
                >
                  <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
                </div>
                <span className="relative z-10 truncate">{item.label}</span>
                {item.badge && (
                  <span className="relative z-10 ml-auto text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/[0.06] text-mkce-200/80 border border-white/[0.06]">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Card */}
        <div className="p-3 border-t border-white/[0.06]" style={{ background: 'rgba(0,0,0,0.2)' }}>
          <Link
            to="/profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.06] transition-all group"
            onClick={() => setSidebarOpen(false)}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm border border-white/15 group-hover:scale-105 transition-transform"
              style={{
                background: 'linear-gradient(135deg, #06A3DA 0%, #073f69 100%)',
                boxShadow: '0 2px 8px rgba(6,163,218,0.3)',
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white truncate group-hover:text-mkce-300 transition-colors">
                {user?.name || 'Authenticated User'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
                <span className="text-[11px] text-mkce-200/70 truncate font-medium">
                  {roleInfo.label}
                </span>
              </div>
            </div>
            <ChevronRight size={15} className="text-white/30 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>
      </aside>

      {/* ===================== MAIN CONTENT AREA ===================== */}
      <div className="flex-1 flex flex-col min-w-0 bg-surface-50">
        {/* Top Header Bar */}
        <header
          role="banner"
          className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-surface-200/60 sticky top-0 z-30"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div className="flex items-center gap-3.5 flex-1 max-w-xl">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-surface-100 text-surface-600 transition-colors"
              aria-label="Open navigation sidebar"
            >
              <Menu size={22} />
            </button>

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center justify-between gap-3 rounded-xl px-3.5 py-2 w-full max-w-md text-left text-sm transition-all group"
              style={{
                background: 'rgba(241,245,249,0.8)',
                border: '1.5px solid rgba(226,232,240,0.6)',
              }}
              aria-label="Quick search across platform (Press Control K)"
            >
              <div className="flex items-center gap-2.5">
                <Search size={15} className="text-surface-400 group-hover:text-mkce-500 transition-colors" />
                <span className="text-surface-400 group-hover:text-surface-500 truncate">Search clubs, events, opportunities...</span>
              </div>
              <kbd className="hidden md:inline-flex items-center gap-0.5 text-[10px] font-semibold text-surface-400 bg-white px-1.5 py-0.5 rounded-md" style={{ border: '1px solid rgba(226,232,240,0.6)', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                <Command size={10} /> K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="sm:hidden p-2.5 rounded-xl hover:bg-surface-100 text-surface-600"
            >
              <Search size={19} />
            </button>

            {/* Role Chip */}
            <div
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${roleInfo.chipBg}`}
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
            >
              <roleInfo.icon size={13} className="shrink-0" />
              <span className="font-bold">{roleInfo.badge}</span>
              {user?.department && (
                <span className="text-[11px] opacity-80 border-l border-current/15 pl-1.5 truncate max-w-[120px]">
                  {user.department}
                </span>
              )}
            </div>

            {/* Notifications */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) markAllRead();
                }}
                className="relative p-2.5 rounded-xl hover:bg-surface-100 text-surface-600 hover:text-mkce-700 transition-all active:scale-95"
                aria-label={`View notifications (${unreadCount} unread)`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-sm animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl z-50 overflow-hidden"
                    style={{
                      background: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(20px) saturate(180%)',
                      border: '1px solid rgba(226,232,240,0.6)',
                      boxShadow: '0 16px 48px -8px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.06)',
                    }}
                  >
                    <div className="p-4 border-b border-surface-100 flex items-center justify-between" style={{ background: 'rgba(248,250,252,0.5)' }}>
                      <div className="flex items-center gap-2">
                        <Bell size={15} className="text-mkce-600" />
                        <h3 className="font-display font-bold text-mkce-900 text-sm">Notifications</h3>
                      </div>
                      {unreadCount > 0 ? (
                        <button onClick={markAllRead} className="text-[11px] font-bold text-mkce-600 hover:text-mkce-800 hover:underline">
                          Mark all read
                        </button>
                      ) : (
                        <span className="text-xs text-surface-400 font-medium">All caught up</span>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-surface-100/50 scrollbar-thin">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <div className="w-12 h-12 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-2.5 text-surface-400">
                            <Bell size={20} />
                          </div>
                          <p className="text-surface-700 text-sm font-semibold">No notifications yet</p>
                          <p className="text-surface-400 text-xs mt-0.5">We'll alert you when events or updates arrive</p>
                        </div>
                      ) : (
                        notifications.slice(0, 10).map((n, i) => (
                          <div
                            key={n._id || i}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-3.5 transition-colors cursor-pointer hover:bg-surface-50/80 ${
                              !n.isRead ? 'bg-mkce-50/40 border-l-[3px] border-mkce-500' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-semibold text-mkce-900 leading-snug">{n.title}</p>
                              {!n.isRead && <span className="w-2 h-2 rounded-full bg-mkce-500 shrink-0 mt-1" />}
                            </div>
                            <p className="text-xs text-surface-500 mt-1 leading-relaxed">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="w-px h-6 bg-surface-200/80" />

            {/* User Menu */}
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-surface-100 transition-all"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm border border-surface-200/50"
                  style={{
                    background: 'linear-gradient(135deg, #06A3DA 0%, #073f69 100%)',
                    boxShadow: '0 2px 6px rgba(6,163,218,0.2)',
                  }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 mt-2 w-64 rounded-2xl z-50 overflow-hidden p-2"
                    style={{
                      background: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(20px) saturate(180%)',
                      border: '1px solid rgba(226,232,240,0.6)',
                      boxShadow: '0 16px 48px -8px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.06)',
                    }}
                  >
                    <div className="p-3 border-b border-surface-100 rounded-xl mb-1" style={{ background: 'rgba(248,250,252,0.5)' }}>
                      <p className="text-sm font-bold text-surface-900 truncate">{user?.name}</p>
                      <p className="text-xs text-surface-500 truncate">{user?.email}</p>
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-mkce-100/70 text-mkce-800 text-[10px] font-bold">
                        <roleInfo.icon size={11} />
                        <span>{roleInfo.label}</span>
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <Link to="/profile" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-surface-700 hover:text-mkce-700 hover:bg-surface-100/80 transition-colors" onClick={() => setShowUserMenu(false)}>
                        <UserIcon size={15} /><span>My Profile & Portfolio</span>
                      </Link>
                      {(user?.role === 'admin' || user?.role === 'hod') && (
                        <Link to="/admin" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-surface-700 hover:text-mkce-700 hover:bg-surface-100/80 transition-colors" onClick={() => setShowUserMenu(false)}>
                          <Shield size={15} className="text-amber-500" /><span>Admin Dashboard</span>
                        </Link>
                      )}
                      <Link to="/clubs" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-surface-700 hover:text-mkce-700 hover:bg-surface-100/80 transition-colors" onClick={() => setShowUserMenu(false)}>
                        <Users size={15} /><span>Campus Clubs Hub</span>
                      </Link>
                      <div className="my-1 border-t border-surface-100" />
                      <button
                        onClick={() => { setShowUserMenu(false); logout(); navigate('/login'); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50/80 transition-colors text-left"
                      >
                        <LogOut size={15} /><span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Search Modal */}
        <AnimatePresence>
          {searchOpen && (
            <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24" onClick={() => setSearchOpen(false)}
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: -16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: -16 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white w-full max-w-xl rounded-2xl overflow-hidden"
                style={{ boxShadow: '0 24px 64px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(226,232,240,0.3)' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-surface-100">
                  <Search size={18} className="text-surface-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search clubs, events, opportunities..."
                    className="w-full bg-transparent outline-none text-sm text-surface-900 placeholder:text-surface-400 font-medium"
                  />
                  <kbd className="text-[10px] font-semibold text-surface-400 bg-surface-100 px-2 py-0.5 rounded-md border border-surface-200/80">
                    ESC
                  </kbd>
                </div>
                <div className="max-h-80 overflow-y-auto p-2 scrollbar-thin">
                  {filteredSearch.length === 0 ? (
                    <div className="p-6 text-center text-sm text-surface-500">No matching pages found</div>
                  ) : (
                    filteredSearch.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.path + item.title}
                          onClick={() => { setSearchOpen(false); navigate(item.path); }}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-surface-100/80 text-left transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-surface-100 text-surface-600 group-hover:bg-mkce-500 group-hover:text-white flex items-center justify-center transition-all duration-200">
                              <Icon size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-surface-800 group-hover:text-mkce-700">{item.title}</p>
                              <p className="text-[11px] text-surface-400">{item.category}</p>
                            </div>
                          </div>
                          <ChevronRight size={15} className="text-surface-300 group-hover:text-mkce-600 group-hover:translate-x-0.5 transition-all" />
                        </button>
                      );
                    })
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main id="main-content" tabIndex={-1} className="flex-1 overflow-y-auto p-4 lg:p-8 scrollbar-thin outline-none">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>

        {/* Footer */}
        <footer
          role="contentinfo"
          className="px-8 py-3.5 border-t border-surface-200/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs"
          style={{
            background: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(8px)',
            color: '#94a3b8',
          }}
        >
          <span>&copy; 2026 M. Kumarasamy College of Engineering, Karur &mdash; Autonomous</span>
          <span className="text-mkce-600/70 font-medium text-[11px]">Technology Innovation Hub &bull; Enterprise Campus Portal</span>
        </footer>
      </div>
    </div>
  );
}
