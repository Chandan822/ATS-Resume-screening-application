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
  const [pricingPeriod, setPricingPeriod] = useState('monthly');
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const features = [
    {
      icon: <Brain className="w-6 h-6 text-indigo-600" />,
      bg: 'bg-indigo-50 border-indigo-100',
      title: 'AI Resume Parsing & Scoring',
      description:
        'Extract candidate skills, work history, and education instantly with LLM-powered parsing that handles messy PDFs and DOCX files gracefully.',
    },
    {
      icon: <Search className="w-6 h-6 text-cyan-600" />,
      bg: 'bg-cyan-50 border-cyan-100',
      title: 'pgvector Semantic Search',
      description:
        'Search candidate talent pools using natural language. Cosine similarity vector embeddings match candidates by contextual relevance beyond simple keywords.',
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-600" />,
      bg: 'bg-amber-50 border-amber-100',
      title: 'Automated Candidate Ranking',
      description:
        'Rank hundreds of applicant resumes against job requirements instantly with automated match scores, missing skill alerts, and AI summaries.',
    },
    {
      icon: <Users className="w-6 h-6 text-emerald-600" />,
      bg: 'bg-emerald-50 border-emerald-100',
      title: 'Smart Interview Scheduling',
      description:
        'Seamlessly transition top candidates from screening to interview rounds with customizable feedback forms and multi-stage evaluation pipelines.',
    },
    {
      icon: <FileCheck2 className="w-6 h-6 text-violet-600" />,
      bg: 'bg-violet-50 border-violet-100',
      title: 'Customizable Job Workflows',
      description:
        'Publish jobs, set required vs. preferred skill weights, track funnel metrics, and automate rejection & shortlist emails with role-based controls.',
    },
    {
      icon: <Lock className="w-6 h-6 text-rose-600" />,
      bg: 'bg-rose-50 border-rose-100',
      title: 'Enterprise RBAC & Audit Security',
      description:
        'Role-Based Access Control for Recruiters, Admins, and Candidates backed by JWT session security, password hashing, and full audit logging.',
    },
  ];

  const faqs = [
    {
      question: 'How does the AI rank and match resumes to job descriptions?',
      answer:
        'Our ATS converts both resumes and job descriptions into high-dimensional vector embeddings stored in PostgreSQL via pgvector. We compute cosine similarity scores combined with required skill coverage to generate an objective 0-100% match score.',
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-600 selection:text-white overflow-x-hidden">
      {/* Soft Light Gradients */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-br from-indigo-200/40 via-purple-100/30 to-transparent rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-1/3 right-0 w-[600px] h-[600px] bg-emerald-200/30 rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <Bot className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg text-slate-900 tracking-tight">
              AI ATS<span className="text-indigo-600 font-semibold text-xs ml-1.5 px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100">Enterprise</span>
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition">
              Features
            </a>
            <a href="#pricing" className="hover:text-indigo-600 transition">
              Pricing
            </a>
            <a href="#testimonials" className="hover:text-indigo-600 transition">
              Testimonials
            </a>
            <a href="#faq" className="hover:text-indigo-600 transition">
              FAQ
            </a>
          </div>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
            >
              Get Started Free <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3 shadow-lg">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-700 hover:text-indigo-600"
            >
              Features
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-700 hover:text-indigo-600"
            >
              Pricing
            </a>
            <a
              href="#testimonials"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-700 hover:text-indigo-600"
            >
              Testimonials
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-700 hover:text-indigo-600"
            >
              FAQ
            </a>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login"
                className="w-full text-center py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg"
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
      <section className="relative pt-16 pb-16 md:pt-24 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider shadow-xs">
          <Sparkles className="w-4 h-4 text-indigo-600" /> Next-Gen AI Applicant Tracking System
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight text-slate-900">
          Hire Top 1% Talent 10x Faster with <span className="text-indigo-600">AI Resume Intelligence</span>
        </h1>

        <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Screen thousands of applicant resumes, compute semantic matching scores, auto-fill candidate profiles, and rank talent effortlessly with vector search.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-xl shadow-indigo-600/20 transition flex items-center justify-center gap-2 group"
          >
            Start Free Hiring Trial
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold text-sm shadow-xs transition"
          >
            Schedule Product Demo
          </Link>
        </div>

        {/* Floating AI Match Card Preview */}
        <div className="pt-8 max-w-4xl mx-auto">
          <div className="p-1.5 rounded-3xl bg-gradient-to-b from-indigo-100 via-slate-200 to-white shadow-2xl">
            <div className="bg-white rounded-[22px] p-6 md:p-8 space-y-6 text-left border border-slate-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Live AI Screening Evaluation</h4>
                    <p className="text-xs text-slate-500">Senior Full Stack Developer Position</p>
                  </div>
                </div>
                <span className="px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shadow-xs">
                  96% Match Score
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-500 font-medium">Parsed Candidate</span>
                  <p className="font-bold text-slate-800">Alex Rivers &bull; 6 Yrs Exp</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-500 font-medium">Required Skills Found</span>
                  <p className="font-bold text-emerald-700">React, Node.js, PostgreSQL, AI</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-500 font-medium">Semantic Vector Similarity</span>
                  <p className="font-bold text-indigo-700">0.94 Cosine Relevance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Banner */}
      <section className="border-y border-slate-200 bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Trusted by modern hiring teams & ambitious scale-ups
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-slate-500 font-bold text-base">
            <div className="flex items-center gap-2 text-slate-700">
              <Building2 className="w-5 h-5 text-indigo-600" /> TechCorp
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Building2 className="w-5 h-5 text-cyan-600" /> CloudScale
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Building2 className="w-5 h-5 text-emerald-600" /> AI Labs
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Building2 className="w-5 h-5 text-violet-600" /> InnovateX
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Built for Enterprise Hiring Excellence
          </h2>
          <p className="text-slate-600 text-sm">
            Everything candidate tracking needs — from parsing raw resumes to vector search and role protection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-200 transition space-y-4 group"
            >
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${feature.bg}`}>
                {feature.icon}
              </div>
              <h3 className="font-bold text-base text-slate-900">{feature.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-100/80 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-center">
          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Simple, Transparent Pricing
            </h2>
            <p className="text-slate-600 text-sm">Pick the plan that matches your recruiting scale.</p>

            {/* Monthly / Annual Toggle */}
            <div className="inline-flex items-center gap-2 p-1 rounded-xl bg-white border border-slate-300 text-xs font-semibold mt-4 shadow-xs">
              <button
                onClick={() => setPricingPeriod('monthly')}
                className={`px-4 py-1.5 rounded-lg transition ${
                  pricingPeriod === 'monthly' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setPricingPeriod('annual')}
                className={`px-4 py-1.5 rounded-lg transition ${
                  pricingPeriod === 'annual' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Annual (Save 20%)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto">
            {/* Starter Plan */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-slate-900">Starter</h3>
                <p className="text-xs text-slate-500">Perfect for small startups hiring up to 5 roles/month.</p>
                <div className="text-3xl font-extrabold text-slate-900">
                  {pricingPeriod === 'monthly' ? '$49' : '$39'}{' '}
                  <span className="text-xs font-medium text-slate-500">/ mo</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Up to 5 Active Jobs
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" /> 500 AI Resume Parses
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Basic Skill Matching
                  </li>
                </ul>
              </div>
              <Link
                to="/register"
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold text-center transition border border-slate-300"
              >
                Start Starter Trial
              </Link>
            </div>

            {/* Growth Pro Plan */}
            <div className="p-8 rounded-3xl bg-white border-2 border-indigo-600 space-y-6 flex flex-col justify-between relative shadow-xl shadow-indigo-600/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                Most Popular
              </div>
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-slate-900">Growth Pro</h3>
                <p className="text-xs text-slate-500">Designed for fast-growing companies and recruitment agencies.</p>
                <div className="text-3xl font-extrabold text-slate-900">
                  {pricingPeriod === 'monthly' ? '$149' : '$119'}{' '}
                  <span className="text-xs font-medium text-slate-500">/ mo</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Unlimited Active Jobs
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" /> 5,000 AI Resume Parses
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" /> pgvector Semantic Talent Search
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Multi-interviewer Round Schedules
                  </li>
                </ul>
              </div>
              <Link
                to="/register"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold text-center transition shadow-md shadow-indigo-600/20"
              >
                Get Started with Growth Pro
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-slate-900">Enterprise</h3>
                <p className="text-xs text-slate-500">Custom AI workflows, SLA support, and dedicated database clusters.</p>
                <div className="text-3xl font-extrabold text-slate-900">Custom</div>
                <ul className="space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Custom LLM Model Integration
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Dedicated Neon Database Instance
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" /> 24/7 Priority Support & Audit Logs
                  </li>
                </ul>
              </div>
              <Link
                to="/login"
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold text-center transition border border-slate-300"
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
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Loved by Hiring Managers & Candidates
          </h2>
          <p className="text-slate-600 text-sm">See how companies use our AI ATS to streamline recruiting.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <p className="text-xs text-slate-700 italic leading-relaxed">
              &quot;The semantic search feature is a game changer. We found qualified engineers in seconds who didn&apos;t use exact keyword matches.&quot;
            </p>
            <div>
              <h4 className="font-bold text-xs text-slate-900">Sarah Jenkins</h4>
              <p className="text-[11px] text-slate-500">Head of Talent &bull; TechScale</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <p className="text-xs text-slate-700 italic leading-relaxed">
              &quot;As a candidate, uploading my resume automatically parsed my experience and skills without filling 50 manual form fields!&quot;
            </p>
            <div>
              <h4 className="font-bold text-xs text-slate-900">David Miller</h4>
              <p className="text-[11px] text-slate-500">Senior Full Stack Developer</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <p className="text-xs text-slate-700 italic leading-relaxed">
              &quot;Role-based permissions and interview feedback rounds allowed our team of 12 recruiters to coordinate seamlessly.&quot;
            </p>
            <div>
              <h4 className="font-bold text-xs text-slate-900">Marcus Vance</h4>
              <p className="text-[11px] text-slate-500">VP People &bull; CloudCorp</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="py-20 max-w-3xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Frequently Asked Questions</h2>
          <p className="text-slate-600 text-xs">Got questions? We have answers.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-xs">
              <button
                onClick={() => toggleFaq(i)}
                className="w-full px-5 py-4 text-left text-xs font-bold text-slate-900 flex items-center justify-between hover:bg-slate-50 transition"
              >
                <span>{faq.question}</span>
                {activeFaq === i ? <ChevronUp className="w-4 h-4 text-indigo-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {activeFaq === i && (
                <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-16 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white text-center space-y-6">
        <h2 className="text-3xl font-extrabold tracking-tight">Ready to Transform Your Hiring Pipeline?</h2>
        <p className="text-slate-300 text-xs max-w-xl mx-auto">
          Get started today with AI candidate screening, vector matching, and automated workflow pipelines.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/register"
            className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-500/30 transition"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-200">AI ATS &bull; Enterprise Applicant Tracking System</span>
          </div>
          <p>&copy; {new Date().getFullYear()} AI ATS Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
