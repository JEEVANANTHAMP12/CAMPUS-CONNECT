import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Users, Calendar, MessageSquare, ArrowLeft, Clock, MapPin, Heart, MessageCircle, Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ClubDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => { fetchClub(); }, [id]);

  const fetchClub = async () => {
    setLoading(true);
    setError(null);
    try {
      const [clubRes, eventsRes, postsRes] = await Promise.all([
        api.get(`/clubs/${id}`),
        api.get(`/events?club=${id}`),
        api.get(`/posts?club=${id}`)
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
      toast.success('Joined club!');
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
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-surface-200 border-t-mkce-600"></div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="space-y-6 animate-in">
        <Link to="/clubs" className="inline-flex items-center gap-2 text-surface-500 hover:text-surface-700 transition-colors">
          <ArrowLeft size={18} /> Back to Clubs
        </Link>
        <div className="card p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-100 flex items-center justify-center">
            <Users size={32} className="text-surface-400" />
          </div>
          <h3 className="section-title text-surface-700 mb-1">Club Not Found</h3>
          <p className="text-surface-500 text-sm">{error || 'The club you are looking for does not exist.'}</p>
          <Link to="/clubs" className="btn-primary inline-block mt-4">Browse Clubs</Link>
        </div>
      </div>
    );
  }

  const isMember = club.members?.some(m => m._id === user?.id || m === user?.id);
  const isLeader = club.leader?._id === user?.id || club.leader === user?.id;

  const tabs = [
    { id: 'about', label: 'About' },
    { id: 'events', label: 'Events' },
    { id: 'posts', label: 'Posts' },
    { id: 'members', label: 'Members' }
  ];

  return (
    <div className="space-y-6 animate-in">
      <Link to="/clubs" className="inline-flex items-center gap-2 text-surface-500 hover:text-surface-700 transition-colors">
        <ArrowLeft size={18} /> Back to Clubs
      </Link>

      <div className="card overflow-hidden">
        <div className="h-52 bg-gradient-to-br from-mkce-700 via-mkce-800 to-mkce-950 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white/20 text-[140px] font-display font-bold leading-none">
              {club.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        <div className="p-6 relative">
          <div className="absolute -top-10 left-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-mkce-500 to-mkce-700 flex items-center justify-center shadow-lg border-4 border-white">
              <span className="text-white text-3xl font-display font-bold">
                {club.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="pt-8">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="page-title">{club.name}</h1>
                <div className="flex items-center gap-3 mt-2">
                  {club.department && <span className="badge-primary">{club.department}</span>}
                  <span className="text-surface-500 text-sm flex items-center gap-1">
                    <Users size={14} className="text-mkce-500" />
                    {club.members?.length || 0} members
                  </span>
                  <span className="text-surface-500 text-sm flex items-center gap-1">
                    <Calendar size={14} className="text-mkce-500" />
                    {events.length} events
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {isMember ? (
                  <>
                    <Link
                      to={`/messages?club=${club._id}`}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <MessageSquare size={16} /> Chat
                    </Link>
                    {!isLeader && (
                      <button onClick={leaveClub} className="btn-danger">
                        Leave Club
                      </button>
                    )}
                  </>
                ) : (
                  <button onClick={joinClub} className="btn-primary">
                    Join Club
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-surface-200">
        <div className="flex gap-1 scrollbar-thin overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.id
                  ? 'text-mkce-600 border-b-2 border-mkce-600'
                  : 'text-surface-500 hover:text-surface-700 border-b-2 border-transparent hover:border-surface-300'
              }`}
            >
              {tab.label}
              {tab.id === 'events' && <span className="ml-1.5 text-xs">({events.length})</span>}
              {tab.id === 'posts' && <span className="ml-1.5 text-xs">({posts.length})</span>}
              {tab.id === 'members' && <span className="ml-1.5 text-xs">({club.members?.length || 0})</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-6 min-h-[300px]">
        {activeTab === 'about' && (
          <div className="space-y-6 animate-in">
            <div>
              <h3 className="section-title mb-3">About</h3>
              <p className="text-surface-600 leading-relaxed">
                {club.description || 'No description available for this club.'}
              </p>
            </div>

            {club.activities?.length > 0 && (
              <div>
                <h3 className="section-title mb-3">Activities</h3>
                <div className="flex flex-wrap gap-2">
                  {club.activities.map((activity, i) => (
                    <span key={i} className="badge-primary">
                      {activity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="section-title mb-3">Club Leader</h3>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-50 border border-surface-100">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-mkce-500 to-mkce-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-display font-bold text-xl">
                    {club.leader?.name?.charAt(0) || '?'}
                  </span>
                </div>
                <div>
                  <p className="font-display font-semibold text-surface-900">{club.leader?.name || 'Unknown'}</p>
                  <p className="text-sm text-surface-500">{club.leader?.department || 'Club Leader'}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="section-title mb-3">Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-surface-50 border border-surface-100">
                  <div className="flex items-center gap-2 text-mkce-600 mb-1">
                    <Users size={16} />
                    <span className="text-sm font-medium">Members</span>
                  </div>
                  <p className="text-2xl font-display font-bold text-surface-900">{club.members?.length || 0}</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-50 border border-surface-100">
                  <div className="flex items-center gap-2 text-mkce-600 mb-1">
                    <Calendar size={16} />
                    <span className="text-sm font-medium">Events</span>
                  </div>
                  <p className="text-2xl font-display font-bold text-surface-900">{events.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-3 animate-in">
            {events.length === 0 ? (
              <div className="text-center py-12">
                <Calendar size={40} className="mx-auto mb-3 text-surface-300" />
                <p className="text-surface-500">No events yet</p>
              </div>
            ) : (
              events.map(event => (
                <Link
                  key={event._id}
                  to={`/events`}
                  className="block p-4 rounded-xl border border-surface-100 hover:border-mkce-200 hover:bg-surface-50 transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-mkce-100 to-mkce-200 flex items-center justify-center flex-shrink-0">
                      <Calendar size={20} className="text-mkce-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display font-semibold text-surface-900">{event.title}</h4>
                      <div className="flex items-center gap-4 mt-1.5 text-sm text-surface-500">
                        <span className="flex items-center gap-1">
                          <Clock size={14} className="text-mkce-400" />
                          {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={14} className="text-mkce-400" />
                            {event.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="space-y-3 animate-in">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle size={40} className="mx-auto mb-3 text-surface-300" />
                <p className="text-surface-500">No posts yet</p>
              </div>
            ) : (
              posts.map(post => (
                <div key={post._id} className="p-4 rounded-xl border border-surface-100 hover:border-mkce-200 transition-all duration-200">
                  <h4 className="font-display font-semibold text-surface-900">{post.title}</h4>
                  <p className="text-sm text-surface-500 mt-1.5 line-clamp-2 leading-relaxed">{post.content}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-surface-400">
                    <span className="flex items-center gap-1">
                      <Star size={12} className="text-mkce-400" />
                      {post.author?.name || 'Unknown'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart size={12} className="text-mkce-400" />
                      {post.likes?.length || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle size={12} className="text-mkce-400" />
                      {post.comments?.length || 0}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="animate-in">
            {club.members?.length === 0 ? (
              <div className="text-center py-12">
                <Users size={40} className="mx-auto mb-3 text-surface-300" />
                <p className="text-surface-500">No members yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {club.members?.map((member, index) => (
                  <div
                    key={member._id || member}
                    className={`flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 border border-transparent hover:border-surface-100 transition-all duration-200 animate-in stagger-${Math.min(index + 1, 5)}`}
                  >
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-mkce-500 to-mkce-700 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-display font-semibold text-sm">
                        {member.name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-surface-900 truncate">{member.name || 'Member'}</p>
                      <p className="text-xs text-surface-500 truncate">{member.department || 'Student'}</p>
                    </div>
                    {member._id === club.leader?._id && (
                      <span className="badge-gold ml-auto flex-shrink-0">
                        <Star size={10} className="mr-0.5" />
                        Leader
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
