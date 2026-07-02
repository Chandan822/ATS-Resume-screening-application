import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recruiterService } from '../../services/recruiterService';
import InclusiveJobEditor from '../../components/InclusiveJobEditor';
import CandidateRecommendationModal from '../../components/CandidateRecommendationModal';
import {
  Briefcase,
  Plus,
  Search,
  MapPin,
  DollarSign,
  Users,
  RefreshCw,
  X,
  Copy,
  CheckCircle2,
  Archive,
  Trash2,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export function RecruiterJobs() {
  const queryClient = useQueryClient();

  // Search, Filter & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [page, setPage] = useState(1);
  const limit = 6;

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [showBiasScannerModal, setShowBiasScannerModal] = useState(false);
  const [recommendationModalJob, setRecommendationModalJob] = useState(null);
  const [editingJob, setEditingJob] = useState(null);

  // Form State covering all 12 job fields
  const [form, setForm] = useState({
    title: '',
    department: 'Engineering',
    description: '',
    requirements: '',
    benefits: '',
    location: 'San Francisco, CA / Remote',
    jobType: 'FULL_TIME',
    experienceLevel: 'MID',
    minSalary: '120000',
    maxSalary: '150000',
    currency: 'USD',
    status: 'DRAFT',
    priority: 'MEDIUM',
  });

  // Query Jobs API with pagination, search, sorting, and filters
  const { data: responseData, isLoading, isError, refetch } = useQuery({
    queryKey: ['recruiterJobs', page, searchQuery, filterDept, filterStatus, filterType, sortBy],
    queryFn: async () => {
      const res = await recruiterService.getJobs({
        page,
        limit,
        query: searchQuery || undefined,
        department: filterDept !== 'ALL' ? filterDept : undefined,
        status: filterStatus !== 'ALL' ? filterStatus : undefined,
        jobType: filterType !== 'ALL' ? filterType : undefined,
        sortBy,
      });
      return res;
    },
  });

  const jobs = responseData?.data || [];
  const pagination = responseData?.pagination || { totalCount: jobs.length, totalPages: 1 };

  // Mutations
  const createJobMut = useMutation({
    mutationFn: (payload) => recruiterService.createJob(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['recruiterJobs']);
      queryClient.invalidateQueries(['recruiterStats']);
      closeModal();
      if (data.data) {
        setRecommendationModalJob(data.data);
      }
    },
  });

  const updateJobMut = useMutation({
    mutationFn: ({ id, payload }) => recruiterService.updateJob(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['recruiterJobs']);
      closeModal();
    },
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }) => recruiterService.updateJobStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries(['recruiterJobs']),
  });

  const duplicateMut = useMutation({
    mutationFn: (id) => recruiterService.duplicateJob(id),
    onSuccess: () => queryClient.invalidateQueries(['recruiterJobs']),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => recruiterService.deleteJob(id),
    onSuccess: () => queryClient.invalidateQueries(['recruiterJobs']),
  });

  const openCreateModal = () => {
    setEditingJob(null);
    setForm({
      title: '',
      department: 'Engineering',
      description: '',
      requirements: '',
      benefits: '',
      location: 'San Francisco, CA / Remote',
      jobType: 'FULL_TIME',
      experienceLevel: 'MID',
      minSalary: '120000',
      maxSalary: '150000',
      currency: 'USD',
      status: 'DRAFT',
      priority: 'MEDIUM',
    });
    setShowModal(true);
  };

  const openEditModal = (job) => {
    setEditingJob(job);
    setForm({
      title: job.title || '',
      department: job.department || 'Engineering',
      description: job.description || '',
      requirements: job.requirements || '',
      benefits: job.benefits || '',
      location: job.location || '',
      jobType: job.jobType || 'FULL_TIME',
      experienceLevel: job.experienceLevel || 'MID',
      minSalary: job.minSalary ? String(job.minSalary) : '',
      maxSalary: job.maxSalary ? String(job.maxSalary) : '',
      currency: job.currency || 'USD',
      status: job.status || 'OPEN',
      priority: job.priority || 'MEDIUM',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingJob(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      minSalary: form.minSalary ? parseFloat(form.minSalary) : undefined,
      maxSalary: form.maxSalary ? parseFloat(form.maxSalary) : undefined,
    };

    if (editingJob) {
      updateJobMut.mutate({ id: editingJob.id, payload });
    } else {
      createJobMut.mutate(payload);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
        <span className="text-xs font-semibold">Loading Job Requisitions...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between">
        <span>Failed to load jobs list.</span>
        <button onClick={() => refetch()} className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-600" /> Job Requisition Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Create, publish, duplicate, archive, and edit job requisitions with full ATS tracking.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-2 transition shadow-md shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" /> Create New Job
        </button>
      </div>

      {/* Search & Multi-Criteria Filter Controls */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by job title, department..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition"
            />
          </div>

          {/* Department Filter */}
          <select
            value={filterDept}
            onChange={(e) => {
              setFilterDept(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-bold"
          >
            <option value="ALL">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Product Design">Product Design</option>
            <option value="Marketing">Marketing</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-bold"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open (Published)</option>
            <option value="DRAFT">Draft</option>
            <option value="CLOSED">Closed</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-bold"
          >
            <option value="createdAt">Sort by Date Posted</option>
            <option value="title">Sort by Job Title</option>
            <option value="minSalary">Sort by Salary</option>
          </select>
        </div>
      </div>

      {/* Jobs Requisitions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {jobs.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
            <Briefcase className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700">No job requisitions found</p>
            <p className="text-xs text-slate-400">Try clearing search filters or create a new job opening.</p>
          </div>
        ) : (
          jobs.map((job) => (
            <div
              key={job.id}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 text-xs hover:border-indigo-200 transition"
            >
              <div className="space-y-3">
                {/* Badges Bar */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-extrabold text-[10px] border border-indigo-100">
                    {job.department || 'General'}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      job.status === 'OPEN'
                        ? 'bg-emerald-100 text-emerald-800'
                        : job.status === 'DRAFT'
                        ? 'bg-amber-100 text-amber-800'
                        : job.status === 'CLOSED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                {/* Title & Location */}
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base leading-snug">{job.title}</h3>
                  <p className="text-slate-500 flex items-center gap-1 mt-1 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {job.location}
                  </p>
                </div>

                {/* Salary & Priority */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    {job.minSalary ? `$${job.minSalary.toLocaleString()} - $${job.maxSalary?.toLocaleString()}` : 'Negotiable'}
                  </span>
                  <span className="text-slate-500 font-semibold uppercase">{job.priority || 'MEDIUM'} Priority</span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-slate-500 font-medium text-[11px]">
                  <span className="flex items-center gap-1 text-indigo-600 font-bold">
                    <Users className="w-3.5 h-3.5" /> {job._count?.applications || 0} Applicants
                  </span>
                  <span>{job.jobType?.replace('_', ' ')}</span>
                </div>

                {/* Quick Action Controls */}
                <div className="grid grid-cols-6 gap-1 pt-1 border-t border-slate-100">
                  {/* Auto-Sourcing Candidate Recommendations */}
                  <button
                    onClick={() => setRecommendationModalJob(job)}
                    className="p-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition flex flex-col items-center justify-center text-[10px] font-bold col-span-2"
                    title="Auto-Sourced Candidate Recommendations"
                  >
                    <Sparkles className="w-4 h-4 mb-0.5 text-purple-600" /> Auto-Source
                  </button>

                  {/* Publish / Open */}
                  {job.status !== 'OPEN' ? (
                    <button
                      onClick={() => statusMut.mutate({ id: job.id, status: 'OPEN' })}
                      className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition flex flex-col items-center justify-center text-[10px] font-bold"
                      title="Publish Job (Open)"
                    >
                      <CheckCircle2 className="w-4 h-4 mb-0.5" /> Publish
                    </button>
                  ) : (
                    <button
                      onClick={() => statusMut.mutate({ id: job.id, status: 'CLOSED' })}
                      className="p-2 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 transition flex flex-col items-center justify-center text-[10px] font-bold"
                      title="Close Job"
                    >
                      <X className="w-4 h-4 mb-0.5" /> Close
                    </button>
                  )}

                  {/* Edit */}
                  <button
                    onClick={() => openEditModal(job)}
                    className="p-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition flex flex-col items-center justify-center text-[10px] font-bold"
                    title="Edit Job Fields"
                  >
                    <Edit3 className="w-4 h-4 mb-0.5" /> Edit
                  </button>

                  {/* Duplicate */}
                  <button
                    onClick={() => duplicateMut.mutate(job.id)}
                    className="p-2 rounded-xl bg-cyan-50 text-cyan-700 hover:bg-cyan-100 transition flex flex-col items-center justify-center text-[10px] font-bold"
                    title="Duplicate Job Requisition"
                  >
                    <Copy className="w-4 h-4 mb-0.5" /> Clone
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete "${job.title}"?`)) {
                        deleteMut.mutate(job.id);
                      }
                    }}
                    className="p-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 transition flex flex-col items-center justify-center text-[10px] font-bold"
                    title="Delete Job"
                  >
                    <Trash2 className="w-4 h-4 mb-0.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Bar */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 text-xs font-bold">
          <span className="text-slate-500">
            Showing page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} Total Jobs)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 inline-flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
              disabled={page === pagination.totalPages}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 inline-flex items-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT JOB */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 max-w-2xl w-full space-y-4 text-xs my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                {editingJob ? `Edit Job Requisition (${editingJob.title})` : 'Create New Job Requisition'}
              </h4>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700">Job Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Full Stack Engineer"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 mt-1 text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Department *</label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 mt-1 text-slate-900"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Product Design">Product Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Job Description *</label>
                  <button
                    type="button"
                    onClick={() => setShowBiasScannerModal(true)}
                    className="text-indigo-600 hover:text-indigo-800 font-bold text-[11px] inline-flex items-center gap-1 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-xl transition"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" /> DE&I Bias Scanner
                  </button>
                </div>
                <textarea
                  rows={3}
                  required
                  placeholder="Comprehensive description of role, responsibilities, and key goals..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 mt-1 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700">Requirements & Qualifications</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. 5+ years React/Node, Computer Science degree..."
                    value={form.requirements}
                    onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 mt-1 text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Benefits & Perks</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Health insurance, 401k matching, remote stipend..."
                    value={form.benefits}
                    onChange={(e) => setForm({ ...form, benefits: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 mt-1 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. San Francisco, CA / Remote"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 mt-1 text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Employment Type</label>
                  <select
                    value={form.jobType}
                    onChange={(e) => setForm({ ...form, jobType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 mt-1 text-slate-900"
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="REMOTE">Remote</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700">Experience Level</label>
                  <select
                    value={form.experienceLevel}
                    onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 mt-1 text-slate-900"
                  >
                    <option value="ENTRY">Entry Level</option>
                    <option value="MID">Mid Level</option>
                    <option value="SENIOR">Senior Level</option>
                    <option value="LEAD">Lead / Staff</option>
                    <option value="EXECUTIVE">Executive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Min Salary (USD)</label>
                  <input
                    type="number"
                    placeholder="120000"
                    value={form.minSalary}
                    onChange={(e) => setForm({ ...form, minSalary: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 mt-1 text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Max Salary (USD)</label>
                  <input
                    type="number"
                    placeholder="160000"
                    value={form.maxSalary}
                    onChange={(e) => setForm({ ...form, maxSalary: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 mt-1 text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Priority & Status</label>
                  <div className="grid grid-cols-2 gap-1.5 mt-1">
                    <select
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                    >
                      <option value="HIGH">High Priority</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                    </select>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold"
                    >
                      <option value="OPEN">Open</option>
                      <option value="DRAFT">Draft</option>
                      <option value="CLOSED">Closed</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createJobMut.isPending || updateJobMut.isPending}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-md shadow-indigo-600/20"
                >
                  {createJobMut.isPending || updateJobMut.isPending ? 'Saving...' : editingJob ? 'Update Job' : 'Create Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL: REAL-TIME BIAS & INCLUSIVITY SCANNER */}
      {showBiasScannerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-4xl w-full relative my-8">
            <button
              onClick={() => setShowBiasScannerModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 z-10 bg-slate-100 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
            <InclusiveJobEditor
              initialText={form.description}
              onTextChange={(newText) => setForm({ ...form, description: newText })}
            />
          </div>
        </div>
      )}
      {/* MODAL: AUTOMATED TALENT POOL SOURCING RECOMMENDATIONS */}
      {recommendationModalJob && (
        <CandidateRecommendationModal
          jobId={recommendationModalJob.id}
          jobTitle={recommendationModalJob.title}
          onClose={() => setRecommendationModalJob(null)}
        />
      )}
    </div>
  );
}

export default RecruiterJobs;
