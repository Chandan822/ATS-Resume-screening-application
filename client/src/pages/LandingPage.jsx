import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Zap,
  Brain,
  Search,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Star,
  Users,
  Building2,
  FileCheck2,
  Lock,
  Menu,
  X,
  Bot,
} from 'lucide-react';

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pricingPeriod, setPricingPeriod] = useState('monthly'); // 'monthly' | 'annual'
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const features = [
    {
      icon: <Brain className="w-6 h-6 text-indigo-400" />,
      title: 'AI Resume Parsing & Scoring',
      description:
        'Extract candidate skills, work history, and education instantly with LLM-powered parsing that handles messy PDFs and DOCX files gracefully.',
    },
    {
      icon: <Search className="w-6 h-6 text-cyan-400" />,
      title: 'pgvector Semantic Search',
      description:
        'Search candidate talent pools using natural language. Cosine similarity vector embeddings match candidates by contextual relevance beyond simple keywords.',
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-400" />,
      title: 'Automated Candidate Ranking',
      description:
        'Rank hundreds of applicant resumes against job requirements instantly with automated match scores, missing skill alerts, and AI summaries.',
    },
    {
      icon: <Users className="w-6 h-6 text-emerald-400" />,
      title: 'Smart Interview Scheduling',
      description:
        'Seamlessly transition top candidates from screening to interview rounds with customizable feedback forms and multi-stage evaluation pipelines.',
    },
    {
      icon: <FileCheck2 className="w-6 h-6 text-violet-400" />,
      title: 'Customizable Job Workflows',
      description:
        'Publish jobs, set required vs. preferred skill weights, track funnel metrics, and automate rejection & shortlist emails with role-based controls.',
    },
    {
      icon: <Lock className="w-6 h-6 text-rose-400" />,
      title: 'Enterprise RBAC & Audit Security',
      description:
        'Role-Based Access Control for Recruiters, Admins, and Candidates backed by JWT session security, password hashing, and full audit logging.',
    },
  ];

  const faqs = [
    {
      question: 'How does the AI rank and match resumes to job descriptions?',
      answer:
        'Our ATS converts both resumes and job descriptions into high-dimensional vector embeddings stored in PostgreSQL via pgvector. We compute cosine similarity scores combined with required skill coverage to generate a objective 0-100% match score.',
    },
    {
      question: 'Can candidates parse their resumes automatically during sign-up?',
      answer:
        'Yes! Candidates can upload their PDF/DOCX resume file during profile setup. Our pipeline parses contact info, skills, education, and experience history to auto-fill their candidate profile in seconds.',
    },
    {
      question: 'What roles are supported in the system?',
      answer:
        'The platform supports 3 primary user roles: Candidates (who apply and track status), Recruiters (who post jobs, screen resumes, and schedule interviews), and Admins (who manage platform configurations and system health).',
    },
    {
      question: 'Is my candidate data secure and compliant?',
      answer:
        'Absolutely. All authentication is powered by bcrypt password hashing, dual-token JWT rotation (Access & Refresh tokens), HTTPS encryption, and granular database cascade rules.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Background Gradients */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed top-1/3 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent tracking-tight">
              AI ATS<span className="text-indigo-400 font-normal text-xs ml-1">Enterprise</span>
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-400">
            <a href="#features" className="hover:text-indigo-400 transition">
              Features
            </a>
            <a href="#pricing" className="hover:text-indigo-400 transition">
              Pricing
            </a>
            <a href="#testimonials" className="hover:text-indigo-400 transition">
              Testimonials
            </a>
            <a href="#faq" className="hover:text-indigo-400 transition">
              FAQ
            </a>
          </div>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition flex items-center gap-1.5"
            >
              Get Started Free <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-4 space-y-3">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-slate-300 hover:text-indigo-400"
            >
              Features
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-slate-300 hover:text-indigo-400"
            >
              Pricing
            </a>
            <a
              href="#testimonials"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-slate-300 hover:text-indigo-400"
            >
              Testimonials
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-slate-300 hover:text-indigo-400"
            >
              FAQ
            </a>
            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              <Link
                to="/login"
                className="w-full text-center py-2 text-xs font-semibold text-slate-300 bg-slate-800 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="w-full text-center py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" /> Next-Gen AI Applicant Tracking System
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          Hire Top 1% Talent 10x Faster with AI Resume Intelligence
        </h1>

        <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Screen thousands of applicant resumes, compute semantic matching scores, auto-fill candidate profiles, and rank talent effortlessly with vector search.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/25 transition flex items-center justify-center gap-2 group"
          >
            Start Free Hiring Trial
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-sm transition"
          >
            Schedule Product Demo
          </Link>
        </div>

        {/* Floating AI Match Card Preview */}
        <div className="pt-10 max-w-4xl mx-auto">
          <div className="p-1 rounded-3xl bg-gradient-to-b from-indigo-500/20 via-slate-800/40 to-slate-900/80 shadow-2xl backdrop-blur-xl">
            <div className="bg-slate-950/90 rounded-[22px] p-6 md:p-8 space-y-6 text-left border border-slate-800/60">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">Live AI Screening Evaluation</h4>
                    <p className="text-xs text-slate-400">Senior Full Stack Developer Position</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                  96% Match Score
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="text-slate-400">Parsed Candidate</span>
                  <p className="font-semibold text-slate-200">Alex Rivers &bull; 6 Yrs Exp</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="text-slate-400">Required Skills Found</span>
                  <p className="font-semibold text-emerald-400">React, Node.js, PostgreSQL, AI</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="text-slate-400">Semantic Vector Similarity</span>
                  <p className="font-semibold text-indigo-400">0.94 Cosine Relevance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Banner */}
      <section className="border-y border-slate-800/80 bg-slate-950/50 py-10">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Trusted by modern hiring teams & ambitious scale-ups
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-slate-600 font-bold text-base">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5" /> TechCorp
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5" /> CloudScale
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5" /> AI Labs
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5" /> InnovateX
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
            Built for Enterprise Hiring Excellence
          </h2>
          <p className="text-slate-400 text-sm">
            Everything candidate tracking needs — from parsing raw resumes to vector search and role protection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md hover:border-slate-700 transition space-y-3 group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center group-hover:scale-105 transition">
                {feature.icon}
              </div>
              <h3 className="font-bold text-base text-slate-100">{feature.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-center">
          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
              Simple, Transparent Pricing
            </h2>
            <p className="text-slate-400 text-sm">Pick the plan that matches your recruiting scale.</p>

            {/* Monthly / Annual Toggle */}
            <div className="inline-flex items-center gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium mt-4">
              <button
                onClick={() => setPricingPeriod('monthly')}
                className={`px-4 py-1.5 rounded-lg transition ${
                  pricingPeriod === 'monthly' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setPricingPeriod('annual')}
                className={`px-4 py-1.5 rounded-lg transition ${
                  pricingPeriod === 'annual' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                Annual (Save 20%)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto">
            {/* Starter Plan */}
            <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-slate-100">Starter</h3>
                <p className="text-xs text-slate-400">Perfect for small startups hiring up to 5 roles/month.</p>
                <div className="text-3xl font-extrabold text-slate-100">
                  {pricingPeriod === 'monthly' ? '$49' : '$39'}{' '}
                  <span className="text-xs font-normal text-slate-500">/ mo</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" /> Up to 5 Active Jobs
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" /> 500 AI Resume Parses
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" /> Basic Skill Matching
                  </li>
                </ul>
              </div>
              <Link
                to="/register"
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold text-center transition border border-slate-800"
              >
                Start Starter Trial
              </Link>
            </div>

            {/* Growth Pro Plan */}
            <div className="p-8 rounded-3xl bg-slate-900/90 border-2 border-indigo-500/60 space-y-6 flex flex-col justify-between relative shadow-2xl shadow-indigo-500/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider">
                Most Popular
              </div>
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-slate-100">Growth Pro</h3>
                <p className="text-xs text-slate-400">Designed for fast-growing companies and recruitment agencies.</p>
                <div className="text-3xl font-extrabold text-slate-100">
                  {pricingPeriod === 'monthly' ? '$149' : '$119'}{' '}
                  <span className="text-xs font-normal text-slate-500">/ mo</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" /> Unlimited Active Jobs
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" /> 5,000 AI Resume Parses
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" /> pgvector Semantic Talent Search
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" /> Multi-interviewer Round Schedules
                  </li>
                </ul>
              </div>
              <Link
                to="/register"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold text-center transition shadow-lg shadow-indigo-600/20"
              >
                Get Started with Growth Pro
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-slate-100">Enterprise</h3>
                <p className="text-xs text-slate-400">Custom AI workflows, SLA support, and dedicated database clusters.</p>
                <div className="text-3xl font-extrabold text-slate-100">Custom</div>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" /> Custom LLM Model Integration
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" /> Dedicated Neon Database Instance
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" /> 24/7 Priority Support & Audit Logs
                  </li>
                </ul>
              </div>
              <Link
                to="/login"
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold text-center transition border border-slate-800"
              >
                Contact Enterprise Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
            Loved by Hiring Managers & Candidates
          </h2>
          <p className="text-slate-400 text-sm">See how companies use our AI ATS to streamline recruiting.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <p className="text-xs text-slate-300 italic leading-relaxed">
              &quot;The semantic search feature is a game changer. We found qualified engineers in seconds who didn&apos;t use exact keyword matches.&quot;
            </p>
            <div>
              <h4 className="font-bold text-xs text-slate-100">Sarah Jenkins</h4>
              <p className="text-[11px] text-slate-500">Head of Talent &bull; TechScale</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <p className="text-xs text-slate-300 italic leading-relaxed">
              &quot;As a candidate, uploading my resume automatically parsed my experience and skills without filling 50 manual form fields!&quot;
            </p>
            <div>
              <h4 className="font-bold text-xs text-slate-100">David Miller</h4>
              <p className="text-[11px] text-slate-500">Senior Full Stack Developer</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <p className="text-xs text-slate-300 italic leading-relaxed">
              &quot;Role-based permissions and interview feedback rounds allowed our team of 12 recruiters to coordinate seamlessly.&quot;
            </p>
            <div>
              <h4 className="font-bold text-xs text-slate-100">Marcus Vance</h4>
              <p className="text-[11px] text-slate-500">VP People &bull; CloudCorp</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="py-20 max-w-3xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight">Frequently Asked Questions</h2>
          <p className="text-slate-400 text-xs">Got questions? We have answers.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl bg-slate-900/60 border border-slate-800 overflow-hidden">
              <button
                onClick={() => toggleFaq(i)}
                className="w-full px-5 py-4 text-left text-xs font-semibold text-slate-200 flex items-center justify-between hover:bg-slate-800/50 transition"
              >
                <span>{faq.question}</span>
                {activeFaq === i ? <ChevronUp className="w-4 h-4 text-indigo-400" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>
              {activeFaq === i && (
                <div className="px-5 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/50 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-900/30 via-slate-900 to-cyan-900/30 border-t border-slate-800 text-center space-y-6">
        <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight">Ready to Transform Your Hiring Pipeline?</h2>
        <p className="text-slate-400 text-xs max-w-xl mx-auto">
          Get started today with AI candidate screening, vector matching, and automated workflow pipelines.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/register"
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-300">AI ATS &bull; Enterprise Applicant Tracking System</span>
          </div>
          <p>&copy; {new Date().getFullYear()} AI ATS Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
