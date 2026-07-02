import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { recruiterService } from '../services/recruiterService';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Zap,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export function InclusiveJobEditor({ initialText = '', onTextChange }) {
  const [text, setText] = useState(
    initialText ||
      'We are seeking a rockstar software ninja to join our young and vibrant team! The ideal candidate is a digital native who can work hard play hard and is a native English speaker. Must be able to stand for 8 hours.'
  );

  const [analysis, setAnalysis] = useState({
    inclusivityScore: 62,
    detectedBiases: [
      { id: 'b1', phrase: 'rockstar', category: 'GENDER_BIAS', explanation: 'Masculine-coded term that alienates female applicants.', suggestion: 'exceptional engineer' },
      { id: 'b2', phrase: 'ninja', category: 'GENDER_BIAS', explanation: 'Masculine-coded jargon.', suggestion: 'skilled developer' },
      { id: 'b3', phrase: 'young and vibrant', category: 'AGE_BIAS', explanation: 'Ageist term favoring younger candidates.', suggestion: 'energetic and collaborative' },
      { id: 'b4', phrase: 'digital native', category: 'AGE_BIAS', explanation: 'Age-restrictive terminology.', suggestion: 'proficient with digital tools' },
      { id: 'b5', phrase: 'work hard play hard', category: 'AGGRESSIVE_TONE', explanation: 'Implies excessive overtime and burnout culture.', suggestion: 'balanced & results-oriented workplace' },
      { id: 'b6', phrase: 'native English speaker', category: 'EXCLUSIONARY_LANGUAGE', explanation: 'Excludes fluent non-native speakers.', suggestion: 'fluent in professional English' },
      { id: 'b7', phrase: 'stand for 8 hours', category: 'ACCESSIBILITY_ISSUE', explanation: 'Unnecessary physical constraint for office work.', suggestion: 'perform core duties with accommodation' },
    ],
  });

  // Debounced API Mutation
  const analyzeMut = useMutation({
    mutationFn: (val) => recruiterService.analyzeJobBias(val),
    onSuccess: (res) => {
      if (res.data) setAnalysis(res.data);
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (text.trim().length > 10) {
        analyzeMut.mutate(text);
      }
    }, 400);

    if (onTextChange) onTextChange(text);
    return () => clearTimeout(timer);
  }, [text]);

  const handleReplacePhrase = (phrase, suggestion) => {
    const regex = new RegExp(phrase, 'gi');
    const newText = text.replace(regex, suggestion);
    setText(newText);
  };

  const getCategoryBadgeClass = (cat) => {
    switch (cat) {
      case 'GENDER_BIAS':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'AGE_BIAS':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'EXCLUSIONARY_LANGUAGE':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'AGGRESSIVE_TONE':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'ACCESSIBILITY_ISSUE':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6 text-xs text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> DEI Real-time Inclusivity Scanner
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Job Description Bias Detector</h3>
          <p className="text-xs text-slate-500">
            Real-time scanner highlighting Gender Bias, Age Bias, Exclusionary Language, Aggressive Tone, and Accessibility Issues.
          </p>
        </div>

        {/* Inclusivity Score Gauge */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-2xl">
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Inclusivity Score</span>
            <span
              className={`font-black text-base ${
                analysis.inclusivityScore >= 85
                  ? 'text-emerald-600'
                  : analysis.inclusivityScore >= 70
                  ? 'text-amber-600'
                  : 'text-rose-600'
              }`}
            >
              {analysis.inclusivityScore}% / 100
            </span>
          </div>

          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-white ${
              analysis.inclusivityScore >= 85
                ? 'bg-emerald-500'
                : analysis.inclusivityScore >= 70
                ? 'bg-amber-500'
                : 'bg-rose-500'
            }`}
          >
            {analysis.inclusivityScore >= 85 ? 'A+' : analysis.inclusivityScore >= 70 ? 'B' : 'C-'}
          </div>
        </div>
      </div>

      {/* Editor & Real-time Suggestions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Job Text Input */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-700">Job Description Content</label>
            {analyzeMut.isPending && (
              <span className="text-indigo-600 font-bold flex items-center gap-1 text-[11px]">
                <RefreshCw className="w-3 h-3 animate-spin" /> Scanning text...
              </span>
            )}
          </div>

          <textarea
            rows={12}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste job description requirements..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 leading-relaxed focus:outline-none focus:border-indigo-600 focus:bg-white transition font-mono text-xs"
          />

          <p className="text-[11px] text-slate-400">
            Tip: Click "Replace with Inclusive Option" on any detected issue to update the text automatically.
          </p>
        </div>

        {/* Right Column: Detected Issues & Inclusive Suggestions */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Detected Inclusivity Issues ({analysis.detectedBiases?.length || 0})
            </h4>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {analysis.detectedBiases?.length === 0 ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-bold text-emerald-900">No Biased Language Detected!</p>
                <p className="text-emerald-700 text-[11px]">This job description reads as inclusive, balanced, and accessible.</p>
              </div>
            ) : (
              analysis.detectedBiases?.map((b) => (
                <div key={b.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-xs">
                      "{b.phrase}"
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${getCategoryBadgeClass(b.category)}`}>
                      {b.category?.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-normal">{b.explanation}</p>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Inclusive Alternative</span>
                      <span className="font-bold text-indigo-700">{b.suggestion}</span>
                    </div>

                    <button
                      onClick={() => handleReplacePhrase(b.phrase, b.suggestion)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] inline-flex items-center gap-1 transition shadow-xs"
                    >
                      Replace <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InclusiveJobEditor;
