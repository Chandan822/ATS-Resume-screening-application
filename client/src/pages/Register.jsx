import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserCheck, Briefcase, Mail, Lock, User, Phone, Building, Sparkles, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email address required'),
  phone: z.string().optional(),
  password: z
    .string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^a-zA-Z0-9]/, 'Must contain a special character'),
  role: z.enum(['CANDIDATE', 'RECRUITER']),
  companyName: z.string().optional(),
  companyWebsite: z.string().optional(),
  designation: z.string().optional(),
}).refine(
  (data) => {
    if (data.role === 'RECRUITER' && !data.companyName) {
      return false;
    }
    return true;
  },
  {
    message: 'Company name is required for recruiter accounts',
    path: ['companyName'],
  }
);

export function Register() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [role, setRole] = useState('CANDIDATE');
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'CANDIDATE',
    },
  });

  const handleRoleSwitch = (newRole) => {
    setRole(newRole);
    setValue('role', newRole);
  };

  const onSubmit = async (data) => {
    setApiError('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      await registerUser(data);
      setSuccessMsg('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full space-y-6 relative z-10 my-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> AI ATS Registration
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Create your account</h1>
          <p className="text-slate-400 text-sm">Join as a candidate seeking opportunities or recruiter hiring talent</p>
        </div>

        {/* Role Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/80 rounded-xl border border-slate-800 backdrop-blur-md">
          <button
            type="button"
            onClick={() => handleRoleSwitch('CANDIDATE')}
            className={`flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition ${
              role === 'CANDIDATE'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <UserCheck className="w-4 h-4" /> Candidate Profile
          </button>
          <button
            type="button"
            onClick={() => handleRoleSwitch('RECRUITER')}
            className={`flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition ${
              role === 'RECRUITER'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Briefcase className="w-4 h-4" /> Recruiter Account
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

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* First & Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">First Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="John"
                    {...register('firstName')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                {errors.firstName && <p className="text-[11px] text-rose-400">{errors.firstName.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Last Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Doe"
                    {...register('lastName')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                {errors.lastName && <p className="text-[11px] text-rose-400">{errors.lastName.message}</p>}
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  placeholder="name@domain.com"
                  {...register('email')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
              {errors.email && <p className="text-[11px] text-rose-400">{errors.email.message}</p>}
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Phone Number (Optional)</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  {...register('phone')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            {/* Recruiter specific fields */}
            {role === 'RECRUITER' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Company Name</label>
                  <div className="relative">
                    <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Acme Corporation"
                      {...register('companyName')}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                  {errors.companyName && <p className="text-[11px] text-rose-400">{errors.companyName.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Designation / Title</label>
                  <input
                    type="text"
                    placeholder="Senior Technical Recruiter"
                    {...register('designation')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </>
            )}

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Must contain uppercase, number, special char"
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
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-lg shadow-indigo-600/20 mt-2"
            >
              {isSubmitting ? 'Creating account...' : `Register as ${role.toLowerCase()}`}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 font-semibold hover:text-indigo-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
