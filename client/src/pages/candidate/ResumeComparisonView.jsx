import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { candidateService } from '../../services/candidateService';
import {
  Sparkles,
  Award,
  TrendingUp,
  CheckCircle2,
  FileText,
  ArrowRight,
  RefreshCw,
  Zap,
} from 'lucide-react';

export function ResumeComparisonView() {
  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: ['candidateProfile'],
    queryFn: async () => {
      const res = await candidateService.getProfile();
      return res.data;
    },
  });

  const resumes = profileData?.resumeFiles || [];

  const [selectedResumeA, setSelectedResumeA] = useState('');
  const [selectedResumeB, setSelectedResumeB] = useState('');

  // Default selection when resumes load
  useEffect(() => {
    if (resumes.length >= 2) {
      if (!selectedResumeA) setSelectedResumeA(resumes[0].id);
      if (!selectedResumeB) setSelectedResumeB(resumes[1].id);
    }
  }, [resumes, selectedResumeA, selectedResumeB]);

  const resumeAId = selectedResumeA || resumes[0]?.id;
  const resumeBId = selectedResumeB || resumes[1]?.id || resumes[0]?.id;

  const hasDistinctSelection = resumeAId && resumeBId && resumeAId !== resumeBId;

  const { data: comparisonData, isLoading, isError } = useQuery({
    queryKey: ['resumeComparison', resumeAId, resumeBId],
    queryFn: async () => {
      if (!hasDistinctSelection) return null;
      const res = await candidateService.compareResumes(resumeAId, resumeBId);
      return res.data;
    },
    enabled: Boolean(hasDistinctSelection),
  });

  if (isProfileLoading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center text-slate-500 text-xs">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mb-1" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-xs text-slate-900">
      {/* Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-1">
              <Zap className="w-3.5 h-3.5 text-indigo-600" /> Multi-Resume Comparative Analytics
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Side-by-Side Resume Comparison</h2>
            <p className="text-xs text-slate-500">
              Compare any two resume versions side-by-side across ATS Score, Keywords, Skills, Formatting, and Grammar.
            </p>
          </div>

          {/* Resume Selection Controls */}
          {resumes.length >= 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-500 block text-[10px] mb-1">Select Resume A</label>
                <select
                  value={resumeAId}
                  onChange={(e) => setSelectedResumeA(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.fileName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-500 block text-[10px] mb-1">Select Resume B</label>
                <select
                  value={resumeBId}
                  onChange={(e) => setSelectedResumeB(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.fileName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Conditional States */}
      {resumes.length < 2 ? (
        <div className="p-8 rounded-3xl bg-amber-50/50 border border-amber-200 text-center space-y-3">
          <FileText className="w-12 h-12 text-amber-500 mx-auto opacity-70" />
          <h3 className="font-extrabold text-base text-amber-950">Multiple Resumes Needed</h3>
          <p className="text-slate-600 max-w-md mx-auto">
            You currently have {resumes.length} resume(s) uploaded. Please upload at least 2 resume versions under the <strong>Resume Files</strong> tab to run side-by-side comparative diagnostics.
          </p>
        </div>
      ) : resumeAId === resumeBId ? (
        <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-3">
          <FileText className="w-12 h-12 text-slate-400 mx-auto opacity-70" />
          <h3 className="font-extrabold text-base text-slate-800">Select Different Resumes</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Please select two different resume versions from the dropdown lists above to analyze and match them side-by-side.
          </p>
        </div>
      ) : isLoading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center text-slate-500 gap-2">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
          <span className="font-semibold text-xs">Computing comparative ATS scores...</span>
        </div>
      ) : isError || !comparisonData ? (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          Failed to load resume comparison metrics. Please check that the selected resumes are parsed correctly.
        </div>
      ) : (
        <>
          {/* Improvement Highlights Callout */}
          {comparisonData.improvements && comparisonData.improvements.length > 0 && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" /> Key Comparative Improvement Callouts
                </h3>
                <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                  Winner: {comparisonData.deltas?.winningResume}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {comparisonData.improvements.map((imp, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-white/10 border border-white/10 text-xs flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{imp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Side-by-Side Parallel Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* RESUME A COLUMN */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px]">
                    Baseline
                  </span>
                  <h4 className="font-extrabold text-base text-slate-900 mt-1">{comparisonData.resumeA.title}</h4>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 block">ATS Score</span>
                  <span className="text-2xl font-black text-indigo-600">{comparisonData.resumeA.atsScore}%</span>
                </div>
              </div>

              {/* Section Score Gauges */}
              <div className="space-y-3">
                <span className="font-bold text-slate-700 text-xs block">Section Metrics Breakdown</span>
                {[
                  { label: 'Keywords Optimization', score: comparisonData.resumeA.sections?.keywords || 0 },
                  { label: 'Skills & Tech Stack', score: comparisonData.resumeA.sections?.skills || 0 },
                  { label: 'ATS Formatting & Parser', score: comparisonData.resumeA.sections?.formatting || 0 },
                  { label: 'Grammar & Tone Clarity', score: comparisonData.resumeA.sections?.grammar || 0 },
                  { label: 'Semantic Role Alignment', score: comparisonData.resumeA.sections?.experience || 0 },
                ].map((sec) => (
                  <div key={sec.label} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                      <span>{sec.label}</span>
                      <span className="font-bold text-slate-900">{sec.score}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${sec.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Skills Breakdown */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="font-bold text-slate-700 text-xs block">
                  Detected Skills ({comparisonData.resumeA.skillsCount})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {comparisonData.resumeA.skills && comparisonData.resumeA.skills.length > 0 ? (
                    comparisonData.resumeA.skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px]">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">No skills extracted</span>
                  )}
                </div>
              </div>
            </div>

            {/* RESUME B COLUMN */}
            <div className="p-6 rounded-3xl bg-white border border-indigo-200 shadow-xs space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-indigo-600 text-white px-4 py-1 rounded-bl-2xl text-[10px] font-black uppercase tracking-wider">
                Comparison Version
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-3 pt-2">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-extrabold text-[10px] border border-indigo-100">
                    Optimized
                  </span>
                  <h4 className="font-extrabold text-base text-slate-900 mt-1">{comparisonData.resumeB.title}</h4>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 block">ATS Score</span>
                  <span className="text-2xl font-black text-emerald-600">{comparisonData.resumeB.atsScore}%</span>
                </div>
              </div>

              {/* Section Score Gauges */}
              <div className="space-y-3">
                <span className="font-bold text-slate-700 text-xs block">Section Metrics Breakdown</span>
                {[
                  { label: 'Keywords Optimization', score: comparisonData.resumeB.sections?.keywords || 0 },
                  { label: 'Skills & Tech Stack', score: comparisonData.resumeB.sections?.skills || 0 },
                  { label: 'ATS Formatting & Parser', score: comparisonData.resumeB.sections?.formatting || 0 },
                  { label: 'Grammar & Tone Clarity', score: comparisonData.resumeB.sections?.grammar || 0 },
                  { label: 'Semantic Role Alignment', score: comparisonData.resumeB.sections?.experience || 0 },
                ].map((sec) => (
                  <div key={sec.label} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                      <span>{sec.label}</span>
                      <span className="font-bold text-slate-900">{sec.score}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${sec.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Skills Breakdown */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="font-bold text-slate-700 text-xs block">
                  Detected Skills ({comparisonData.resumeB.skillsCount})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {comparisonData.resumeB.skills && comparisonData.resumeB.skills.length > 0 ? (
                    comparisonData.resumeB.skills.map((s) => {
                      const isNew = comparisonData.deltas?.addedSkills?.includes(s);
                      return (
                        <span
                          key={s}
                          className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                            isNew
                              ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {s} {isNew && '★ NEW'}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-slate-400 italic">No skills extracted</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ResumeComparisonView;
