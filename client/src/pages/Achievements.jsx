import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Heart, MessageCircle, Trophy, Award, Star, Send, X, Sparkles, Eye, ShieldCheck, Trash2, Medal, Crown } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { StaggerContainer, StaggerItem } from '../components/animations/StaggerContainer';
import { triggerConfetti, triggerAchievementFireworks } from '../components/animations/Confetti';
import SEO from '../components/SEO';

export default function Achievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', badge: '🏆 National Champion', mediaUrl: '' });
  const [commentText, setCommentText] = useState({});
  const [expandedComments, setExpandedComments] = useState({});

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try { const res = await api.get('/achievements'); setAchievements(res.data.data || []); }
    catch { toast.error('Failed to load achievements'); }
    setLoading(false);
  };

  const createAchievement = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Please enter an achievement title'); return; }
    try {
      await api.post('/achievements', { title: form.title.trim(), description: form.description.trim(), badge: form.badge, media: form.mediaUrl.trim() ? [form.mediaUrl.trim()] : [], department: user?.department || undefined });
      triggerAchievementFireworks();
      toast.success('Achievement published to Hall of Fame!');
      setShowCreate(false);
      setForm({ title: '', description: '', badge: '🏆 National Champion', mediaUrl: '' });
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to post achievement'); }
  };

  const likeAchievement = async (id) => { try { const res = await api.post(`/achievements/${id}/like`); triggerConfetti({ particleCount: 25, spread: 45 }); setAchievements((prev) => prev.map((a) => (a._id === id ? res.data.data : a))); } catch { toast.error('Failed to give kudos'); } };
  const addComment = async (id) => { const text = commentText[id]?.trim(); if (!text) return; try { const res = await api.post(`/achievements/${id}/comment`, { content: text }); setCommentText((prev) => ({ ...prev, [id]: '' })); setAchievements((prev) => prev.map((a) => (a._id === id ? res.data.data : a))); setExpandedComments((prev) => ({ ...prev, [id]: true })); toast.success('Comment added!'); } catch (err) { toast.error(err.response?.data?.message || 'Failed to add comment'); } };
  const highlightAchievement = async (id) => { try { const res = await api.put(`/achievements/${id}/highlight`); toast.success('Achievement highlighted!'); setAchievements((prev) => prev.map((a) => (a._id === id ? res.data.data : a))); } catch { toast.error('Failed to highlight'); } };
  const deleteAchievement = async (id) => { if (!window.confirm('Delete this achievement?')) return; try { await api.delete(`/achievements/${id}`); toast.success('Achievement removed'); setAchievements((prev) => prev.filter((a) => a._id !== id)); } catch { toast.error('Failed to delete'); } };
  const toggleComments = (id) => setExpandedComments((prev) => ({ ...prev, [id]: !prev[id] }));
  const formatDateSafely = (d) => { try { return format(new Date(d), 'MMM d, yyyy • h:mm a'); } catch { return 'Recently'; } };
  const canHighlight = user?.role === 'admin' || user?.role === 'hod' || user?.role === 'leader';

  const spotlightBadges = [
    { tier: 'gold', title: 'Grand Champion', user: 'Bob Smith', honor: 'SIH National Winners 2025', desc: 'Secured 1st place in Smart India Hackathon among 300+ university teams.', icon: Crown, bg: '#000000' },
    { tier: 'diamond', title: 'Research Vanguard', user: 'David Kim', honor: 'IEEE AI Transactions Publication', desc: 'Published peer-reviewed paper on Edge Neural Acceleration.', icon: Medal, bg: '#000000' },
    { tier: 'special', title: 'Open Source Fellow', user: 'Student Demo', honor: 'Google Summer of Code Selected', desc: 'Contributing to Linux Foundation distributed telemetry.', icon: Star, bg: '#000000' },
  ];

  const badgeOptions = ['🏆 National Champion', '📜 IEEE Scholar', '⭐ Open Source Star', '🤖 Robotics Innovator', '💡 Innovation Award', '🎖️ Campus Pioneer', '🥇 Hackathon Winner'];

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans text-zinc-900">
      <SEO title="Hall of Fame & Verified Student Achievements" description="Celebrate student victories, hackathon awards, research publications, and patents at M. Kumarasamy College of Engineering." keywords="MKCE Achievements, Student Awards Karur, Engineering Hall of Fame" canonical="/achievements" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1"><span className="badge-gold"><Trophy size={12} className="mr-1 text-black" />Verified Hall of Fame</span></div>
          <h1 className="page-heading">Campus Achievements</h1>
          <p className="text-zinc-500 text-sm mt-1">Celebrate project victories, hackathon ranks, research milestones, and campus honors.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-mkce flex items-center gap-2 self-start sm:self-auto"><Plus size={18} /><span>Post Achievement</span></button>
      </div>

      {/* Honor Roll Spotlight */}
      <div className="rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden bg-black border border-zinc-800 shadow-xl">
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white bg-zinc-900 border border-zinc-700">
              <Award size={20} />
            </div>
            <div>
              <h2 className="font-display font-black text-xl text-white">Campus Honor Roll</h2>
              <p className="text-xs text-zinc-400 font-medium">Distinguished student researchers & competition winners</p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-zinc-900 border border-zinc-700 text-zinc-300">
            <Sparkles size={13} className="text-white" />Verified Ledger
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
          {spotlightBadges.map((badge, i) => {
            const Icon = badge.icon;
            return (
              <div key={i} onClick={() => setSelectedBadge(badge)}
                className="rounded-2xl p-5 cursor-pointer flex flex-col items-center text-center group transition-all duration-200 hover:-translate-y-1 bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white bg-black border border-zinc-700 shadow-md mb-3 group-hover:scale-105 transition-transform duration-200">
                  <Icon size={30} className="text-white" />
                </div>
                <p className="font-display font-black text-base text-white group-hover:text-zinc-200 transition-colors">{badge.user}</p>
                <p className="text-xs text-zinc-400 font-bold mt-0.5">{badge.title}</p>
                <span className="text-[11px] text-zinc-400 mt-1 font-medium leading-tight line-clamp-1">{badge.honor}</span>
                <span className="text-[10px] font-bold text-white mt-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye size={11} /> View Details
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badge Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-3xl p-7 max-w-md w-full text-white text-center relative bg-black border border-zinc-800 shadow-2xl">
              <button onClick={() => setSelectedBadge(null)} className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800"><X size={20} /></button>
              <div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-white bg-zinc-900 border border-zinc-700 shadow-xl mb-4">
                <selectedBadge.icon size={38} className="text-white" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-zinc-900 border border-zinc-700 text-zinc-300">{selectedBadge.title}</span>
              <h3 className="text-2xl font-display font-black text-white mt-3">{selectedBadge.user}</h3>
              <p className="text-sm font-semibold text-zinc-300 mt-1">{selectedBadge.honor}</p>
              <p className="text-xs text-zinc-400 leading-relaxed mt-3 px-2 font-medium">{selectedBadge.desc}</p>
              <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                <span className="flex items-center gap-1 text-white font-bold"><ShieldCheck size={14} /> Verified by MKCE</span>
                <span>2025-26</span>
              </div>
              <button onClick={() => setSelectedBadge(null)} className="btn-mkce w-full py-2.5 text-sm font-bold mt-6 bg-white text-black hover:bg-zinc-200">Close Showcase</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
            <motion.div initial={{ opacity: 0, scale: 0.97, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 20 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-3xl w-full max-w-lg overflow-hidden border border-zinc-200 shadow-2xl">
              <div className="p-6 border-b border-zinc-800 text-white flex items-center justify-between bg-black">
                <div><h2 className="font-display font-bold text-lg text-white">Post Your Achievement</h2><p className="text-xs text-zinc-400 mt-0.5 font-medium">Share your hackathon, certification, or project victory</p></div>
                <button onClick={() => setShowCreate(false)} className="p-1 text-zinc-400 hover:text-white rounded-lg"><X size={20} /></button>
              </div>
              <form onSubmit={createAchievement} className="p-6 space-y-4">
                <div><label className="block text-xs font-bold text-black uppercase tracking-wider mb-2">Achievement Title</label>
                  <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="input-mkce" placeholder="e.g. 1st Place at Smart India Hackathon 2026" /></div>
                <div><label className="block text-xs font-bold text-black uppercase tracking-wider mb-2">Badge Type</label>
                  <select value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} className="input-mkce cursor-pointer font-medium">
                    {badgeOptions.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select></div>
                <div><label className="block text-xs font-bold text-black uppercase tracking-wider mb-2">Description & Highlights</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-mkce resize-none" placeholder="Provide details about the competition, tech stack, or certificate..." rows={4} /></div>
                <div><label className="block text-xs font-bold text-black uppercase tracking-wider mb-2">Media URL (Optional)</label>
                  <input type="url" value={form.mediaUrl} onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })} className="input-mkce text-xs" placeholder="https://images.unsplash.com/..." /></div>
                <div className="flex gap-3 pt-3">
                  <button type="submit" className="btn-mkce flex-1 py-3 text-sm font-bold">Post to Hall of Fame</button>
                  <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1 py-3 text-sm font-bold">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Achievement Feed */}
      {loading ? (
        <div className="space-y-5">{[1,2,3].map(i => <div key={i} className="skeleton rounded-3xl h-44" />)}</div>
      ) : achievements.length === 0 ? (
        <div className="card-premium p-12 text-center">
          <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-zinc-400"><Trophy size={32} /></div>
          <h3 className="font-display font-bold text-black text-lg">No Achievements Yet</h3>
          <p className="text-zinc-500 text-sm mt-1 font-medium">Be the pioneer and post the first milestone!</p>
          <button onClick={() => setShowCreate(true)} className="btn-mkce mt-4 text-xs inline-flex items-center gap-1.5"><Plus size={15} /><span>Post First Achievement</span></button>
        </div>
      ) : (
        <StaggerContainer className="space-y-5">
          {achievements.map((ach) => {
            const isLiked = ach.likes?.includes(user?.id || user?._id);
            const isOwner = ach.user?._id === (user?.id || user?._id) || ach.user === (user?.id || user?._id);
            return (
              <StaggerItem key={ach._id}>
                <div className="card-premium p-6 sm:p-7">
                  <div className="flex items-start gap-4 sm:gap-5">
                    <div className="w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 text-amber-600 bg-amber-50 border border-amber-200 shadow-xs">
                      <Trophy size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-display font-bold text-lg sm:text-xl text-zinc-900 leading-snug">{ach.title}</h3>
                          {ach.badge && <span className="badge-gold text-xs font-bold">{ach.badge}</span>}
                          {ach.isHighlighted && <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold"><Award size={13} />Verified Highlight</span>}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {canHighlight && !ach.isHighlighted && <button onClick={() => highlightAchievement(ach._id)} className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition-colors">⭐ Highlight</button>}
                          {(isOwner || user?.role === 'admin') && <button onClick={() => deleteAchievement(ach._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors"><Trash2 size={15} /></button>}
                        </div>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">Conferred to <span className="font-bold text-black">{ach.user?.name || 'Student'}</span>{ach.user?.department && <span className="text-zinc-400"> ({ach.user.department})</span>} • <span>{formatDateSafely(ach.createdAt)}</span></p>
                      {ach.description && <p className="text-zinc-700 text-sm mt-3 leading-relaxed whitespace-pre-wrap font-normal">{ach.description}</p>}
                      {ach.media?.length > 0 && ach.media[0] && (
                        <div className="mt-4 rounded-2xl overflow-hidden max-h-72 border border-zinc-200 bg-zinc-50">
                          <img src={ach.media[0]} alt={ach.title} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                        </div>
                      )}
                      <div className="flex items-center gap-6 mt-4 pt-3.5 border-t border-zinc-100">
                        <button onClick={() => likeAchievement(ach._id)} className={`flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95 ${isLiked ? 'text-rose-600' : 'text-zinc-500 hover:text-rose-600'}`}>
                          <Heart size={17} fill={isLiked ? 'currentColor' : 'none'} strokeWidth={2} /><span>{ach.likes?.length || 0} Kudos</span>
                        </button>
                        <button onClick={() => toggleComments(ach._id)} className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-blue-600 transition-colors">
                          <MessageCircle size={17} /><span>{ach.comments?.length || 0} Comments</span>
                        </button>
                      </div>
                      {expandedComments[ach._id] && ach.comments?.length > 0 && (
                        <div className="mt-3.5 space-y-2 p-3.5 rounded-2xl border border-zinc-200 bg-zinc-50">
                          {ach.comments.map((comment, i) => (
                            <div key={comment._id || i} className="text-xs flex items-start gap-2">
                              <span className="font-bold text-black shrink-0">{comment.author?.name || 'Peer'}:</span>
                              <span className="text-zinc-700 leading-relaxed">{comment.content}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-3.5">
                        <input type="text" value={commentText[ach._id] || ''} onChange={(e) => setCommentText({ ...commentText, [ach._id]: e.target.value })}
                          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addComment(ach._id); } }}
                          className="input-mkce py-2 text-xs flex-1" placeholder="Congratulate your peer..." />
                        <button onClick={() => addComment(ach._id)} disabled={!commentText[ach._id]?.trim()} className="btn-mkce px-4 py-2 text-xs font-bold disabled:opacity-40"><Send size={13} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}
    </div>
  );
}
