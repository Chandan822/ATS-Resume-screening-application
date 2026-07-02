import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recruiterService } from '../../services/recruiterService';
import { Briefcase, Plus, MapPin, DollarSign, Users, RefreshCw, X } from 'lucide-react';

export function RecruiterJobs() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [filterDept, setFilterDept] = useState('ALL');

  const [form, setForm] = useState({
    title: '',
    department: 'Engineering',
    location: 'San Francisco, CA / Remote',
    type: 'FULL_TIME',
    salaryMin: '120000',
    salaryMax: '150000',
    description: '',
  });

  const { data: jobs, isLoading, isError, refetch } = useQuery({
    queryKey: ['recruiterJobs'],
    queryFn: async () => {
      const res = await recruiterService.getJobs();
      return res.data;
    },
  });

  const createJobMut = useMutation({
    mutationFn: (payload) => recruiterService.createJob(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['recruiterJobs']);
      queryClient.invalidateQueries(['recruiterStats']);
      setShowModal(false);
      setForm({
        title: '',
        department: 'Engineering',
        location: 'San Francisco, CA / Remote',
        type: 'FULL_TIME',
        salaryMin: '120000',
        salaryMax: '150000',
        description: '',
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
        <span className="text-xs font-semibold">Loading Job Openings...</span>
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

  const filteredJobs = filterDept === 'ALL' ? jobs : jobs?.filter((j) => j.department === filterDept);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-600" /> Job Postings & Requisitions
          </h2>
          <p className="text-xs text-slate-500 mt-1">Manage active openings, job descriptions, and view applicant counts.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-2 transition shadow-md shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" /> Create Job Opening
        </button>
      </div>

      {/* Department Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs font-bold">
        {['ALL', 'Engineering', 'Infrastructure', 'Product Design', 'Marketing'].map((dept) => (
          <button
            key={dept}
            onClick={() => setFilterDept(dept)}
            className={`px-4 py-2 rounded-xl transition ${
              filterDept === dept
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Jobs List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredJobs?.map((job) => (
          <div key={job.id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between text-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-extrabold text-[10px] border border-indigo-100">
                  {job.department}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    job.status === 'OPEN' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {job.status}
                </span>
              </div>

              <h3 className="font-extrabold text-slate-900 text-base">{job.title}</h3>
              <p className="text-slate-500 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}
                </span>
                {job.salaryMin && (
                  <span className="flex items-center gap-1 text-emerald-700 font-bold">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> ${job.salaryMin.toLocaleString()} - ${job.salaryMax?.toLocaleString()}
                  </span>
                )}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between font-bold text-slate-700">
              <span className="flex items-center gap-1 text-indigo-600">
                <Users className="w-4 h-4" /> {job._count?.applications || 0} Applicants
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Posted recently</span>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: CREATE JOB */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 max-w-md w-full space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-bold text-sm text-slate-900">Create Job Opening</h4>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createJobMut.mutate(form);
              }}
              className="space-y-3"
            >
              <div>
                <label className="font-bold text-slate-700">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Backend Engineer"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl p-2 mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700">Department</label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full bg-slate-50 border rounded-xl p-2 mt-1"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Product Design">Product Design</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700">Employment Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-slate-50 border rounded-xl p-2 mt-1"
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Remote / San Francisco, CA"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl p-2 mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700">Min Salary ($)</label>
                  <input
                    type="number"
                    value={form.salaryMin}
                    onChange={(e) => setForm({ ...form, salaryMin: e.target.value })}
                    className="w-full bg-slate-50 border rounded-xl p-2 mt-1"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Max Salary ($)</label>
                  <input
                    type="number"
                    value={form.salaryMax}
                    onChange={(e) => setForm({ ...form, salaryMax: e.target.value })}
                    className="w-full bg-slate-50 border rounded-xl p-2 mt-1"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={createJobMut.isPending}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold disabled:opacity-50 mt-2"
              >
                {createJobMut.isPending ? 'Posting...' : 'Post Job Opening'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecruiterJobs;
