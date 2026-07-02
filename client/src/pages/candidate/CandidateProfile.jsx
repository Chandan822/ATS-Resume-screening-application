import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { candidateService } from '../../services/candidateService';
import {
  User,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Award,
  FileText,
  Plus,
  Trash2,
  MapPin,
  DollarSign,
  Clock,
  Globe,
  Github,
  Linkedin,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  X,
} from 'lucide-react';

export function CandidateProfile() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview'); // overview | education | experience | projects | skills | certificates | resumes

  // Modals state
  const [showEduModal, setShowEduModal] = useState(false);
  const [showExpModal, setShowExpModal] = useState(false);
  const [showProjModal, setShowProjModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);

  // Form states for modals
  const [eduForm, setEduForm] = useState({ institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', grade: '' });
  const [expForm, setExpForm] = useState({ companyName: '', jobTitle: '', location: '', startDate: '', endDate: '', description: '' });
  const [projForm, setProjForm] = useState({ title: '', description: '', projectUrl: '', githubUrl: '' });
  const [skillForm, setSkillForm] = useState({ skillName: '', yearsOfExperience: 2, proficiencyLevel: 'INTERMEDIATE' });
  const [certForm, setCertForm] = useState({ name: '', issuingOrganization: '', credentialId: '', credentialUrl: '' });

  // Basic Info Form state
  const [basicForm, setBasicForm] = useState({
    headline: '',
    summary: '',
    currentLocation: '',
    preferredLocation: '',
    expectedSalary: '',
    noticePeriod: '',
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
  });
  const [isEditingBasic, setIsEditingBasic] = useState(false);

  // Fetch Candidate Profile
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['candidateProfile'],
    queryFn: async () => {
      const res = await candidateService.getProfile();
      const c = res.data.candidate;
      setBasicForm({
        headline: c.headline || '',
        summary: c.summary || '',
        currentLocation: c.currentLocation || '',
        preferredLocation: c.preferredLocation || '',
        expectedSalary: c.expectedSalary || '',
        noticePeriod: c.noticePeriod || '',
        githubUrl: c.githubUrl || '',
        linkedinUrl: c.linkedinUrl || '',
        portfolioUrl: c.portfolioUrl || '',
      });
      return res.data;
    },
  });

  // Mutations
  const updateProfileMut = useMutation({
    mutationFn: (payload) => candidateService.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['candidateProfile']);
      setIsEditingBasic(false);
    },
  });

  const addEduMut = useMutation({
    mutationFn: (payload) => candidateService.addEducation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['candidateProfile']);
      setShowEduModal(false);
      setEduForm({ institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', grade: '' });
    },
  });

  const deleteEduMut = useMutation({
    mutationFn: (id) => candidateService.deleteEducation(id),
    onSuccess: () => queryClient.invalidateQueries(['candidateProfile']),
  });

  const addExpMut = useMutation({
    mutationFn: (payload) => candidateService.addExperience(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['candidateProfile']);
      setShowExpModal(false);
      setExpForm({ companyName: '', jobTitle: '', location: '', startDate: '', endDate: '', description: '' });
    },
  });

  const deleteExpMut = useMutation({
    mutationFn: (id) => candidateService.deleteExperience(id),
    onSuccess: () => queryClient.invalidateQueries(['candidateProfile']),
  });

  const addProjMut = useMutation({
    mutationFn: (payload) => candidateService.addProject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['candidateProfile']);
      setShowProjModal(false);
      setProjForm({ title: '', description: '', projectUrl: '', githubUrl: '' });
    },
  });

  const deleteProjMut = useMutation({
    mutationFn: (id) => candidateService.deleteProject(id),
    onSuccess: () => queryClient.invalidateQueries(['candidateProfile']),
  });

  const addSkillMut = useMutation({
    mutationFn: (payload) => candidateService.addSkill(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['candidateProfile']);
      setShowSkillModal(false);
      setSkillForm({ skillName: '', yearsOfExperience: 2, proficiencyLevel: 'INTERMEDIATE' });
    },
  });

  const deleteSkillMut = useMutation({
    mutationFn: (id) => candidateService.deleteSkill(id),
    onSuccess: () => queryClient.invalidateQueries(['candidateProfile']),
  });

  const addCertMut = useMutation({
    mutationFn: (payload) => candidateService.addCertificate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['candidateProfile']);
      setShowCertModal(false);
      setCertForm({ name: '', issuingOrganization: '', credentialId: '', credentialUrl: '' });
    },
  });

  const deleteCertMut = useMutation({
    mutationFn: (id) => candidateService.deleteCertificate(id),
    onSuccess: () => queryClient.invalidateQueries(['candidateProfile']),
  });

  const uploadResumeMut = useMutation({
    mutationFn: (file) => candidateService.uploadResume(file),
    onSuccess: () => queryClient.invalidateQueries(['candidateProfile']),
  });

  const deleteResumeMut = useMutation({
    mutationFn: (id) => candidateService.deleteResume(id),
    onSuccess: () => queryClient.invalidateQueries(['candidateProfile']),
  });

  const parseAiMut = useMutation({
    mutationFn: (resumeFileId) => candidateService.parseResumeAI(resumeFileId),
    onSuccess: () => queryClient.invalidateQueries(['candidateProfile']),
  });

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
        <span className="text-xs font-semibold">Loading Candidate Profile...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600" />
          <span>Failed to load profile. Please verify candidate authorization.</span>
        </div>
        <button onClick={() => refetch()} className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold">
          Retry
        </button>
      </div>
    );
  }

  const candidate = data.candidate;
  const completionScore = data.completionPercentage || 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Profile Summary Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-600/20 shrink-0">
              {candidate.user?.firstName ? candidate.user.firstName.charAt(0) : 'C'}
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900">
                {candidate.user?.firstName} {candidate.user?.lastName}
              </h2>
              <p className="text-xs font-semibold text-indigo-600 mt-0.5">
                {candidate.headline || 'Add professional headline (e.g. Senior Full Stack Engineer)'}
              </p>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                <span>{candidate.user?.email}</span>
                {candidate.currentLocation && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {candidate.currentLocation}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Completion Progress Bar */}
          <div className="w-full md:w-64 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Profile Completion
              </span>
              <span className="text-indigo-600">{completionScore}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${completionScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-4 overflow-x-auto text-xs font-bold scrollbar-none">
          {[
            { id: 'overview', label: 'Overview & Info', icon: User },
            { id: 'education', label: `Education (${candidate.educations?.length || 0})`, icon: GraduationCap },
            { id: 'experience', label: `Experience (${candidate.experiences?.length || 0})`, icon: Briefcase },
            { id: 'projects', label: `Projects (${candidate.projects?.length || 0})`, icon: FolderGit2 },
            { id: 'skills', label: `Skills (${candidate.candidateSkills?.length || 0})`, icon: Sparkles },
            { id: 'certificates', label: `Certificates (${candidate.certificates?.length || 0})`, icon: Award },
            { id: 'resumes', label: `Resumes (${candidate.resumeFiles?.length || 0})`, icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Panels */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-bold text-base text-slate-900">Personal & Professional Summary</h3>
              <button
                onClick={() => setIsEditingBasic(!isEditingBasic)}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition"
              >
                {isEditingBasic ? 'Cancel Edit' : 'Edit Summary'}
              </button>
            </div>

            {isEditingBasic ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateProfileMut.mutate({
                    ...basicForm,
                    expectedSalary: basicForm.expectedSalary ? parseFloat(basicForm.expectedSalary) : undefined,
                  });
                }}
                className="space-y-4 text-xs"
              >
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Headline</label>
                  <input
                    type="text"
                    value={basicForm.headline}
                    onChange={(e) => setBasicForm({ ...basicForm, headline: e.target.value })}
                    placeholder="e.g. Senior Full Stack Engineer (Node.js & React)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Professional Summary</label>
                  <textarea
                    rows={4}
                    value={basicForm.summary}
                    onChange={(e) => setBasicForm({ ...basicForm, summary: e.target.value })}
                    placeholder="Brief overview of your background, achievements, and career focus..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Current Location</label>
                    <input
                      type="text"
                      value={basicForm.currentLocation}
                      onChange={(e) => setBasicForm({ ...basicForm, currentLocation: e.target.value })}
                      placeholder="e.g. San Francisco, CA"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Preferred Location</label>
                    <input
                      type="text"
                      value={basicForm.preferredLocation}
                      onChange={(e) => setBasicForm({ ...basicForm, preferredLocation: e.target.value })}
                      placeholder="e.g. Remote / New York, NY"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Expected Salary (USD / yr)</label>
                    <input
                      type="number"
                      value={basicForm.expectedSalary}
                      onChange={(e) => setBasicForm({ ...basicForm, expectedSalary: e.target.value })}
                      placeholder="e.g. 140000"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Notice Period</label>
                    <input
                      type="text"
                      value={basicForm.noticePeriod}
                      onChange={(e) => setBasicForm({ ...basicForm, noticePeriod: e.target.value })}
                      placeholder="e.g. Immediate / 2 Weeks"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">GitHub URL</label>
                    <input
                      type="url"
                      value={basicForm.githubUrl}
                      onChange={(e) => setBasicForm({ ...basicForm, githubUrl: e.target.value })}
                      placeholder="https://github.com/username"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">LinkedIn URL</label>
                    <input
                      type="url"
                      value={basicForm.linkedinUrl}
                      onChange={(e) => setBasicForm({ ...basicForm, linkedinUrl: e.target.value })}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Portfolio URL</label>
                    <input
                      type="url"
                      value={basicForm.portfolioUrl}
                      onChange={(e) => setBasicForm({ ...basicForm, portfolioUrl: e.target.value })}
                      placeholder="https://yourportfolio.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={updateProfileMut.isPending}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-600/20 transition"
                >
                  {updateProfileMut.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            ) : (
              <div className="space-y-6 text-xs">
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">About Candidate</h4>
                  <p className="text-slate-600 leading-relaxed">
                    {candidate.summary || 'No summary added yet. Click Edit Summary to add your professional summary.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600" /> Current Location
                    </span>
                    <p className="font-bold text-slate-800">{candidate.currentLocation || 'Not set'}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-cyan-600" /> Preferred Location
                    </span>
                    <p className="font-bold text-slate-800">{candidate.preferredLocation || 'Not set'}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Expected Salary
                    </span>
                    <p className="font-bold text-slate-800">
                      {candidate.expectedSalary ? `$${candidate.expectedSalary.toLocaleString()}/yr` : 'Not set'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" /> Notice Period
                    </span>
                    <p className="font-bold text-slate-800">{candidate.noticePeriod || 'Not set'}</p>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex items-center gap-4 pt-2">
                  {candidate.githubUrl && (
                    <a
                      href={candidate.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition"
                    >
                      <Github className="w-4 h-4" /> GitHub
                    </a>
                  )}
                  {candidate.linkedinUrl && (
                    <a
                      href={candidate.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100 transition"
                    >
                      <Linkedin className="w-4 h-4 text-indigo-600" /> LinkedIn
                    </a>
                  )}
                  {candidate.portfolioUrl && (
                    <a
                      href={candidate.portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-50 text-cyan-700 font-semibold hover:bg-cyan-100 transition"
                    >
                      <Globe className="w-4 h-4 text-cyan-600" /> Portfolio
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EDUCATION */}
        {activeTab === 'education' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-bold text-base text-slate-900">Academic Background</h3>
              <button
                onClick={() => setShowEduModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add Education
              </button>
            </div>

            <div className="space-y-4">
              {candidate.educations?.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">No education records added yet.</p>
              ) : (
                candidate.educations?.map((edu) => (
                  <div key={edu.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 text-sm">{edu.degree}</h4>
                      <p className="text-slate-700 font-semibold">{edu.institution}</p>
                      {edu.fieldOfStudy && <p className="text-slate-500">{edu.fieldOfStudy}</p>}
                      <p className="text-[11px] text-slate-400">
                        {new Date(edu.startDate).getFullYear()} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteEduMut.mutate(edu.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: EXPERIENCE */}
        {activeTab === 'experience' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-bold text-base text-slate-900">Work History</h3>
              <button
                onClick={() => setShowExpModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add Experience
              </button>
            </div>

            <div className="space-y-4">
              {candidate.experiences?.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">No experience records added yet.</p>
              ) : (
                candidate.experiences?.map((exp) => (
                  <div key={exp.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 text-sm">{exp.jobTitle}</h4>
                      <p className="text-indigo-600 font-semibold">{exp.companyName}</p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(exp.startDate).toLocaleDateString()} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}
                      </p>
                      {exp.description && <p className="text-slate-600 mt-2 leading-relaxed">{exp.description}</p>}
                    </div>
                    <button
                      onClick={() => deleteExpMut.mutate(exp.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: PROJECTS */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-bold text-base text-slate-900">Portfolio Projects</h3>
              <button
                onClick={() => setShowProjModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add Project
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {candidate.projects?.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">No portfolio projects added yet.</p>
              ) : (
                candidate.projects?.map((proj) => (
                  <div key={proj.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between text-xs space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 text-sm">{proj.title}</h4>
                        <button
                          onClick={() => deleteProjMut.mutate(proj.id)}
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {proj.description && <p className="text-slate-600">{proj.description}</p>}
                    </div>

                    <div className="flex items-center gap-3 pt-2 border-t border-slate-200/60 text-[11px]">
                      {proj.projectUrl && (
                        <a href={proj.projectUrl} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline">
                          Live Demo
                        </a>
                      )}
                      {proj.githubUrl && (
                        <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-slate-700 font-bold hover:underline">
                          Source Code
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: SKILLS */}
        {activeTab === 'skills' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-bold text-base text-slate-900">Skills Taxonomy</h3>
              <button
                onClick={() => setShowSkillModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add Skill
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              {candidate.candidateSkills?.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">No skills added yet.</p>
              ) : (
                candidate.candidateSkills?.map((cs) => (
                  <div
                    key={cs.id}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold shadow-xs"
                  >
                    <span>{cs.skill.name}</span>
                    <span className="text-[10px] bg-indigo-200/60 px-1.5 py-0.5 rounded text-indigo-800 font-semibold">
                      {cs.proficiencyLevel} &bull; {cs.yearsOfExperience} yrs
                    </span>
                    <button
                      onClick={() => deleteSkillMut.mutate(cs.id)}
                      className="text-indigo-400 hover:text-rose-600 transition ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 6: CERTIFICATES */}
        {activeTab === 'certificates' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-bold text-base text-slate-900">Certifications & Credentials</h3>
              <button
                onClick={() => setShowCertModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add Certificate
              </button>
            </div>

            <div className="space-y-3">
              {candidate.certificates?.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">No certificates added yet.</p>
              ) : (
                candidate.certificates?.map((cert) => (
                  <div key={cert.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900">{cert.name}</h4>
                      <p className="text-slate-600 font-medium">{cert.issuingOrganization}</p>
                      {cert.credentialId && <p className="text-[11px] text-slate-400">ID: {cert.credentialId}</p>}
                    </div>
                    <button
                      onClick={() => deleteCertMut.mutate(cert.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 7: RESUMES */}
        {activeTab === 'resumes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-bold text-base text-slate-900">Uploaded Resume Files & Extracted Text Pipeline</h3>
            </div>

            {/* Dropzone Upload */}
            <label className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 transition cursor-pointer text-center space-y-2">
              <UploadCloud className="w-8 h-8 text-indigo-600" />
              <span className="text-xs font-bold text-indigo-900">
                {uploadResumeMut.isPending ? 'Processing & Extracting Text...' : 'Click to upload or drag & drop resume PDF / DOCX'}
              </span>
              <span className="text-[11px] text-slate-500">Supported Formats: .pdf, .docx (Max 10MB)</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                disabled={uploadResumeMut.isPending}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    uploadResumeMut.mutate(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
            </label>

            {/* Extracted Text Result Banner if uploaded */}
            {uploadResumeMut.data && (
              <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Text Extraction Successful
                  </span>
                  <span className="text-[11px] font-semibold text-indigo-700">
                    {uploadResumeMut.data.data?.wordCount || 0} Words &bull; {uploadResumeMut.data.data?.charCount || 0} Characters
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-indigo-100 max-h-48 overflow-y-auto text-[11px] text-slate-700 font-mono leading-relaxed whitespace-pre-wrap">
                  {uploadResumeMut.data.data?.extractedText || 'No text extracted.'}
                </div>
              </div>
            )}

            {/* Resumes List */}
            <div className="space-y-4">
              {candidate.resumeFiles?.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">No resume files uploaded yet.</p>
              ) : (
                candidate.resumeFiles?.map((resFile) => (
                  <div key={resFile.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-indigo-600 shrink-0" />
                        <div>
                          <h4 className="font-bold text-slate-900 flex items-center gap-2">
                            {resFile.fileName}
                            {resFile.isPrimary && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                                Primary
                              </span>
                            )}
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            {(resFile.fileSize / 1024).toFixed(1)} KB &bull; Uploaded {new Date(resFile.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => parseAiMut.mutate(resFile.id)}
                          disabled={parseAiMut.isPending}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 transition shadow-sm disabled:opacity-50"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          {parseAiMut.isPending ? 'Parsing with AI...' : 'Parse with AI'}
                        </button>
                        <button
                          onClick={() => deleteResumeMut.mutate(resFile.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Render AI Parsed Result JSON if available */}
                    {parseAiMut.data?.data?.parsedData && (
                      <div className="p-4 rounded-xl bg-white border border-indigo-200 space-y-3">
                        <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                          <span className="font-extrabold text-indigo-950 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-indigo-600" /> AI Parsed Resume JSON Output
                          </span>
                          <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                            Gemini / Structured Engine
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                          <div>
                            <span className="text-slate-400 block font-medium">Extracted Name</span>
                            <span className="font-bold text-slate-800">{parseAiMut.data.data.parsedData.name || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-medium">Extracted Email</span>
                            <span className="font-bold text-slate-800">{parseAiMut.data.data.parsedData.email || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-medium">Extracted Phone</span>
                            <span className="font-bold text-slate-800">{parseAiMut.data.data.parsedData.phone || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-medium">Location</span>
                            <span className="font-bold text-slate-800">{parseAiMut.data.data.parsedData.location || 'N/A'}</span>
                          </div>
                        </div>

                        {parseAiMut.data.data.parsedData.skills?.length > 0 && (
                          <div>
                            <span className="text-slate-500 font-bold block mb-1">Extracted Skills Taxonomy</span>
                            <div className="flex flex-wrap gap-1.5">
                              {parseAiMut.data.data.parsedData.skills.map((s, idx) => (
                                <span key={idx} className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold text-[10px]">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: ADD EDUCATION */}
      {showEduModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 max-w-md w-full space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-bold text-sm text-slate-900">Add Education</h4>
              <button onClick={() => setShowEduModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700">Degree</label>
                <input
                  type="text"
                  placeholder="e.g. B.S. Computer Science"
                  value={eduForm.degree}
                  onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl p-2 mt-1"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Institution</label>
                <input
                  type="text"
                  placeholder="e.g. Stanford University"
                  value={eduForm.institution}
                  onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl p-2 mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700">Start Date</label>
                  <input
                    type="date"
                    value={eduForm.startDate}
                    onChange={(e) => setEduForm({ ...eduForm, startDate: e.target.value })}
                    className="w-full bg-slate-50 border rounded-xl p-2 mt-1"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">End Date</label>
                  <input
                    type="date"
                    value={eduForm.endDate}
                    onChange={(e) => setEduForm({ ...eduForm, endDate: e.target.value })}
                    className="w-full bg-slate-50 border rounded-xl p-2 mt-1"
                  />
                </div>
              </div>
              <button
                onClick={() => addEduMut.mutate(eduForm)}
                disabled={!eduForm.degree || !eduForm.institution || !eduForm.startDate}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold disabled:opacity-50"
              >
                Save Education
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD EXPERIENCE */}
      {showExpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 max-w-md w-full space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-bold text-sm text-slate-900">Add Work Experience</h4>
              <button onClick={() => setShowExpModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700">Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Software Engineer"
                  value={expForm.jobTitle}
                  onChange={(e) => setExpForm({ ...expForm, jobTitle: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl p-2 mt-1"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Google"
                  value={expForm.companyName}
                  onChange={(e) => setExpForm({ ...expForm, companyName: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl p-2 mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700">Start Date</label>
                  <input
                    type="date"
                    value={expForm.startDate}
                    onChange={(e) => setExpForm({ ...expForm, startDate: e.target.value })}
                    className="w-full bg-slate-50 border rounded-xl p-2 mt-1"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">End Date</label>
                  <input
                    type="date"
                    value={expForm.endDate}
                    onChange={(e) => setExpForm({ ...expForm, endDate: e.target.value })}
                    className="w-full bg-slate-50 border rounded-xl p-2 mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700">Description</label>
                <textarea
                  rows={3}
                  placeholder="Key responsibilities and technical impact..."
                  value={expForm.description}
                  onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl p-2 mt-1"
                />
              </div>
              <button
                onClick={() => addExpMut.mutate(expForm)}
                disabled={!expForm.jobTitle || !expForm.companyName || !expForm.startDate}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold disabled:opacity-50"
              >
                Save Experience
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD SKILL */}
      {showSkillModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 max-w-md w-full space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-bold text-sm text-slate-900">Add Skill</h4>
              <button onClick={() => setShowSkillModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700">Skill Name</label>
                <input
                  type="text"
                  placeholder="e.g. React, Node.js, Python"
                  value={skillForm.skillName}
                  onChange={(e) => setSkillForm({ ...skillForm, skillName: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl p-2 mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700">Years Experience</label>
                  <input
                    type="number"
                    value={skillForm.yearsOfExperience}
                    onChange={(e) => setSkillForm({ ...skillForm, yearsOfExperience: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border rounded-xl p-2 mt-1"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Proficiency</label>
                  <select
                    value={skillForm.proficiencyLevel}
                    onChange={(e) => setSkillForm({ ...skillForm, proficiencyLevel: e.target.value })}
                    className="w-full bg-slate-50 border rounded-xl p-2 mt-1"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                    <option value="EXPERT">Expert</option>
                  </select>
                </div>
              </div>
              <button
                onClick={() => addSkillMut.mutate(skillForm)}
                disabled={!skillForm.skillName}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold disabled:opacity-50"
              >
                Add Skill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD PROJECT */}
      {showProjModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 max-w-md w-full space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-bold text-sm text-slate-900">Add Portfolio Project</h4>
              <button onClick={() => setShowProjModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700">Project Title</label>
                <input
                  type="text"
                  placeholder="e.g. AI Resume Screening Platform"
                  value={projForm.title}
                  onChange={(e) => setProjForm({ ...projForm, title: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl p-2 mt-1"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief project details and tech stack..."
                  value={projForm.description}
                  onChange={(e) => setProjForm({ ...projForm, description: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl p-2 mt-1"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Project Demo URL</label>
                <input
                  type="url"
                  placeholder="https://myproject.com"
                  value={projForm.projectUrl}
                  onChange={(e) => setProjForm({ ...projForm, projectUrl: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl p-2 mt-1"
                />
              </div>
              <button
                onClick={() => addProjMut.mutate(projForm)}
                disabled={!projForm.title}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold disabled:opacity-50"
              >
                Save Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD CERTIFICATE */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 max-w-md w-full space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-bold text-sm text-slate-900">Add Certificate</h4>
              <button onClick={() => setShowCertModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700">Certificate Name</label>
                <input
                  type="text"
                  placeholder="e.g. AWS Certified Solutions Architect"
                  value={certForm.name}
                  onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl p-2 mt-1"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Issuing Organization</label>
                <input
                  type="text"
                  placeholder="e.g. Amazon Web Services"
                  value={certForm.issuingOrganization}
                  onChange={(e) => setCertForm({ ...certForm, issuingOrganization: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl p-2 mt-1"
                />
              </div>
              <button
                onClick={() => addCertMut.mutate(certForm)}
                disabled={!certForm.name || !certForm.issuingOrganization}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold disabled:opacity-50"
              >
                Save Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CandidateProfile;
