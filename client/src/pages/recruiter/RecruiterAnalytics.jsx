import { BarChart3, TrendingUp, Users, Clock, CheckCircle2 } from 'lucide-react';

export function RecruiterAnalytics() {
  const departmentStats = [
    { department: 'Engineering', activeJobs: 6, applicants: 98, hired: 5, fillRate: 88 },
    { department: 'Infrastructure', activeJobs: 3, applicants: 28, hired: 2, fillRate: 75 },
    { department: 'Product Design', activeJobs: 2, applicants: 34, hired: 3, fillRate: 92 },
    { department: 'Marketing', activeJobs: 1, applicants: 12, hired: 1, fillRate: 100 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-600" /> Recruitment Analytics & Velocity Metrics
        </h2>
        <p className="text-xs text-slate-500 mt-1">Track applicant conversion rates, department velocity, and time-to-hire.</p>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-indigo-600" /> Avg Time to Hire
          </span>
          <p className="text-3xl font-black text-indigo-950 tracking-tight">18 Days</p>
          <span className="text-[11px] font-semibold text-emerald-600">-4 days vs industry average</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-cyan-600" /> Offer Acceptance Rate
          </span>
          <p className="text-3xl font-black text-cyan-950 tracking-tight">84.5%</p>
          <span className="text-[11px] font-semibold text-emerald-600">+6% vs last quarter</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-600" /> Total Hires YTD
          </span>
          <p className="text-3xl font-black text-emerald-950 tracking-tight">32</p>
          <span className="text-[11px] font-semibold text-slate-500">100% on target</span>
        </div>
      </div>

      {/* Department Breakdown Table / Bar Visualizer */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Department Recruitment Performance
        </h3>

        <div className="space-y-4 text-xs">
          {departmentStats.map((dept, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-900 text-sm">{dept.department}</span>
                <span className="text-indigo-600">
                  {dept.applicants} Applicants &bull; {dept.hired} Hired ({dept.fillRate}% Capacity)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full rounded-full bg-indigo-600 transition-all duration-700" style={{ width: `${dept.fillRate}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RecruiterAnalytics;
