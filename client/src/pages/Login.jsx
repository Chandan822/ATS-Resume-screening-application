import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Lock, Mail, Eye, EyeOff, Sparkles, AlertCircle, ArrowRight, UserCheck, Briefcase, Shield } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState('CANDIDATE'); // CANDIDATE | RECRUITER | ADMIN
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setApiError('');
    setIsSubmitting(true);
    try {
      await login(data);
      navigate('/');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> AI ATS Portal
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Sign in to your account</h1>
          <p className="text-slate-400 text-sm">Access candidate portal or recruiter hiring workspace</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-900/80 rounded-xl border border-slate-800 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setSelectedRole('CANDIDATE')}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition ${
              selectedRole === 'CANDIDATE'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" /> Candidate
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('RECRUITER')}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition ${
              selectedRole === 'RECRUITER'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" /> Recruiter
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('ADMIN')}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition ${
              selectedRole === 'ADMIN'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> Admin
          </button>
        </div>

        {/* Form Container */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl space-y-5">
          {apiError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  placeholder={
                    selectedRole === 'CANDIDATE'
                      ? 'candidate@example.com'
                      : selectedRole === 'RECRUITER'
                      ? 'recruiter@company.com'
                      : 'admin@aiats.com'
                  }
                  {...register('email')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
              {errors.email && <p className="text-[11px] text-rose-400">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-slate-300">Password</label>
                <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-[11px] text-rose-400">{errors.password.message}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-lg shadow-indigo-600/20"
            >
              {isSubmitting ? 'Authenticating...' : `Sign In as ${selectedRole.toLowerCase()}`}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-400">
          Don&apos;t have an account yet?{' '}
          <Link to="/register" className="text-indigo-400 font-semibold hover:text-indigo-300">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
