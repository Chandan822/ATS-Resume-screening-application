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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 selection:bg-indigo-600 selection:text-white relative overflow-hidden">
      {/* Soft Background Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl w-full space-y-8 relative z-10">
        {/* Top Branding Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold tracking-wide uppercase shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Phase Verification
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            AI Applicant Tracking System
          </h1>
          <p className="text-slate-600 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Enterprise infrastructure operational. React, Express, Neon PostgreSQL, Prisma ORM & Light Design System verified.
          </p>
        </div>

        {/* System Diagnostics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* React Frontend Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition duration-200">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">React + Vite</h3>
                <p className="text-xs text-slate-500 mt-1">Frontend Client & State Management</p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Status</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Operational
              </span>
            </div>
          </div>

          {/* Express Backend Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition duration-200">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Express.js</h3>
                <p className="text-xs text-slate-500 mt-1">REST API Gateway</p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Status</span>
              {isLoading ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold animate-pulse">
                  Checking...
                </span>
              ) : isError ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Offline
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {data?.server || 'Connected'}
                </span>
              )}
            </div>
          </div>

          {/* Prisma Database Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition duration-200">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-600">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Neon PostgreSQL</h3>
                <p className="text-xs text-slate-500 mt-1">pgvector Vector Engine</p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Status</span>
              {isLoading ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold animate-pulse">
                  Checking...
                </span>
              ) : isError ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Disconnected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {data?.database || 'Connected'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stack Highlights */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <h4 className="text-sm font-bold text-slate-900">Active System Modules</h4>
            </div>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-semibold disabled:opacity-50 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              Re-verify status
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-700 font-medium">React Router</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-700 font-medium">React Query</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-700 font-medium">React Hook Form</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-700 font-medium">Zod Validation</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-700 font-medium">Tailwind CSS</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-700 font-medium">Helmet & CORS</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-700 font-medium">Morgan Logger</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-700 font-medium">Multer Uploads</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Code2 className="w-4 h-4 text-slate-400" />
          <span>AI ATS Architecture Initialized &bull; High-Contrast Light Theme</span>
        </div>
      </div>
    </div>
  );
}

export default App;
