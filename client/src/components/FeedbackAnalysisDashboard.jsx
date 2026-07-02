import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { recruiterService } from '../services/recruiterService';
import {
  Brain,
  CheckCircle2,
  AlertTriangle,
  Award,
  RefreshCw,
  Sparkles,
  Save,
} from 'lucide-react';

export function FeedbackAnalysisDashboard({ roundId, candidateName }) {
  const [rawNotes, setRawNotes] = useState(
    'Candidate communicated very clearly during the technical discussion. Demonstrated deep knowledge of React state management, custom hooks, and server-side rendering. Solved the coding problem in O(n) time complexity. Showed great culture fit and leadership enthusiasm. Minor area to improve: could elaborate more on microservices deployment metrics.'
  );

  const [analysisResult, setAnalysisResult] = useState({
    summary: 'Candidate demonstrated outstanding technical depth, strong architectural problem-solving, and clear communication skills.',
    strengths: [
      'Articulate communication of complex system architecture concepts',
      'Optimal O(n) algorithm solution for coding problem',
      'Strong cultural alignment and team collaboration mindset',
    ],
    weaknesses: [
      'Limited elaboration on production microservices deployment metrics',
    ],
    communicationScore: 92,
    technicalScore: 95,
    cultureFitScore: 90,
    recommendation: 'STRONG_HIRE',
    confidenceScore: 94,
  });

  const analyzeMut = useMutation({
    mutationFn: () => recruiterService.analyzeInterviewerNotes(rawNotes),
    onSuccess: (res) => {
      if (res.data) {
        setAnalysisResult(res.data);
      }
    },
  });

  const saveMut = useMutation({
    mutationFn: () =>
      recruiterService.saveInterviewFeedback(roundId || 'demo_round_1', {
        rawNotes,
        comments: rawNotes,
        aiAnalysis: analysisResult,
      }),
    onSuccess: () => alert('Interview feedback & AI analysis saved to database!'),
  });

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6 text-xs text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-1">
            <Brain className="w-3.5 h-3.5 text-indigo-600" /> AI Feedback Intelligence
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Interviewer Notes Analyzer</h3>
          <p className="text-xs text-slate-500">
            Convert free-text interviewer notes into structured evaluations & hiring recommendations for{' '}
            <span className="font-bold text-slate-800">{candidateName || 'Candidate'}</span>.
          </p>
        </div>

        <button
          onClick={() => saveMut.mutate()}
          disabled={saveMut.isPending}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2 transition shadow-md shadow-emerald-600/20 disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {saveMut.isPending ? 'Saving...' : 'Save Feedback Record'}
        </button>
      </div>

      {/* Free-Text Notes Input */}
      <div className="space-y-2">
        <label className="font-bold text-slate-700 block">Unformatted Interviewer Free-Text Notes</label>
        <textarea
          rows={4}
          value={rawNotes}
          onChange={(e) => setRawNotes(e.target.value)}
          placeholder="Paste raw interview bullet points, transcripts, or notes..."
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-slate-900 focus:outline-none focus:border-indigo-600 transition"
        />
        <div className="flex justify-end">
          <button
            onClick={() => analyzeMut.mutate()}
            disabled={analyzeMut.isPending || !rawNotes.trim()}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 transition shadow-md shadow-indigo-600/20 disabled:opacity-50"
          >
            {analyzeMut.isPending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing Notes...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Analyze Notes with AI
              </>
            )}
          </button>
        </div>
      </div>

      {/* Structured Visual Display */}
      {analysisResult && (
        <div className="space-y-5 pt-4 border-t border-slate-100">
          {/* Recommendation Banner */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-slate-500 font-bold text-[11px] uppercase tracking-wider">AI Hiring Recommendation</span>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3.5 py-1 rounded-full text-sm font-extrabold tracking-wide border ${
                    analysisResult.recommendation === 'STRONG_HIRE'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : analysisResult.recommendation === 'HIRE'
                      ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                      : analysisResult.recommendation === 'NEUTRAL'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-rose-100 text-rose-800 border-rose-300'
                  }`}
                >
                  {analysisResult.recommendation?.replace('_', ' ')}
                </span>
                <span className="text-slate-600 font-bold text-xs">
                  {analysisResult.confidenceScore || 90}% Confidence Score
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs max-w-md leading-relaxed">
              <p className="italic">"{analysisResult.summary}"</p>
            </div>
          </div>

          {/* 3 Metric Score Gauges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between font-bold text-slate-700">
                <span>Communication Skills</span>
                <span className="text-indigo-600">{analysisResult.communicationScore}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-500"
                  style={{ width: `${analysisResult.communicationScore}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between font-bold text-slate-700">
                <span>Technical Proficiency</span>
                <span className="text-emerald-600">{analysisResult.technicalScore}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 transition-all duration-500"
                  style={{ width: `${analysisResult.technicalScore}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between font-bold text-slate-700">
                <span>Culture & Team Alignment</span>
                <span className="text-amber-600">{analysisResult.cultureFitScore}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${analysisResult.cultureFitScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Strengths & Weaknesses Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
              <h4 className="font-extrabold text-emerald-800 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Key Strengths Demonstrated
              </h4>
              <ul className="space-y-2 text-slate-700">
                {analysisResult.strengths?.map((str, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses / Growth Areas */}
            <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200/80 space-y-3">
              <h4 className="font-extrabold text-rose-800 text-xs flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" /> Growth Areas & Considerations
              </h4>
              <ul className="space-y-2 text-slate-700">
                {analysisResult.weaknesses?.map((wk, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>{wk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FeedbackAnalysisDashboard;
