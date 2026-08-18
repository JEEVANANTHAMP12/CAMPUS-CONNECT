import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Heart, MessageCircle, Trophy, Award, Star, Send, X } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function Achievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [topAchievers, setTopAchievers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });
  const [commentText, setCommentText] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [achRes, topRes] = await Promise.all([
        api.get('/achievements'),
        api.get('/achievements/top-achievers'),
      ]);
      setAchievements(achRes.data.data);
      setTopAchievers(topRes.data.data);
    } catch (err) {
      toast.error('Failed to load achievements');
    }
    setLoading(false);
  };

  const createAchievement = async (e) => {
    e.preventDefault();
    try {
      await api.post('/achievements', form);
      toast.success('Achievement posted!');
      setShowCreate(false);
      setForm({ title: '', description: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post achievement');
    }
  };

  const likeAchievement = async (id) => {
    try {
      await api.post(`/achievements/${id}/like`);
      fetchData();
    } catch (err) {
      toast.error('Failed to like achievement');
    }
  };

  const addComment = async (id) => {
    if (!commentText[id]?.trim()) return;
    try {
      await api.post(`/achievements/${id}/comment`, {
        content: commentText[id],
      });
      setCommentText({ ...commentText, [id]: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add comment');
    }
  };

  const getRankBadge = (index) => {
    if (index === 0) return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white';
    if (index === 1) return 'bg-gradient-to-r from-gray-300 to-gray-400 text-white';
    if (index === 2) return 'bg-gradient-to-r from-orange-400 to-orange-500 text-white';
    return 'bg-surface-200 text-surface-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Achievement Feed</h1>
          <p className="text-surface-500 mt-1">Celebrate campus accomplishments</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-gold flex items-center gap-2"
        >
          <Plus size={18} />
          Post Achievement
        </button>
      </div>

      {topAchievers.length > 0 && (
        <div className="bg-gradient-to-r from-gold-500 via-gold-400 to-gold-600 rounded-xl p-6 text-white shadow-lg shadow-gold-500/20">
          <div className="flex items-center gap-2 mb-5">
            <Star size={22} className="text-white" fill="currentColor" />
            <h2 className="font-display font-bold text-xl">Top Achievers</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topAchievers.map((achiever, index) => (
              <div
                key={index}
                className="bg-white/15 backdrop-blur-sm rounded-xl p-4 flex items-center gap-4 hover:bg-white/25 transition-colors"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-display font-bold text-lg flex-shrink-0 ${getRankBadge(
                    index
                  )}`}
                >
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <p className="font-display font-semibold text-white truncate">
                    {achiever.userName}
                  </p>
                  <p className="text-sm text-white/80 truncate">{achiever.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-surface-900/50 z-50 flex items-center justify-center p-4 animate-in">
          <div className="card w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title">Post Achievement</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="text-surface-400 hover:text-surface-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={createAchievement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Achievement Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="input-field"
                  placeholder="What did you achieve?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="input-field resize-none"
                  placeholder="Describe your achievement..."
                  rows={4}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-gold flex-1">
                  Post
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-gold-200 border-t-gold-500"></div>
        </div>
      ) : achievements.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-gold-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trophy size={32} className="text-gold-500" />
          </div>
          <h3 className="section-title mb-2">No Achievements Yet</h3>
          <p className="text-surface-500">
            Be the first to share an accomplishment!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {achievements.map((ach) => (
            <div key={ach._id} className="card overflow-hidden">
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-gold-300/30">
                    <Trophy size={22} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display font-semibold text-lg text-surface-900">
                        {ach.title}
                      </h3>
                      {ach.isHighlighted && (
                        <span className="badge-gold flex items-center gap-1">
                          <Award size={12} />
                          Highlighted
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-surface-500 mt-0.5">
                      {ach.user?.name} &middot;{' '}
                      {format(new Date(ach.createdAt), 'MMM d, h:mm a')}
                    </p>
                    {ach.description && (
                      <p className="text-surface-700 mt-2">{ach.description}</p>
                    )}

                    <div className="flex items-center gap-5 mt-4">
                      <button
                        onClick={() => likeAchievement(ach._id)}
                        className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                          ach.likes?.includes(user?.id)
                            ? 'text-red-500'
                            : 'text-surface-400 hover:text-red-500'
                        }`}
                      >
                        <Heart
                          size={18}
                          fill={
                            ach.likes?.includes(user?.id) ? 'currentColor' : 'none'
                          }
                          strokeWidth={
                            ach.likes?.includes(user?.id) ? 0 : 2
                          }
                        />
                        {ach.likes?.length || 0}
                      </button>
                      <span className="flex items-center gap-1.5 text-sm text-surface-400">
                        <MessageCircle size={18} />
                        {ach.comments?.length || 0}
                      </span>
                    </div>

                    {ach.comments?.length > 0 && (
                      <div className="mt-3 space-y-2.5 border-t border-surface-100 pt-3">
                        {ach.comments.slice(-3).map((comment, i) => (
                          <div key={i} className="text-sm">
                            <span className="font-medium text-surface-800">
                              {comment.author?.name}
                            </span>
                            <span className="text-surface-500 ml-1.5">
                              {comment.content}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-3">
                      <input
                        type="text"
                        value={commentText[ach._id] || ''}
                        onChange={(e) =>
                          setCommentText({
                            ...commentText,
                            [ach._id]: e.target.value,
                          })
                        }
                        onKeyDown={(e) =>
                          e.key === 'Enter' && addComment(ach._id)
                        }
                        className="input-field flex-1 !py-2 text-sm"
                        placeholder="Add a comment..."
                      />
                      <button
                        onClick={() => addComment(ach._id)}
                        disabled={!commentText[ach._id]?.trim()}
                        className="btn-primary !px-3 !py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
