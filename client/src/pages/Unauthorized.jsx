import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export function Unauthorized() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden text-center">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full space-y-6 relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Access Restricted</h1>
          <p className="text-slate-400 text-sm">You do not have the necessary permissions or role to access this resource.</p>
        </div>

        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Unauthorized;
