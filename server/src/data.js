const { supabase } = require('./config/db');

const fail = ({ error, data, count }) => {
  if (error) throw new Error(error.message);
  return { data, count };
};
const one = async (query) => fail(await query.single()).data;
const maybeOne = async (query) => {
  const { data, error } = await query.maybeSingle();
  if (error) throw new Error(error.message);
  return data;
};
const many = async (query) => fail(await query).data || [];
const count = async (query) => fail(await query).count || 0;
const page = (value, fallback) => Math.max(1, Number.parseInt(value, 10) || fallback);
const range = (p, l) => [(p - 1) * l, p * l - 1];

const camel = {
  profile_image: 'profileImage', privacy_settings: 'privacySettings', is_active: 'isActive',
  login_attempts: 'loginAttempts', lock_until: 'lockUntil', last_login: 'lastLogin', password_changed_at: 'passwordChangedAt',
  created_at: 'createdAt', updated_at: 'updatedAt', is_sub_leader: 'isSubLeader', created_by: 'createdBy',
  target_audience: 'targetAudience', is_approved: 'isApproved', approved_by: 'approvedBy', board_type: 'boardType',
  is_pinned: 'isPinned', is_reported: 'isReported', reported_by: 'reportedBy', posted_by: 'postedBy',
  is_verified: 'isVerified', verified_by: 'verifiedBy', user_id: 'user', is_highlighted: 'isHighlighted',
  highlighted_by: 'highlightedBy', reference_id: 'referenceId', reference_model: 'referenceModel', is_read: 'isRead', message_type: 'messageType', applied_at: 'appliedAt',
};
const doc = (row) => {
  if (!row) return row;
  const out = {};
  Object.entries(row).forEach(([key, value]) => { out[camel[key] || key] = value; });
  out._id = row.id;
  return out;
};
const docs = (rows) => rows.map(doc);
const publicUser = (row) => {
  const user = doc(row);
  if (user) { delete user.password; delete user.loginAttempts; delete user.lockUntil; }
  return user;
};
const usersByIds = async (ids, columns = '*') => {
  const unique = [...new Set(ids.filter(Boolean))];
  if (!unique.length) return new Map();
  const rows = await many(supabase.from('users').select(columns).in('id', unique));
  return new Map(rows.map((row) => [row.id, publicUser(row)]));
};
const clubByIds = async (ids, columns = '*') => {
  const unique = [...new Set(ids.filter(Boolean))];
  if (!unique.length) return new Map();
  const rows = await many(supabase.from('clubs').select(columns).in('id', unique));
  return new Map(rows.map((row) => [row.id, doc(row)]));
};
const notify = async (data) => one(supabase.from('notifications').insert(data).select());

async function enrich(table, row, options = {}) {
  if (!row) return null;
  const out = doc(row);
  if (table === 'clubs') {
    const memberships = await many(supabase.from('club_members').select('*').eq('club_id', row.id));
    const users = await usersByIds([row.leader, ...memberships.map((m) => m.user_id)]);
    out.leader = users.get(row.leader) || row.leader;
    out.members = memberships.map((m) => users.get(m.user_id) || m.user_id);
    out.subLeaders = memberships.filter((m) => m.is_sub_leader).map((m) => users.get(m.user_id) || m.user_id);
  }
  if (table === 'events') {
    const attendees = await many(supabase.from('event_attendees').select('user_id').eq('event_id', row.id));
    const [users, clubs] = await Promise.all([usersByIds([row.created_by, row.approved_by, ...attendees.map((a) => a.user_id)]), clubByIds([row.club])]);
    out.createdBy = users.get(row.created_by) || row.created_by; out.approvedBy = users.get(row.approved_by) || row.approved_by; out.club = clubs.get(row.club) || row.club;
    out.attendees = options.detail ? attendees.map((a) => a.user_id).map((id) => users.get(id) || id) : attendees.map((a) => a.user_id);
  }
  if (table === 'posts') {
    const [users, clubs, likes, comments] = await Promise.all([usersByIds([row.author, row.reported_by]), clubByIds([row.club]), many(supabase.from('post_likes').select('user_id').eq('post_id', row.id)), many(supabase.from('post_comments').select('*').eq('post_id', row.id).order('created_at'))]);
    const commentUsers = await usersByIds(comments.map((c) => c.author));
    out.author = users.get(row.author) || row.author; out.reportedBy = users.get(row.reported_by) || row.reported_by; out.club = clubs.get(row.club) || row.club; out.likes = likes.map((x) => x.user_id); out.comments = comments.map((x) => ({ ...doc(x), author: commentUsers.get(x.author) || x.author }));
  }
  if (table === 'jobs') {
    const apps = await many(supabase.from('job_applications').select('*').eq('job_id', row.id));
    const users = await usersByIds([row.posted_by, row.verified_by, ...apps.map((a) => a.user_id)]);
    out.postedBy = users.get(row.posted_by) || row.posted_by; out.verifiedBy = users.get(row.verified_by) || row.verified_by; out.applicants = apps.map((x) => ({ ...doc(x), user: users.get(x.user_id) || x.user_id }));
  }
  if (table === 'achievements') {
    const [users, clubs, likes, comments] = await Promise.all([usersByIds([row.user_id, row.highlighted_by]), clubByIds([row.club]), many(supabase.from('achievement_likes').select('user_id').eq('achievement_id', row.id)), many(supabase.from('achievement_comments').select('*').eq('achievement_id', row.id).order('created_at'))]);
    const commentUsers = await usersByIds(comments.map((c) => c.author));
    out.user = users.get(row.user_id) || row.user_id; out.highlightedBy = users.get(row.highlighted_by) || row.highlighted_by; out.club = clubs.get(row.club) || row.club; out.likes = likes.map((x) => x.user_id); out.comments = comments.map((x) => ({ ...doc(x), author: commentUsers.get(x.author) || x.author }));
  }
  if (table === 'messages') { const users = await usersByIds([row.sender]); out.sender = users.get(row.sender) || row.sender; }
  return out;
}
module.exports = { supabase, one, maybeOne, many, count, page, range, doc, docs, publicUser, usersByIds, clubByIds, notify, enrich };
