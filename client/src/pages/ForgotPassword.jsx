import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import { Mail, ArrowLeft, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export function ForgotPassword() {
  const [apiError, setApiError] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    setApiError('');
    setSuccessData(null);
    setIsSubmitting(true);

    try {
      const response = await authService.forgotPassword(data.email);
      setSuccessData(response);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to process password reset request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Reset Your Password</h1>
          <p className="text-slate-400 text-xs">Enter your registered email to receive a password reset token</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl space-y-5">
          {apiError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          {successData ? (
            <div className="space-y-4 text-center">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-start gap-2.5 text-left">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{successData.message}</p>
                  {successData.data?.resetToken && (
                    <p className="mt-1 text-[11px] text-slate-300 break-all">
                      Generated Simulation Reset Token: <br />
                      <code className="text-indigo-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {successData.data.resetToken}
                      </code>
                    </p>
                  )}
                </div>
              </div>

              <Link
                to={`/reset-password${successData.data?.resetToken ? `?token=${successData.data.resetToken}` : ''}`}
                className="inline-flex items-center justify-center w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-lg shadow-indigo-600/20"
              >
                Proceed to Set New Password
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    placeholder="you@domain.com"
                    {...register('email')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                {errors.email && <p className="text-[11px] text-rose-400">{errors.email.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-lg shadow-indigo-600/20"
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}
        </div>

        <div className="text-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
