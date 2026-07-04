import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { User, Briefcase, Building, Mail, Phone, Globe, Shield, Sparkles } from 'lucide-react';

export function RecruiterProfile() {
  const { user } = useAuth();

  // Since user details are fetched from useAuth() which pulls from localstorage / auth/me,
  // we display them in a polished, readable card layout.
  const company = user?.recruiter?.company || {};
  const recruiter = user?.recruiter || {};

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-xs text-slate-900">
      {/* Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Shield className="w-6 h-6 text-indigo-600" /> Recruiter Workspace Profile
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Review your verified recruiter designation, organization parameters, and system credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Card - User Profile */}
        <div className="md:col-span-1 p-6 bg-white border border-slate-200 rounded-3xl flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-3xl shadow-lg shadow-indigo-600/20">
            {user?.firstName ? user.firstName.charAt(0) : 'U'}
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">
              {user?.firstName} {user?.lastName}
            </h3>
            <p className="text-indigo-600 font-bold text-[10px] uppercase tracking-wider mt-0.5">
              {recruiter.designation || 'Hiring Recruiter'}
            </p>
          </div>
          <div className="w-full pt-4 border-t border-slate-100 text-left space-y-3">
            <div className="flex items-center gap-2 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{user?.email}</span>
            </div>
            {user?.phone && (
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{user.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Card - Company & Recruiter Profile Details */}
        <div className="md:col-span-2 p-6 bg-white border border-slate-200 rounded-3xl space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 pb-3 border-b border-slate-100">
              <Building className="w-4 h-4 text-indigo-600" /> Associated Hiring Organization
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="space-y-1">
                <span className="text-slate-400 font-medium">Company Name</span>
                <p className="font-bold text-slate-900 text-xs">{company.name || 'Not Configured'}</p>
              </div>
              {company.website && (
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium">Website</span>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <Globe className="w-3.5 h-3.5" /> Visit Site
                  </a>
                </div>
              )}
              {company.industry && (
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium">Industry Vertical</span>
                  <p className="font-bold text-slate-900 text-xs">{company.industry}</p>
                </div>
              )}
              {company.location && (
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium">HQ Location</span>
                  <p className="font-bold text-slate-900 text-xs">{company.location}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 pb-3 border-b border-slate-100">
              <Briefcase className="w-4 h-4 text-indigo-600" /> Workspace Credentials
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="space-y-1">
                <span className="text-slate-400 font-medium">Account Access Role</span>
                <p className="font-bold text-slate-900 text-xs uppercase tracking-wider">{user?.role}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-medium">Account Created</span>
                <p className="font-bold text-slate-900 text-xs">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecruiterProfile;
