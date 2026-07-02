import { CheckCircle2, AlertTriangle, Lightbulb, ShieldCheck } from 'lucide-react';

export function AtsScoreDashboard({ scoreData }) {
  if (!scoreData) return null;

  const { overallScore, scoreGrade, wordCount, sectionScores, suggestions } = scoreData;

  // Circle Gauge SVG dimensions
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  // Color theme mapping
  let gaugeColor = '#10b981'; // Emerald >= 85
  let badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (overallScore < 55) {
    gaugeColor = '#f43f5e'; // Rose
    badgeBg = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (overallScore < 70) {
    gaugeColor = '#f59e0b'; // Amber
    badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (overallScore < 85) {
    gaugeColor = '#4f46e5'; // Indigo
    badgeBg = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  }

  const sectionList = [
    { label: 'Formatting & Layout', score: sectionScores?.formatting || 0, weight: '10%' },
    { label: 'Skills Density', score: sectionScores?.skills || 0, weight: '15%' },
    { label: 'Action Keywords', score: sectionScores?.keywords || 0, weight: '15%' },
    { label: 'Work Experience Depth', score: sectionScores?.experience || 0, weight: '15%' },
    { label: 'Education & Degrees', score: sectionScores?.education || 0, weight: '10%' },
    { label: 'Grammar & Professional Tone', score: sectionScores?.grammar || 0, weight: '10%' },
    { label: 'Quantified Achievements', score: sectionScores?.achievements || 0, weight: '15%' },
    { label: 'Resume Length', score: sectionScores?.length || 0, weight: '10%' },
  ];

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-8 text-slate-900">
      {/* Top Section: Header & Gauge Meter */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 border-b border-slate-100 pb-8">
        {/* Left Info */}
        <div className="space-y-3 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
            <ShieldCheck className="w-3.5 h-3.5" /> ATS Compatibility Audit
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">ATS Resume Score Analysis</h3>
          <p className="text-xs text-slate-500 max-w-md">
            Calculated across 8 core screening criteria evaluated by modern Applicant Tracking Systems.
          </p>

          <div className="flex items-center justify-center md:justify-start gap-3 pt-1 text-xs">
            <span className={`px-3 py-1 rounded-xl font-bold border ${badgeBg}`}>
              Grade: {scoreGrade.replace('_', ' ')}
            </span>
            <span className="px-3 py-1 rounded-xl font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {wordCount} Words
            </span>
          </div>
        </div>

        {/* Right Animated SVG Gauge Meter */}
        <div className="relative flex flex-col items-center justify-center shrink-0">
          <svg className="w-36 h-36 transform -rotate-90">
            {/* Track Background */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke="#e2e8f0"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Animated Gauge Arc */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke={gaugeColor}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-3xl font-black text-slate-900 tracking-tighter">{overallScore}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Out of 100</span>
          </div>
        </div>
      </div>

      {/* 8 Section Progress Bars Grid */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-slate-900">8-Category Section Breakdown</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sectionList.map((sec, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">{sec.label}</span>
                <span className="font-extrabold text-slate-900">
                  {sec.score}% <span className="text-[10px] text-slate-400 font-normal">({sec.weight})</span>
                </span>
              </div>

              {/* Section Progress Bar */}
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${sec.score}%`,
                    backgroundColor: sec.score >= 80 ? '#10b981' : sec.score >= 65 ? '#4f46e5' : sec.score >= 50 ? '#f59e0b' : '#f43f5e',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Targeted Improvement Suggestions */}
      {suggestions?.length > 0 && (
        <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-3 text-xs">
          <h4 className="font-extrabold text-indigo-950 flex items-center gap-2 text-sm">
            <Lightbulb className="w-4 h-4 text-indigo-600" /> Actionable ATS Optimization Recommendations
          </h4>

          <div className="space-y-2">
            {suggestions.map((sug, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-indigo-100 text-slate-700">
                {sug.toLowerCase().includes('format') || sug.toLowerCase().includes('grammar') ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                )}
                <span className="leading-relaxed">{sug}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AtsScoreDashboard;
