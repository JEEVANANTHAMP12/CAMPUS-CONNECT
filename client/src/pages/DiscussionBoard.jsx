import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Heart, MessageCircle, Pin, Flag, Send, X, MessageSquare, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function DiscussionBoard() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    boardType: 'general'
  });
  const [commentText, setCommentText] = useState({});
  const [expandedComments, setExpandedComments] = useState({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/posts');
      setPosts(res.data.data);
    } catch (err) {
      toast.error('Failed to load discussions');
    }
    setLoading(false);
  };

  const createPost = async (e) => {
    e.preventDefault();
    try {
      await api.post('/posts', form);
      toast.success('Post published!');
      setShowCreate(false);
      setForm({ title: '', content: '', boardType: 'general' });
      fetchPosts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create post');
    }
  };

  const likePost = async (postId) => {
    try {
      await api.post(`/posts/${postId}/like`);
      fetchPosts();
    } catch (err) {
      toast.error('Failed to like post');
    }
  };

  const addComment = async (postId) => {
    if (!commentText[postId]?.trim()) return;
    try {
      await api.post(`/posts/${postId}/comment`, { content: commentText[postId] });
      setCommentText({ ...commentText, [postId]: '' });
      toast.success('Comment added!');
      fetchPosts();
    } catch (err) {
      toast.error('Failed to add comment');
    }
  };

  const reportPost = async (postId) => {
    try {
      await api.post(`/posts/${postId}/report`);
      toast.success('Post reported. We will review it shortly.');
    } catch (err) {
      toast.error('Failed to report post');
    }
  };

  const toggleComments = (postId) => {
    setExpandedComments({
      ...expandedComments,
      [postId]: !expandedComments[postId]
    });
  };

  const getBoardTypeBadge = (type) => {
    const badges = {
      general: 'badge-primary',
      club: 'badge-gold',
      department: 'badge-success',
      anonymous: 'badge-danger'
    };
    return badges[type] || 'badge-primary';
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Discussion Board</h1>
          <p className="text-surface-500 mt-1">Share ideas and connect with peers</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          New Post
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-surface-900/50 z-50 flex items-center justify-center p-4 animate-in">
          <div className="card w-full max-w-lg p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title">Create Post</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="text-surface-400 hover:text-surface-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={createPost} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="input-field"
                  placeholder="Give your post a title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Content
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  required
                  className="input-field resize-none"
                  placeholder="Share your thoughts, questions, or ideas..."
                  rows={5}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Board Type
                </label>
                <select
                  value={form.boardType}
                  onChange={(e) => setForm({ ...form, boardType: e.target.value })}
                  className="input-field"
                >
                  <option value="general">General Discussion</option>
                  <option value="club">Club Related</option>
                  <option value="department">Department</option>
                  <option value="anonymous">Anonymous</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  Publish Post
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
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-mkce-200 border-t-mkce-600"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-mkce-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageSquare size={32} className="text-mkce-500" />
          </div>
          <h3 className="section-title mb-2">No Discussions Yet</h3>
          <p className="text-surface-500">Be the first to start a conversation!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post._id} className="card p-5 hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-gradient-to-br from-mkce-500 to-mkce-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-white font-display font-semibold text-sm">
                    {getInitials(post.author?.name)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-semibold text-surface-900">
                      {post.title}
                    </h3>
                    {post.isPinned && (
                      <Pin size={14} className="text-gold-500" fill="currentColor" />
                    )}
                    <span className={getBoardTypeBadge(post.boardType)}>
                      {post.boardType}
                    </span>
                  </div>
                  <p className="text-sm text-surface-500 mt-0.5">
                    {post.author?.name} • {format(new Date(post.createdAt), 'MMM d, h:mm a')}
                  </p>
                  <p className="text-surface-700 mt-3 whitespace-pre-wrap leading-relaxed">
                    {post.content}
                  </p>

                  <div className="flex items-center gap-5 mt-4 pt-3 border-t border-surface-100">
                    <button
                      onClick={() => likePost(post._id)}
                      className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                        post.likes?.includes(user?.id)
                          ? 'text-red-500'
                          : 'text-surface-400 hover:text-red-500'
                      }`}
                    >
                      <Heart
                        size={18}
                        fill={post.likes?.includes(user?.id) ? 'currentColor' : 'none'}
                      />
                      {post.likes?.length || 0}
                    </button>
                    <button
                      onClick={() => toggleComments(post._id)}
                      className="flex items-center gap-1.5 text-sm font-medium text-surface-400 hover:text-mkce-600 transition-colors"
                    >
                      <MessageCircle size={18} />
                      {post.comments?.length || 0}
                    </button>
                    {post.author?._id !== user?.id && (
                      <button
                        onClick={() => reportPost(post._id)}
                        className="flex items-center gap-1.5 text-sm text-surface-400 hover:text-orange-500 transition-colors ml-auto"
                      >
                        <Flag size={16} />
                        <span className="hidden sm:inline">Report</span>
                      </button>
                    )}
                  </div>

                  {expandedComments[post._id] && post.comments?.length > 0 && (
                    <div className="mt-4 space-y-3 bg-surface-50 rounded-xl p-4">
                      {post.comments.slice(-3).map((comment, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <div className="w-7 h-7 bg-surface-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-surface-600">
                              {getInitials(comment.author?.name)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-surface-700">
                                {comment.author?.name}
                              </span>
                              <span className="text-xs text-surface-400">
                                {format(new Date(comment.createdAt), 'MMM d')}
                              </span>
                            </div>
                            <p className="text-sm text-surface-600 mt-0.5">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-3">
                    <input
                      type="text"
                      value={commentText[post._id] || ''}
                      onChange={(e) =>
                        setCommentText({ ...commentText, [post._id]: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          addComment(post._id);
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mkce-500/20 focus:border-mkce-400 transition-all placeholder:text-surface-400"
                      placeholder="Write a comment..."
                    />
                    <button
                      onClick={() => addComment(post._id)}
                      disabled={!commentText[post._id]?.trim()}
                      className="p-2 bg-mkce-600 text-white rounded-xl hover:bg-mkce-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={16} />
                    </button>
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
