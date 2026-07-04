import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { candidateService } from '../../services/candidateService';
import { FileText, CheckCircle2, AlertCircle, Trash2, RefreshCw, Clock } from 'lucide-react';

export function CandidateApplications() {
  const queryClient = useQueryClient();

  const { data: apps, isLoading, isError, refetch } = useQuery({
    queryKey: ['candidateApplications'],
    queryFn: async () => {
      const res = await candidateService.getMyApplications();
      return res.data || [];
    },
  });

  const withdrawMut = useMutation({
    mutationFn: (id) => candidateService.withdrawApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidateApplications'] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
        <span className="text-xs font-semibold">Loading Submitted Applications...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between">
        <span>Failed to load application history.</span>
        <button onClick={() => refetch()} className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold">
          Retry
        </button>
      </div>
    );
  }

  const stagesOrder = ['APPLIED', 'SCREENING', 'INTERVIEW_SCHEDULED', 'OFFERED', 'HIRED'];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-600" /> My Submitted Applications
        </h2>
        <p className="text-xs text-slate-500 mt-1">Track application progress, review stage milestones, or withdraw active submissions.</p>
      </div>

      {/* Applications Tracker List */}
      <div className="space-y-4">
        {apps.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
            <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700">No active applications submitted yet</p>
            <p className="text-xs text-slate-400">Browse open roles on the job board to apply.</p>
          </div>
        ) : (
          apps.map((app) => {
            const currentStageIndex = stagesOrder.indexOf(app.status);
            const isRejected = app.status === 'REJECTED';

            return (
              <div key={app.id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6 text-xs">
                {/* Application Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-extrabold text-[10px] border border-indigo-100">
                      {app.job?.department || 'Engineering'}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-base mt-1">{app.job?.title}</h3>
                    <p className="text-slate-500 text-[11px]">
                      {app.job?.company?.name || 'TechCorp Global'} &bull; Applied on {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        app.status === 'HIRED' || app.status === 'OFFERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      Status: {app.status}
                    </span>

                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to withdraw this application?')) {
                          withdrawMut.mutate(app.id);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 text-rose-600 font-bold hover:bg-rose-50 transition inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Withdraw
                    </button>
                  </div>
                </div>

                {/* Live Application Timeline Tracker */}
                <div className="space-y-2">
                  <span className="font-bold text-slate-700 text-xs">Application Stage Tracker</span>
                  {isRejected ? (
                    <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 font-medium text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600" /> Application status set to Rejected by hiring team.
                    </div>
                  ) : (
                    <div className="grid grid-cols-5 gap-2 pt-2">
                      {stagesOrder.map((st, idx) => {
                        const isDone = currentStageIndex >= idx;
                        const isCurrent = currentStageIndex === idx;
                        return (
                          <div key={st} className="space-y-1.5 text-center">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                isDone ? 'bg-indigo-600' : 'bg-slate-100'
                              }`}
                            />
                            <span
                              className={`text-[10px] font-bold block ${
                                isCurrent ? 'text-indigo-600' : isDone ? 'text-slate-800' : 'text-slate-400'
                              }`}
                            >
                              {st}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default CandidateApplications;
