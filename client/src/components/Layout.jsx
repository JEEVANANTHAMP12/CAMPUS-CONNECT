import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Home, Users, Calendar, MessageSquare, Briefcase, Trophy,
  MessageCircle, Shield, Bell, Menu, X, LogOut, Search,
  Zap, CheckCircle, Sparkles, ShieldCheck, GraduationCap,
  ChevronRight, Command, User as UserIcon, PlusCircle, Check,
  PanelLeftClose, PanelLeft, ChevronsLeft, ChevronsRight
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
          color: 'text-rose-600',
          chipBg: 'bg-rose-50 border-rose-200 text-rose-700',
        };
      case 'hod':
        return {
          label: `HOD (${user?.department || 'Dept'})`, badge: 'HOD', icon: ShieldCheck,
          color: 'text-purple-600',
          chipBg: 'bg-purple-50 border-purple-200 text-purple-700',
        };
      case 'faculty':
        return {
          label: `Faculty (${user?.department || 'Dept'})`, badge: 'Faculty', icon: GraduationCap,
          color: 'text-blue-600',
          chipBg: 'bg-blue-50 border-blue-200 text-blue-700',
        };
      case 'leader':
        return {
          label: 'Club Leader', badge: 'Lead', icon: Sparkles,
          color: 'text-amber-600',
          chipBg: 'bg-amber-50 border-amber-200 text-amber-800',
        };
      case 'sub_leader':
        return {
          label: 'Club Sub-Leader', badge: 'Sub-Lead', icon: Zap,
          color: 'text-indigo-600',
          chipBg: 'bg-indigo-50 border-indigo-200 text-indigo-700',
        };
      case 'student':
      default:
        return {
          label: `Student (${user?.year ? `Year ${user.year}` : 'Student'})`, badge: 'Student', icon: Users,
          color: 'text-zinc-600',
          chipBg: 'bg-zinc-100 border-zinc-200 text-zinc-800',
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
    <div className="flex h-screen bg-white overflow-hidden font-sans text-zinc-900">
      {/* Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2.5 focus:bg-black focus:text-white focus:rounded-xl focus:shadow-2xl focus:outline-none focus:ring-2 focus:ring-black text-xs font-bold uppercase tracking-wider"
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
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ===================== SIDEBAR ===================== */}
      <aside
        id="sidebar-navigation"
        aria-label="Main Platform Navigation"
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-zinc-200 transform transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${sidebarExpanded ? 'w-[270px] lg:w-[270px]' : 'w-[270px] lg:w-[72px]'}
          ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className={`border-b border-zinc-200 relative overflow-hidden bg-white transition-all ${sidebarExpanded ? 'px-5 py-4' : 'px-3 py-4 flex flex-col items-center gap-3'}`}>
          {sidebarExpanded ? (
            <div className="flex items-center justify-between w-full">
              <Link
                to="/"
                className="flex items-center gap-3 relative z-10 group"
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center font-display font-black text-xl text-white bg-black border border-zinc-800 transition-all duration-200 group-hover:bg-zinc-800"
                  style={{
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                  }}
                >
                  MK
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-display font-black text-black text-[15px] tracking-tight transition-colors">
                      MKCE Connect
                    </span>
                    <span className="w-2 h-2 rounded-full bg-black shadow-xs" />
                  </div>
                  <p className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase">M. Kumarasamy College</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-100 text-black font-bold border border-zinc-200">NAAC 'A'</span>
                    <span className="text-[9px] text-zinc-500">Autonomous</span>
                  </div>
                </div>
              </Link>
              <button
                onClick={() => setSidebarExpanded(false)}
                className="hidden lg:flex p-2 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded-xl transition-colors"
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <PanelLeftClose size={18} />
              </button>
            </div>
          ) : (
            <>
              <Link to="/" className="w-11 h-11 rounded-2xl flex items-center justify-center font-display font-black text-xl text-white bg-black border border-zinc-800 shrink-0" title="MKCE Connect">
                MK
              </Link>
              <button
                onClick={() => setSidebarExpanded(true)}
                className="hidden lg:flex p-2 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded-xl transition-colors"
                aria-label="Expand sidebar"
                title="Expand sidebar"
              >
                <PanelLeft size={18} />
              </button>
            </>
          )}

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-zinc-500 hover:text-black rounded-xl hover:bg-zinc-100 absolute top-4 right-4"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin bg-white" aria-label="Sidebar Menu">
          <div className={`mb-2 mt-1 flex items-center gap-1.5 ${sidebarExpanded ? 'px-3' : 'justify-center'}`}>
            {sidebarExpanded ? (
              <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-[0.15em]">Platform</span>
            ) : (
              <span className="w-6 h-px bg-zinc-200" />
            )}
          </div>

          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={active ? 'page' : undefined}
                title={!sidebarExpanded ? item.label : undefined}
                className={`relative flex items-center rounded-xl text-[13px] font-semibold transition-all duration-150 group
                  ${sidebarExpanded ? 'gap-3 px-3 py-2.5' : 'justify-center p-2.5 mx-auto w-11 h-11'}
                  ${active ? 'text-white bg-black shadow-xs' : 'text-zinc-600 hover:text-black hover:bg-zinc-100'}`}
                onClick={() => setSidebarOpen(false)}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 shrink-0
                    ${active
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-500 group-hover:text-black'
                    }`}
                >
                  <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
                </div>
                {sidebarExpanded && <span className="truncate">{item.label}</span>}

                {sidebarExpanded && item.path === '/messages' && unreadCount > 0 && (
                  <span className="ml-auto px-2 py-0.5 bg-black text-white text-[10px] font-black rounded-full border border-white/20">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
                {!sidebarExpanded && item.path === '/messages' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="my-3 mx-3 h-px bg-zinc-200" />

          <div className={`mb-2 flex items-center gap-1.5 ${sidebarExpanded ? 'px-3' : 'justify-center'}`}>
            {sidebarExpanded ? (
              <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-[0.15em]">{roleNav.title}</span>
            ) : (
              <roleNav.icon size={14} className="text-zinc-400" />
            )}
          </div>

          {roleNav.items.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.path}
                aria-current={active ? 'page' : undefined}
                title={!sidebarExpanded ? item.label : undefined}
                className={`relative flex items-center rounded-xl text-[13px] font-semibold transition-all duration-150 group
                  ${sidebarExpanded ? 'gap-3 px-3 py-2.5' : 'justify-center p-2.5 mx-auto w-11 h-11'}
                  ${active ? 'text-white bg-black shadow-xs' : 'text-zinc-600 hover:text-black hover:bg-zinc-100'}`}
                onClick={() => setSidebarOpen(false)}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 shrink-0
                    ${active
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-500 group-hover:text-black'
                    }`}
                >
                  <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
                </div>
                {sidebarExpanded && <span className="truncate">{item.label}</span>}
                {sidebarExpanded && item.badge && (
                  <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    active ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Card */}
        <div className={`border-t border-zinc-200 bg-zinc-50/70 ${sidebarExpanded ? 'p-3' : 'p-2 flex justify-center'}`}>
          {sidebarExpanded ? (
            <Link
              to="/profile"
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-zinc-200/60 transition-all group"
              onClick={() => setSidebarOpen(false)}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm bg-black border border-zinc-800 group-hover:scale-105 transition-transform shrink-0"
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-zinc-900 truncate group-hover:text-black transition-colors">
                  {user?.name || 'Authenticated User'}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                  <span className="text-[11px] text-zinc-500 truncate font-medium">
                    {roleInfo.label}
                  </span>
                </div>
              </div>
              <ChevronRight size={15} className="text-zinc-400 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
            </Link>
          ) : (
            <Link
              to="/profile"
              title={user?.name || 'Profile'}
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm bg-black border border-zinc-800 hover:scale-105 transition-transform"
              onClick={() => setSidebarOpen(false)}
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Link>
          )}
        </div>
      </aside>

      {/* ===================== MAIN CONTENT AREA ===================== */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#fafafa]">
        {/* Top Header Bar */}
        <header
          role="banner"
          className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-zinc-200 sticky top-0 z-30 bg-white/95 backdrop-blur-md"
        >
          <div className="flex items-center gap-3.5 flex-1 max-w-xl">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-zinc-100 text-zinc-700 transition-colors"
              aria-label="Open navigation sidebar"
            >
              <Menu size={22} />
            </button>
            <button
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              className="hidden lg:flex p-2 rounded-xl hover:bg-zinc-100 text-zinc-700 transition-colors"
              aria-label={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
              title={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {sidebarExpanded ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
            </button>

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center justify-between gap-3 rounded-xl px-3.5 py-2 w-full max-w-md text-left text-sm transition-all group bg-zinc-100 hover:bg-zinc-200/70 border border-zinc-200"
              aria-label="Quick search across platform (Press Control K)"
            >
              <div className="flex items-center gap-2.5">
                <Search size={15} className="text-zinc-400 group-hover:text-black transition-colors" />
                <span className="text-zinc-500 group-hover:text-zinc-700 truncate text-xs">Search clubs, events, opportunities...</span>
              </div>
              <kbd className="hidden md:inline-flex items-center gap-0.5 text-[10px] font-bold text-zinc-500 bg-white px-1.5 py-0.5 rounded-md border border-zinc-200">
                <Command size={10} /> K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="sm:hidden p-2.5 rounded-xl hover:bg-zinc-100 text-zinc-700"
            >
              <Search size={19} />
            </button>

            {/* Role Chip */}
            <div
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-zinc-100 text-black border border-zinc-200"
            >
              <roleInfo.icon size={13} className="shrink-0" />
              <span>{roleInfo.badge}</span>
              {user?.department && (
                <span className="text-[11px] text-zinc-500 border-l border-zinc-300 pl-1.5 truncate max-w-[120px]">
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
                className="relative p-2.5 rounded-xl hover:bg-zinc-100 text-zinc-700 hover:text-black transition-all active:scale-95"
                aria-label={`View notifications (${unreadCount} unread)`}
              >
                <Bell size={19} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-black text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
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
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl z-50 overflow-hidden bg-white border border-zinc-200 shadow-xl"
                  >
                    <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/80">
                      <div className="flex items-center gap-2">
                        <Bell size={15} className="text-black" />
                        <h3 className="font-display font-bold text-black text-sm">Notifications</h3>
                      </div>
                      {unreadCount > 0 ? (
                        <button onClick={markAllRead} className="text-[11px] font-bold text-black hover:underline">
                          Mark all read
                        </button>
                      ) : (
                        <span className="text-xs text-zinc-400 font-medium">All caught up</span>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100 scrollbar-thin">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-2.5 text-zinc-400">
                            <Bell size={20} />
                          </div>
                          <p className="text-zinc-800 text-sm font-semibold">No notifications yet</p>
                          <p className="text-zinc-400 text-xs mt-0.5">We'll alert you when events or updates arrive</p>
                        </div>
                      ) : (
                        notifications.slice(0, 10).map((n, i) => (
                          <div
                            key={n._id || i}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-3.5 transition-colors cursor-pointer hover:bg-zinc-50 ${
                              !n.isRead ? 'bg-zinc-100/60 border-l-[3px] border-black' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-semibold text-black leading-snug">{n.title}</p>
                              {!n.isRead && <span className="w-2 h-2 rounded-full bg-black shrink-0 mt-1" />}
                            </div>
                            <p className="text-xs text-zinc-600 mt-1 leading-relaxed">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="w-px h-6 bg-zinc-200" />

            {/* User Menu */}
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-zinc-100 transition-all"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-sm bg-black border border-zinc-800 shadow-xs"
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
                    transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 mt-2 w-64 rounded-2xl z-50 overflow-hidden p-2 bg-white border border-zinc-200 shadow-xl"
                  >
                    <div className="p-3 border-b border-zinc-100 rounded-xl mb-1 bg-zinc-50">
                      <p className="text-sm font-bold text-black truncate">{user?.name}</p>
                      <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-200 text-black text-[10px] font-bold">
                        <roleInfo.icon size={11} />
                        <span>{roleInfo.label}</span>
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <Link to="/profile" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 hover:text-black hover:bg-zinc-100 transition-colors" onClick={() => setShowUserMenu(false)}>
                        <UserIcon size={15} /><span>My Profile & Portfolio</span>
                      </Link>
                      {(user?.role === 'admin' || user?.role === 'hod') && (
                        <Link to="/admin" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 hover:text-black hover:bg-zinc-100 transition-colors" onClick={() => setShowUserMenu(false)}>
                          <Shield size={15} /><span>Admin Dashboard</span>
                        </Link>
                      )}
                      <Link to="/clubs" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 hover:text-black hover:bg-zinc-100 transition-colors" onClick={() => setShowUserMenu(false)}>
                        <Users size={15} /><span>Campus Clubs Hub</span>
                      </Link>
                      <div className="my-1 border-t border-zinc-200" />
                      <button
                        onClick={() => { setShowUserMenu(false); logout(); navigate('/login'); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left"
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
                className="bg-white w-full max-w-xl rounded-2xl overflow-hidden border border-zinc-200 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-200">
                  <Search size={18} className="text-zinc-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search clubs, events, opportunities..."
                    className="w-full bg-transparent outline-none text-sm text-black placeholder:text-zinc-400 font-medium"
                  />
                  <kbd className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200">
                    ESC
                  </kbd>
                </div>
                <div className="max-h-80 overflow-y-auto p-2 scrollbar-thin">
                  {filteredSearch.length === 0 ? (
                    <div className="p-6 text-center text-sm text-zinc-500">No matching pages found</div>
                  ) : (
                    filteredSearch.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.path + item.title}
                          onClick={() => { setSearchOpen(false); navigate(item.path); }}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-zinc-100 text-left transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 group-hover:bg-black group-hover:text-white flex items-center justify-center transition-all duration-150">
                              <Icon size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-zinc-900 group-hover:text-black">{item.title}</p>
                              <p className="text-[11px] text-zinc-400">{item.category}</p>
                            </div>
                          </div>
                          <ChevronRight size={15} className="text-zinc-300 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
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
        <main id="main-content" tabIndex={-1} className="flex-1 overflow-y-auto p-4 lg:p-8 scrollbar-thin outline-none bg-[#fafafa]">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>

        {/* Footer */}
        <footer
          role="contentinfo"
          className="px-8 py-3.5 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs bg-white text-zinc-500"
        >
          <span>&copy; 2026 M. Kumarasamy College of Engineering, Karur &mdash; Autonomous</span>
          <span className="text-black font-semibold text-[11px]">Technology Innovation Hub &bull; Campus Portal</span>
        </footer>
      </div>
    </div>
  );
}
