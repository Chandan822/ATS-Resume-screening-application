import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recruiterService } from '../../services/recruiterService';
import { candidateService } from '../../services/candidateService';
import {
  Briefcase,
  Search,
  MapPin,
  DollarSign,
  Bookmark,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  X,
  Building2,
  ArrowRight,
} from 'lucide-react';

export function CandidateJobBoard() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('ALL');
  const [selectedJob, setSelectedJob] = useState(null);

  // Fetch Job Openings
  const { data: responseData, isLoading, isError, refetch } = useQuery({
    queryKey: ['candidateJobs', searchQuery, filterDept],
    queryFn: async () => {
      const res = await recruiterService.getJobs({
        query: searchQuery || undefined,
        department: filterDept !== 'ALL' ? filterDept : undefined,
        status: 'OPEN',
      });
      return res;
    },
  });

  const jobs = responseData?.data || [];

  // Fetch Saved Jobs for bookmark state
  const { data: savedJobsData } = useQuery({
    queryKey: ['candidateSavedJobs'],
    queryFn: async () => {
      const res = await candidateService.getSavedJobs();
      return res.data || [];
    },
  });

  const savedJobIds = (savedJobsData || []).map((j) => j.id);

  // Apply Mutation
  const applyMut = useMutation({
    mutationFn: (jobId) => candidateService.applyToJob(jobId),
    onSuccess: (data) => {
      alert(data.message || 'Application submitted successfully!');
      queryClient.invalidateQueries(['candidateApplications']);
      setSelectedJob(null);
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to submit application.');
    },
  });

  // Save Job Mutation
  const toggleSaveMut = useMutation({
    mutationFn: (jobId) => {
      if (savedJobIds.includes(jobId)) {
        return candidateService.unsaveJob(jobId);
      }
      return candidateService.saveJob(jobId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['candidateSavedJobs']);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
        <span className="text-xs font-semibold">Loading Open Positions...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between">
        <span>Failed to load job board.</span>
        <button onClick={() => refetch()} className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Explore Tech Roles
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Explore Open Positions</h2>
          <p className="text-xs text-slate-500">Search and apply to verified career opportunities with 1-click application.</p>
        </div>

        {/* Search & Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by role, skill, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition"
            />
          </div>

          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 font-bold"
          >
            <option value="ALL">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Product Design">Product Design</option>
            <option value="Marketing">Marketing</option>
          </select>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {jobs.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
            <Briefcase className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700">No open positions found</p>
            <p className="text-xs text-slate-400">Try adjusting your search terms or filters.</p>
          </div>
        ) : (
          jobs.map((job) => {
            const isSaved = savedJobIds.includes(job.id);
            return (
              <div
                key={job.id}
                className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 text-xs hover:border-indigo-200 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-extrabold text-[10px] border border-indigo-100">
                      {job.department}
                    </span>
                    <button
                      onClick={() => toggleSaveMut.mutate(job.id)}
                      className={`p-1.5 rounded-xl transition ${
                        isSaved ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 hover:text-slate-600'
                      }`}
                      title={isSaved ? 'Remove Bookmark' : 'Save Job'}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base leading-snug">{job.title}</h3>
                    <p className="text-slate-500 flex items-center gap-1 mt-1 text-[11px]">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {job.company?.name || 'TechCorp'} &bull;{' '}
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {job.location}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      {job.salaryMin ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax?.toLocaleString()}` : 'Competitive'}
                    </span>
                    <span className="text-slate-500 font-medium">{job.jobType?.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-center transition"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => applyMut.mutate(job.id)}
                    disabled={applyMut.isPending}
                    className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-center transition shadow-md shadow-indigo-600/20 disabled:opacity-50"
                  >
                    {applyMut.isPending ? 'Applying...' : 'Apply Now'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* JOB DETAILS MODAL */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 max-w-2xl w-full space-y-5 text-xs max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-extrabold text-[10px] border border-indigo-100">
                  {selectedJob.department}
                </span>
                <h3 className="font-extrabold text-xl text-slate-900 mt-1">{selectedJob.title}</h3>
                <p className="text-slate-500 text-xs flex items-center gap-3 mt-1">
                  <span>{selectedJob.company?.name || 'TechCorp Global'}</span>
                  <span>&bull;</span>
                  <span>{selectedJob.location}</span>
                </p>
              </div>
              <button onClick={() => setSelectedJob(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-slate-700 leading-relaxed">
              <div>
                <h4 className="font-bold text-slate-900 mb-1">About the Role</h4>
                <p>{selectedJob.description}</p>
              </div>

              {selectedJob.requirements && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Requirements & Qualifications</h4>
                  <p>{selectedJob.requirements}</p>
                </div>
              )}

              {selectedJob.benefits && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Benefits & Perks</h4>
                  <p>{selectedJob.benefits}</p>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Salary Range</span>
                  <span className="font-bold text-emerald-700">
                    {selectedJob.salaryMin
                      ? `$${selectedJob.salaryMin.toLocaleString()} - $${selectedJob.salaryMax?.toLocaleString()}/yr`
                      : 'Competitive'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Employment Type</span>
                  <span className="font-bold text-slate-800">{selectedJob.jobType?.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button onClick={() => setSelectedJob(null)} className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold">
                Close
              </button>
              <button
                onClick={() => applyMut.mutate(selectedJob.id)}
                disabled={applyMut.isPending}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold inline-flex items-center gap-2 shadow-md shadow-indigo-600/20 disabled:opacity-50"
              >
                {applyMut.isPending ? 'Applying...' : 'Submit Application'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CandidateJobBoard;
