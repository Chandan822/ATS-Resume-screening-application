import { useQuery } from '@tanstack/react-query';
import { recruiterService } from '../../services/recruiterService';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Calendar,
  Award,
  TrendingUp,
  Clock,
  ArrowRight,
  Sparkles,
  Building2,
  Plus,
  RefreshCw,
} from 'lucide-react';

export function RecruiterDashboard() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['recruiterStats'],
    queryFn: async () => {
      const res = await recruiterService.getDashboardStats();
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
        <span className="text-xs font-semibold">Loading Recruiter Overview...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between">
        <span>Failed to load dashboard metrics. Please verify recruiter access.</span>
        <button onClick={() => refetch()} className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold">
          Retry
        </button>
      </div>
    );
  }

  const { widgets, stageBreakdown, recentActivity, company } = data;

  const statCards = [
    {
      title: 'Open Jobs',
      value: widgets?.openJobs || 0,
      badge: '+2 this week',
      icon: Briefcase,
      color: 'bg-indigo-50 border-indigo-200 text-indigo-600',
      valueColor: 'text-indigo-950',
    },
    {
      title: 'Total Applications',
      value: widgets?.totalApplications || 0,
      badge: '+18% vs last month',
      icon: Users,
      color: 'bg-cyan-50 border-cyan-200 text-cyan-600',
      valueColor: 'text-cyan-950',
    },
    {
      title: 'Interviews Scheduled',
      value: widgets?.interviewsScheduled || 0,
      badge: '6 today',
      icon: Calendar,
      color: 'bg-amber-50 border-amber-200 text-amber-600',
      valueColor: 'text-amber-950',
    },
    {
      title: 'Offers Extended',
      value: widgets?.offersExtended || 0,
      badge: '75% acceptance',
      icon: Award,
      color: 'bg-emerald-50 border-emerald-200 text-emerald-600',
      valueColor: 'text-emerald-950',
    },
  ];

  const totalFunnel = (stageBreakdown?.applied || 0) + (stageBreakdown?.screening || 0) + (stageBreakdown?.interview || 0) + (stageBreakdown?.offered || 0) + (stageBreakdown?.hired || 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
            <Building2 className="w-3.5 h-3.5" /> {company?.name || 'TechCorp Global'}
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Recruiter Command Center</h2>
          <p className="text-xs text-slate-500">Overview of active job openings, candidate pipelines, and scheduling.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/jobs"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-2 transition shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" /> Post New Job
          </Link>
          <Link
            to="/dashboard/candidates"
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold inline-flex items-center gap-2 transition"
          >
            <Users className="w-4 h-4" /> View Candidates
          </Link>
        </div>
      </div>

      {/* 4 Core Stat Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {card.badge}
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.title}</span>
                <p className={`text-3xl font-black ${card.valueColor} tracking-tight mt-0.5`}>{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Hiring Funnel & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Hiring Pipeline Progress Bars */}
        <div className="lg:col-span-2 p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" /> Active Candidate Hiring Funnel
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Distribution of candidate applications across current pipeline stages.</p>
            </div>
            <Link to="/dashboard/analytics" className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1">
              Analytics <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4 text-xs">
            {[
              { stage: 'Applied / New', count: stageBreakdown?.applied || 0, color: 'bg-indigo-600' },
              { stage: 'Initial Screening', count: stageBreakdown?.screening || 0, color: 'bg-cyan-600' },
              { stage: 'Interview Phase', count: stageBreakdown?.interview || 0, color: 'bg-amber-500' },
              { stage: 'Offer Extended', count: stageBreakdown?.offered || 0, color: 'bg-emerald-600' },
              { stage: 'Hired', count: stageBreakdown?.hired || 0, color: 'bg-purple-600' },
            ].map((item, idx) => {
              const pct = totalFunnel > 0 ? Math.round((item.count / totalFunnel) * 100) : 0;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-700">{item.stage}</span>
                    <span className="text-slate-900">
                      {item.count} Candidates <span className="text-[11px] text-slate-400 font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${item.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Recent Activity Audit Feed */}
        <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" /> Recent Hiring Activity
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Real-time recruitment updates.</p>
          </div>

          <div className="space-y-4">
            {recentActivity?.map((act) => (
              <div key={act.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    {act.action?.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{act.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecruiterDashboard;
