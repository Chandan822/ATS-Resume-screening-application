import { useQuery } from '@tanstack/react-query';
import { recruiterService } from '../../services/recruiterService';
import { exportToCSV, exportToPDF } from '../../utils/exportUtils';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  PieChart as PieIcon,
  BarChart2,
  LineChart as LineIcon,
  Grid,
  Download,
  Printer,
  RefreshCw,
  Sparkles,
  Users,
} from 'lucide-react';

export function RecruiterAnalytics() {
  const { data: responseData, isLoading, isError, refetch } = useQuery({
    queryKey: ['recruiterAnalytics'],
    queryFn: async () => {
      const res = await recruiterService.getAnalyticsOverview();
      return res.data;
    },
  });

  const analytics = responseData || {
    overviewStats: {
      totalApplications: 0,
      openJobs: 0,
      timeToHireDays: 0,
      offerAcceptanceRate: 0,
      recruiterProductivityScore: 0,
    },
    hiringFunnel: [
      { stage: 'Applied', count: 0, conversionRate: 0 },
      { stage: 'Screening', count: 0, conversionRate: 0 },
      { stage: 'Interview', count: 0, conversionRate: 0 },
      { stage: 'Offered', count: 0, conversionRate: 0 },
      { stage: 'Hired', count: 0, conversionRate: 0 },
    ],
    sourceEffectiveness: [],
    skillDemand: [],
    monthlyHires: [],
    recruiterHeatmap: [],
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
        <span className="text-xs font-semibold">Loading Recruitment Analytics...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between">
        <span>Failed to load analytics dashboard.</span>
        <button onClick={() => refetch()} className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-xs text-slate-900">
      {/* Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Executive Intelligence & Reports
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Recruitment Analytics & Velocity</h2>
          <p className="text-xs text-slate-500">
            Real-time tracking of application volume, hiring funnel conversion, sourcing channels, and recruiter throughput.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportToCSV(analytics)}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>

          <button
            onClick={() => exportToPDF(analytics)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 transition shadow-md shadow-indigo-600/20"
          >
            <Printer className="w-4 h-4" /> Export PDF Report
          </button>
        </div>
      </div>

      {/* 4 Overview Metric Stat Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
          <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider block">Total Applications</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">{analytics.overviewStats.totalApplications}</span>
            <span className="text-emerald-600 font-extrabold text-xs flex items-center gap-0.5">+18% MoM</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
          <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider block">Average Time to Hire</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">{analytics.overviewStats.timeToHireDays} Days</span>
            <span className="text-emerald-600 font-extrabold text-xs flex items-center gap-0.5">-3 Days faster</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
          <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider block">Offer Acceptance Rate</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-emerald-600">{analytics.overviewStats.offerAcceptanceRate}%</span>
            <span className="text-indigo-600 font-extrabold text-xs">High Efficiency</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
          <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider block">Recruiter Velocity</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-indigo-600">{analytics.overviewStats.recruiterProductivityScore} / 100</span>
            <span className="text-slate-500 font-bold text-xs">Top Tier</span>
          </div>
        </div>
      </div>

      {/* 4 CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: BAR CHART (SKILL DEMAND DISTRIBUTION) */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-600" /> Skill Demand Distribution (Bar Chart)
            </h3>
            <span className="text-slate-400 text-[11px] font-medium">Top Requested Tech Stack</span>
          </div>

          <div className="space-y-3.5 pt-2">
            {analytics.skillDemand.map((sd) => (
              <div key={sd.skill} className="space-y-1">
                <div className="flex justify-between font-bold text-slate-700 text-xs">
                  <span>{sd.skill}</span>
                  <span className="text-indigo-600">{sd.count} Job Openings ({sd.percentage}%)</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: `${sd.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CHART 2: PIE / DONUT CHART (SOURCE EFFECTIVENESS) */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-indigo-600" /> Sourcing Channel Distribution (Pie / Donut)
            </h3>
            <span className="text-slate-400 text-[11px] font-medium">Channel Effectiveness</span>
          </div>

          <div className="space-y-4 pt-2">
            {/* Visual Donut / Segmented Bar */}
            <div className="h-6 rounded-2xl overflow-hidden flex shadow-xs border border-slate-200">
              {analytics.sourceEffectiveness.map((se) => (
                <div key={se.source} style={{ width: `${se.percentage}%`, backgroundColor: se.color }} title={`${se.source}: ${se.percentage}%`} />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {analytics.sourceEffectiveness.map((se) => (
                <div key={se.source} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: se.color }} />
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">{se.source}</span>
                    <span className="text-slate-500 text-[11px]">{se.count} Apps &bull; {se.hires} Hires ({se.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CHART 3: LINE CHART (MONTHLY HIRING & APPLICATION PROGRESSION) */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <LineIcon className="w-5 h-5 text-indigo-600" /> Monthly Hiring Volume & Trend (Line Chart)
            </h3>
            <span className="text-slate-400 text-[11px] font-medium">6-Month Trend</span>
          </div>

          <div className="pt-4 space-y-6">
            {/* Line Graph Simulated Bars */}
            <div className="h-40 flex items-end justify-between gap-3 border-b border-slate-200 pb-2 px-2">
              {analytics.monthlyHires.map((mh) => {
                const heightPct = Math.round((mh.applications / 150) * 100);
                return (
                  <div key={mh.month} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="opacity-0 group-hover:opacity-100 text-[10px] font-extrabold text-indigo-600 transition">
                      {mh.applications} Apps
                    </span>
                    <div
                      className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-xl transition-all duration-500 group-hover:from-emerald-600 group-hover:to-emerald-400"
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="font-extrabold text-slate-700 text-xs">{mh.month}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-6 text-xs font-bold text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-indigo-600" /> Applications Growth
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" /> Successful Hires
              </span>
            </div>
          </div>
        </div>

        {/* CHART 4: RECRUITER ACTIVITY HEATMAP */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Grid className="w-5 h-5 text-indigo-600" /> Recruiter Weekly Activity (Heatmap)
            </h3>
            <span className="text-slate-400 text-[11px] font-medium">Days vs Active Hours</span>
          </div>

          <div className="space-y-3 pt-2">
            {analytics.recruiterHeatmap.map((row) => (
              <div key={row.day} className="flex items-center gap-3">
                <span className="w-8 font-extrabold text-slate-700 text-xs">{row.day}</span>
                <div className="flex-1 grid grid-cols-6 gap-2">
                  {row.hours.map((val, hIdx) => {
                    const bgClass =
                      val >= 9
                        ? 'bg-indigo-600 text-white font-bold'
                        : val >= 7
                        ? 'bg-indigo-400 text-white'
                        : val >= 4
                        ? 'bg-indigo-200 text-indigo-900'
                        : 'bg-slate-100 text-slate-500';

                    return (
                      <div
                        key={hIdx}
                        className={`p-2.5 rounded-xl text-center text-xs transition hover:scale-105 ${bgClass}`}
                        title={`${row.day} Hour block ${hIdx + 9}AM: ${val} evaluations`}
                      >
                        {val}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="flex items-center justify-end gap-2 text-[10px] text-slate-400 font-bold pt-2">
              <span>Low Activity</span>
              <span className="w-3 h-3 bg-slate-100 rounded-md" />
              <span className="w-3 h-3 bg-indigo-200 rounded-md" />
              <span className="w-3 h-3 bg-indigo-400 rounded-md" />
              <span className="w-3 h-3 bg-indigo-600 rounded-md" />
              <span>High Activity</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecruiterAnalytics;
