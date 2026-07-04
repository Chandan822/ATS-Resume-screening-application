import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { recruiterService } from '../../services/recruiterService';
import { Users, Search, MapPin, Briefcase, Mail, Phone, Globe, Github, Linkedin, RefreshCw, Star, Code } from 'lucide-react';

export function RecruiterCandidates() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSkill, setFilterSkill] = useState('');

  const { data: candidatesData, isLoading, isError, refetch } = useQuery({
    queryKey: ['recruiterCandidates'],
    queryFn: async () => {
      const res = await recruiterService.getCandidates();
      return res.data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
        <span className="text-xs font-semibold">Loading Talent Pool...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between">
        <span>Failed to load talent pool candidates.</span>
        <button onClick={() => refetch()} className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold">
          Retry
        </button>
      </div>
    );
  }

  const candidates = candidatesData || [];

  // Filter candidates by name or email or skills
  const filteredCandidates = candidates.filter((cand) => {
    const fullName = `${cand.user?.firstName || ''} ${cand.user?.lastName || ''}`.toLowerCase();
    const email = (cand.user?.email || '').toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase());

    const skillsStr = (cand.candidateSkills || []).map((s) => s.skill?.name || '').join(' ').toLowerCase();
    const matchesSkill = !filterSkill || skillsStr.includes(filterSkill.toLowerCase());

    return matchesSearch && matchesSkill;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-xs text-slate-900">
      {/* Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" /> Talent Pool & Candidates
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Browse and search the entire directory of registered candidates, view profiles, skills, and portfolios.
          </p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold">
          Total Pool: {candidates.length} Profiles
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-slate-900 focus:outline-none focus:border-indigo-600 transition"
          />
        </div>
        <div className="relative">
          <Code className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by skill (e.g. React, Node...)"
            value={filterSkill}
            onChange={(e) => setFilterSkill(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-slate-900 focus:outline-none focus:border-indigo-600 transition"
          />
        </div>
      </div>

      {/* Talent Cards Grid */}
      {filteredCandidates.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200">
          <Users className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          <p className="font-bold text-slate-700">No candidates match your search</p>
          <p className="text-xs text-slate-400">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCandidates.map((cand) => (
            <div key={cand.id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-5 hover:border-indigo-200 transition">
              <div className="space-y-4">
                {/* Profile Header */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-indigo-600/10">
                    {cand.user?.firstName ? cand.user.firstName.charAt(0) : 'C'}
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="font-extrabold text-slate-900 text-sm leading-snug">
                      {cand.user?.firstName} {cand.user?.lastName}
                    </h3>
                    <p className="text-indigo-600 font-bold text-[10px] uppercase tracking-wider">
                      {cand.headline || 'Software Engineer'}
                    </p>
                    <div className="flex items-center gap-3 text-slate-400 text-[10px] pt-1">
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" /> {cand.currentLocation || 'Remote'}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Briefcase className="w-3 h-3" /> {cand.totalExperienceYears || 0} Yrs Exp
                      </span>
                    </div>
                  </div>
                </div>

                {/* About Summary */}
                {cand.summary && (
                  <p className="text-slate-600 leading-relaxed text-[11px] line-clamp-3">
                    {cand.summary}
                  </p>
                )}

                {/* Skills Section */}
                {(cand.candidateSkills || []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {cand.candidateSkills.slice(0, 8).map((cs) => (
                      <span
                        key={cs.id}
                        className="px-2 py-0.5 rounded-full bg-slate-50 text-slate-700 font-bold border border-slate-200/80 text-[9px]"
                      >
                        {cs.skill?.name}
                      </span>
                    ))}
                    {cand.candidateSkills.length > 8 && (
                      <span className="text-[9px] text-slate-400 font-bold pl-1 align-middle pt-0.5">
                        +{cand.candidateSkills.length - 8} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Links & Contact */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="space-y-0.5 text-[10px] text-slate-500">
                  <p className="flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {cand.user?.email}
                  </p>
                  {cand.user?.phone && (
                    <p className="flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {cand.user.phone}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {cand.githubUrl && (
                    <a
                      href={cand.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition"
                      title="GitHub Profile"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {cand.linkedinUrl && (
                    <a
                      href={cand.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 hover:bg-indigo-100 transition"
                      title="LinkedIn Profile"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {cand.portfolioUrl && (
                    <a
                      href={cand.portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition"
                      title="Portfolio Website"
                    >
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecruiterCandidates;
