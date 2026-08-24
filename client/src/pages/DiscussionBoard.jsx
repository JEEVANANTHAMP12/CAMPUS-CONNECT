import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Heart, MessageCircle, Pin, Flag, Send, X, MessageSquare, Sparkles, User, Search, Trash2, Filter, Shield, Users, Building, Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { StaggerContainer, StaggerItem } from '../components/animations/StaggerContainer';
import { triggerConfetti } from '../components/animations/Confetti';
import SEO from '../components/SEO';

export default function DiscussionBoard() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [form, setForm] = useState({ title: '', content: '', boardType: 'general' });
  const [commentText, setCommentText] = useState({});
  const [expandedComments, setExpandedComments] = useState({});

  useEffect(() => { fetchPosts(); }, [selectedChannel]);

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedChannel !== 'all') params.append('boardType', selectedChannel);
      if (search.trim()) params.append('search', search.trim());
      const res = await api.get(`/posts?${params.toString()}`);
      setPosts(res.data.data || []);
    } catch { toast.error('Failed to load discussions'); }
    setLoading(false);
  };

  const handleSearchSubmit = (e) => { e.preventDefault(); fetchPosts(); };

  const createPost = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) { toast.error('Please fill in title and content'); return; }
    try {
      await api.post('/posts', { title: form.title.trim(), content: form.content.trim(), boardType: form.boardType, department: user?.department || undefined });
      triggerConfetti({ particleCount: 60, spread: 55 });
      toast.success('Discussion thread published!');
      setShowCreate(false);
      setForm({ title: '', content: '', boardType: 'general' });
      fetchPosts();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create post'); }
  };

  const likePost = async (postId) => {
    try { const res = await api.post(`/posts/${postId}/like`); triggerConfetti({ particleCount: 20, spread: 35 }); setPosts((prev) => prev.map((p) => (p._id === postId ? res.data.data : p))); }
    catch { toast.error('Failed to like post'); }
  };

  const addComment = async (postId) => {
    const text = commentText[postId]?.trim();
    if (!text) return;
    try { const res = await api.post(`/posts/${postId}/comment`, { content: text }); setCommentText((prev) => ({ ...prev, [postId]: '' })); setPosts((prev) => prev.map((p) => (p._id === postId ? res.data.data : p))); setExpandedComments((prev) => ({ ...prev, [postId]: true })); toast.success('Comment published!'); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to add comment'); }
  };

  const reportPost = async (postId) => { try { await api.post(`/posts/${postId}/report`); toast.success('Thread flagged for admin moderation.'); } catch { toast.error('Failed to report post'); } };

  const pinPost = async (postId) => { try { const res = await api.put(`/posts/${postId}/pin`); toast.success(res.data.data.isPinned ? 'Post pinned to top!' : 'Post unpinned'); setPosts((prev) => prev.map((p) => (p._id === postId ? res.data.data : p))); } catch { toast.error('Failed to pin post'); } };

  const deletePost = async (postId) => { if (!window.confirm('Delete this discussion?')) return; try { await api.delete(`/posts/${postId}`); toast.success('Post removed'); setPosts((prev) => prev.filter((p) => p._id !== postId)); } catch { toast.error('Failed to delete post'); } };

  const toggleComments = (postId) => setExpandedComments((prev) => ({ ...prev, [postId]: !prev[postId] }));

  const getBoardTypeBadge = (type) => {
    switch (type) {
      case 'club': return 'bg-amber-50 text-amber-700 border-amber-200/80';
      case 'department': return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'career': return 'bg-purple-50 text-purple-700 border-purple-200/80';
      default: return 'bg-mkce-50 text-mkce-700 border-mkce-200/80';
    }
  };

  const channels = [
    { id: 'all', label: 'All Channels', icon: MessageSquare },
    { id: 'general', label: 'General Campus', icon: Users },
    { id: 'department', label: 'Departmental', icon: Building },
    { id: 'club', label: 'Clubs & Chapters', icon: Sparkles },
    { id: 'career', label: 'Careers & Placements', icon: Briefcase },
  ];

  const formatDateSafely = (d) => { try { return format(new Date(d), 'MMM d, yyyy • h:mm a'); } catch { return 'Recently'; } };
  const canPin = user?.role === 'admin' || user?.role === 'hod' || user?.role === 'leader';

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      <SEO title="Engineering Forums & Student Discussions" description="Join active discussions, ask technical questions, collaborate on project ideas, and interact with departmental peers at MKCE." keywords="MKCE Discussions, Engineering Forum Karur, Student Tech Forum" canonical="/discussions" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1"><span className="badge-blue"><Sparkles size={11} className="mr-1" />Interactive Community Forum</span></div>
          <h1 className="page-heading">Discussion Board</h1>
          <p className="text-surface-500 text-sm mt-1">Exchange engineering perspectives, ask peer questions, and collaborate across departments.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-mkce flex items-center gap-2 self-start sm:self-auto shimmer-btn"><Plus size={18} /><span>Start Thread</span></button>
      </div>

      {/* Channel Tabs & Search */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {channels.map((ch) => {
            const Icon = ch.icon;
            const active = selectedChannel === ch.id;
            return (
              <button key={ch.id} onClick={() => setSelectedChannel(ch.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                  active ? 'bg-mkce-700 text-white shadow-sm' : 'bg-white text-surface-600 hover:bg-surface-100/80 border border-surface-200/80'
                }`}>
                <Icon size={14} /><span>{ch.label}</span>
              </button>
            );
          })}
        </div>
        <form onSubmit={handleSearchSubmit} className="relative min-w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search discussions..." className="input-mkce pl-9 py-2 text-xs w-full" />
        </form>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
            <motion.div initial={{ opacity: 0, scale: 0.97, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 20 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-3xl w-full max-w-lg overflow-hidden" style={{ boxShadow: '0 24px 64px -12px rgba(0,0,0,0.2)' }}>
              <div className="p-6 border-b border-surface-100 text-white flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #09203f 0%, #073f69 50%, #06A3DA 100%)' }}>
                <div><h2 className="font-display font-bold text-lg">Start New Discussion</h2><p className="text-xs text-mkce-200/80 mt-0.5">Share with your branch, club, or the full campus</p></div>
                <button onClick={() => setShowCreate(false)} className="p-1 text-white/60 hover:text-white rounded-lg"><X size={20} /></button>
              </div>
              <form onSubmit={createPost} className="p-6 space-y-4">
                <div><label className="block text-xs font-bold text-mkce-900 uppercase tracking-wider mb-2">Topic Title</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="input-mkce" placeholder="e.g. Best practices for optimizing PyTorch models" /></div>
                <div><label className="block text-xs font-bold text-mkce-900 uppercase tracking-wider mb-2">Discussion Content</label><textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required className="input-mkce resize-none" placeholder="Elaborate on your idea, question, or discussion point..." rows={4} /></div>
                <div><label className="block text-xs font-bold text-mkce-900 uppercase tracking-wider mb-2">Board Channel</label>
                  <select value={form.boardType} onChange={(e) => setForm({ ...form, boardType: e.target.value })} className="input-mkce cursor-pointer">
                    <option value="general">General Campus Discussion</option>
                    <option value="department">Department Technical ({user?.department || 'Department'})</option>
                    <option value="club">Clubs & Student Chapters</option>
                    <option value="career">Careers & Placements</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-3">
                  <button type="submit" className="btn-mkce flex-1 py-3 text-sm font-bold">Publish Thread</button>
                  <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1 py-3 text-sm">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Posts */}
      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="skeleton rounded-3xl h-48" />)}</div>
      ) : posts.length === 0 ? (
        <div className="card-premium p-12 text-center">
          <div className="w-16 h-16 bg-mkce-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-mkce-600"><MessageSquare size={32} /></div>
          <h3 className="font-display font-bold text-mkce-900 text-lg">No Discussions Found</h3>
          <p className="text-surface-500 text-sm mt-1">Be the catalyst and start the first conversation on campus!</p>
          <button onClick={() => setShowCreate(true)} className="btn-mkce mt-4 text-xs inline-flex items-center gap-1.5"><Plus size={15} /><span>Create First Thread</span></button>
        </div>
      ) : (
        <StaggerContainer className="space-y-4">
          {posts.map((post) => {
            const isLiked = post.likes?.includes(user?.id || user?._id);
            const isAuthor = post.author?._id === (user?.id || user?._id) || post.author === (user?.id || user?._id);
            const authorInitial = (post.author?.name || 'C').charAt(0).toUpperCase();
            return (
              <StaggerItem key={post._id}>
                <div className="card-premium p-6 sm:p-7">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-display font-bold text-white text-base shrink-0"
                      style={{ background: 'linear-gradient(135deg, #06A3DA 0%, #073f69 100%)', boxShadow: '0 2px 8px rgba(6,163,218,0.2)' }}>
                      {authorInitial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-display font-bold text-lg text-mkce-900 leading-snug">{post.title}</h3>
                          {post.isPinned && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/80 text-[10px] font-extrabold"><Pin size={11} className="fill-current" />Pinned</span>}
                          <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${getBoardTypeBadge(post.boardType)}`}>{post.boardType || 'General'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {canPin && <button onClick={() => pinPost(post._id)} className={`p-1.5 rounded-lg hover:bg-surface-100 transition-colors ${post.isPinned ? 'text-amber-600' : 'text-surface-400 hover:text-amber-600'}`} title={post.isPinned ? 'Unpin' : 'Pin'}><Pin size={14} /></button>}
                          {(isAuthor || user?.role === 'admin') && <button onClick={() => deletePost(post._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-surface-400 hover:text-red-600 transition-colors" title="Delete"><Trash2 size={14} /></button>}
                        </div>
                      </div>
                      <p className="text-xs text-surface-500 mt-1">Posted by <span className="font-semibold text-mkce-800">{post.author?.name || 'Campus Member'}</span>{post.author?.department && <span className="text-surface-400"> ({post.author.department})</span>} • <span>{formatDateSafely(post.createdAt)}</span></p>
                      <p className="text-surface-700 text-sm mt-3 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                      <div className="flex items-center gap-5 mt-4 pt-3.5 border-t border-surface-100/60">
                        <button onClick={() => likePost(post._id)} className={`flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95 ${isLiked ? 'text-red-500' : 'text-surface-500 hover:text-red-500'}`}>
                          <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} strokeWidth={2} /><span>{post.likes?.length || 0} Likes</span>
                        </button>
                        <button onClick={() => toggleComments(post._id)} className="flex items-center gap-1.5 text-xs font-bold text-surface-500 hover:text-mkce-600 transition-colors">
                          <MessageCircle size={16} /><span>{post.comments?.length || 0} Replies</span>
                        </button>
                        {!isAuthor && <button onClick={() => reportPost(post._id)} className="flex items-center gap-1 text-xs text-surface-400 hover:text-red-500 transition-colors ml-auto"><Flag size={13} /><span className="hidden sm:inline">Report</span></button>}
                      </div>
                      {expandedComments[post._id] && post.comments?.length > 0 && (
                        <div className="mt-4 space-y-2.5 p-4 rounded-2xl border border-surface-100/60" style={{ background: 'rgba(248,250,252,0.6)' }}>
                          {post.comments.map((comment, i) => (
                            <div key={comment._id || i} className="text-xs flex items-start gap-2.5">
                              <div className="w-6 h-6 rounded-lg bg-mkce-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">{comment.author?.name?.charAt(0) || 'P'}</div>
                              <div className="flex-1 min-w-0"><span className="font-bold text-mkce-900 mr-1.5">{comment.author?.name || 'Campus Member'}:</span><span className="text-surface-700 leading-relaxed">{comment.content}</span></div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-3.5">
                        <input type="text" value={commentText[post._id] || ''} onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addComment(post._id); } }}
                          className="input-mkce py-2 text-xs flex-1" placeholder="Add a reply..." />
                        <button onClick={() => addComment(post._id)} disabled={!commentText[post._id]?.trim()} className="btn-mkce px-4 py-2 text-xs font-bold disabled:opacity-40"><Send size={13} /></button>
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
