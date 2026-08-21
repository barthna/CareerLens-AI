'use client';

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, CheckCircle2, AlertTriangle, RefreshCw, 
  HelpCircle, ChevronRight, Check, Play, FileText, ArrowRight
} from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/Toast';

export default function JobMatcher() {
  const { toast } = useToast();
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [matchData, setMatchData] = useState<any>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const savedJobId = searchParams.get('saved_job_id');

    async function loadResumesAndSavedJob() {
      const isDemo = localStorage.getItem('demo_mode') === 'true';
      let selectedJob: any = null;

      if (isDemo) {
        setResumes([
          { id: 101, filename: 'software_engineer_cv.pdf' },
          { id: 102, filename: 'product_manager_resume.docx' }
        ]);
        setSelectedResumeId('101');

        if (savedJobId) {
          const demoJobs = [
            { id: 201, title: 'Full Stack Engineer', company: 'Stripe', description: 'Looking for a generalist engineer with deep expertise in React and Python.' },
            { id: 202, title: 'Senior Frontend Developer', company: 'Vercel', description: 'Work on building the next generation of Next.js features and layouts.' }
          ];
          selectedJob = demoJobs.find(j => j.id.toString() === savedJobId);
        }
      } else {
        try {
          const data = await api.request('/resumes');
          setResumes(data);
          if (data.length > 0) {
            setSelectedResumeId(data[0].id.toString());
          }

          if (savedJobId) {
            selectedJob = await api.request(`/jobs/saved/${savedJobId}`);
          }
        } catch (err: any) {
          toast('Failed to load initial data.', 'error');
        }
      }

      if (selectedJob) {
        setJobTitle(selectedJob.title || '');
        setCompany(selectedJob.company || '');
        setJobDescription(selectedJob.description || '');
      }
    }
    loadResumesAndSavedJob();
  }, [toast]);

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResumeId) {
      toast('Please upload or select a resume first.', 'error');
      return;
    }
    if (!jobDescription.trim()) {
      toast('Please paste a job description.', 'error');
      return;
    }

    setLoading(true);
    const isDemo = localStorage.getItem('demo_mode') === 'true';
    if (isDemo) {
      // Mock job match
      setTimeout(() => {
        setMatchData({
          match_score: 84,
          skills_match: 84,
          experience_match: 78,
          education_match: 95,
          keyword_match: 88,
          responsibilities_match: 81,
          analysis_json: {
            scores: { overall: 84 },
            matched_skills: ['Python', 'SQL', 'React', 'Git', 'REST APIs'],
            missing_skills: [
              {
                name: 'Docker',
                importance: 'High',
                why_it_matters: 'Essential for running isolated development setups and containerized microservices.',
                suggested_learning_path: ['Docker basics', 'Images & containers', 'Docker Compose', 'Deploy a backend application']
              },
              {
                name: 'Kubernetes',
                importance: 'Medium',
                why_it_matters: 'Utilized for orchestrating high-scale containers in production cloud clusters.',
                suggested_learning_path: ['Kubernetes concepts', 'Pods & Deployments', 'ConfigMaps & Secrets', 'Minikube local setup']
              }
            ],
            recommendations: {
              why_good_match: 'You have solid full-stack engineering skills, a strong React codebase foundation, and robust Postgres knowledge.',
              what_may_hurt: 'A lack of experience in container systems, Docker configs, and Kubernetes pod management.',
              what_to_improve: 'Include any Docker run integrations you did in personal projects. List any AWS ECS hosting tasks.',
              recommended_resume_changes: [
                'In the project details, explicitly describe how you configured Docker Compose for local environments.',
                'Specify the serverless functions you hosted in your AWS infrastructure.'
              ],
              interview_prep_topics: [
                {
                  topic: 'Docker Compose',
                  sample_question: 'Explain what Docker Compose is and how it differs from a single Dockerfile.',
                  how_to_answer: 'Docker Compose is a tool for defining and running multi-container Docker applications, whereas a Dockerfile defines a single container image.'
                },
                {
                  topic: 'API Latency Tuning',
                  sample_question: 'How do you analyze and optimize slow database queries?',
                  how_to_answer: 'Use EXPLAIN ANALYZE to identify bottle-necks, verify appropriate database indexing, and leverage caching mechanisms.'
                }
              ]
            }
          }
        });
        setLoading(false);
        toast('Analysis complete!', 'success');
      }, 1200);
      return;
    }

    try {
      const response = await api.request('/jobs/analyze', {
        method: 'POST',
        body: JSON.stringify({
          resume_id: parseInt(selectedResumeId),
          job_title: jobTitle,
          company: company,
          job_description: jobDescription
        })
      });
      setMatchData(response);
      toast('Match analyzed successfully!', 'success');
    } catch (err: any) {
      toast('Failed to analyze job match.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Job Matcher</h1>
        <p className="text-xs text-slate-400 mt-1">Audit your resume compatibility against specified job requirements</p>
      </div>

      {loading ? (
        <div className="glass p-12 rounded-2xl text-center max-w-md mx-auto w-full mt-10 flex flex-col items-center justify-center">
          <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
          <h3 className="text-lg font-bold text-slate-200">Matching Resume</h3>
          <p className="text-xs text-indigo-300 font-semibold mt-2 animate-pulse">Running semantic comparison checks...</p>
        </div>
      ) : !matchData ? (
        /* Form State */
        <form onSubmit={handleMatch} className="glass p-6 md:p-8 rounded-2xl max-w-3xl mx-auto w-full flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Select Resume</label>
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                required
              >
                <option value="">-- Choose Resume --</option>
                {resumes.map(r => (
                  <option key={r.id} value={r.id}>{r.filename}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Role Title (Opt)</label>
                <input
                  type="text"
                  placeholder="e.g. Frontend Dev"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Company (Opt)</label>
                <input
                  type="text"
                  placeholder="e.g. Stripe"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Paste Job Description</label>
            <textarea
              placeholder="Paste the full job description details here..."
              rows={8}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500 transition-colors resize-y"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-xl font-bold bg-white text-[#090a0f] hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Analyze Match Compatibility</span>
          </button>
        </form>
      ) : (
        /* Results State */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left panel match circular meter */}
          <div className="flex flex-col gap-6">
            <div className="glass p-6 rounded-2xl flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
              <h3 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-6">Overall Match Score</h3>
              
              <div className="relative w-36 h-36 flex items-center justify-center mb-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="50" cy="50" r="40" 
                    stroke="url(#emeraldGrad)" strokeWidth="8" fill="transparent" 
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * (matchData.match_score || 0)) / 100}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute text-center">
                  <span className="text-4xl font-extrabold text-white">{matchData.match_score}%</span>
                </div>
              </div>

              {/* Reset button */}
              <button 
                onClick={() => setMatchData(null)}
                className="w-full py-2.5 rounded-xl border border-slate-900 bg-slate-950 hover:bg-slate-900 transition-colors text-xs font-semibold"
              >
                Analyze Another Match
              </button>
            </div>

            {/* Matching Categories Progress bar */}
            <div className="glass p-6 rounded-2xl flex flex-col gap-4">
              <h3 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-2">Category Comparison</h3>
              {[
                { label: 'Skills Match', val: matchData.skills_match },
                { label: 'Experience Match', val: matchData.experience_match },
                { label: 'Education Match', val: matchData.education_match },
                { label: 'Keywords Match', val: matchData.keyword_match },
                { label: 'Responsibilities Match', val: matchData.responsibilities_match }
              ].map((c) => (
                <div key={c.label}>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-500">{c.label}</span>
                    <span className="text-slate-300">{c.val}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${c.val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel matching breakdowns */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Skills split */}
            <div className="glass p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-xs text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Matched Skills ({matchData.analysis_json?.matched_skills?.length || 0})</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {matchData.analysis_json?.matched_skills?.map((sk: string) => (
                    <span key={sk} className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-semibold">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-xs text-red-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Missing Skills ({matchData.analysis_json?.missing_skills?.length || 0})</span>
                </h3>
                <div className="space-y-4">
                  {matchData.analysis_json?.missing_skills?.map((sk: any) => (
                    <div key={sk.name} className="p-3 bg-slate-900/40 rounded-xl border border-slate-950">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-200">{sk.name}</span>
                        <span className="text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded font-extrabold uppercase">
                          {sk.importance} Importance
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed mb-2">{sk.why_it_matters}</p>
                      
                      {/* Suggested path steps */}
                      <div className="border-t border-slate-950 pt-2">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Suggested learning path:</span>
                        <div className="flex flex-col gap-1 text-[11px] text-indigo-300">
                          {sk.suggested_learning_path?.map((step: string, idx: number) => (
                            <span key={idx} className="flex items-center gap-1">
                              <ChevronRight className="w-3 h-3 text-indigo-500" />
                              <span>{step}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Insights & Interview Prep */}
            <div className="glass p-6 rounded-2xl flex flex-col gap-6">
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider">AI Recommendations</h3>
              
              <div className="space-y-4 text-xs text-slate-400 leading-relaxed">
                <div>
                  <strong className="text-slate-300 block mb-1">Why you're a good match:</strong>
                  <p>{matchData.analysis_json?.recommendations?.why_good_match}</p>
                </div>
                <div>
                  <strong className="text-slate-300 block mb-1">What may hurt your application:</strong>
                  <p>{matchData.analysis_json?.recommendations?.what_may_hurt}</p>
                </div>
                <div>
                  <strong className="text-slate-300 block mb-1">Recommended resume changes:</strong>
                  <ul className="list-disc list-inside space-y-1 mt-1 text-indigo-300">
                    {matchData.analysis_json?.recommendations?.recommended_resume_changes?.map((ch: string, idx: number) => (
                      <li key={idx}>{ch}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Interview Prep Questions */}
            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider">Interview Preparation Prep</h3>
              {matchData.analysis_json?.recommendations?.interview_prep_topics?.map((topic: any, idx: number) => (
                <div key={idx} className="glass p-5 rounded-2xl flex flex-col gap-3 relative overflow-hidden">
                  <div className="absolute top-0 left-0 h-full w-1 bg-indigo-500" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Topic: {topic.topic}</span>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Sample Question</span>
                    <p className="text-xs text-slate-200 font-semibold leading-relaxed mt-1">"{topic.sample_question}"</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Suggested Response Strategy</span>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1">{topic.how_to_answer}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
