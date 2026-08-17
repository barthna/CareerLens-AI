'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, FileText, CheckCircle2, ShieldCheck, Zap, ArrowRight, 
  HelpCircle, ChevronDown, Award, Search, Users, Menu, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LandingPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const startDemo = () => {
    // Write demo flag to localStorage and redirect
    localStorage.setItem('demo_mode', 'true');
    localStorage.setItem('access_token', 'demo_access_token');
    localStorage.setItem('refresh_token', 'demo_refresh_token');
    localStorage.setItem('user_info', JSON.stringify({
      id: 0,
      name: 'Demo Visitor',
      email: 'demo@careerlens.ai',
      role: 'USER',
      profile: {
        target_role: 'Full Stack Engineer',
        experience_years: 3,
        location: 'San Francisco, CA',
        preferred_work_type: 'Remote'
      }
    }));
    router.push('/dashboard');
  };

  const faqs = [
    {
      q: "How does the AI Resume Analyzer calculate the ATS score?",
      a: "Our engine uses advanced parser services combined with AI models to cross-compare your resume structure, keyword densities, and skill listings against industry-standard ATS standards, providing a granular breakdown out of 100."
    },
    {
      q: "Can I try the service without registering an account?",
      a: "Absolutely! Simply click on 'Try Demo' to load pre-configured resumes and job matches to explore all platform features without typing a single credential."
    },
    {
      q: "Is my personal resume data secure?",
      a: "Yes. CareerLens AI enforces total tenant isolation. Resumes are scoped securely to your user account, and our data controllers ensure zero third-party access."
    },
    {
      q: "Does it support both PDF and DOCX uploads?",
      a: "Yes, both formats are fully supported. We extract and clean structured sections from standard PDF and Word Document layouts."
    }
  ];

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col selection:bg-indigo-500/30">
      {/* Header */}
      <header className="glass sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="gradient-accent p-2 rounded-lg text-white glow">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight gradient-text">CareerLens AI</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <button 
              onClick={startDemo}
              className="text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg border border-slate-700 transition-colors"
            >
              Try Demo
            </button>
            <Link href="/register" className="text-sm font-medium gradient-accent hover:opacity-90 text-white px-4 py-2 rounded-lg glow transition-all">
              Analyze My Resume
            </Link>
          </div>

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass md:hidden fixed top-16 left-0 w-full p-6 flex flex-col gap-4 z-40"
          >
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-slate-300">Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-slate-300">How It Works</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-slate-300">FAQ</a>
            <hr className="border-slate-800" />
            <Link href="/login" className="text-slate-300">Sign In</Link>
            <button onClick={startDemo} className="w-full bg-slate-800 py-2 rounded-lg border border-slate-700 text-center">
              Try Demo
            </button>
            <Link href="/register" className="w-full gradient-accent py-2 rounded-lg text-center font-bold text-white shadow-lg">
              Get Started
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/25 px-4 py-1.5 rounded-full text-indigo-300 text-xs font-semibold mb-6 hover:bg-indigo-500/15 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Powering job-search insights with Advanced AI</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] max-w-4xl mx-auto"
          >
            Turn your resume into your <span className="text-indigo-400">career advantage.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Analyze your resume, discover missing skills, and see exactly how well you match your dream jobs with AI.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
            <Link href="/register" className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-white text-[#090a0f] hover:bg-slate-100 shadow-xl shadow-white/5 transition-all flex items-center justify-center gap-2 group">
              <span>Analyze My Resume</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button 
              onClick={startDemo}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              Try Demo Mode
            </button>
          </motion.div>

          {/* Hero Preview Card */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="glass p-6 md:p-8 rounded-2xl max-w-4xl mx-auto text-left shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[60px] pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-800/80 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-indigo-400">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100 text-base">software_engineer_cv.pdf</h3>
                  <p className="text-xs text-slate-400">Analyzed 2 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-center bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-500/20">
                  <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider">ATS Score</p>
                  <p className="text-xl font-extrabold text-white">92%</p>
                </div>
                <div className="text-center bg-purple-500/10 px-4 py-2 rounded-xl border border-purple-500/20">
                  <p className="text-xs text-purple-300 font-bold uppercase tracking-wider">Matches</p>
                  <p className="text-xl font-extrabold text-white">24</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Key Strengths</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Strong React/TypeScript foundations</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Experience optimizing DB latencies by 20%</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Missing Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {["CI/CD", "Docker", "AWS", "Redis", "Horizontal Scaling"].map((k) => (
                    <span key={k} className="text-xs px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-indigo-300 font-medium">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 border-t border-slate-900 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Complete AI Tooling Suite</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Smarter tools built to evaluate, expand, and structure your professional profile.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-xl hover:border-slate-800 transition-colors">
              <Zap className="w-8 h-8 text-indigo-400 mb-6" />
              <h3 className="text-xl font-bold mb-3">ATS Checker</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Scan layouts, keywords, and skill matches instantly against major standard parser checkers.
              </p>
            </div>
            <div className="glass-card p-8 rounded-xl hover:border-slate-800 transition-colors">
              <Search className="w-8 h-8 text-purple-400 mb-6" />
              <h3 className="text-xl font-bold mb-3">Job Match Comparison</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Paste job descriptions to evaluate scores, missing skills, and recommended rewrite highlights.
              </p>
            </div>
            <div className="glass-card p-8 rounded-xl hover:border-slate-800 transition-colors">
              <Award className="w-8 h-8 text-indigo-400 mb-6" />
              <h3 className="text-xl font-bold mb-3">Interview Planner</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Receive personalized potential interview questions and custom strategies based on your resume.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 border-t border-slate-900">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="glass rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full p-5 flex items-center justify-between text-left font-medium text-slate-200 hover:text-white transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openFaqIndex === idx ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaqIndex === idx && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="p-5 pt-0 text-sm text-slate-400 leading-relaxed border-t border-slate-900">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 px-6 bg-slate-950/40 border-t border-slate-900 text-center relative">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Ready to upgrade your job hunt?</h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-8">
            Create an account or launch Demo Mode to immediately audit your resume's competitive strengths.
          </p>
          <button 
            onClick={startDemo}
            className="gradient-accent text-white px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-opacity glow inline-flex items-center gap-2"
          >
            <span>Launch CareerLens AI Demo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-900 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} CareerLens AI. All rights reserved. Created as a modern GitHub portfolio showcase.</p>
      </footer>
    </div>
  );
}
