import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import socket from '../utils/socket';
import { Send, Search, ArrowLeft, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

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
    socket.connect();
    socket.emit('user-online', user?.id);
    socket.on('online-users', (users) => setOnlineUsers(users));
    socket.on('receive-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      socket.off('online-users');
      socket.off('receive-message');
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
      setConversations(res.data.data);
    } catch (err) {
      toast.error('Failed to load conversations');
    }
    setLoading(false);
  };

  const loadMessages = async (uid) => {
    try {
      const res = await api.get(`/messages/${uid}`);
      setMessages(res.data.data);
      setSelectedUser(uid);
      const conv = conversations.find((c) => (c._id?._id || c._id) === uid);
      setSelectedConversation(conv);
      socket.emit('join-room', [user.id, uid].sort().join('-'));
      inputRef.current?.focus();
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
        content: newMessage,
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

  const filteredConversations = conversations.filter((c) =>
    (c._id?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const getUserInitial = (name) => (name ? name.charAt(0).toUpperCase() : '?');

  return (
    <div className="space-y-6 animate-in">
      <h1 className="page-title">Messages</h1>

      <div className="card overflow-hidden">
        <div className="flex h-[calc(100vh-14rem)]">
          <div
            className={`w-full md:w-80 border-r border-surface-200 flex flex-col ${
              selectedUser ? 'hidden md:flex' : 'flex'
            }`}
          >
            <div className="p-4 border-b border-surface-100">
              <h2 className="section-title mb-3">Conversations</h2>
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field pl-9 py-2.5"
                  placeholder="Search conversations..."
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-surface-200 border-t-mkce-600 rounded-full animate-spin"></div>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageSquare
                    size={32}
                    className="mx-auto text-surface-300 mb-2"
                  />
                  <p className="text-surface-500 text-sm">
                    {search ? 'No conversations found' : 'No conversations yet'}
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const uid = conv._id?._id || conv._id;
                  const name = conv._id?.name || 'Unknown';
                  const isActive = selectedUser === uid;
                  const isOnline = onlineUsers.includes(uid);
                  return (
                    <button
                      key={uid}
                      onClick={() => loadMessages(uid)}
                      className={`w-full flex items-center gap-3 p-4 transition-colors border-b border-surface-100 ${
                        isActive
                          ? 'bg-mkce-50 border-l-2 border-l-mkce-600'
                          : 'hover:bg-surface-50'
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <div
                          className={`w-11 h-11 rounded-full flex items-center justify-center font-semibold text-sm ${
                            isActive
                              ? 'bg-mkce-600 text-white'
                              : 'bg-mkce-100 text-mkce-700'
                          }`}
                        >
                          {getUserInitial(name)}
                        </div>
                        {isOnline && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                        )}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${
                            isActive ? 'text-mkce-900' : 'text-surface-900'
                          }`}
                        >
                          {name}
                        </p>
                        <p className="text-xs text-surface-500 truncate mt-0.5">
                          {conv.lastMessage?.content || 'No messages yet'}
                        </p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="flex-shrink-0 w-5 h-5 bg-mkce-600 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                          {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div
            className={`flex-1 flex flex-col ${
              selectedUser ? 'flex' : 'hidden md:flex'
            }`}
          >
            {selectedUser ? (
              <>
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-surface-100 bg-white">
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      setSelectedConversation(null);
                    }}
                    className="md:hidden p-2 hover:bg-surface-100 rounded-xl transition-colors"
                  >
                    <ArrowLeft size={18} className="text-surface-600" />
                  </button>
                  <div className="relative">
                    <div className="w-9 h-9 bg-mkce-100 rounded-full flex items-center justify-center">
                      <span className="text-mkce-700 font-semibold text-sm">
                        {getUserInitial(selectedConversation?._id?.name || selectedConversation?.name || '')}
                      </span>
                    </div>
                    {onlineUsers.includes(selectedUser) && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-surface-900 text-sm">
                      {selectedConversation?._id?.name || selectedConversation?.name || 'Chat'}
                    </p>
                    <p className="text-xs text-surface-400">
                      {onlineUsers.includes(selectedUser) ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-surface-50 scrollbar-thin">
                  {messages.length === 0 && (
                    <div className="flex items-center justify-center h-full text-surface-400">
                      <div className="text-center">
                        <MessageSquare size={40} className="mx-auto mb-3 opacity-40" />
                        <p className="text-sm">No messages yet. Start the conversation!</p>
                      </div>
                    </div>
                  )}
                  {messages.map((msg, i) => {
                    const isSent =
                      msg.sender?._id === user?.id || msg.sender === user?.id;
                    return (
                      <div
                        key={msg._id || i}
                        className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                            isSent
                              ? 'bg-mkce-600 text-white rounded-br-md'
                              : 'bg-white text-surface-900 rounded-bl-md shadow-card border border-surface-100'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          <p
                            className={`text-xs mt-1.5 ${
                              isSent ? 'text-mkce-200' : 'text-surface-400'
                            }`}
                          >
                            {format(new Date(msg.createdAt), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-surface-100 bg-white">
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      className="input-field py-3"
                      placeholder="Type a message..."
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="w-11 h-11 bg-mkce-600 text-white rounded-xl flex items-center justify-center hover:bg-mkce-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 active:scale-95"
                    >
                      {sending ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <Send size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-mkce-50 flex items-center justify-center">
                    <MessageSquare size={32} className="text-mkce-300" />
                  </div>
                  <h3 className="section-title text-surface-700 mb-1">
                    Select a conversation
                  </h3>
                  <p className="text-surface-500 text-sm">
                    Choose a conversation to start chatting
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
