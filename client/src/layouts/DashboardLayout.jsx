import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import NotificationCenter from '../components/NotificationCenter';
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
  Bookmark,
} from 'lucide-react';

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const candidateNavItems = [
    { name: 'Job Openings', path: '/dashboard/jobs', icon: Briefcase },
    { name: 'My Applications', path: '/dashboard/applications', icon: FileText },
    { name: 'Saved Jobs', path: '/dashboard/saved-jobs', icon: Bookmark },
    { name: 'My Profile', path: '/dashboard/profile', icon: User },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  const recruiterNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Job Openings', path: '/dashboard/jobs', icon: Briefcase },
    { name: 'Candidates', path: '/dashboard/candidates', icon: Users },
    { name: 'Applications', path: '/dashboard/applications', icon: FileText },
    { name: 'Interviews', path: '/dashboard/interviews', icon: Calendar },
    { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  const navItems = user?.role === 'CANDIDATE' ? candidateNavItems : recruiterNavItems;

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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex overflow-hidden font-sans selection:bg-indigo-600 selection:text-white">
      {/* Background Subtle Light Glow */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* Sidebar Overlay for Mobile */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Component */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-300 shadow-xs ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Sidebar Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-100">
          <Link to="/" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-extrabold text-base text-slate-900 tracking-tight whitespace-nowrap">
                AI ATS<span className="text-indigo-600 font-bold text-xs ml-1">Pro</span>
              </span>
            )}
          </Link>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                {!sidebarCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* Sidebar User Role Badge */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0 font-bold text-xs uppercase">
                {user?.role ? user.role.charAt(0) : 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'System User'}
                </p>
                <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">
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
        <header className="h-16 bg-white/90 border-b border-slate-200 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 z-30 shadow-xs">
          {/* Left: Mobile Toggle & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg bg-slate-100"
            >
              <PanelLeftOpen className="w-5 h-5" />
            </button>

            {/* Breadcrumb Indicator */}
            <nav className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Link to="/" className="hover:text-slate-900 transition">
                Home
              </Link>
              {breadcrumbs.length > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
              {breadcrumbs.map((crumb, idx) => (
                <div key={crumb.url} className="flex items-center gap-1.5">
                  {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
                  <span className={idx === breadcrumbs.length - 1 ? 'font-bold text-slate-900' : 'hover:text-slate-900'}>
                    {crumb.name}
                  </span>
                </div>
              ))}
            </nav>
          </div>

          {/* Center: Quick Search Bar Preview */}
          <div className="hidden md:flex items-center max-w-sm w-full">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search candidates, jobs, resumes..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Right: Notifications & User Avatar Dropdown */}
          <div className="flex items-center gap-3">
            {/* Real-time Socket.io Notification Center Widget */}
            <NotificationCenter />

            {/* User Avatar & Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-indigo-600/20">
                  {user?.firstName ? user.firstName.charAt(0) : 'U'}
                </div>
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-2xl p-2 z-50 space-y-1 text-xs">
                  <div className="p-2.5 border-b border-slate-100 mb-1">
                    <p className="font-bold text-slate-900">
                      {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'User Account'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email || 'user@example.com'}</p>
                  </div>

                  <Link
                    to="/dashboard/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 transition font-semibold"
                  >
                    <User className="w-3.5 h-3.5 text-indigo-600" /> Profile Settings
                  </Link>

                  <div className="flex items-center gap-2 px-3 py-2 text-slate-500 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Role: {user?.role || 'CANDIDATE'}
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition font-bold border-t border-slate-100 mt-1"
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
