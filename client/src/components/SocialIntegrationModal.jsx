import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { candidateService } from '../services/candidateService';
import {
  Github,
  Linkedin,
  ShieldCheck,
  CheckCircle2,
  Star,
  GitFork,
  Code,
  Briefcase,
  GraduationCap,
  RefreshCw,
  X,
  ArrowRight,
} from 'lucide-react';

export function SocialIntegrationModal({ onClose }) {
  const queryClient = useQueryClient();

  const [hasPermission, setHasPermission] = useState(false);
  const [githubUsername, setGithubUsername] = useState('chandan-r');
  const [linkedinUrl, setLinkedinUrl] = useState('chandan-r');

  const [githubData, setGithubData] = useState(null);
  const [linkedinData, setLinkedinData] = useState(null);

  // Fetch GitHub Mutation
  const fetchGithubMut = useMutation({
    mutationFn: () => candidateService.fetchGitHubIntegration(githubUsername, hasPermission),
    onSuccess: (res) => {
      if (res.data) setGithubData(res.data);
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to fetch GitHub profile data.');
    },
  });

  // Fetch LinkedIn Mutation
  const fetchLinkedinMut = useMutation({
    mutationFn: () => candidateService.fetchLinkedInIntegration(linkedinUrl, hasPermission),
    onSuccess: (res) => {
      if (res.data) setLinkedinData(res.data);
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to fetch LinkedIn profile data.');
    },
  });

  // Sync / Merge Mutation
  const mergeMut = useMutation({
    mutationFn: () => candidateService.syncMergeSocialProfile(githubData, linkedinData),
    onSuccess: () => {
      alert('GitHub & LinkedIn data merged into candidate profile database successfully!');
      queryClient.invalidateQueries(['candidateProfile']);
      onClose();
    },
  });

  const handleFetchAll = () => {
    if (!hasPermission) {
      alert('You must check explicit permission consent before fetching social profiles.');
      return;
    }
    if (githubUsername) fetchGithubMut.mutate();
    if (linkedinUrl) fetchLinkedinMut.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 md:p-8 max-w-4xl w-full space-y-6 text-xs text-slate-900 my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Explicit Permission Required
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Connect GitHub & LinkedIn Profiles
            </h3>
            <p className="text-xs text-slate-500">
              Fetch public repositories, languages, stars, contributions, README summaries, and LinkedIn credentials.
            </p>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Explicit Consent Checkbox */}
        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasPermission}
              onChange={(e) => setHasPermission(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="font-bold text-indigo-950 text-xs leading-snug">
              I explicitly grant permission to AI ATS to fetch, analyze, and merge my public GitHub repositories and LinkedIn profile data into my profile.
            </span>
          </label>
        </div>

        {/* Inputs Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-bold text-slate-700 flex items-center gap-1.5 mb-1">
              <Github className="w-4 h-4 text-slate-900" /> GitHub Username
            </label>
            <input
              type="text"
              placeholder="e.g. torvalds or username"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 flex items-center gap-1.5 mb-1">
              <Linkedin className="w-4 h-4 text-sky-600" /> LinkedIn Handle / Profile URL
            </label>
            <input
              type="text"
              placeholder="e.g. linkedin.com/in/username"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleFetchAll}
            disabled={!hasPermission || fetchGithubMut.isPending || fetchLinkedinMut.isPending}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 transition shadow-md shadow-indigo-600/20 disabled:opacity-40"
          >
            {fetchGithubMut.isPending || fetchLinkedinMut.isPending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Fetching Social Data...
              </>
            ) : (
              <>
                Fetch Profile Data <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Extracted Data Preview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-slate-100">
          {/* GITHUB PREVIEW CARD */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Github className="w-4 h-4 text-slate-900" /> GitHub Data Preview
            </h4>

            {!githubData ? (
              <p className="text-slate-400 py-6 text-center">Click "Fetch Profile Data" to load GitHub details.</p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img src={githubData.avatarUrl} alt="GH Avatar" className="w-10 h-10 rounded-full border" />
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">{githubData.name}</span>
                    <span className="text-slate-500 text-[11px]">@{githubData.username}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-white border border-slate-200 text-center text-[11px]">
                  <div>
                    <span className="text-slate-400 font-medium block">Repos</span>
                    <span className="font-bold text-slate-900">{githubData.publicReposCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Total Stars</span>
                    <span className="font-bold text-amber-600 flex items-center justify-center gap-0.5">
                      <Star className="w-3 h-3 text-amber-500" /> {githubData.totalStars}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Commits</span>
                    <span className="font-bold text-indigo-600">{githubData.contributionStats?.totalCommitsEstimate}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-slate-700 block text-[11px]">Top Languages</span>
                  <div className="flex flex-wrap gap-1">
                    {githubData.topLanguages?.map((l) => (
                      <span key={l.language} className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                        {l.language} ({l.count})
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="font-bold text-slate-700 block text-[11px]">Pinned Repositories & README Summaries</span>
                  {githubData.pinnedRepositories?.slice(0, 2).map((repo) => (
                    <div key={repo.id} className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                      <span className="font-bold text-indigo-600 block">{repo.name} ★ {repo.stars}</span>
                      <p className="text-slate-600 text-[10px]">{repo.readmeSummary}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* LINKEDIN PREVIEW CARD */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Linkedin className="w-4 h-4 text-sky-600" /> LinkedIn Data Preview
            </h4>

            {!linkedinData ? (
              <p className="text-slate-400 py-6 text-center">Click "Fetch Profile Data" to load LinkedIn details.</p>
            ) : (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block">Extracted Headline</span>
                  <p className="text-slate-600 text-[11px]">{linkedinData.headline}</p>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-slate-700 block text-[11px]">Work Experience</span>
                  {linkedinData.experiences?.map((exp, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-0.5">
                      <span className="font-bold text-slate-900 block">{exp.title} &bull; {exp.company}</span>
                      <p className="text-slate-500 text-[10px]">{exp.description}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-slate-700 block text-[11px]">Extracted Skills Taxonomy</span>
                  <div className="flex flex-wrap gap-1">
                    {linkedinData.skills?.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[10px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition">
            Cancel
          </button>

          <button
            onClick={() => mergeMut.mutate()}
            disabled={(!githubData && !linkedinData) || mergeMut.isPending}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold inline-flex items-center gap-2 transition shadow-md shadow-emerald-600/20 disabled:opacity-40"
          >
            <CheckCircle2 className="w-4 h-4" /> {mergeMut.isPending ? 'Merging Profile...' : 'Merge Data into Candidate Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SocialIntegrationModal;
