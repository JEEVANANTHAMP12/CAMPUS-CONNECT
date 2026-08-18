import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Building2,
  BookOpen,
  Award,
  Briefcase,
  Edit3,
  Save,
  X,
  Trophy,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

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

  useEffect(() => {
    fetchProfile();
  }, [targetId]);

  const fetchProfile = async () => {
    try {
      const [profileRes, achRes] = await Promise.all([
        api.get(`/users/${targetId}`),
        api.get(`/achievements?user=${targetId}`),
      ]);
      setProfile(profileRes.data.data);
      setForm(profileRes.data.data);
      setAchievements(achRes.data.data);
    } catch (err) {
      toast.error('Failed to load profile');
    }
    setLoading(false);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({
        name: form.name,
        department: form.department,
        year: form.year,
        skills: form.skills,
        bio: form.bio,
      });
      setEditing(false);
      toast.success('Profile updated successfully!');
      fetchProfile();
    } catch (err) {
      toast.error('Failed to update profile');
    }
    setSaving(false);
  };

  const cancelEdit = () => {
    setForm(profile);
    setEditing(false);
  };

  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : '?');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-mkce-200 border-t-mkce-600 rounded-full animate-spin"></div>
          <p className="text-sm text-surface-400 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="card p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-100 flex items-center justify-center">
          <User size={32} className="text-surface-400" />
        </div>
        <h3 className="section-title text-surface-700 mb-1">Profile not found</h3>
        <p className="text-surface-500 text-sm">The profile you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in">
      <div className="card overflow-hidden">
        <div className="h-36 bg-mkce-gradient relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold-500/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-mkce-950/30 to-transparent"></div>
        </div>
        <div className="px-6 pb-6">
          <div className="flex items-end gap-5 -mt-14 relative z-10">
            <div className="w-28 h-28 bg-white rounded-2xl border-4 border-white shadow-lg flex items-center justify-center flex-shrink-0">
              <span className="text-4xl font-display font-bold text-mkce-600">
                {getInitial(profile.name)}
              </span>
            </div>
            <div className="flex-1 pb-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-display font-bold text-surface-900">
                  {profile.name}
                </h1>
                <span className="badge-primary capitalize">{profile.role}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-surface-500">
                <Mail size={14} />
                <span className="text-sm">{profile.email}</span>
              </div>
            </div>
            {isOwn && (
              <div className="flex-shrink-0 pb-1">
                {editing ? (
                  <div className="flex gap-2">
                    <button
                      onClick={saveProfile}
                      disabled={saving}
                      className="btn-primary flex items-center gap-1.5 text-sm py-2"
                    >
                      {saving ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <Save size={16} />
                      )}
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="btn-secondary flex items-center gap-1.5 text-sm py-2"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="btn-secondary flex items-center gap-1.5 text-sm py-2"
                  >
                    <Edit3 size={16} />
                    Edit Profile
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="section-title flex items-center gap-2 mb-5">
            <User size={18} className="text-mkce-500" />
            Details
          </h2>
          <div className="space-y-4">
            {editing ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">
                    Name
                  </label>
                  <input
                    type="text"
                    value={form.name || ''}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-field"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">
                    Department
                  </label>
                  <input
                    type="text"
                    value={form.department || ''}
                    onChange={(e) =>
                      setForm({ ...form, department: e.target.value })
                    }
                    className="input-field"
                    placeholder="e.g. Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">
                    Year
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="4"
                    value={form.year || ''}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    className="input-field"
                    placeholder="1-4"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">
                    Bio
                  </label>
                  <textarea
                    value={form.bio || ''}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    className="input-field resize-none"
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">
                    Skills (comma separated)
                  </label>
                  <input
                    type="text"
                    value={form.skills?.join(', ') || ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        skills: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    className="input-field"
                    placeholder="React, Node.js, Python"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl">
                  <div className="w-9 h-9 bg-mkce-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Building2 size={16} className="text-mkce-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-surface-400 font-medium">Department</p>
                    <p className="text-sm text-surface-800 truncate">
                      {profile.department || 'Not specified'}
                    </p>
                  </div>
                </div>
                {profile.year && (
                  <div className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl">
                    <div className="w-9 h-9 bg-mkce-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <BookOpen size={16} className="text-mkce-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-surface-400 font-medium">Year</p>
                      <p className="text-sm text-surface-800">Year {profile.year}</p>
                    </div>
                  </div>
                )}
                {profile.bio && (
                  <div className="p-3 bg-surface-50 rounded-xl">
                    <p className="text-xs text-surface-400 font-medium mb-1">Bio</p>
                    <p className="text-sm text-surface-700 leading-relaxed">{profile.bio}</p>
                  </div>
                )}
                {!profile.department && !profile.year && !profile.bio && (
                  <p className="text-sm text-surface-400 text-center py-4">
                    No details added yet
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="section-title flex items-center gap-2 mb-5">
            <Sparkles size={18} className="text-gold-500" />
            Skills
          </h2>
          {profile.skills?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-mkce-50 text-mkce-700 text-sm font-medium rounded-lg"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-surface-400 text-center py-4">No skills added yet</p>
          )}
        </div>
      </div>

      {profile.clubs?.length > 0 && (
        <div className="card p-6">
          <h2 className="section-title flex items-center gap-2 mb-5">
            <Briefcase size={18} className="text-mkce-500" />
            Clubs Joined
          </h2>
          <div className="flex flex-wrap gap-3">
            {profile.clubs.map((club) => (
              <div
                key={club._id || club}
                className="flex items-center gap-2.5 bg-surface-50 px-4 py-2.5 rounded-xl border border-surface-100"
              >
                <div className="w-8 h-8 bg-mkce-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-mkce-700 font-semibold text-xs">
                    {club.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-surface-800">{club.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {achievements.length > 0 && (
        <div className="card p-6">
          <h2 className="section-title flex items-center gap-2 mb-5">
            <Trophy size={18} className="text-gold-500" />
            Achievements
          </h2>
          <div className="space-y-3">
            {achievements.map((ach) => (
              <div
                key={ach._id}
                className="flex items-start gap-3 p-4 bg-gold-50 rounded-xl border border-gold-100/50"
              >
                <div className="w-10 h-10 bg-gold-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Trophy size={18} className="text-gold-600" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-surface-900">{ach.title}</h4>
                  {ach.description && (
                    <p className="text-sm text-surface-500 mt-0.5 leading-relaxed">
                      {ach.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
