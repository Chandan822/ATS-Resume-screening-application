import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recruiterService } from '../../services/recruiterService';
import InterviewQuestionGenerator from '../../components/InterviewQuestionGenerator';
import FeedbackAnalysisDashboard from '../../components/FeedbackAnalysisDashboard';
import { Calendar, User, Briefcase, RefreshCw, Clock, ExternalLink, Sparkles, Brain, X, AlertCircle } from 'lucide-react';

export function RecruiterInterviews() {
  const queryClient = useQueryClient();
  const [selectedRoundForQuestions, setSelectedRoundForQuestions] = useState(null);
  const [selectedRoundForFeedback, setSelectedRoundForFeedback] = useState(null);

  const { data: interviewsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['recruiterInterviews'],
    queryFn: async () => {
      const res = await recruiterService.getInterviews();
      return res.data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
        <span className="text-xs font-semibold">Loading Scheduled Interviews...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between">
        <span>Failed to load interviews schedule.</span>
        <button onClick={() => refetch()} className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold">
          Retry
        </button>
      </div>
    );
  }

  const interviews = interviewsData || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-xs text-slate-900">
      {/* Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600" /> Scheduled Interview Rounds
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track active system interviews, configure questionnaire kits using AI, and write AI-analyzed feedback ratings.
          </p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold">
          Active: {interviews.length} Interviews
        </div>
      </div>

      {/* Interviews grid */}
      {interviews.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
          <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="font-bold text-slate-700">No scheduled interviews found</p>
          <p className="text-xs text-slate-400">Scheduled interviews will appear here when a candidate is moved to the INTERVIEW stage.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map((round) => {
            const app = round.application;
            const candName = app?.candidate?.user
              ? `${app.candidate.user.firstName} ${app.candidate.user.lastName || ''}`
              : 'Unknown Candidate';
            const jobTitle = app?.job?.title || 'Unknown Job';

            return (
              <div key={round.id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5 hover:border-indigo-200 transition">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-extrabold text-[10px] border border-indigo-100 uppercase tracking-wider">
                        {round.roundName}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-extrabold text-[10px]">
                        {round.status}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-sm leading-snug">
                      Candidate: {candName}
                    </h3>
                    <p className="text-slate-500 font-semibold text-[10px]">
                      Job Requisition: {jobTitle} ({app?.job?.department})
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-slate-400 text-[10px] pt-1 font-medium">
                      <span className="flex items-center gap-1 text-indigo-600 font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(round.scheduledAt).toLocaleString()} ({round.durationMinutes} mins)
                      </span>
                      {round.locationOrLink && (
                        <span className="flex items-center gap-1">
                          <ExternalLink className="w-3.5 h-3.5" /> Link: {round.locationOrLink}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Kit */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedRoundForQuestions({
                        ...round,
                        candidateName: candName,
                        jobTitle: jobTitle,
                        resumeText: app?.resumeVersion?.parsedText || '',
                        jobDescription: app?.job?.description || '',
                      })}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold flex items-center gap-1 transition"
                      title="Open AI Interview Question Kit"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-600" /> AI Questions
                    </button>
                    <button
                      onClick={() => setSelectedRoundForFeedback({
                        ...round,
                        candidateName: candName,
                        jobTitle: jobTitle,
                      })}
                      className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold flex items-center gap-1 transition"
                      title="Open Interviewer Feedback & notes rating"
                    >
                      <Brain className="w-4 h-4 text-purple-600" /> AI Feedback
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Question generator modal */}
      {selectedRoundForQuestions && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button
              onClick={() => setSelectedRoundForQuestions(null)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="p-6 md:p-8">
              <InterviewQuestionGenerator
                roundId={selectedRoundForQuestions.id}
                candidateName={selectedRoundForQuestions.candidateName}
                jobTitle={selectedRoundForQuestions.jobTitle}
                resumeText={selectedRoundForQuestions.resumeText}
                jobDescription={selectedRoundForQuestions.jobDescription}
              />
            </div>
          </div>
        </div>
      )}

      {/* AI Feedback & notes modal */}
      {selectedRoundForFeedback && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button
              onClick={() => setSelectedRoundForFeedback(null)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="p-6 md:p-8">
              <FeedbackAnalysisDashboard
                roundId={selectedRoundForFeedback.id}
                candidateName={selectedRoundForFeedback.candidateName}
                jobTitle={selectedRoundForFeedback.jobTitle}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecruiterInterviews;
