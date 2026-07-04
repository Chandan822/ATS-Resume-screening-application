import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recruiterService } from '../../services/recruiterService';
import InterviewQuestionGenerator from '../../components/InterviewQuestionGenerator';
import FeedbackAnalysisDashboard from '../../components/FeedbackAnalysisDashboard';
import { Users, Mail, RefreshCw, Sparkles, Brain, X } from 'lucide-react';

export function RecruiterApplicants() {
  const queryClient = useQueryClient();
  const [filterStage, setFilterStage] = useState('ALL');
  const [selectedAppForQuestions, setSelectedAppForQuestions] = useState(null);
  const [selectedAppForFeedback, setSelectedAppForFeedback] = useState(null);

  const { data: apps, isLoading, isError, refetch } = useQuery({
    queryKey: ['recruiterApps'],
    queryFn: async () => {
      const res = await recruiterService.getApplications();
      return res.data;
    },
  });

  const updateStageMut = useMutation({
    mutationFn: ({ id, status }) => recruiterService.updateApplicationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiterApps'] });
      queryClient.invalidateQueries({ queryKey: ['recruiterStats'] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
        <span className="text-xs font-semibold">Loading Applicants Pipeline...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between">
        <span>Failed to load applicant pipeline.</span>
        <button onClick={() => refetch()} className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold">
          Retry
        </button>
      </div>
    );
  }

  const filteredApps = filterStage === 'ALL' ? apps : apps?.filter((a) => a.status === filterStage);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-600" /> Applicant Candidates Pipeline
        </h2>
        <p className="text-xs text-slate-500 mt-1">Review candidate profiles and advance application status stages.</p>
      </div>

      {/* Stage Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs font-bold">
        {['ALL', 'APPLIED', 'SCREENING', 'INTERVIEW_SCHEDULED', 'OFFERED', 'HIRED', 'REJECTED'].map((stage) => (
          <button
            key={stage}
            onClick={() => setFilterStage(stage)}
            className={`px-4 py-2 rounded-xl transition ${
              filterStage === stage
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {stage}
          </button>
        ))}
      </div>

      {/* Applicants List Table / Cards */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3">Candidate</th>
                <th className="pb-3">Applied Position</th>
                <th className="pb-3">Applied Date</th>
                <th className="pb-3">Current Stage</th>
                <th className="pb-3 text-right">Update Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps?.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs">
                        {app.candidate?.user?.firstName ? app.candidate.user.firstName.charAt(0) : 'C'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">
                          {app.candidate?.user?.firstName} {app.candidate?.user?.lastName}
                        </p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {app.candidate?.user?.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <p className="font-bold text-slate-800">{app.job?.title}</p>
                    <p className="text-[11px] text-slate-400">{app.job?.department}</p>
                  </td>
                  <td className="py-3.5 text-slate-500 font-medium">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        app.status === 'OFFERED' || app.status === 'HIRED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'INTERVIEW_SCHEDULED'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedAppForQuestions(app)}
                        className="px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold flex items-center gap-1 transition"
                        title="Generate AI Interview Questions"
                      >
                        <Sparkles className="w-3 h-3" /> Questions
                      </button>
                      <button
                        onClick={() => setSelectedAppForFeedback(app)}
                        className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold flex items-center gap-1 transition"
                        title="Analyze Interviewer Notes"
                      >
                        <Brain className="w-3 h-3" /> Notes AI
                      </button>
                      <select
                        value={app.status}
                        onChange={(e) => updateStageMut.mutate({ id: app.id, status: e.target.value })}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600"
                      >
                        <option value="APPLIED">Applied</option>
                        <option value="SCREENING">Screening</option>
                        <option value="INTERVIEW_SCHEDULED">Interview</option>
                        <option value="OFFERED">Offered</option>
                        <option value="HIRED">Hired</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: AI QUESTION GENERATOR & EDITOR */}
      {selectedAppForQuestions && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-4xl w-full relative my-8">
            <button
              onClick={() => setSelectedAppForQuestions(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 z-10 bg-slate-100 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
            <InterviewQuestionGenerator
              candidateName={`${selectedAppForQuestions.candidate?.user?.firstName || 'Candidate'} ${selectedAppForQuestions.candidate?.user?.lastName || ''}`}
              jobTitle={selectedAppForQuestions.job?.title || 'Job Opening'}
              roundId={selectedAppForQuestions.id}
            />
          </div>
        </div>
      )}
      {/* MODAL: AI FEEDBACK ANALYSIS DASHBOARD */}
      {selectedAppForFeedback && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-4xl w-full relative my-8">
            <button
              onClick={() => setSelectedAppForFeedback(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 z-10 bg-slate-100 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
            <FeedbackAnalysisDashboard
              candidateName={`${selectedAppForFeedback.candidate?.user?.firstName || 'Candidate'} ${selectedAppForFeedback.candidate?.user?.lastName || ''}`}
              roundId={selectedAppForFeedback.id}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default RecruiterApplicants;
