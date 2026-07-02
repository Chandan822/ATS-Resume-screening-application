import { Building2, MapPin, Globe, Users, Briefcase, Award } from 'lucide-react';

export function RecruiterCompanies() {
  const companyInfo = {
    name: 'TechCorp Global',
    industry: 'Software & Cloud Engineering',
    location: 'San Francisco, CA (HQ)',
    website: 'https://techcorpglobal.com',
    employees: '250 - 500 Employees',
    description:
      'TechCorp Global is a leading enterprise cloud technology provider building next-generation microservice platforms and intelligent AI automation tools.',
    departments: ['Engineering', 'Infrastructure & DevOps', 'Product Design', 'Marketing & Growth', 'Operations'],
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Profile Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-600/20 shrink-0">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{companyInfo.name}</h2>
            <p className="text-xs font-semibold text-indigo-600">{companyInfo.industry}</p>
            <p className="text-xs text-slate-500 flex items-center gap-4 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {companyInfo.location}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" /> {companyInfo.employees}
              </span>
              <a href={companyInfo.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-600 font-bold hover:underline">
                <Globe className="w-3.5 h-3.5" /> Website
              </a>
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-4">{companyInfo.description}</p>
      </div>

      {/* Departments Grid */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-indigo-600" /> Active Hiring Departments
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-bold">
          {companyInfo.departments.map((dept, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-800">{dept}</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] border border-indigo-100 font-extrabold">
                Active
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RecruiterCompanies;
