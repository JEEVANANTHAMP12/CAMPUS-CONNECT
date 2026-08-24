import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Building2, BookOpen, Award, Briefcase, Edit3, Save, X, Trophy, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { triggerConfetti } from '../components/animations/Confetti';
import SEO from '../components/SEO';

export default function Profile() {
  const { id } = useParams();
  const { user, updateProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [achievements, setAchievements] = useState([]);

  const targetId = id || user?.id;
  const isOwn = user?.id === targetId;

  useEffect(() => { fetchProfile(); }, [targetId]);

  const fetchProfile = async () => {
    try {
      const [profileRes, achRes] = await Promise.all([
        api.get(`/users/${targetId}`),
        api.get(`/achievements?user=${targetId}`),
      ]);
      setProfile(profileRes.data.data);
      setForm(profileRes.data.data);
      setAchievements(achRes.data.data || []);
    } catch { toast.error('Failed to load profile'); }
    setLoading(false);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({ name: form.name, department: form.department, year: form.year, skills: form.skills, bio: form.bio });
      triggerConfetti({ particleCount: 50, spread: 60 });
      setEditing(false);
      toast.success('Profile updated successfully!');
      fetchProfile();
    } catch { toast.error('Failed to update profile'); }
    setSaving(false);
  };

  const cancelEdit = () => { setForm(profile); setEditing(false); };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="skeleton rounded-3xl h-52" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="skeleton rounded-3xl h-72" />
          <div className="space-y-6"><div className="skeleton rounded-3xl h-36" /><div className="skeleton rounded-3xl h-40" /></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="card-premium p-12 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-surface-100 flex items-center justify-center text-surface-400">
          <User size={32} />
        </div>
        <h3 className="font-display font-bold text-mkce-900 text-lg">Profile Not Found</h3>
        <p className="text-surface-500 text-sm mt-1">The user profile does not exist or has been disabled.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      <SEO title={`${profile.name} - Engineer Profile`} description={`View ${profile.name}'s engineering profile, skills, achievements, and activities at MKCE.`} keywords={`MKCE ${profile.name}, ${profile.department || 'MKCE'} Student, Engineering Portfolio`} canonical={`/profile/${targetId}`} />

      {/* Premium Profile Hero */}
      <div className="card-premium overflow-hidden">
        <div className="h-44 sm:h-52 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #010018 0%, #020024 20%, #09203f 45%, #073f69 70%, #06A3DA 95%, #60bbfa 100%)' }}>
          <div className="absolute inset-0 bg-white/[0.03]" />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white/[0.04] rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-gold/8 rounded-full blur-[60px] pointer-events-none" />
        </div>
        <div className="px-8 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-16 sm:-mt-20 relative z-10">
            <div className="flex items-end gap-5">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl border-4 border-white shadow-2xl flex items-center justify-center font-display font-black text-4xl text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #06A3DA 0%, #073f69 100%)', boxShadow: '0 8px 32px rgba(6,163,218,0.3)' }}>
                {profile.name?.charAt(0) || 'U'}
              </div>
              <div className="pb-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-display font-black text-mkce-900 tracking-tight">{profile.name}</h1>
                  <span className="badge-blue capitalize text-xs">{profile.role || 'Student'}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-surface-500">
                  <Mail size={13} className="text-mkce-500" /><span>{profile.email}</span>
                </div>
              </div>
            </div>
            {isOwn && (
              <div className="self-start sm:self-auto">
                {editing ? (
                  <div className="flex gap-2">
                    <button onClick={saveProfile} disabled={saving} className="btn-mkce text-xs px-4 py-2.5 font-bold"><Save size={14} /><span>Save</span></button>
                    <button onClick={cancelEdit} className="btn-secondary text-xs px-4 py-2.5 font-bold"><X size={14} /><span>Cancel</span></button>
                  </div>
                ) : (
                  <button onClick={() => setEditing(true)} className="btn-secondary text-xs px-4 py-2.5 font-bold flex items-center gap-1.5"><Edit3 size={14} /><span>Edit Profile</span></button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic Info */}
        <div className="card-premium p-6 sm:p-7">
          <h2 className="section-heading flex items-center gap-2 mb-5"><User size={18} className="text-mkce-500" />Academic Information</h2>
          {editing ? (
            <div className="space-y-4">
              <div><label className="block text-xs font-bold text-mkce-900 uppercase tracking-wider mb-2">Full Name</label><input type="text" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-mkce" /></div>
              <div><label className="block text-xs font-bold text-mkce-900 uppercase tracking-wider mb-2">Department</label><input type="text" value={form.department || ''} onChange={(e) => setForm({ ...form, department: e.target.value })} className="input-mkce" /></div>
              <div><label className="block text-xs font-bold text-mkce-900 uppercase tracking-wider mb-2">Year of Study</label><input type="number" value={form.year || ''} onChange={(e) => setForm({ ...form, year: e.target.value })} className="input-mkce" min="1" max="5" /></div>
              <div><label className="block text-xs font-bold text-mkce-900 uppercase tracking-wider mb-2">Bio / About Me</label><textarea value={form.bio || ''} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="input-mkce resize-none" rows={3} /></div>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { icon: Building2, label: 'Department', value: profile.department || 'Not specified' },
                profile.year && { icon: BookOpen, label: 'Year of Study', value: `Year ${profile.year}` },
              ].filter(Boolean).map((item, i) => (
                <div key={i} className="p-4 rounded-2xl flex items-center gap-3" style={{ background: 'rgba(248,250,252,0.6)', border: '1px solid rgba(226,232,240,0.4)' }}>
                  <div className="w-10 h-10 rounded-xl bg-mkce-50 flex items-center justify-center text-mkce-600"><item.icon size={18} /></div>
                  <div><p className="text-[10px] text-surface-400 font-bold uppercase tracking-wider">{item.label}</p><p className="text-sm font-bold text-mkce-900">{item.value}</p></div>
                </div>
              ))}
              {profile.bio && (
                <div className="p-4 rounded-2xl" style={{ background: 'rgba(248,250,252,0.6)', border: '1px solid rgba(226,232,240,0.4)' }}>
                  <p className="text-[10px] text-surface-400 font-bold uppercase tracking-wider mb-1">About</p>
                  <p className="text-xs sm:text-sm text-surface-700 leading-relaxed">{profile.bio}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Verified Status & Skills */}
        <div className="space-y-6">
          <div className="rounded-3xl p-6 text-white flex items-center justify-between transition-all duration-300 hover:-translate-y-1"
            style={{ background: 'linear-gradient(135deg, #020024 0%, #09203f 35%, #073f69 70%, #06A3DA 100%)', boxShadow: '0 8px 24px -4px rgba(6,163,218,0.25)' }}>
            <div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', color: '#f9d423' }}>Campus Verified</span>
              <h3 className="text-xl font-display font-black mt-2">Verified Member</h3>
              <p className="text-xs text-mkce-200/70 mt-1 max-w-[200px]">Active student on the MKCE digital network.</p>
            </div>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-gold" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', boxShadow: '0 4px 12px rgba(247,206,88,0.2)' }}>
              <ShieldCheck size={36} />
            </div>
          </div>

          <div className="card-premium p-6">
            <h2 className="section-heading flex items-center gap-2 mb-4"><Sparkles size={18} className="text-amber-500" />Verified Skills & Stacks</h2>
            {profile.skills?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, i) => (
                  <span key={i} className="px-3.5 py-1.5 rounded-xl bg-mkce-50 text-mkce-700 text-xs font-bold border border-mkce-200/60">{skill}</span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-surface-400">No skills added yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
