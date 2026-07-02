import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Bot,
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Calendar,
  BarChart3,
  Settings,
  Bell,
  Search,
  ChevronRight,
  LogOut,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Sample Navigation Items (Role Adaptive)
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Job Openings', path: '/dashboard/jobs', icon: Briefcase },
    { name: 'Candidates', path: '/dashboard/candidates', icon: Users },
    { name: 'Applications', path: '/dashboard/applications', icon: FileText },
    { name: 'Interviews', path: '/dashboard/interviews', icon: Calendar },
    { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  // Dynamic Breadcrumb computation
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const url = `/${pathSegments.slice(0, index + 1).join('/')}`;
    return {
      name: segment.charAt(0).toUpperCase() + segment.slice(1),
      url,
    };
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Subtle Glow */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* Sidebar Overlay for Mobile */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Component */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-slate-900/90 border-r border-slate-800/80 backdrop-blur-xl flex flex-col justify-between transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Sidebar Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-800/80">
          <Link to="/" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-extrabold text-base bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent tracking-tight whitespace-nowrap">
                AI ATS<span className="text-indigo-400 font-normal text-xs ml-1">Pro</span>
              </span>
            )}
          </Link>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition"
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`} />
                {!sidebarCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* Sidebar User Role Badge */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 font-bold text-xs uppercase">
                {user?.role ? user.role.charAt(0) : 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-200 truncate">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'System User'}
                </p>
                <p className="text-[10px] text-indigo-400 font-medium uppercase tracking-wider">
                  {user?.role || 'User'} Mode
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-slate-900/80 border-b border-slate-800/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 z-30">
          {/* Left: Mobile Toggle & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/50"
            >
              <PanelLeftOpen className="w-5 h-5" />
            </button>

            {/* Breadcrumb Indicator */}
            <nav className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
              <Link to="/" className="hover:text-slate-200 transition">
                Home
              </Link>
              {breadcrumbs.length > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
              {breadcrumbs.map((crumb, idx) => (
                <div key={crumb.url} className="flex items-center gap-1.5">
                  {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
                  <span className={idx === breadcrumbs.length - 1 ? 'font-semibold text-slate-200' : 'hover:text-slate-200'}>
                    {crumb.name}
                  </span>
                </div>
              ))}
            </nav>
          </div>

          {/* Center: Quick Search Bar Preview */}
          <div className="hidden md:flex items-center max-w-sm w-full">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search candidates, jobs, resumes..."
                className="w-full bg-slate-950 border border-slate-800/80 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Right: Notifications & User Avatar Dropdown */}
          <div className="flex items-center gap-3">
            {/* Notifications Popover Toggle */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setUserDropdownOpen(false);
                }}
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-xl transition relative"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-slate-900" />
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 space-y-3 z-50 backdrop-blur-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Notifications
                    </h4>
                    <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                      2 Unread
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1">
                      <div className="flex items-center justify-between text-slate-300 font-medium">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Resume Parsed
                        </span>
                        <span className="text-[10px] text-slate-500">2m ago</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Candidate Alex Rivers completed profile parsing.</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1">
                      <div className="flex items-center justify-between text-slate-300 font-medium">
                        <span>Interview Scheduled</span>
                        <span className="text-[10px] text-slate-500">1h ago</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Technical Round scheduled for tomorrow at 2:00 PM.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar & Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-800/50 transition"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-indigo-500/20">
                  {user?.firstName ? user.firstName.charAt(0) : 'U'}
                </div>
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 backdrop-blur-xl space-y-1 text-xs">
                  <div className="p-2.5 border-b border-slate-800 mb-1">
                    <p className="font-bold text-slate-200">
                      {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'User Account'}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email || 'user@example.com'}</p>
                  </div>

                  <Link
                    to="/dashboard/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition font-medium"
                  >
                    <User className="w-3.5 h-3.5 text-indigo-400" /> Profile Settings
                  </Link>

                  <div className="flex items-center gap-2 px-3 py-2 text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Role: {user?.role || 'CANDIDATE'}
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition font-medium border-t border-slate-800/80 mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Dynamic Page Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
