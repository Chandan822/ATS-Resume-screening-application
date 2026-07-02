import { useQuery } from '@tanstack/react-query';
import { apiClient } from './services/api';
import { Database, Server, Cpu, CheckCircle2, AlertCircle, RefreshCw, Layers, Sparkles, Code2, ShieldCheck } from 'lucide-react';

const fetchHealth = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

export function App() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['healthCheck'],
    queryFn: fetchHealth,
    refetchInterval: 15000,
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl w-full space-y-8 relative z-10">
        {/* Top Branding Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" /> Phase 1 Initialized
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            AI Applicant Tracking System
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Enterprise-grade infrastructure initialized. Client, Server, Prisma ORM, and Tailwind setup verified.
          </p>
        </div>

        {/* System Diagnostics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* React Frontend Card */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col justify-between hover:border-slate-700 transition duration-200">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-100">React + Vite</h3>
                <p className="text-xs text-slate-400 mt-1">Frontend Client & State Management</p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-400">Status</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Running
              </span>
            </div>
          </div>

          {/* Express Backend Card */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col justify-between hover:border-slate-700 transition duration-200">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-100">Express.js</h3>
                <p className="text-xs text-slate-400 mt-1">REST API Server Gateway</p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-400">Status</span>
              {isLoading ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-medium animate-pulse">
                  Checking...
                </span>
              ) : isError ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> Offline
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {data?.server || 'Connected'}
                </span>
              )}
            </div>
          </div>

          {/* Prisma Database Card */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col justify-between hover:border-slate-700 transition duration-200">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-100">Prisma ORM</h3>
                <p className="text-xs text-slate-400 mt-1">PostgreSQL & pgvector Ready</p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-400">Status</span>
              {isLoading ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-medium animate-pulse">
                  Checking...
                </span>
              ) : isError ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> Disconnected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {data?.database || 'Connected'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tech Stack Modules Bar */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h4 className="text-sm font-semibold text-slate-200">Configured Stack Modules</h4>
            </div>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 disabled:opacity-50 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              Re-verify status
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between">
              <span className="text-slate-300">React Router</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between">
              <span className="text-slate-300">React Query</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between">
              <span className="text-slate-300">React Hook Form</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between">
              <span className="text-slate-300">Zod Validation</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between">
              <span className="text-slate-300">Tailwind CSS</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between">
              <span className="text-slate-300">Helmet & CORS</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between">
              <span className="text-slate-300">Morgan Logger</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between">
              <span className="text-slate-300">Multer Uploads</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Code2 className="w-4 h-4" />
          <span>AI ATS Architecture Initialized &bull; Ready for Phase 2 Authentication</span>
        </div>
      </div>
    </div>
  );
}

export default App;
