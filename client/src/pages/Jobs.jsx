import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, MapPin, Clock, Building2, Briefcase, GraduationCap, X } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ type: '', domain: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    company: '',
    domain: '',
    location: '',
    stipend: '',
    deadline: '',
    type: 'internship',
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.type) params.append('type', filter.type);
      if (filter.domain) params.append('domain', filter.domain);
      const res = await api.get(`/jobs?${params.toString()}`);
      setJobs(res.data.data);
    } catch (err) {
      toast.error('Failed to load jobs');
    }
    setLoading(false);
  };

  const createJob = async (e) => {
    e.preventDefault();
    try {
      await api.post('/jobs', form);
      toast.success('Job posted successfully!');
      setShowCreate(false);
      setForm({
        title: '',
        description: '',
        company: '',
        domain: '',
        location: '',
        stipend: '',
        deadline: '',
        type: 'internship',
      });
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post job');
    }
  };

  const applyToJob = async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/apply`);
      toast.success('Applied successfully!');
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    }
  };

  const filtered = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company?.toLowerCase().includes(search.toLowerCase()) ||
      j.domain?.toLowerCase().includes(search.toLowerCase())
  );

  const canPostJob = ['faculty', 'hod', 'admin', 'leader'].includes(user?.role);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Jobs &amp; Internships</h1>
          <p className="text-surface-500 mt-1">Find your next opportunity</p>
        </div>
        {canPostJob && (
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Post Job
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
            placeholder="Search by title, company, or domain..."
          />
        </div>
        <select
          value={filter.type}
          onChange={(e) => setFilter({ ...filter, type: e.target.value })}
          className="input-field w-full sm:w-40"
        >
          <option value="">All Types</option>
          <option value="internship">Internship</option>
          <option value="job">Job</option>
        </select>
        <input
          type="text"
          value={filter.domain}
          onChange={(e) => setFilter({ ...filter, domain: e.target.value })}
          className="input-field w-full sm:w-48"
          placeholder="Filter by domain..."
        />
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-surface-900/50 z-50 flex items-center justify-center p-4 animate-in">
          <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title">Post Opportunity</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="text-surface-400 hover:text-surface-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={createJob} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Role Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="input-field"
                  placeholder="e.g., Frontend Developer Intern"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  required
                  className="input-field resize-none"
                  placeholder="Describe the role and requirements..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">
                    Company
                  </label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) =>
                      setForm({ ...form, company: e.target.value })
                    }
                    className="input-field"
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">
                    Domain
                  </label>
                  <input
                    type="text"
                    value={form.domain}
                    onChange={(e) =>
                      setForm({ ...form, domain: e.target.value })
                    }
                    className="input-field"
                    placeholder="e.g., Web Dev"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                    className="input-field"
                    placeholder="City or Remote"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">
                    Stipend / Salary
                  </label>
                  <input
                    type="text"
                    value={form.stipend}
                    onChange={(e) =>
                      setForm({ ...form, stipend: e.target.value })
                    }
                    className="input-field"
                    placeholder="e.g., ₹10,000/month"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) =>
                      setForm({ ...form, deadline: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">
                    Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm({ ...form, type: e.target.value })
                    }
                    className="input-field"
                  >
                    <option value="internship">Internship</option>
                    <option value="job">Job</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  Post
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
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-mkce-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Briefcase size={32} className="text-mkce-500" />
          </div>
          <h3 className="section-title mb-2">No Opportunities Found</h3>
          <p className="text-surface-500">
            {search || filter.type || filter.domain
              ? 'Try adjusting your search or filters.'
              : 'Be the first to post an opportunity!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((job) => {
            const hasApplied = job.applicants?.some(
              (a) => a.user?._id === user?.id || a.user === user?.id
            );
            return (
              <div
                key={job._id}
                className="card card-interactive overflow-hidden flex flex-col sm:flex-row"
              >
                <div
                  className={`w-full sm:w-1.5 flex-shrink-0 ${
                    job.type === 'internship'
                      ? 'bg-gradient-to-b from-blue-400 to-blue-600'
                      : 'bg-gradient-to-b from-green-400 to-green-600'
                  }`}
                ></div>
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display font-semibold text-lg text-surface-900">
                          {job.title}
                        </h3>
                        <span
                          className={`badge-primary ${
                            job.type === 'internship'
                              ? '!bg-blue-100 !text-blue-700'
                              : '!bg-green-100 !text-green-700'
                          }`}
                        >
                          {job.type === 'internship' ? (
                            <span className="flex items-center gap-1">
                              <GraduationCap size={12} /> Internship
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Briefcase size={12} /> Job
                            </span>
                          )}
                        </span>
                        {job.isVerified && (
                          <span className="badge-success flex items-center gap-1">
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-surface-500 flex-wrap">
                        {job.company && (
                          <span className="flex items-center gap-1.5">
                            <Building2 size={14} className="text-mkce-400" />
                            {job.company}
                          </span>
                        )}
                        {job.location && (
                          <span className="flex items-center gap-1.5">
                            <MapPin size={14} className="text-gold-500" />
                            {job.location}
                          </span>
                        )}
                        {job.deadline && (
                          <span className="flex items-center gap-1.5">
                            <Clock size={14} className="text-mkce-400" />
                            Due {format(new Date(job.deadline), 'MMM d, yyyy')}
                          </span>
                        )}
                      </div>
                      <p className="text-surface-600 mt-2 line-clamp-2">
                        {job.description}
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        {job.stipend && (
                          <span className="text-sm font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                            {job.stipend}
                          </span>
                        )}
                        {job.domain && (
                          <span className="badge-gold">{job.domain}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-100">
                    <span className="text-sm text-surface-400">
                      {job.applicants?.length || 0} applicant
                      {(job.applicants?.length || 0) !== 1 ? 's' : ''}
                    </span>
                    {user?.role === 'student' &&
                      (hasApplied ? (
                        <span className="badge-success flex items-center gap-1">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Applied
                        </span>
                      ) : (
                        <button
                          onClick={() => applyToJob(job._id)}
                          className="btn-primary text-sm px-4 py-1.5"
                        >
                          Apply Now
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
