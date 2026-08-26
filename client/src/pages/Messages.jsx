import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import socket from '../utils/socket';
import { Send, Search, ArrowLeft, MessageSquare, Sparkles, ShieldCheck, CheckCircle2, Circle } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';

export default function Messages() {
  const { userId } = useParams();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchConversations();
    if (user) {
      socket.connect();
      socket.emit('user-online', user?.id);
    }
    const handleOnlineUsers = (users) => setOnlineUsers(users || []);
    const handleReceiveMsg = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on('online-users', handleOnlineUsers);
    socket.on('receive-message', handleReceiveMsg);

    return () => {
      socket.off('online-users', handleOnlineUsers);
      socket.off('receive-message', handleReceiveMsg);
    };
  }, [user]);

  useEffect(() => {
    if (userId) loadMessages(userId);
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations');
      setConversations(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load conversations');
    }
    setLoading(false);
  };

  const loadMessages = async (uid) => {
    try {
      const res = await api.get(`/messages/${uid}`);
      setMessages(res.data.data || []);
      setSelectedUser(uid);
      const conv = conversations.find((c) => (c._id?._id || c._id) === uid);
      setSelectedConversation(conv);
      socket.emit('join-room', [user.id, uid].sort().join('-'));
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (err) {
      toast.error('Failed to load messages');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || sending) return;
    setSending(true);
    try {
      const res = await api.post('/messages', {
        receiver: selectedUser,
        content: newMessage.trim(),
      });
      setMessages((prev) => [...prev, res.data.data]);
      socket.emit('send-message', { ...res.data.data, receiver: selectedUser });
      setNewMessage('');
      fetchConversations();
    } catch (err) {
      toast.error('Failed to send message');
    }
    setSending(false);
  };

  const formatDateSafely = (dateString, pattern = 'h:mm a') => {
    try {
      return format(new Date(dateString), pattern);
    } catch {
      return '';
    }
  };

  const filteredConversations = conversations.filter((c) =>
    (c._id?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-zinc-900">
      <SEO
        title="Direct Campus Messenger & Chapter Chats"
        description="Collaborate in real-time with fellow students, club leaders, and academic peers across M. Kumarasamy College of Engineering."
        keywords="MKCE Chat, Campus Messenger, Student Collaboration, MKCE Direct Messages"
        canonical="/messages"
      />

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-blue">
              <Sparkles size={11} className="mr-1" />
              Real-time Encrypted Stream
            </span>
          </div>
          <h1 className="page-heading">Campus Messenger</h1>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200 shadow-card overflow-hidden">
        <div className="flex h-[calc(100vh-16rem)] min-h-[500px]">
          {/* Conversation Sidebar */}
          <div
            className={`w-full md:w-80 border-r border-zinc-200 flex flex-col bg-white ${
              selectedUser ? 'hidden md:flex' : 'flex'
            }`}
          >
            <div className="p-4 border-b border-zinc-100 bg-white">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-mkce pl-10 py-2.5 text-xs"
                  placeholder="Search conversations..."
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-zinc-100">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-2 border-zinc-200 border-t-black rounded-full animate-spin" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare size={32} className="mx-auto text-zinc-300 mb-2" />
                  <p className="text-zinc-500 text-xs font-semibold">No conversations yet</p>
                  <p className="text-zinc-400 text-[11px] mt-1">Start chatting by opening a club or student profile.</p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const uid = conv._id?._id || conv._id;
                  const name = conv._id?.name || 'Campus Student';
                  const isActive = selectedUser === uid;
                  const isOnline = onlineUsers.includes(uid);
                  return (
                    <button
                      key={uid}
                      onClick={() => loadMessages(uid)}
                      className={`w-full flex items-center gap-3.5 p-4 text-left transition-all duration-150 ${
                        isActive
                          ? 'bg-zinc-100 border-l-4 border-black shadow-xs'
                          : 'hover:bg-zinc-50'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm text-white bg-black border border-zinc-800 shadow-xs"
                        >
                          {name.charAt(0).toUpperCase()}
                        </div>
                        {isOnline && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-black border-2 border-white rounded-full shadow-xs" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-zinc-900 truncate">{name}</p>
                          {conv.lastMessage?.createdAt && (
                            <span className="text-[10px] text-zinc-400 font-medium">
                              {formatDateSafely(conv.lastMessage.createdAt, 'h:mm a')}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500 truncate mt-0.5 font-medium">
                          {conv.lastMessage?.content || 'Click to open conversation'}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Active Chat Pane */}
          <div className={`flex-1 flex flex-col bg-[#fafafa] ${selectedUser ? 'flex' : 'hidden md:flex'}`}>
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="px-6 py-4 border-b border-zinc-200 bg-white flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="md:hidden p-2 rounded-xl hover:bg-zinc-100 text-zinc-700"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <div className="relative">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm bg-black border border-zinc-800 shadow-xs"
                      >
                        {(selectedConversation?._id?.name || selectedConversation?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      {onlineUsers.includes(selectedUser) && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-black border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-black">
                        {selectedConversation?._id?.name || selectedConversation?.name || 'Peer Chat'}
                      </p>
                      <p className="text-[10px] text-zinc-600 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-black" />
                        {onlineUsers.includes(selectedUser) ? 'Online & Active' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-700 font-bold px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200">
                    <ShieldCheck size={13} className="text-black" />
                    <span>MKCE Verified Protocol</span>
                  </div>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3.5 scrollbar-thin">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-600 mb-2">
                        <MessageSquare size={22} />
                      </div>
                      <p className="text-xs font-bold text-black">Start of Conversation</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">Send a message below to connect.</p>
                    </div>
                  ) : (
                    messages.map((msg, i) => {
                      const isSent = msg.sender?._id === user?.id || msg.sender === user?.id;
                      return (
                        <motion.div
                          key={msg._id || i}
                          initial={{ opacity: 0, y: 8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.15 }}
                          className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[78%] px-4.5 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                              isSent
                                ? 'bg-black text-white rounded-br-xs shadow-xs'
                                : 'bg-white text-zinc-900 rounded-bl-xs border border-zinc-200 shadow-xs'
                            }`}
                          >
                            <p>{msg.content}</p>
                            <span
                              className={`text-[9px] block mt-1 text-right font-medium ${
                                isSent ? 'text-zinc-400' : 'text-zinc-400'
                              }`}
                            >
                              {formatDateSafely(msg.createdAt)}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <div className="p-4 bg-white border-t border-zinc-200 flex items-center gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    className="input-mkce py-3 text-xs sm:text-sm flex-1"
                    placeholder="Type a secure message..."
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="btn-mkce px-5 py-3 rounded-xl shrink-0 disabled:opacity-50"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-3xl bg-zinc-100 flex items-center justify-center text-zinc-500 mb-3 shadow-xs">
                  <MessageSquare size={32} />
                </div>
                <h3 className="font-display font-bold text-black text-base">Select a Peer to Chat</h3>
                <p className="text-zinc-500 text-xs mt-1 max-w-xs leading-relaxed font-medium">
                  Communicate in real-time with club members, chapter leaders, and fellow student engineers.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
