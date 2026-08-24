import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Calendar, MapPin, Clock, X, Users, Sparkles, CalendarDays, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { StaggerContainer, StaggerItem } from '../components/animations/StaggerContainer';
import { triggerConfetti } from '../components/animations/Confetti';
import SEO from '../components/SEO';

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', date: '', location: '', targetAudience: 'all' });

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try { const res = await api.get('/events?upcoming=true'); setEvents(res.data.data); }
    catch { toast.error('Failed to load events'); }
    setLoading(false);
  };

  const createEvent = async (e) => {
    e.preventDefault();
    try {
      await api.post('/events', form);
      triggerConfetti({ particleCount: 75, spread: 65 });
      toast.success('Campus event created successfully!');
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
      triggerConfetti({ particleCount: 60, spread: 50 });
      toast.success('Your seat is confirmed! RSVP recorded.');
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to RSVP');
    }
  };

  const cancelRsvp = async (eventId) => {
    try { await api.post(`/events/${eventId}/cancel-rsvp`); toast.success('RSVP cancelled'); fetchEvents(); }
    catch { toast.error('Failed to cancel RSVP'); }
  };

  const isAttending = (event) => event.attendees?.some((a) => a._id === user?.id || a === user?.id || a?.id === user?.id);

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      <SEO title="Upcoming Campus Events, Hackathons & Workshops" description="Stay updated with upcoming technical symposiums, hackathons, guest lectures, and cultural fests at M. Kumarasamy College of Engineering, Karur." keywords="MKCE Events, Engineering Hackathons Karur, Technical Symposium MKCE, College Workshops Tamil Nadu" canonical="/events" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-blue"><Sparkles size={11} className="mr-1" />Live Campus Schedule</span>
          </div>
          <h1 className="page-heading">Upcoming Events</h1>
          <p className="text-surface-500 text-sm mt-1">Participate in tech symposiums, hackathons, guest lectures, and club meetups.</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'hod' || user?.role === 'leader') && (
          <button onClick={() => setShowCreate(true)} className="btn-mkce flex items-center gap-2 self-start sm:self-auto shimmer-btn">
            <Plus size={18} /><span>Create Event</span>
          </button>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
            <motion.div initial={{ opacity: 0, scale: 0.97, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 20 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-3xl w-full max-w-lg overflow-hidden" style={{ boxShadow: '0 24px 64px -12px rgba(0,0,0,0.2), 0 0 0 1px rgba(226,232,240,0.3)' }}>
              <div className="p-6 border-b border-surface-100 text-white flex items-center justify-between"
                style={{ background: 'linear-gradient(135deg, #09203f 0%, #073f69 50%, #06A3DA 100%)' }}>
                <div>
                  <h2 className="font-display font-bold text-lg">Schedule Campus Event</h2>
                  <p className="text-xs text-mkce-200/80 mt-0.5">Post an official event or workshop for students</p>
                </div>
                <button onClick={() => setShowCreate(false)} className="p-1 text-white/60 hover:text-white"><X size={20} /></button>
              </div>
              <form onSubmit={createEvent} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-mkce-900 uppercase tracking-wider mb-2">Event Title</label>
                  <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="input-mkce" placeholder="e.g. Annual AI Hackathon 2026" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-mkce-900 uppercase tracking-wider mb-2">Description & Agenda</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-mkce resize-none" placeholder="Provide details regarding the agenda, prerequisites, etc." rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-mkce-900 uppercase tracking-wider mb-2">Date & Time</label>
                    <input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required className="input-mkce" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-mkce-900 uppercase tracking-wider mb-2">Venue / Link</label>
                    <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input-mkce" placeholder="e.g. Audi 2 / Virtual" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-mkce-900 uppercase tracking-wider mb-2">Target Audience</label>
                  <select value={form.targetAudience} onChange={(e) => setForm({ ...form, targetAudience: e.target.value })} className="input-mkce cursor-pointer">
                    <option value="all">Open to All Departments</option>
                    <option value="department">Specific Department</option>
                    <option value="club">Club Members Only</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-3">
                  <button type="submit" className="btn-mkce flex-1 py-3 text-sm">Publish Event</button>
                  <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1 py-3 text-sm">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="skeleton rounded-3xl h-80" />)}
        </div>
      ) : events.length === 0 ? (
        <div className="card-premium p-12 text-center">
          <div className="w-16 h-16 bg-mkce-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-mkce-600">
            <CalendarDays size={32} />
          </div>
          <h3 className="font-display font-bold text-mkce-900 text-lg">No Events Scheduled</h3>
          <p className="text-surface-500 text-sm mt-1">Be the first to create and host a campus event!</p>
        </div>
      ) : (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const attending = isAttending(event);
            return (
              <StaggerItem key={event._id} className="h-full">
                <div className="card-premium flex flex-col h-full overflow-hidden group">
                  {/* Header Banner */}
                  <div className="h-36 relative p-6 flex flex-col justify-between text-white overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #020024 0%, #09203f 35%, #073f69 70%, #06A3DA 100%)' }}>
                    <div className="absolute inset-0 bg-white/[0.03]" />
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                        style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                        <Calendar size={12} />
                        <span>{format(new Date(event.date), 'EEE, MMM d')}</span>
                      </div>
                      {attending && (
                        <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
                          <CheckCircle2 size={12} />Attending
                        </span>
                      )}
                    </div>
                    <div className="relative z-10">
                      <span className="text-2xl font-display font-black text-white/90">
                        {format(new Date(event.date), 'dd')} <span className="text-sm font-semibold uppercase">{format(new Date(event.date), 'MMMM')}</span>
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-display font-extrabold text-lg text-mkce-900 group-hover:text-mkce-600 transition-colors line-clamp-1">{event.title}</h3>
                      <p className="text-xs sm:text-sm text-surface-500 mt-2 line-clamp-2 leading-relaxed">{event.description || 'Join us for this exciting campus event.'}</p>
                    </div>
                    <div className="space-y-2 text-xs text-surface-500 pt-2 border-t border-surface-100/60">
                      <div className="flex items-center gap-2 font-medium text-mkce-700">
                        <Clock size={14} className="text-mkce-500" /><span>{format(new Date(event.date), 'h:mm a')}</span>
                      </div>
                      <div className="flex items-center gap-2 font-medium text-surface-600">
                        <MapPin size={14} className="text-amber-500" /><span className="truncate">{event.location || 'College Auditorium'}</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-surface-100/60 flex items-center justify-between gap-3">
                      <span className="text-xs font-bold text-surface-500 flex items-center gap-1">
                        <Users size={14} className="text-mkce-500" />{event.attendees?.length || 0} RSVPs
                      </span>
                      {attending ? (
                        <button onClick={() => cancelRsvp(event._id)} className="btn-danger text-xs px-3.5 py-2 font-bold">Cancel RSVP</button>
                      ) : (
                        <button onClick={() => rsvpEvent(event._id)} className="btn-mkce text-xs px-5 py-2 font-bold">RSVP Now</button>
                      )}
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
