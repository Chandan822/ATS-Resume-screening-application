import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recruiterService } from '../../services/recruiterService';
import InterviewQuestionGenerator from '../../components/InterviewQuestionGenerator';
import FeedbackAnalysisDashboard from '../../components/FeedbackAnalysisDashboard';
import { Users, Mail, RefreshCw, Sparkles, Brain, X, Calendar } from 'lucide-react';

export function RecruiterApplicants() {
  const queryClient = useQueryClient();
  const [filterStage, setFilterStage] = useState('ALL');
  const [selectedAppForQuestions, setSelectedAppForQuestions] = useState(null);
  const [selectedAppForFeedback, setSelectedAppForFeedback] = useState(null);

  // Custom scheduling modal states
  const [schedulingApp, setSchedulingApp] = useState(null);
  const [roundName, setRoundName] = useState('Technical Interview Round 1');
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(45);

  // Job filter & score ranking states
  const [selectedJobId, setSelectedJobId] = useState('ALL');
  const [sortByScore, setSortByScore] = useState('DESC');

  const { data: apps, isLoading, isError, refetch } = useQuery({
    queryKey: ['recruiterApps'],
    queryFn: async () => {
      const res = await recruiterService.getApplications();
      return res.data;
    },
  });

  const updateStageMut = useMutation({
    mutationFn: ({ id, status, schedule }) => recruiterService.updateApplicationStatus(id, status, schedule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiterApps'] });
      queryClient.invalidateQueries({ queryKey: ['recruiterStats'] });
    },
  });

  const handleStatusChange = (app, newStatus) => {
    if (newStatus === 'INTERVIEW_SCHEDULED') {
      setSchedulingApp(app);
      // Set default schedule time to tomorrow at 10:00 AM local timezone
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      const tzOffset = tomorrow.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(tomorrow.getTime() - tzOffset)).toISOString().slice(0, 16);
      setScheduledAt(localISOTime);
      setRoundName('Technical Interview Round 1');
      setDurationMinutes(45);
    } else {
      updateStageMut.mutate({ id: app.id, status: newStatus });
    }
  };

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

  // Extract unique jobs from applications to populate filter dropdown
  const uniqueJobs = [];
  const seenJobIds = new Set();
  if (apps) {
    for (const app of apps) {
      if (app.job && !seenJobIds.has(app.job.id)) {
        seenJobIds.add(app.job.id);
        uniqueJobs.push(app.job);
      }
    }
  }

  // 1. Stage filter
  let processedApps = filterStage === 'ALL' ? (apps || []) : (apps || []).filter((a) => a.status === filterStage);

  // 2. Job filter
  if (selectedJobId !== 'ALL') {
    processedApps = processedApps.filter((a) => a.job?.id === selectedJobId);
  }

  // 3. Score sorting
  if (sortByScore === 'DESC') {
    processedApps = [...processedApps].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  } else if (sortByScore === 'ASC') {
    processedApps = [...processedApps].sort((a, b) => (a.matchScore || 0) - (b.matchScore || 0));
  }

  const getScoreBadge = (score) => {
    if (score === null || score === undefined || score === 0) return <span className="text-slate-400 font-bold">N/A</span>;
    
    let colorClasses = 'bg-slate-50 text-slate-600 border border-slate-200';
    if (score >= 85) {
      colorClasses = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
    } else if (score >= 70) {
      colorClasses = 'bg-indigo-50 text-indigo-700 border border-indigo-100';
    } else if (score >= 55) {
      colorClasses = 'bg-amber-50 text-amber-700 border border-amber-100';
    } else {
      colorClasses = 'bg-rose-50 text-rose-700 border border-rose-100';
    }

    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border tracking-tight ${colorClasses}`}>
        {score}% Match
      </span>
    );
  };

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

      {/* Job Filter & Match Ranking Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white border border-slate-200 rounded-3xl p-4 md:p-6 shadow-xs text-xs font-bold">
        {/* Job selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-slate-500 whitespace-nowrap">Filter by Job:</label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-600 transition font-medium"
          >
            <option value="ALL">All Jobs</option>
            {uniqueJobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title} ({job.department || 'General'})
              </option>
            ))}
          </select>
        </div>

        {/* Match Ranking selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
          <label className="text-slate-500 whitespace-nowrap">Rank by Score:</label>
          <select
            value={sortByScore}
            onChange={(e) => setSortByScore(e.target.value)}
            className="w-full sm:w-48 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-600 transition"
          >
            <option value="DESC">Highest Match first</option>
            <option value="ASC">Lowest Match first</option>
            <option value="NONE">No Ranking (Date Applied)</option>
          </select>
        </div>
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
                <th className="pb-3">ATS Match Score</th>
                <th className="pb-3">Current Stage</th>
                <th className="pb-3 text-right">Update Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processedApps?.map((app) => (
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
                    {getScoreBadge(app.matchScore)}
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
                        onChange={(e) => handleStatusChange(app, e.target.value)}
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
      {/* MODAL: SCHEDULE INTERVIEW */}
      {schedulingApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 md:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setSchedulingApp(null)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" /> Schedule Interview
              </h3>
              <p className="text-xs text-slate-500">
                Configure interview details for <span className="font-bold text-slate-700">{schedulingApp.candidate?.user?.firstName} {schedulingApp.candidate?.user?.lastName}</span>.
              </p>
            </div>

            <div className="space-y-4 text-xs font-bold font-sans">
              {/* Round Name */}
              <div className="space-y-1.5">
                <label className="text-slate-700">Interview Round Name</label>
                <input
                  type="text"
                  value={roundName}
                  onChange={(e) => setRoundName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition font-medium"
                />
              </div>

              {/* Scheduled At */}
              <div className="space-y-1.5">
                <label className="text-slate-700">Date & Time</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition font-medium"
                />
              </div>

              {/* Duration */}
              <div className="space-y-1.5">
                <label className="text-slate-700">Duration (Minutes)</label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                  <option value={90}>90 Minutes</option>
                </select>
              </div>

              {/* Google Meet Info Box */}
              <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] leading-relaxed font-medium">
                <strong>Google Meet Link Generation:</strong> A unique Meet video conferencing link will be auto-generated and emailed directly to the applicant with the meeting invite details.
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setSchedulingApp(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateStageMut.mutate({
                    id: schedulingApp.id,
                    status: 'INTERVIEW_SCHEDULED',
                    schedule: {
                      roundName,
                      scheduledAt,
                      durationMinutes,
                    },
                  }, {
                    onSuccess: () => {
                      setSchedulingApp(null);
                    }
                  });
                }}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition text-xs shadow-md shadow-indigo-600/20"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecruiterApplicants;
