import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { candidateService } from '../../services/candidateService';
import { Bookmark, Building2, MapPin, DollarSign, RefreshCw, ArrowRight, Trash2, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CandidateSavedJobs() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: savedData, isLoading, isError, refetch } = useQuery({
    queryKey: ['candidateSavedJobs'],
    queryFn: async () => {
      const res = await candidateService.getSavedJobs();
      return res.data || [];
    },
  });

  // Fetch Submitted Applications for applied state check
  const { data: applicationsData } = useQuery({
    queryKey: ['candidateApplications'],
    queryFn: async () => {
      const res = await candidateService.getMyApplications();
      return res.data || [];
    },
  });

  const appliedJobIds = (applicationsData || []).map((app) => app.jobId);

  const unsaveMut = useMutation({
    mutationFn: (jobId) => candidateService.unsaveJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidateSavedJobs'] });
    },
  });

  const applyMut = useMutation({
    mutationFn: (jobId) => candidateService.applyToJob(jobId),
    onSuccess: (data) => {
      alert(data.message || 'Application submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['candidateApplications'] });
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to submit application.');
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
        <span className="text-xs font-semibold">Loading Saved Jobs...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between">
        <span>Failed to load saved jobs.</span>
        <button onClick={() => refetch()} className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold">
          Retry
        </button>
      </div>
    );
  }

  const jobs = savedData || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-indigo-600" /> Saved Jobs
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {jobs.length} job{jobs.length !== 1 ? 's' : ''} bookmarked — apply or remove them at any time.
        </p>
      </div>

      {/* Saved Jobs List */}
      {jobs.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200">
          <Bookmark className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          <p className="font-bold text-slate-700">No saved jobs yet</p>
          <p className="text-xs text-slate-400 mt-1">Browse jobs and bookmark them to revisit later.</p>
          <button
            onClick={() => navigate('/dashboard/jobs')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
          >
            Browse Job Board
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs text-xs">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2">
                  {/* Company Badge */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500">{job.company?.name || 'Company'}</span>
                    </div>
                  </div>

                  {/* Job Title */}
                  <h3 className="font-extrabold text-slate-900 text-base">{job.title}</h3>

                  {/* Job Meta */}
                  <div className="flex flex-wrap items-center gap-3 text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {job.location}
                    </span>
                    {(job.minSalary || job.maxSalary) && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" />
                        {job.minSalary ? `$${(job.minSalary / 1000).toFixed(0)}k` : ''}
                        {job.minSalary && job.maxSalary ? ' – ' : ''}
                        {job.maxSalary ? `$${(job.maxSalary / 1000).toFixed(0)}k` : ''}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" /> {job.department || 'Engineering'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full font-bold border text-[10px] bg-emerald-50 text-emerald-700 border-emerald-100">
                      {job.status}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      if (window.confirm('Remove this job from saved list?')) {
                        unsaveMut.mutate(job.id);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 text-rose-600 font-bold hover:bg-rose-50 transition inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>

                  <button
                    onClick={() => !appliedJobIds.includes(job.id) && applyMut.mutate(job.id)}
                    disabled={applyMut.isPending || appliedJobIds.includes(job.id)}
                    className={`px-4 py-1.5 rounded-xl font-bold transition inline-flex items-center gap-1 disabled:opacity-50 ${
                      appliedJobIds.includes(job.id)
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {appliedJobIds.includes(job.id) ? 'Applied' : 'Apply Now'} {!appliedJobIds.includes(job.id) && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CandidateSavedJobs;
