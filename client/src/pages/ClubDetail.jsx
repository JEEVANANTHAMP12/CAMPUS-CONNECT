import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  Users, Calendar, MessageSquare, ArrowLeft, Clock, MapPin,
  Heart, MessageCircle, Star, Sparkles, Shield, UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerConfetti } from '../components/animations/Confetti';
import SEO from '../components/SEO';

export default function ClubDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    fetchClub();
  }, [id]);

  const fetchClub = async () => {
    setLoading(true);
    setError(null);
    try {
      const [clubRes, eventsRes, postsRes] = await Promise.all([
        api.get(`/clubs/${id}`),
        api.get(`/events?club=${id}`),
        api.get(`/posts?club=${id}`),
      ]);
      setClub(clubRes.data.data);
      setEvents(eventsRes.data.data);
      setPosts(postsRes.data.data);
    } catch (err) {
      setError('Club not found or failed to load');
      toast.error('Failed to load club details');
    }
    setLoading(false);
  };

  const joinClub = async () => {
    try {
      await api.post(`/clubs/${id}/join`);
      triggerConfetti({ particleCount: 80, spread: 70 });
      toast.success('You have joined the club!');
      fetchClub();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join club');
    }
  };

  const leaveClub = async () => {
    try {
      await api.post(`/clubs/${id}/leave`);
      toast.success('Left club');
      fetchClub();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to leave club');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-10 h-10 border-3 border-mkce-200 border-t-mkce-600 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-surface-500 font-display">Loading chapter details...</p>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Link to="/clubs" className="inline-flex items-center gap-2 text-sm font-bold text-mkce-600 hover:text-mkce-700">
          <ArrowLeft size={16} /> Back to Clubs
        </Link>
        <div className="bg-white rounded-3xl border border-surface-200 p-12 text-center shadow-card">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-100 flex items-center justify-center text-surface-400">
            <Users size={32} />
          </div>
          <h3 className="font-display font-bold text-mkce-900 text-lg">Club Not Found</h3>
          <p className="text-surface-500 text-sm mt-1">{error || 'The club you are looking for does not exist.'}</p>
          <Link to="/clubs" className="btn-mkce inline-block mt-4">
            Browse All Clubs
          </Link>
        </div>
      </div>
    );
  }

  const isMember = club.members?.some((m) => m._id === user?.id || m === user?.id || m?.id === user?.id);
  const isLeader = club.leader?._id === user?.id || club.leader === user?.id;

  const tabs = [
    { id: 'about', label: 'About Club' },
    { id: 'events', label: 'Events', count: events.length },
    { id: 'posts', label: 'Discussions', count: posts.length },
    { id: 'members', label: 'Members', count: club.members?.length || 0 },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <SEO
        title={`${club.name} - Student Chapter`}
        description={club.description || `Explore ${club.name} activities, upcoming events, and student members at MKCE.`}
        keywords={`MKCE ${club.name}, ${club.department || 'MKCE'} Club, Student Chapter Karur`}
        canonical={`/clubs/${id}`}
      />
      <Link to="/clubs" className="inline-flex items-center gap-2 text-xs font-bold text-surface-500 hover:text-mkce-600 transition-colors">
        <ArrowLeft size={16} /> Back to Clubs
      </Link>

      {/* 3D Depth Header Banner */}
      <div className="bg-white rounded-3xl border border-surface-200/80 shadow-card overflow-hidden">
        <div
          className="h-48 sm:h-56 relative flex items-center justify-between p-8 text-white overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #020024 0%, #09203f 40%, #073f69 70%, #06A3DA 100%)',
          }}
        >
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-white/5 rounded-full blur-3xl" />
          <div className="relative z-10 flex items-center gap-6">
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center font-display font-black text-3xl sm:text-4xl text-white shadow-2xl border-2 border-white/30"
              style={{ background: 'linear-gradient(135deg, #06A3DA 0%, #073f69 100%)' }}
            >
              {club.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                {club.department && (
                  <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider border border-white/20">
                    {club.department}
                  </span>
                )}
                {isMember && (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 backdrop-blur-md text-[10px] font-bold border border-emerald-400/30 flex items-center gap-1">
                    <UserCheck size={12} />
                    Active Member
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight">{club.name}</h1>
            </div>
          </div>

          <div className="relative z-10 hidden sm:flex items-center gap-3">
            {isMember ? (
              <>
                <Link to={`/messages?club=${club._id}`} className="btn-outline text-xs">
                  <MessageSquare size={14} />
                  <span>Club Chat</span>
                </Link>
                {!isLeader && (
                  <button onClick={leaveClub} className="btn-danger text-xs">
                    Leave Club
                  </button>
                )}
              </>
            ) : (
              <button onClick={joinClub} className="btn-gold text-xs shadow-gold">
                <Sparkles size={14} />
                <span>Join Chapter</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 border-b border-surface-200 flex items-center gap-2 overflow-x-auto scrollbar-thin">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative py-4 px-4 text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  active ? 'text-mkce-700' : 'text-surface-500 hover:text-surface-800'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                      active ? 'bg-mkce-100 text-mkce-700 font-extrabold' : 'bg-surface-100 text-surface-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {active && (
                  <motion.div
                    layoutId="activeClubTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-mkce-500"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'about' && (
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="section-heading mb-2">Club Overview &amp; Mission</h3>
                  <p className="text-surface-600 text-sm sm:text-base leading-relaxed">
                    {club.description || 'Welcome to this campus chapter. We host hands-on workshops, hackathons, and student initiatives.'}
                  </p>
                </div>

                {club.activities?.length > 0 && (
                  <div>
                    <h3 className="section-heading mb-3">Core Activities</h3>
                    <div className="flex flex-wrap gap-2">
                      {club.activities.map((act, i) => (
                        <span key={i} className="badge-blue text-xs">
                          {act}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Leader Card */}
                <div>
                  <h3 className="section-heading mb-3">Leadership</h3>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-50 border border-surface-200/80 max-w-md">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-md text-base"
                      style={{ background: 'linear-gradient(135deg, #06A3DA 0%, #073f69 100%)' }}
                    >
                      {club.leader?.name?.charAt(0) || 'L'}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-mkce-900">{club.leader?.name || 'Club Leader'}</p>
                      <p className="text-xs text-surface-500">{club.leader?.department || 'Student Lead'}</p>
                    </div>
                    <span className="ml-auto badge-gold text-[10px]">
                      <Star size={10} className="mr-1" />
                      Lead
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'events' && (
              <motion.div
                key="events"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                {events.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar size={36} className="mx-auto mb-2 text-surface-300" />
                    <p className="text-surface-500 font-semibold text-sm">No events scheduled for this club yet</p>
                  </div>
                ) : (
                  events.map((event) => (
                    <Link
                      key={event._id}
                      to="/events"
                      className="flex items-center gap-4 p-4 rounded-2xl border border-surface-200/80 hover:border-mkce-300 hover:bg-surface-50 transition-all group"
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm font-display flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #06A3DA 0%, #073f69 100%)' }}
                      >
                        <Calendar size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-mkce-900 truncate group-hover:text-mkce-600 transition-colors">
                          {event.title}
                        </h4>
                        <p className="text-xs text-surface-500 mt-0.5">
                          {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} &bull; {event.location || 'Campus'}
                        </p>
                      </div>
                    </Link>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'posts' && (
              <motion.div
                key="posts"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                {posts.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle size={36} className="mx-auto mb-2 text-surface-300" />
                    <p className="text-surface-500 font-semibold text-sm">No discussions in this club yet</p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <div key={post._id} className="p-4 rounded-2xl border border-surface-200/80 hover:border-mkce-200 transition-all">
                      <h4 className="font-bold text-sm text-mkce-900">{post.title}</h4>
                      <p className="text-xs text-surface-600 mt-1 leading-relaxed">{post.content}</p>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'members' && (
              <motion.div
                key="members"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
              >
                {club.members?.map((member, i) => (
                  <div
                    key={member._id || i}
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-surface-50 border border-surface-200/80 hover:border-mkce-300 transition-all"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm text-sm"
                      style={{ background: 'linear-gradient(135deg, #06A3DA 0%, #073f69 100%)' }}
                    >
                      {member.name?.charAt(0) || 'M'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-mkce-900 truncate">{member.name || 'Member'}</p>
                      <p className="text-[10px] text-surface-400 truncate">{member.department || 'Student'}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
