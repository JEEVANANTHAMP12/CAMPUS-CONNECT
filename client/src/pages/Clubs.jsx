import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Clubs() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', department: '' });

  useEffect(() => { fetchClubs(); }, []);

  const fetchClubs = async () => {
    try {
      const res = await api.get('/clubs');
      setClubs(res.data.data);
    } catch (err) {
      toast.error('Failed to load clubs');
    }
    setLoading(false);
  };

  const createClub = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/clubs', form);
      toast.success('Club created successfully!');
      setShowCreate(false);
      setForm({ name: '', description: '', department: '' });
      fetchClubs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create club');
    }
    setCreating(false);
  };

  const joinClub = async (clubId) => {
    try {
      await api.post(`/clubs/${clubId}/join`);
      toast.success('Joined club!');
      fetchClubs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join club');
    }
  };

  const filtered = clubs.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase()) ||
    c.department?.toLowerCase().includes(search.toLowerCase())
  );

  const canCreate = user?.role === 'leader' || user?.role === 'admin' || user?.role === 'hod';

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Clubs</h1>
          <p className="text-surface-500 mt-1">Discover and join campus clubs</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Create Club
          </button>
        )}
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field pl-10"
          placeholder="Search clubs by name, description, or department..."
        />
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-surface-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-0 animate-in">
            <div className="p-6 border-b border-surface-100">
              <h2 className="section-title">Create New Club</h2>
              <p className="text-surface-500 text-sm mt-1">Set up a new club for your campus community</p>
            </div>
            <form onSubmit={createClub} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Club Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  required
                  className="input-field"
                  placeholder="Enter club name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  className="input-field resize-none"
                  placeholder="Describe your club's purpose and activities"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Department</label>
                <input
                  type="text"
                  value={form.department}
                  onChange={e => setForm({...form, department: e.target.value})}
                  className="input-field"
                  placeholder="e.g. Computer Science, ECE, etc."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={creating} className="btn-primary flex-1">
                  {creating ? 'Creating...' : 'Create Club'}
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-surface-200 border-t-mkce-600"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-100 flex items-center justify-center">
            <Users size={32} className="text-surface-400" />
          </div>
          <h3 className="section-title text-surface-700 mb-1">
            {search ? 'No clubs found' : 'No clubs yet'}
          </h3>
          <p className="text-surface-500 text-sm">
            {search ? 'Try a different search term' : 'Be the first to create a club on campus'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((club, index) => {
            const isMember = club.members?.some(m => m._id === user?.id || m === user?.id);
            return (
              <div
                key={club._id}
                className={`card-interactive overflow-hidden animate-in stagger-${Math.min(index + 1, 5)}`}
              >
                <div className="h-32 bg-gradient-to-br from-mkce-600 via-mkce-700 to-mkce-900 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  <span className="text-white/90 text-5xl font-display font-bold relative z-10">
                    {club.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="p-5">
                  <Link to={`/clubs/${club._id}`}>
                    <h3 className="font-display font-semibold text-surface-900 hover:text-mkce-600 transition-colors">
                      {club.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-surface-500 mt-1 line-clamp-2 leading-relaxed">
                    {club.description || 'No description available'}
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="flex items-center gap-1.5 text-sm text-surface-500">
                      <Users size={14} className="text-mkce-500" />
                      {club.members?.length || 0} members
                    </span>
                    {club.department && (
                      <span className="badge-primary">
                        {club.department}
                      </span>
                    )}
                  </div>
                  {!isMember ? (
                    <button
                      onClick={() => joinClub(club._id)}
                      className="w-full mt-4 btn-primary text-sm py-2"
                    >
                      Join Club
                    </button>
                  ) : (
                    <div className="mt-4">
                      <Link
                        to={`/clubs/${club._id}`}
                        className="block w-full text-center btn-secondary text-sm py-2"
                      >
                        View Club
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
