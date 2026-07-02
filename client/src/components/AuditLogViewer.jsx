import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { recruiterService } from '../services/recruiterService';
import {
  ShieldCheck,
  Search,
  Filter,
  Calendar,
  User,
  Activity,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  X,
  Database,
  Terminal,
} from 'lucide-react';

export function AuditLogViewer() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedChanges, setSelectedChanges] = useState(null);

  const { data: responseData, isLoading, isError, refetch } = useQuery({
    queryKey: ['auditLogs', search, actionFilter, entityFilter, dateRange, page],
    queryFn: async () => {
      const res = await recruiterService.getAuditLogs({
        search,
        action: actionFilter,
        entity: entityFilter,
        dateRange,
        page,
        limit: 10,
      });
      return res;
    },
  });

  const logs = responseData?.data || [];
  const pagination = responseData?.pagination || { totalCount: 0, page: 1, totalPages: 1 };

  const getActionBadge = (action) => {
    switch (action) {
      case 'CREATE_JOB':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'DELETE_JOB':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'USER_LOGIN':
      case 'USER_LOGOUT':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'EXTEND_OFFER':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'REJECT_APPLICATION':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'UPDATE_APPLICATION_STATUS':
      case 'SCHEDULE_INTERVIEW':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    }
  };

  return (
    <div className="space-y-6 text-xs text-slate-900">
      {/* Header Bar */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-900 text-white mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Security Audit Log System
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">System Action & Compliance Logs</h2>
          <p className="text-xs text-slate-500">
            Immutable audit record of authentication, job requisition updates, applicant status transitions, and security actions.
          </p>
        </div>

        <button onClick={() => refetch()} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-2 transition">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Logs
        </button>
      </div>

      {/* Search & Multi-Criteria Filter Controls */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search actions, IP, or entity..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </div>

          {/* Action Filter */}
          <div>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-600"
            >
              <option value="">All Actions</option>
              <option value="USER_LOGIN">User Login</option>
              <option value="CREATE_JOB">Create Job</option>
              <option value="DELETE_JOB">Delete Job</option>
              <option value="UPDATE_APPLICATION_STATUS">Application Status</option>
              <option value="SCHEDULE_INTERVIEW">Schedule Interview</option>
              <option value="EXTEND_OFFER">Extend Offer</option>
              <option value="REJECT_APPLICATION">Reject Application</option>
              <option value="UPDATE_PROFILE">Update Profile</option>
              <option value="ADMIN_ACTION">Admin Action</option>
            </select>
          </div>

          {/* Entity Filter */}
          <div>
            <select
              value={entityFilter}
              onChange={(e) => {
                setEntityFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-600"
            >
              <option value="">All Entities</option>
              <option value="User">User</option>
              <option value="Job">Job</option>
              <option value="Application">Application</option>
              <option value="Candidate">Candidate</option>
              <option value="InterviewRound">InterviewRound</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-600"
            >
              <option value="all">All Time</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading && (
          <div className="py-12 text-center text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-2" />
            <span className="font-semibold">Querying Security Logs...</span>
          </div>
        )}

        {!isLoading && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Action Event</th>
                  <th className="py-3.5 px-4">Entity & ID</th>
                  <th className="py-3.5 px-4">Client IP</th>
                  <th className="py-3.5 px-4 text-right">Payload Changes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-bold">
                      No audit log events found matching criteria.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-medium">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">
                          {log.user ? `${log.user.firstName} ${log.user.lastName || ''}` : 'System / Guest'}
                        </div>
                        <div className="text-[10px] text-slate-400">{log.user?.email || 'N/A'}</div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getActionBadge(log.action)}`}>
                          {log.action}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-800">{log.entity}</span>
                        {log.entityId && <span className="text-slate-400 text-[11px] block font-mono">{log.entityId}</span>}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-600">
                        {log.ipAddress || '127.0.0.1'}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => setSelectedChanges(log)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold inline-flex items-center gap-1.5 transition"
                        >
                          <Eye className="w-3.5 h-3.5" /> Inspect JSON
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-slate-500 text-xs font-medium">
            Showing page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} Total Logs)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* INSPECT JSON MODAL DRAWER */}
      {selectedChanges && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 text-slate-100 shadow-2xl p-6 max-w-xl w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-extrabold text-sm flex items-center gap-2 text-indigo-400">
                <Terminal className="w-4 h-4" /> Audit Log Event Details: {selectedChanges.action}
              </span>
              <button onClick={() => setSelectedChanges(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                <div>User: <span className="text-white font-bold">{selectedChanges.user?.email || 'N/A'}</span></div>
                <div>IP: <span className="text-white font-mono">{selectedChanges.ipAddress}</span></div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-60">
                <pre>{JSON.stringify(selectedChanges.changes || { note: 'No payload state modification logged.' }, null, 2)}</pre>
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={() => setSelectedChanges(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700">
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuditLogViewer;
