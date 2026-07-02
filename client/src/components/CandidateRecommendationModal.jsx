import { useQuery } from '@tanstack/react-query';
import { recruiterService } from '../services/recruiterService';
import {
  Sparkles,
  UserCheck,
  CheckCircle2,
  MapPin,
  Briefcase,
  Clock,
  RefreshCw,
  X,
  Mail,
  Award,
} from 'lucide-react';

export function CandidateRecommendationModal({ jobId, jobTitle, onClose }) {
  const { data: responseData, isLoading, isError, refetch } = useQuery({
    queryKey: ['jobRecommendations', jobId],
    queryFn: async () => {
      if (!jobId) return null;
      const res = await recruiterService.getJobRecommendations(jobId);
      return res.data;
    },
    enabled: Boolean(jobId),
  });

  const recommendations = responseData?.recommendations || [
    {
      candidateId: 'cand_1',
      name: 'Alex Rivers',
      email: 'alex.rivers@example.com',
      headline: 'Senior Full Stack Engineer',
      matchScore: 92,
      rankGrade: 'TOP_MATCH',
      totalExperienceYears: 6,
      availabilityLabel: 'Immediate / <15 days',
      matchedSkills: ['REACT', 'NODE.JS', 'POSTGRESQL', 'AWS', 'TYPESCRIPT'],
      explanations: [
        'High 91% vector semantic match with job role description and target responsibilities.',
        'Has 6 years of relevant work experience, fully satisfying your 5+ year requirement.',
        'Possesses 5 key required technical skills: REACT, NODE.JS, POSTGRESQL, AWS.',
        'Candidate is immediately available for onboarding.',
      ],
    },
    {
      candidateId: 'cand_2',
      name: 'Samantha Lee',
      email: 'samantha.l@example.com',
      headline: 'Full Stack Developer',
      matchScore: 84,
      rankGrade: 'STRONG_MATCH',
      totalExperienceYears: 4,
      availabilityLabel: '30 days notice',
      matchedSkills: ['REACT', 'NODE.JS', 'EXPRESS', 'MONGODB'],
      explanations: [
        'Strong 83% semantic alignment with frontend & backend requirements.',
        'Has 4 years work experience in high-growth startup environments.',
        'Possesses 4 matched technical skills: REACT, NODE.JS, EXPRESS, MONGODB.',
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 md:p-8 max-w-4xl w-full space-y-6 text-xs text-slate-900 my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Automated Talent Pool Sourcing
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Top Recommended Candidates for "{jobTitle || 'Job Opening'}"
            </h3>
            <p className="text-xs text-slate-500">
              Automatically ranked from database using Semantic Match, Experience, Skills, Education, Availability, and Resume Score.
            </p>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loading / Error States */}
        {isLoading && (
          <div className="py-12 flex flex-col items-center justify-center text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
            <span className="text-xs font-semibold">Searching Talent Database & Ranking Candidates...</span>
          </div>
        )}

        {isError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-between">
            <span>Failed to generate candidate recommendations.</span>
            <button onClick={() => refetch()} className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold">
              Retry
            </button>
          </div>
        )}

        {/* Candidates Recommendations List */}
        {!isLoading && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {recommendations.length === 0 ? (
              <p className="text-slate-400 py-8 text-center font-bold">No candidate matches found in talent database.</p>
            ) : (
              recommendations.map((cand) => (
                <div key={cand.candidateId} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  {/* Candidate Header & Score */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-900 text-base">{cand.name}</h4>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            cand.rankGrade === 'TOP_MATCH'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                          }`}
                        >
                          {cand.rankGrade?.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">{cand.headline} &bull; {cand.email}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 block">Overall Match</span>
                        <span className="text-xl font-black text-indigo-600">{cand.matchScore}%</span>
                      </div>

                      <button
                        onClick={() => alert(`Shortlisted ${cand.name} for ${jobTitle}!`)}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold inline-flex items-center gap-1.5 transition shadow-sm"
                      >
                        <UserCheck className="w-4 h-4" /> Shortlist Candidate
                      </button>
                    </div>
                  </div>

                  {/* Badges Bar */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {cand.totalExperienceYears} Years Experience
                    </span>
                    <span>&bull;</span>
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" /> {cand.availabilityLabel}
                    </span>
                  </div>

                  {/* AI Recommendation Rationale Explanations */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                    <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Why This Candidate Was Recommended:
                    </span>
                    <ul className="space-y-1 text-slate-700 text-[11px]">
                      {cand.explanations?.map((exp, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{exp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition">
            Close Recommendations
          </button>
        </div>
      </div>
    </div>
  );
}

export default CandidateRecommendationModal;
