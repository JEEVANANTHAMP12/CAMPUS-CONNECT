import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Calendar, MapPin, Clock, Check, X, Users, MapPinIcon, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    targetAudience: 'all'
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events?upcoming=true');
      setEvents(res.data.data);
    } catch (err) {
      toast.error('Failed to load events');
    }
    setLoading(false);
  };

  const createEvent = async (e) => {
    e.preventDefault();
    try {
      await api.post('/events', form);
      toast.success('Event created successfully!');
      setShowCreate(false);
      setForm({ title: '', description: '', date: '', location: '', targetAudience: 'all' });
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    }
  };

  const rsvpEvent = async (eventId) => {
    try {
      await api.post(`/events/${eventId}/rsvp`);
      toast.success('RSVP confirmed!');
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to RSVP');
    }
  };

  const cancelRsvp = async (eventId) => {
    try {
      await api.post(`/events/${eventId}/cancel-rsvp`);
      toast.success('RSVP cancelled');
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel RSVP');
    }
  };

  const isAttending = (event) => {
    return event.attendees?.some(a => a._id === user?.id || a === user?.id);
  };

  const getGradientClass = (index) => {
    const gradients = [
      'from-mkce-600 to-mkce-800',
      'from-mkce-500 to-mkce-700',
      'from-gold-500 to-gold-700',
      'from-emerald-500 to-emerald-700',
      'from-purple-500 to-purple-700',
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Events</h1>
          <p className="text-surface-500 mt-1">Upcoming campus events</p>
        </div>
        {user?.role === 'admin' || user?.role === 'hod' ? (
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Create Event
          </button>
        ) : null}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-surface-900/50 z-50 flex items-center justify-center p-4 animate-in">
          <div className="card w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title">Create Event</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="text-surface-400 hover:text-surface-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={createEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Event Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="input-field"
                  placeholder="Enter event title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-field resize-none"
                  placeholder="Describe your event..."
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="input-field"
                  placeholder="Event venue or online link"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Target Audience
                </label>
                <select
                  value={form.targetAudience}
                  onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                  className="input-field"
                >
                  <option value="all">All Students</option>
                  <option value="department">Department Only</option>
                  <option value="club">Club Only</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  Create Event
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
      ) : events.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-mkce-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CalendarDays size={32} className="text-mkce-500" />
          </div>
          <h3 className="section-title mb-2">No Events Yet</h3>
          <p className="text-surface-500">Be the first to create an upcoming campus event!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((event, index) => (
            <div key={event._id} className="card overflow-hidden hover:-translate-y-1 transition-all duration-300">
              <div className={`h-32 bg-gradient-to-br ${getGradientClass(index)} flex items-center justify-center relative`}>
                <Calendar size={40} className="text-white/80" />
                {isAttending(event) && (
                  <div className="absolute top-3 right-3">
                    <span className="badge-success flex items-center gap-1 px-2 py-1">
                      <Check size={12} />
                      Attending
                    </span>
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-display font-semibold text-lg text-surface-900 mb-2">
                  {event.title}
                </h3>
                <p className="text-surface-500 text-sm line-clamp-2 mb-4">
                  {event.description}
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-surface-500">
                    <Clock size={14} className="text-mkce-500" />
                    {format(new Date(event.date), 'MMM d, yyyy • h:mm a')}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-surface-500">
                    <MapPin size={14} className="text-gold-500" />
                    {event.location || 'Location TBD'}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-surface-100">
                  <div className="flex items-center gap-1.5 text-sm text-surface-400">
                    <Users size={14} />
                    <span>{event.attendees?.length || 0} attending</span>
                  </div>
                  {isAttending(event) ? (
                    <button
                      onClick={() => cancelRsvp(event._id)}
                      className="btn-danger text-sm px-3 py-1.5"
                    >
                      Cancel RSVP
                    </button>
                  ) : (
                    <button
                      onClick={() => rsvpEvent(event._id)}
                      className="btn-primary text-sm px-3 py-1.5"
                    >
                      RSVP
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
