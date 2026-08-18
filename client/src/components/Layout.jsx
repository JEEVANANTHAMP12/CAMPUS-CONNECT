import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home, Users, Calendar, MessageSquare, Briefcase, Trophy,
  MessageCircle, Shield, Bell, Menu, X, LogOut, Search,
  ChevronDown, Award, Zap
} from 'lucide-react';
import api from '../utils/api';
import socket from '../utils/socket';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    if (user) {
      socket.connect();
      socket.emit('user-online', user.id);
      fetchNotifications();
    }
    return () => socket.disconnect();
  }, [user]);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    socket.on('notification', (data) => {
      setNotifications(prev => [data, ...prev]);
      setUnreadCount(prev => prev + 1);
    });
    return () => socket.off('notification');
  }, []);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data);
      setUnreadCount(res.data.unreadCount);
    } catch (err) {}
  };

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/clubs', label: 'Clubs', icon: Users },
    { path: '/events', label: 'Events', icon: Calendar },
    { path: '/discussions', label: 'Discussions', icon: MessageSquare },
    { path: '/jobs', label: 'Opportunities', icon: Briefcase },
    { path: '/achievements', label: 'Achievements', icon: Trophy },
    { path: '/messages', label: 'Messages', icon: MessageCircle },
  ];

  const adminNav = [
    { path: '/admin', label: 'Admin Panel', icon: Shield },
  ];

  const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <div className="flex h-screen bg-surface-50 overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-[280px] flex flex-col transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ background: 'linear-gradient(to top, #09203f 0%, #0d2d52 50%, #122a4a 100%)' }}>
        
        {/* MKCE Logo Section */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-lg text-white"
              style={{ background: 'linear-gradient(135deg, #06A3DA 0%, #073f69 100%)' }}>
              MK
            </div>
            <div>
              <h1 className="font-display font-bold text-white text-base leading-tight">MKCE Connect</h1>
              <p className="text-[10px] text-surface-400 tracking-wider uppercase">M. Kumarasamy College of Engineering</p>
              <p className="text-[9px] text-mkce-400 tracking-wide">NAAC 'A' Grade | Autonomous</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden absolute top-4 right-4 p-1 text-white/60 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
          <p className="px-3 mb-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">Menu</p>
          {navItems.map(item => (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive(item.path)
                  ? 'text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'}`}
              style={isActive(item.path) ? { background: 'linear-gradient(90deg, rgba(6,163,218,0.2) 0%, rgba(6,163,218,0.05) 100%)' } : {}}
              onClick={() => setSidebarOpen(false)}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                ${isActive(item.path) ? 'bg-mkce-500/20 text-mkce-400' : 'bg-white/5 text-white/40'}`}>
                <item.icon size={16} />
              </div>
              {item.label}
              {item.path === '/messages' && unreadCount > 0 && (
                <span className="ml-auto w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadCount}</span>
              )}
            </Link>
          ))}

          {(user?.role === 'admin' || user?.role === 'hod') && (
            <>
              <div className="my-3 mx-3 border-t border-white/10"></div>
              <p className="px-3 mb-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">Administration</p>
              {adminNav.map(item => (
                <Link key={item.path} to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive(item.path) ? 'text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                  style={isActive(item.path) ? { background: 'linear-gradient(90deg, rgba(6,163,218,0.2) 0%, rgba(6,163,218,0.05) 100%)' } : {}}
                  onClick={() => setSidebarOpen(false)}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                    ${isActive(item.path) ? 'bg-mkce-500/20 text-mkce-400' : 'bg-white/5 text-white/40'}`}>
                    <item.icon size={16} />
                  </div>
                  {item.label}
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-white/10">
          <Link to="/profile" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5 transition-colors"
            onClick={() => setSidebarOpen(false)}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #06A3DA 0%, #073f69 100%)' }}>
              {user?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-white/40 capitalize flex items-center gap-1">
                <Zap size={9} className="text-gold" />
                {user?.role}
              </p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-14 flex items-center justify-between px-4 lg:px-6 border-b border-surface-200 bg-white sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-surface-100 text-surface-500">
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-surface-50 border border-surface-200 rounded-lg px-3 py-2 w-72">
              <Search size={16} className="text-surface-400" />
              <input type="text" placeholder="Search clubs, events, people..."
                className="bg-transparent outline-none text-sm w-full placeholder:text-surface-400" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div ref={notifRef} className="relative">
              <button onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) markAllRead(); }}
                className="relative p-2 rounded-lg hover:bg-surface-100 text-surface-500 transition-colors">
                <Bell size={19} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-card-hover border border-surface-200 z-50 overflow-hidden">
                  <div className="p-4 border-b border-surface-100 flex items-center justify-between">
                    <h3 className="font-display font-bold text-mkce-800">Notifications</h3>
                    {unreadCount > 0 && <span className="badge-blue">{unreadCount} new</span>}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell size={32} className="mx-auto text-surface-300 mb-2" />
                        <p className="text-surface-400 text-sm">No notifications</p>
                      </div>
                    ) : notifications.slice(0, 10).map((n, i) => (
                      <div key={i} className={`p-4 border-b border-surface-50 ${!n.isRead ? 'bg-mkce-50/50' : ''}`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!n.isRead ? 'bg-mkce-500' : 'bg-surface-300'}`}></div>
                          <div>
                            <p className="text-sm font-semibold text-mkce-800">{n.title}</p>
                            <p className="text-xs text-surface-500 mt-0.5">{n.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="w-px h-6 bg-surface-200 hidden sm:block"></div>
            <button onClick={() => { logout(); navigate('/login'); }}
              className="p-2 rounded-lg hover:bg-red-50 text-surface-400 hover:text-red-500 transition-colors"
              title="Sign out">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 scrollbar-thin">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>

        {/* MKCE Footer */}
        <footer className="px-6 py-3 border-t border-surface-200 bg-white text-center">
          <p className="text-[11px] text-surface-400">
            2026 &copy; M. Kumarasamy College of Engineering, Karur &mdash; All Rights Reserved
          </p>
          <p className="text-[10px] text-surface-300 mt-0.5">
            Designed &amp; Maintained by Technology Innovation Hub &ndash; MKCE
          </p>
        </footer>
      </div>
    </div>
  );
}
