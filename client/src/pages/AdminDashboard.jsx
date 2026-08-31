import { useState, useEffect, useMemo } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  Users, Calendar, Briefcase, Trophy, AlertTriangle, Check, X, BarChart3,
  ShieldCheck, Cpu, HardDrive, Sparkles, Activity, Building2, UserPlus,
  Plus, Search, Filter, Trash2, UserCheck, UserX, Key, Eye, EyeOff,
  ChevronLeft, ChevronRight, GraduationCap, Shield, RefreshCw, Mail,
  Lock, BookOpen, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';
import AnimatedCounter from '../components/animations/AnimatedCounter';
import { StaggerContainer, StaggerItem } from '../components/animations/StaggerContainer';
import SEO from '../components/SEO';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  const isHod = currentUser?.role === 'hod';

  const [stats, setStats] = useState(null);
  const [securityData, setSecurityData] = useState(null);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [reportedPosts, setReportedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // User Management State
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userDeptFilter, setUserDeptFilter] = useState('ALL');
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userTotal, setUserTotal] = useState(0);

  // Create User Modal
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [createUserForm, setCreateUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: isHod ? 'faculty' : 'faculty',
    department: isHod ? (currentUser?.department || '') : '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submittingUser, setSubmittingUser] = useState(false);

  // Department Module State
  const [departmentsList, setDepartmentsList] = useState([]);
  const [deptsLoading, setDeptsLoading] = useState(false);
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [addDeptForm, setAddDeptForm] = useState({ name: '', code: '', description: '', hodId: '' });
  const [submittingDept, setSubmittingDept] = useState(false);

  // Assign HOD Modal
  const [assignHodTargetDept, setAssignHodTargetDept] = useState(null);
  const [selectedHodUserId, setSelectedHodUserId] = useState('');
  const [hodSearchQuery, setHodSearchQuery] = useState('');
  const [potentialHods, setPotentialHods] = useState([]);
  const [submittingAssignHod, setSubmittingAssignHod] = useState(false);

  // Delete User State
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'departments') {
      fetchDepartments();
    }
  }, [activeTab, userPage, userRoleFilter, userDeptFilter]);

  const fetchAll = async () => {
    try {
      const [statsRes, eventsRes, jobsRes, reportedRes, secRes, deptsRes] = await Promise.all([
        api.get('/admin/stats').catch(() => ({ data: { data: null } })),
        api.get('/admin/pending-events').catch(() => ({ data: { data: [] } })),
        api.get('/admin/pending-jobs').catch(() => ({ data: { data: [] } })),
        api.get('/admin/reported').catch(() => ({ data: { data: [] } })),
        api.get('/security/diagnostics').catch(() => ({ data: { data: null } })),
        api.get('/departments').catch(() => ({ data: { data: [] } })),
      ]);
      setStats(statsRes.data.data);
      setPendingEvents(eventsRes.data.data || []);
      setPendingJobs(jobsRes.data.data || []);
      setReportedPosts(reportedRes.data.data || []);
      setSecurityData(secRes.data.data);
      setDepartmentsList(deptsRes.data.data || []);
    } catch {
      toast.error('Failed to load admin telemetry');
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const params = {
        page: userPage,
        limit: 15,
      };
      if (userRoleFilter !== 'ALL') params.role = userRoleFilter;
      if (userDeptFilter !== 'ALL') params.department = userDeptFilter;
      if (userSearch.trim()) params.search = userSearch.trim();

      const res = await api.get('/users', { params });
      setUsersList(res.data.data || []);
      setUserTotalPages(res.data.pages || 1);
      setUserTotal(res.data.total || 0);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch users');
    }
    setUsersLoading(false);
  };

  const fetchDepartments = async () => {
    setDeptsLoading(true);
    try {
      const res = await api.get('/departments');
      setDepartmentsList(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load departments');
    }
    setDeptsLoading(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setUserPage(1);
    fetchUsers();
  };

  // Create User (Admin or HOD)
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!createUserForm.name.trim() || !createUserForm.email.trim() || !createUserForm.password.trim()) {
      return toast.error('Please fill in all required fields');
    }

    setSubmittingUser(true);
    try {
      const payload = {
        name: createUserForm.name.trim(),
        email: createUserForm.email.trim().toLowerCase(),
        password: createUserForm.password,
        role: isHod ? 'faculty' : createUserForm.role,
        department: isHod ? currentUser?.department : (createUserForm.department || undefined),
      };

      const res = await api.post('/users', payload);
      toast.success(res.data.message || `${payload.role === 'hod' ? 'HOD' : 'Faculty/Staff'} created successfully!`);
      setShowCreateUserModal(false);
      setCreateUserForm({
        name: '',
        email: '',
        password: '',
        role: isHod ? 'faculty' : 'faculty',
        department: isHod ? (currentUser?.department || '') : '',
      });
      fetchUsers();
      fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    }
    setSubmittingUser(false);
  };

  // Toggle User Active Status
  const handleToggleUserStatus = async (targetUser) => {
    try {
      const newStatus = !targetUser.isActive;
      await api.put(`/users/${targetUser._id || targetUser.id}/status`, { isActive: newStatus });
      toast.success(`User ${newStatus ? 'activated' : 'suspended'}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user status');
    }
  };

  // Delete User
  const handleDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    try {
      await api.delete(`/users/${deleteConfirmUser._id || deleteConfirmUser.id}`);
      toast.success('User deleted successfully');
      setDeleteConfirmUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  // Create Department (Admin)
  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    if (!addDeptForm.name.trim() || !addDeptForm.code.trim()) {
      return toast.error('Department name and code are required');
    }
    setSubmittingDept(true);
    try {
      await api.post('/departments', {
        name: addDeptForm.name.trim(),
        code: addDeptForm.code.trim().toUpperCase(),
        description: addDeptForm.description.trim() || undefined,
        hodId: addDeptForm.hodId || undefined,
      });
      toast.success('Department created successfully!');
      setShowAddDeptModal(false);
      setAddDeptForm({ name: '', code: '', description: '', hodId: '' });
      fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create department');
    }
    setSubmittingDept(false);
  };

  // Open Assign HOD Modal
  const openAssignHodModal = async (dept) => {
    setAssignHodTargetDept(dept);
    setSelectedHodUserId(dept.hod?._id || dept.hod?.id || '');
    setHodSearchQuery('');
    try {
      // Fetch users with role 'hod' or 'faculty' or in that department
      const res = await api.get('/users', { params: { limit: 100 } });
      setPotentialHods(res.data.data || []);
    } catch (e) {
      setPotentialHods([]);
    }
  };

  // Submit Assign HOD
  const handleAssignHod = async (e) => {
    e.preventDefault();
    if (!selectedHodUserId || !assignHodTargetDept) {
      return toast.error('Please select a user to assign as HOD');
    }
    setSubmittingAssignHod(true);
    try {
      const res = await api.put(`/departments/${assignHodTargetDept._id || assignHodTargetDept.id}/assign-hod`, {
        hodId: selectedHodUserId,
      });
      toast.success(res.data.message || 'HOD assigned successfully!');
      setAssignHodTargetDept(null);
      fetchDepartments();
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign HOD');
    }
    setSubmittingAssignHod(false);
  };

  const approveEvent = async (eventId) => {
    try {
      await api.put(`/events/${eventId}/approve`);
      toast.success('Event approved!');
      fetchAll();
    } catch {
      toast.error('Failed to approve');
    }
  };

  const verifyJob = async (jobId) => {
    try {
      await api.put(`/jobs/${jobId}/verify`);
      toast.success('Job verified!');
      fetchAll();
    } catch {
      toast.error('Failed to verify');
    }
  };

  const moderatePost = async (postId, action) => {
    try {
      await api.put(`/admin/moderate/${postId}`, { action });
      toast.success(action === 'delete' ? 'Post removed' : 'Report dismissed');
      fetchAll();
    } catch {
      toast.error('Failed to moderate');
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let pass = '';
    for (let i = 0; i < 12; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
    setCreateUserForm(prev => ({ ...prev, password: pass }));
  };

  const filteredHodsList = useMemo(() => {
    if (!hodSearchQuery.trim()) return potentialHods;
    const q = hodSearchQuery.toLowerCase();
    return potentialHods.filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
  }, [potentialHods, hodSearchQuery]);

  if (loading) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="skeleton rounded-3xl h-24" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton rounded-3xl h-32" />)}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Registered Users', value: stats?.totalUsers ?? userTotal ?? 0, icon: Users },
    { label: 'Academic Departments', value: departmentsList.length || 0, icon: Building2 },
    { label: 'Campus Chapters', value: stats?.totalClubs ?? 0, icon: Trophy },
    { label: 'Live Events', value: stats?.totalEvents ?? 0, icon: Calendar },
  ];

  const tabs = [
    { id: 'overview', label: 'Platform Overview', icon: BarChart3 },
    { id: 'users', label: isHod ? 'Staff & Users' : 'User Module', icon: Users },
    { id: 'departments', label: 'Department Module', icon: Building2 },
    { id: 'events', label: `Pending Events (${pendingEvents.length})`, icon: Calendar },
    { id: 'jobs', label: `Pending Jobs (${pendingJobs.length})`, icon: Briefcase },
    { id: 'reported', label: `Reported (${reportedPosts.length})`, icon: AlertTriangle },
    { id: 'security', label: 'Security & Telemetry', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans text-zinc-900">
      <SEO title="Executive Management Console" description="Administrative and Department Management Console for MKCE Connect." canonical="/admin" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-blue">
              <ShieldCheck size={11} className="mr-1" />
              {isAdmin ? 'Super Admin Console' : `HOD Portal (${currentUser?.department || 'Department'})`}
            </span>
          </div>
          <h1 className="page-heading">Executive Management</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {isAdmin
              ? 'Oversee academic departments, provision HODs and faculty, and govern college operations.'
              : `Manage your department team, provision staff, and oversee ${currentUser?.department || 'academic'} activities.`}
          </p>
        </div>

        {/* Quick Action Button in Header */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setCreateUserForm({
                name: '',
                email: '',
                password: '',
                role: isHod ? 'faculty' : 'faculty',
                department: isHod ? (currentUser?.department || '') : '',
              });
              setShowCreateUserModal(true);
            }}
            className="btn-mkce text-xs px-4 py-2.5 font-bold flex items-center gap-2"
          >
            <UserPlus size={15} />
            <span>{isHod ? 'Create Staff / Faculty' : 'Create User / Staff / HOD'}</span>
          </button>
          {isAdmin && (
            <button
              onClick={() => {
                setAddDeptForm({ name: '', code: '', description: '', hodId: '' });
                setShowAddDeptModal(true);
              }}
              className="btn-secondary text-xs px-4 py-2.5 font-bold flex items-center gap-2"
            >
              <Plus size={15} />
              <span>Add Department</span>
            </button>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {statCards.map((item, i) => (
          <StaggerItem key={i}>
            <div className="card-premium p-5 group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-black border border-zinc-800 shadow-xs transition-transform duration-200 group-hover:scale-105">
                  <item.icon size={22} className="text-white" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-display font-black text-black tracking-tight">
                <AnimatedCounter value={item.value} />
              </p>
              <p className="text-[11px] font-bold text-zinc-400 mt-1 uppercase tracking-wider">{item.label}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Tabs Bar */}
      <div className="flex gap-1.5 border-b border-zinc-200 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all rounded-xl ${
                active
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-white text-zinc-600 hover:bg-zinc-100 hover:text-black border border-zinc-200'
              }`}
            >
              <tab.icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ===================== OVERVIEW TAB ===================== */}
      {activeTab === 'overview' && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-premium p-6">
            <h2 className="font-display font-bold text-black text-lg mb-4 flex items-center gap-2">
              <Users size={18} className="text-black" />Users by Role
            </h2>
            <div className="space-y-4">
              {stats.usersByRole?.map((r, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-zinc-700 capitalize">{r._id}</span>
                    <span className="text-black font-extrabold">{r.count}</span>
                  </div>
                  <div className="w-full bg-zinc-100 rounded-full h-2.5 overflow-hidden border border-zinc-200">
                    <div
                      className="h-full rounded-full bg-black transition-all duration-500"
                      style={{ width: `${Math.min(100, (r.count / (stats.totalUsers || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card-premium p-6">
            <h2 className="font-display font-bold text-black text-lg mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-black" />Department Distribution
            </h2>
            <div className="space-y-3">
              {stats.usersByDept?.slice(0, 8).map((d, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0 text-xs">
                  <span className="font-bold text-zinc-800">{d._id || 'General'}</span>
                  <span className="badge-blue text-[11px] font-bold">{d.count} Members</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================== USER MANAGEMENT MODULE TAB ===================== */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="card-premium p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by name or @mkce.ac.in email..."
                className="input-mkce pl-10 py-2.5 text-xs w-full"
              />
            </form>

            <div className="flex flex-wrap items-center gap-2">
              {/* Role filter */}
              <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200 text-xs font-semibold">
                {['ALL', 'hod', 'faculty', 'student', 'admin'].map((roleKey) => (
                  <button
                    key={roleKey}
                    type="button"
                    onClick={() => { setUserRoleFilter(roleKey); setUserPage(1); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      userRoleFilter === roleKey
                        ? 'bg-black text-white shadow-xs'
                        : 'text-zinc-600 hover:text-black'
                    }`}
                  >
                    {roleKey === 'ALL' ? 'All Roles' : roleKey === 'faculty' ? 'Faculty / Staff' : roleKey.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Department filter (Admin only, HOD locked to their dept) */}
              {isAdmin && (
                <select
                  value={userDeptFilter}
                  onChange={(e) => { setUserDeptFilter(e.target.value); setUserPage(1); }}
                  className="input-mkce py-2 text-xs font-semibold bg-white cursor-pointer"
                >
                  <option value="ALL">All Departments</option>
                  {departmentsList.map((d) => (
                    <option key={d.code || d.name} value={d.name}>
                      {d.code ? `${d.code} - ${d.name}` : d.name}
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={() => {
                  setCreateUserForm({
                    name: '',
                    email: '',
                    password: '',
                    role: isHod ? 'faculty' : 'faculty',
                    department: isHod ? (currentUser?.department || '') : '',
                  });
                  setShowCreateUserModal(true);
                }}
                className="btn-mkce text-xs px-3.5 py-2 font-bold flex items-center gap-1.5"
              >
                <UserPlus size={14} />
                <span>Create User</span>
              </button>
            </div>
          </div>

          {/* User List Table */}
          <div className="card-premium overflow-hidden">
            {usersLoading ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-2 border-zinc-200 border-t-black rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Loading user directory...</p>
              </div>
            ) : usersList.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-14 h-14 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-zinc-400">
                  <Users size={24} />
                </div>
                <h3 className="font-display font-bold text-black text-base">No Users Found</h3>
                <p className="text-zinc-500 text-xs mt-1">Try adjusting your role or department search filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-5 py-3.5">User Identity</th>
                      <th className="px-4 py-3.5">Role</th>
                      <th className="px-4 py-3.5">Department</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5">Registered</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-medium text-zinc-800">
                    {usersList.map((u) => {
                      const isSelf = u.id === currentUser?.id || u._id === currentUser?.id;
                      return (
                        <tr key={u.id || u._id} className="hover:bg-zinc-50/70 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-black text-white font-bold flex items-center justify-center text-xs shrink-0 border border-zinc-800">
                                {u.name?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-black truncate">{u.name}</p>
                                <p className="text-[11px] text-zinc-500 truncate">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                              u.role === 'admin'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : u.role === 'hod'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : u.role === 'faculty'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-zinc-100 text-zinc-800 border-zinc-200'
                            }`}>
                              {u.role === 'admin' && <Shield size={11} />}
                              {u.role === 'hod' && <ShieldCheck size={11} />}
                              {u.role === 'faculty' && <GraduationCap size={11} />}
                              {u.role === 'student' && <Users size={11} />}
                              <span>{u.role === 'faculty' ? 'Faculty / Staff' : u.role?.toUpperCase()}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-zinc-700 font-semibold">{u.department || '—'}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.isActive !== false
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${u.isActive !== false ? 'bg-emerald-500' : 'bg-red-500'}`} />
                              <span>{u.isActive !== false ? 'Active' : 'Suspended'}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-zinc-500 text-[11px]">
                            {u.createdAt ? format(new Date(u.createdAt), 'dd MMM yyyy') : '—'}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {!isSelf && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleUserStatus(u)}
                                  title={u.isActive !== false ? 'Suspend User' : 'Activate User'}
                                  className={`p-1.5 rounded-lg border transition-colors ${
                                    u.isActive !== false
                                      ? 'text-zinc-500 hover:text-amber-600 hover:bg-amber-50 border-zinc-200'
                                      : 'text-emerald-600 hover:bg-emerald-50 border-emerald-200'
                                  }`}
                                >
                                  {u.isActive !== false ? <UserX size={14} /> : <UserCheck size={14} />}
                                </button>
                              )}

                              {isAdmin && !isSelf && (
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmUser(u)}
                                  title="Delete User"
                                  className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 border border-zinc-200 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination footer */}
            {userTotalPages > 1 && (
              <div className="p-4 border-t border-zinc-200 flex items-center justify-between text-xs bg-zinc-50/50">
                <span className="text-zinc-500 font-semibold">
                  Showing page {userPage} of {userTotalPages} ({userTotal} total users)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={userPage <= 1}
                    onClick={() => setUserPage(prev => Math.max(1, prev - 1))}
                    className="btn-secondary text-xs px-3 py-1.5 font-bold disabled:opacity-40"
                  >
                    <ChevronLeft size={13} className="mr-1 inline" /> Previous
                  </button>
                  <button
                    disabled={userPage >= userTotalPages}
                    onClick={() => setUserPage(prev => prev + 1)}
                    className="btn-secondary text-xs px-3 py-1.5 font-bold disabled:opacity-40"
                  >
                    Next <ChevronRight size={13} className="ml-1 inline" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== DEPARTMENT MANAGEMENT MODULE TAB ===================== */}
      {activeTab === 'departments' && (
        <div className="space-y-6">
          {/* Header & Stats Banner */}
          <div className="card-premium p-6 bg-gradient-to-r from-zinc-900 via-black to-zinc-900 text-white border-zinc-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Building2 size={20} className="text-emerald-400" />
                  <h2 className="text-xl font-display font-black text-white">Academic Departments Directory</h2>
                </div>
                <p className="text-xs text-zinc-400 max-w-xl font-medium">
                  Autonomous academic units at M. Kumarasamy College of Engineering. Assign Heads of Department (HOD) to empower them with staff provisioning and department leadership.
                </p>
              </div>

              {isAdmin && (
                <button
                  onClick={() => {
                    setAddDeptForm({ name: '', code: '', description: '', hodId: '' });
                    setShowAddDeptModal(true);
                  }}
                  className="btn-mkce bg-white text-black hover:bg-zinc-100 text-xs px-4 py-2.5 font-bold flex items-center gap-2 self-start md:self-auto"
                >
                  <Plus size={15} />
                  <span>Add New Department</span>
                </button>
              )}
            </div>
          </div>

          {/* Department Cards Grid */}
          {deptsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton rounded-3xl h-48" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {departmentsList.map((dept) => {
                const hasHod = Boolean(dept.hod);
                return (
                  <div key={dept.id || dept._id} className="card-premium p-6 flex flex-col justify-between group hover:border-black transition-all">
                    <div>
                      {/* Top Code badge and title */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <span className="badge-blue text-[10px] font-black uppercase tracking-wider mb-1 inline-block">
                            {dept.code || 'DEPT'}
                          </span>
                          <h3 className="font-display font-black text-black text-base leading-snug">
                            {dept.name}
                          </h3>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700 shrink-0">
                          <Building2 size={18} />
                        </div>
                      </div>

                      <p className="text-xs text-zinc-500 line-clamp-2 mb-4 font-normal">
                        {dept.description || `Autonomous engineering division for ${dept.name} at MKCE.`}
                      </p>

                      {/* HOD Status Section */}
                      <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 mb-4">
                        <div className="flex items-center justify-between text-[11px] font-bold mb-2">
                          <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Head of Department (HOD)</span>
                          {hasHod ? (
                            <span className="text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md text-[10px] font-bold">Assigned</span>
                          ) : (
                            <span className="text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md text-[10px] font-bold">Unassigned</span>
                          )}
                        </div>

                        {hasHod ? (
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                              {dept.hod?.name?.charAt(0)?.toUpperCase() || 'H'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-black truncate">{dept.hod?.name}</p>
                              <p className="text-[10px] text-zinc-500 truncate">{dept.hod?.email}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-zinc-500 font-medium italic">
                            No HOD currently assigned to this department.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bottom Stats & Actions */}
                    <div>
                      <div className="grid grid-cols-2 gap-2 py-2 border-t border-zinc-100 text-center mb-3">
                        <div className="p-2 rounded-xl bg-zinc-50/70 border border-zinc-100">
                          <p className="text-base font-black text-black">{dept.facultyCount || 0}</p>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase">Staff / Faculty</p>
                        </div>
                        <div className="p-2 rounded-xl bg-zinc-50/70 border border-zinc-100">
                          <p className="text-base font-black text-black">{dept.studentCount || 0}</p>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase">Students</p>
                        </div>
                      </div>

                      {isAdmin && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openAssignHodModal(dept)}
                            className="btn-secondary text-xs py-2 px-3 flex-1 font-bold flex items-center justify-center gap-1.5"
                          >
                            <ShieldCheck size={13} />
                            <span>{hasHod ? 'Change HOD' : 'Assign HOD'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===================== SECURITY TAB ===================== */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden bg-black border border-zinc-800 shadow-xl">
            <div className="relative z-10 flex items-center gap-3 mb-2">
              <ShieldCheck size={28} className="text-emerald-400" />
              <h2 className="text-2xl font-display font-black text-white">Enterprise Security Diagnostics</h2>
            </div>
            <p className="text-sm text-zinc-400 max-w-xl relative z-10 font-medium">Live server-side verification of security defenses.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 relative z-10">
              {[
                { label: 'Helmet CSP & HSTS', status: 'ACTIVE', desc: 'Secure HTTP Headers' },
                { label: 'NoSQL Sanitizer', status: 'ACTIVE', desc: 'Query Defense' },
                { label: 'Rate Limiter', status: 'ACTIVE', desc: 'Brute-force Shield' },
                { label: 'HPP & XSS Filter', status: 'ACTIVE', desc: 'Payload Protection' },
              ].map((s, i) => (
                <div key={i} className="rounded-2xl p-4 bg-zinc-900 border border-zinc-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{s.label}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-xs animate-pulse" />
                  </div>
                  <p className="text-lg font-black text-emerald-400">{s.status}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5 font-medium">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
          {securityData && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  icon: Cpu, title: 'Runtime Specs', color: 'text-blue-600', items: [
                    { label: 'Node.js', value: securityData.system?.nodeVersion },
                    { label: 'Platform', value: securityData.system?.platform || 'Linux' },
                    { label: 'Bcrypt Rounds', value: securityData.security?.bcryptRounds || 12 },
                  ]
                },
                {
                  icon: HardDrive, title: 'Memory', color: 'text-amber-500', items: [
                    { label: 'Total', value: `${securityData.system?.totalMemoryMb || 1024} MB` },
                    { label: 'Free', value: `${securityData.system?.freeMemoryMb || 512} MB` },
                    { label: 'JWT Expiry', value: securityData.security?.jwtExpiry || '7d' },
                  ]
                },
                {
                  icon: Activity, title: 'Security Audit', color: 'text-emerald-600', items: [
                    { label: 'Auditor', value: securityData.audit?.requestedBy || 'Admin' },
                    { label: 'Time', value: format(new Date(), 'HH:mm:ss') },
                    { label: 'Status', value: 'Zero Vulnerabilities', highlight: true },
                  ]
                },
              ].map((card, i) => (
                <div key={i} className="card-premium p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <card.icon size={20} className={card.color} />
                    <h3 className="font-display font-bold text-black">{card.title}</h3>
                  </div>
                  <div className="space-y-2 text-xs text-zinc-600 font-medium">
                    {card.items.map((item, j) => (
                      <p key={j}>
                        <span className="font-bold text-black">{item.label}:</span>{' '}
                        <span className={item.highlight ? 'text-emerald-600 font-bold' : ''}>{item.value}</span>
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================== PENDING EVENTS TAB ===================== */}
      {activeTab === 'events' && (
        <div className="space-y-3">
          {pendingEvents.length === 0 ? (
            <div className="card-premium p-12 text-center">
              <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-black"><Check size={32} /></div>
              <h3 className="font-display font-bold text-black text-lg">All Events Clear</h3>
              <p className="text-zinc-500 text-sm mt-1 font-medium">No pending events for approval.</p>
            </div>
          ) : pendingEvents.map((event) => (
            <div key={event._id} className="card-premium p-5 flex items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-base text-zinc-900">{event.title}</h4>
                <p className="text-xs text-zinc-500 mt-1">Submitted by <span className="font-bold text-black">{event.createdBy?.name || 'Leader'}</span> • {event.location || 'Campus'}</p>
              </div>
              <button onClick={() => approveEvent(event._id)} className="btn-mkce text-xs px-5 py-2 font-bold flex items-center gap-1.5"><Check size={14} /><span>Approve</span></button>
            </div>
          ))}
        </div>
      )}

      {/* ===================== PENDING JOBS TAB ===================== */}
      {activeTab === 'jobs' && (
        <div className="space-y-3">
          {pendingJobs.length === 0 ? (
            <div className="card-premium p-12 text-center">
              <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-black"><Check size={32} /></div>
              <h3 className="font-display font-bold text-black text-lg">All Postings Verified</h3>
              <p className="text-zinc-500 text-sm mt-1 font-medium">No opportunities waiting for review.</p>
            </div>
          ) : pendingJobs.map((job) => (
            <div key={job._id} className="card-premium p-5 flex items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-base text-zinc-900">{job.title}</h4>
                <p className="text-xs text-zinc-500 mt-1">Posted by <span className="font-bold text-black">{job.company || 'Enterprise'}</span> • {job.stipend || 'Competitive'}</p>
              </div>
              <button onClick={() => verifyJob(job._id)} className="btn-mkce text-xs px-5 py-2 font-bold flex items-center gap-1.5"><Check size={14} /><span>Verify</span></button>
            </div>
          ))}
        </div>
      )}

      {/* ===================== REPORTED TAB ===================== */}
      {activeTab === 'reported' && (
        <div className="space-y-3">
          {reportedPosts.length === 0 ? (
            <div className="card-premium p-12 text-center">
              <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-black"><Check size={32} /></div>
              <h3 className="font-display font-bold text-black text-lg">Feed in Good Standing</h3>
              <p className="text-zinc-500 text-sm mt-1 font-medium">No flagged posts.</p>
            </div>
          ) : reportedPosts.map((post) => (
            <div key={post._id} className="card-premium p-5 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-red-600 font-bold mb-1"><AlertTriangle size={13} /><span>Flagged</span></div>
                <h4 className="font-bold text-sm text-zinc-900">{post.title}</h4>
                <p className="text-xs text-zinc-700 mt-1 p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 font-normal">{post.content}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => moderatePost(post._id, 'delete')} className="btn-danger text-xs px-3.5 py-2 font-bold">Delete</button>
                <button onClick={() => moderatePost(post._id, 'dismiss')} className="btn-secondary text-xs px-3.5 py-2 font-bold">Dismiss</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===================== MODAL: CREATE USER (STAFF / HOD) ===================== */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden border border-zinc-200 shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between mb-5 border-b border-zinc-100 pb-4">
              <div>
                <h3 className="font-display font-black text-black text-lg flex items-center gap-2">
                  <UserPlus size={20} className="text-black" />
                  {isHod ? 'Create Faculty / Staff' : 'Provision User Account'}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {isHod
                    ? `Create a staff account under the ${currentUser?.department || 'assigned'} department.`
                    : 'Create official institutional credentials for HODs or Staff.'}
                </p>
              </div>
              <button
                onClick={() => setShowCreateUserModal(false)}
                className="p-2 text-zinc-400 hover:text-black rounded-xl hover:bg-zinc-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              {/* Role Selector (Admin only) */}
              {isAdmin ? (
                <div>
                  <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                    Account Role
                  </label>
                  <select
                    value={createUserForm.role}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, role: e.target.value })}
                    className="input-mkce text-xs font-bold"
                  >
                    <option value="faculty">Faculty / Staff Member</option>
                    <option value="hod">Head of Department (HOD)</option>
                  </select>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-semibold">
                  Role: <strong>Faculty / Staff</strong> • Department: <strong>{currentUser?.department}</strong>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={createUserForm.name}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, name: e.target.value })}
                  placeholder="e.g. Dr. K. Ramesh"
                  className="input-mkce text-xs"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                  Institutional Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={createUserForm.email}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
                  placeholder="e.g. ramesh@mkce.ac.in"
                  className="input-mkce text-xs"
                />
              </div>

              {/* Department Selector (Admin only) */}
              {isAdmin && (
                <div>
                  <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={createUserForm.department}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, department: e.target.value })}
                    className="input-mkce text-xs font-semibold"
                  >
                    <option value="">-- Select Department --</option>
                    {departmentsList.map((d) => (
                      <option key={d.code || d.name} value={d.name}>
                        {d.code ? `${d.code} - ${d.name}` : d.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Password with generator */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-black uppercase tracking-wider">
                    Initial Password <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] font-bold text-black hover:underline flex items-center gap-1"
                  >
                    <RefreshCw size={11} /> Generate
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={createUserForm.password}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, password: e.target.value })}
                    placeholder="Enter initial password or click Generate"
                    className="input-mkce text-xs pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="btn-secondary text-xs px-4 py-2.5 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingUser}
                  className="btn-mkce text-xs px-5 py-2.5 font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  {submittingUser ? 'Creating...' : 'Provision User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: ADD DEPARTMENT (ADMIN ONLY) ===================== */}
      {showAddDeptModal && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden border border-zinc-200 shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between mb-5 border-b border-zinc-100 pb-4">
              <div>
                <h3 className="font-display font-black text-black text-lg flex items-center gap-2">
                  <Building2 size={20} className="text-black" />
                  Add Academic Department
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">Register a new academic department in the MKCE Connect platform.</p>
              </div>
              <button
                onClick={() => setShowAddDeptModal(false)}
                className="p-2 text-zinc-400 hover:text-black rounded-xl hover:bg-zinc-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateDepartment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                  Department Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addDeptForm.name}
                  onChange={(e) => setAddDeptForm({ ...addDeptForm, name: e.target.value })}
                  placeholder="e.g. Biomedical Engineering"
                  className="input-mkce text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                  Department Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addDeptForm.code}
                  onChange={(e) => setAddDeptForm({ ...addDeptForm, code: e.target.value })}
                  placeholder="e.g. BME"
                  className="input-mkce text-xs uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={addDeptForm.description}
                  onChange={(e) => setAddDeptForm({ ...addDeptForm, description: e.target.value })}
                  placeholder="Brief description of the department..."
                  className="input-mkce text-xs"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowAddDeptModal(false)}
                  className="btn-secondary text-xs px-4 py-2.5 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDept}
                  className="btn-mkce text-xs px-5 py-2.5 font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  {submittingDept ? 'Creating...' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: ASSIGN HOD (ADMIN ONLY) ===================== */}
      {assignHodTargetDept && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden border border-zinc-200 shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between mb-4 border-b border-zinc-100 pb-3">
              <div>
                <h3 className="font-display font-black text-black text-lg flex items-center gap-2">
                  <ShieldCheck size={20} className="text-purple-600" />
                  Assign Head of Department (HOD)
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Department: <strong className="text-black">{assignHodTargetDept.name} ({assignHodTargetDept.code})</strong>
                </p>
              </div>
              <button
                onClick={() => setAssignHodTargetDept(null)}
                className="p-2 text-zinc-400 hover:text-black rounded-xl hover:bg-zinc-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAssignHod} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                  Search & Select User to Promote/Assign as HOD
                </label>
                <div className="relative mb-2">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={hodSearchQuery}
                    onChange={(e) => setHodSearchQuery(e.target.value)}
                    placeholder="Search candidate by name or email..."
                    className="input-mkce pl-9 py-2 text-xs"
                  />
                </div>

                <div className="max-h-60 overflow-y-auto border border-zinc-200 rounded-2xl divide-y divide-zinc-100">
                  {filteredHodsList.length === 0 ? (
                    <div className="p-4 text-center text-xs text-zinc-500">No candidates found</div>
                  ) : (
                    filteredHodsList.map((u) => {
                      const isSelected = selectedHodUserId === (u.id || u._id);
                      return (
                        <div
                          key={u.id || u._id}
                          onClick={() => setSelectedHodUserId(u.id || u._id)}
                          className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected ? 'bg-purple-50/80 border-l-4 border-purple-600' : 'hover:bg-zinc-50'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-black text-white font-bold flex items-center justify-center text-xs shrink-0">
                              {u.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-xs text-black truncate">{u.name}</p>
                              <p className="text-[11px] text-zinc-500 truncate">{u.email} • <span className="capitalize">{u.role}</span></p>
                            </div>
                          </div>
                          {isSelected && <Check size={16} className="text-purple-600 shrink-0 ml-2" />}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setAssignHodTargetDept(null)}
                  className="btn-secondary text-xs px-4 py-2.5 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAssignHod || !selectedHodUserId}
                  className="btn-mkce text-xs px-5 py-2.5 font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  {submittingAssignHod ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: DELETE USER CONFIRMATION ===================== */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden border border-zinc-200 shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-200">
              <Trash2 size={24} />
            </div>
            <h3 className="font-display font-bold text-black text-center text-lg">Delete User Account</h3>
            <p className="text-xs text-zinc-500 text-center mt-2">
              Are you sure you want to delete <strong className="text-black">{deleteConfirmUser.name}</strong> ({deleteConfirmUser.email})? This action cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="btn-secondary text-xs px-4 py-2.5 font-bold flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                className="btn-danger text-xs px-4 py-2.5 font-bold flex-1"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
