'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  UploadCloud, FileText, Sparkles, Award, CheckCircle2, 
  AlertTriangle, Copy, ArrowLeft, RefreshCw, Layers, Check 
} from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/Toast';

function AnalyzerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [loadStage, setLoadStage] = useState('');
  const [resumeData, setResumeData] = useState<any>(null);
  const [improvements, setImprovements] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'scores' | 'ats' | 'suggestions'>('scores');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Load resume if ID is present in URL
  useEffect(() => {
    const resumeId = searchParams.get('id');
    if (resumeId) {
      loadResumeDetails(parseInt(resumeId));
    }
  }, [searchParams]);

  const loadResumeDetails = async (id: number) => {
    const isDemo = localStorage.getItem('demo_mode') === 'true';
    if (isDemo) {
      // Setup demo details
      setLoading(true);
      setLoadStage('Preparing sandbox insights...');
      setTimeout(() => {
        setResumeData({
          id,
          filename: 'software_engineer_cv.pdf',
          file_type: 'pdf',
          analysis: {
            overall_score: 87,
            ats_score: 92,
            skills_score: 88,
            experience_score: 85,
            formatting_score: 95,
            keyword_score: 90,
            analysis_json: {
              personal_info: { name: 'Alex Mercer', email: 'alex.mercer@example.com', location: 'San Francisco, CA' },
              summary: 'Experienced Full Stack Developer with over 4 years of experience.',
              skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Git', 'HTML', 'CSS', 'Tailwind CSS'],
              strengths: [
                'Strong frontend capabilities with modern React framework integrations.',
                'Clear database architectural insights and API query reductions.',
                'Relevant education and certification credentials.'
              ],
              weaknesses: [
                'Lacks quantifiable metrics for business impact highlights.',
                'Summary introduction statement could be more action-oriented.',
                'Missing DevOps automation logs (e.g. CI/CD actions).'
              ],
              suggested_keywords: ['Docker', 'AWS ECS', 'Redis', 'Unit Testing']
            }
          }
        });
        setImprovements([
          {
            section: 'Professional Summary',
            current: 'Experienced Full Stack Developer with over 4 years of hands-on experience designing, building, and deploying robust web applications.',
            suggestion: 'Performance-driven Full Stack Engineer with 4+ years of experience engineering high-scale web apps, optimizing database queries to cut load times by 25%, and spearheading responsive UI developments.',
            why: 'Highlights action-oriented results and metrics instead of passive descriptions.'
          },
          {
            section: 'Experience Description',
            current: 'Collaborated with cross-functional teams to build React & Node.js features. Designed REST APIs.',
            suggestion: 'Spearheaded design and delivery of 12+ customer-facing React components while refactoring Node.js backend endpoints, reducing API response latency by 20%.',
            why: 'Injects strong active verbs and concrete performance increases.'
          }
        ]);
        setLoading(false);
      }, 1000);
      return;
    }

    try {
      setLoading(true);
      setLoadStage('Loading analysis data...');
      const resume = await api.request(`/resumes/${id}`);
      setResumeData(resume);
      
      const impData = await api.request(`/resumes/${id}/improvements`);
      setImprovements(impData.improvements || []);
    } catch (err: any) {
      toast('Failed to load analysis details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const simulateLoadingStages = async () => {
    const stages = [
      'Reading your resume...',
      'Analyzing your skills...',
      'Comparing with ATS requirements...',
      'Preparing your career insights...',
      'Analysis complete.'
    ];
    for (const stage of stages) {
      setLoadStage(stage);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setLoading(true);
    setError(null);
    
    // Simulate loading stages
    const loaderPromise = simulateLoadingStages();
    
    const isDemo = localStorage.getItem('demo_mode') === 'true';
    if (isDemo) {
      await loaderPromise;
      // Mock upload
      setResumeData({
        id: 101,
        filename: file.name,
        file_type: file.name.endsWith('.pdf') ? 'pdf' : 'docx',
        analysis: {
          overall_score: 82,
          ats_score: 85,
          skills_score: 80,
          experience_score: 83,
          formatting_score: 90,
          keyword_score: 81,
          analysis_json: {
            personal_info: { name: 'Sandbox Candidate', email: 'sandbox@example.com' },
            summary: 'Experienced Developer profile uploaded via sandbox file.',
            skills: ['React', 'JavaScript', 'SQL', 'Git'],
            strengths: ['Clear document structure and clean font layout', 'Strong react foundations'],
            weaknesses: ['Missing AWS deployment experiences', 'Suggested keyword density is low'],
            suggested_keywords: ['TypeScript', 'FastAPI', 'Docker', 'AWS', 'Tailwind CSS']
          }
        }
      });
      setImprovements([
        {
          section: 'Summary',
          current: 'Experienced Developer profile uploaded via sandbox.',
          suggestion: 'Detail-oriented Systems Developer with 3+ years of experience programming web applications, configuring database pipelines, and deploying robust user solutions.',
          why: 'Provides a more distinct professional branding.'
        }
      ]);
      setLoading(false);
      toast('Demo file processed successfully!', 'success');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.request('/resumes/upload', {
        method: 'POST',
        body: formData,
      });

      await loaderPromise;
      setResumeData(response);
      toast('Analysis complete!', 'success');
      
      // Load improvements
      const impData = await api.request(`/resumes/${response.id}/improvements`);
      setImprovements(impData.improvements || []);
    } catch (err: any) {
      toast(err.error?.message || 'Failed to upload resume.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const triggerDemoResume = () => {
    const fakeFile = new File(['Alex Mercer Resume Context'], 'software_engineer_cv.pdf', { type: 'application/pdf' });
    handleFileUpload(fakeFile);
  };

  const [error, setError] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast('Suggestion copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Top action header */}
      <div className="flex items-center gap-4">
        {resumeData && (
          <button 
            onClick={() => {
              setResumeData(null);
              router.push('/dashboard/analyzer');
            }}
            className="p-2 rounded-xl bg-slate-950 border border-slate-900 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-slate-100">AI Resume Analyzer</h1>
          <p className="text-xs text-slate-400 mt-1">Upload and audit your resume against technical job vectors</p>
        </div>
      </div>

      {loading ? (
        <div className="glass p-12 rounded-2xl text-center max-w-md mx-auto w-full mt-10 flex flex-col items-center justify-center">
          <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
          <h3 className="text-lg font-bold text-slate-200">Analyzing Profile</h3>
          <p className="text-sm text-indigo-300 font-semibold mt-2 animate-pulse">{loadStage}</p>
        </div>
      ) : !resumeData ? (
        /* UPLOAD STATE */
        <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            className="glass border-2 border-dashed border-slate-800/80 hover:border-indigo-500/50 p-12 rounded-2xl text-center cursor-pointer transition-colors group relative overflow-hidden"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
              className="hidden" 
              accept=".pdf,.docx"
            />
            <UploadCloud className="w-12 h-12 text-slate-500 group-hover:text-indigo-400 transition-colors mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-200">Drag & Drop Resume</h3>
            <p className="text-xs text-slate-500 mt-2 mb-6">Supports PDF and DOCX files up to 5MB</p>
            <button className="bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-200 text-xs px-5 py-3 rounded-xl font-semibold pointer-events-none transition-colors">
              Select Document
            </button>
          </div>

          <div className="text-center">
            <span className="text-xs text-slate-500">Don't have a resume? </span>
            <button 
              onClick={triggerDemoResume}
              className="text-xs text-indigo-400 font-semibold hover:text-indigo-300 underline underline-offset-4"
            >
              Try our demo resume.
            </button>
          </div>
        </div>
      ) : (
        /* ANALYSIS RESULTS STATE */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left panel metrics */}
          <div className="flex flex-col gap-6">
            <div className="glass p-6 rounded-2xl flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
              <h3 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-6">Overall Assessment</h3>
              
              {/* Circular Score representation */}
              <div className="relative w-36 h-36 flex items-center justify-center mb-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="50" cy="50" r="40" 
                    stroke="url(#indigoGrad)" strokeWidth="8" fill="transparent" 
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * (resumeData.analysis?.overall_score || 0)) / 100}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="indigoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute text-center">
                  <span className="text-4xl font-extrabold text-white">{resumeData.analysis?.overall_score}</span>
                  <span className="text-xs text-slate-500 block">/ 100</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full border-t border-slate-900 pt-6 mt-2">
                <div className="text-left p-3 rounded-lg bg-slate-950/40">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">ATS Score</span>
                  <span className="text-lg font-extrabold text-indigo-400 mt-1 block">{resumeData.analysis?.ats_score}%</span>
                </div>
                <div className="text-left p-3 rounded-lg bg-slate-950/40">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Formatting</span>
                  <span className="text-lg font-extrabold text-purple-400 mt-1 block">{resumeData.analysis?.formatting_score}%</span>
                </div>
              </div>
            </div>

            {/* Keyword breakdown card */}
            <div className="glass p-6 rounded-2xl">
              <h3 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-4">Suggested Keywords</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Adding these missing terms will increase your compatibilities on resume parser systems:
              </p>
              <div className="flex flex-wrap gap-2">
                {resumeData.analysis?.analysis_json?.suggested_keywords?.map((k: string) => (
                  <span key={k} className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-indigo-300 font-semibold">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel Tabs */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Tabs Selector */}
            <div className="glass p-1 rounded-xl flex gap-1">
              <button 
                onClick={() => setActiveTab('scores')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'scores' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Score Summary
              </button>
              <button 
                onClick={() => setActiveTab('ats')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'ats' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
              >
                ATS Breakdown
              </button>
              <button 
                onClick={() => setActiveTab('suggestions')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'suggestions' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
              >
                AI Rewrite Suggestions ({improvements.length})
              </button>
            </div>

            {/* Scores summary Content */}
            {activeTab === 'scores' && (
              <div className="glass p-6 rounded-2xl flex flex-col gap-6">
                <div>
                  <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider mb-4">Core Strengths</h3>
                  <ul className="space-y-3">
                    {resumeData.analysis?.analysis_json?.strengths?.map((str: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <hr className="border-slate-900" />

                <div>
                  <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider mb-4">Areas for Improvement</h3>
                  <ul className="space-y-3">
                    {resumeData.analysis?.analysis_json?.weaknesses?.map((weak: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed">
                        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{weak}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* ATS breakdown Content */}
            {activeTab === 'ats' && (
              <div className="glass p-6 rounded-2xl flex flex-col gap-6">
                <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider mb-4">ATS Compatibility Breakdown</h3>
                
                <div className="space-y-4">
                  {[
                    { label: 'Keywords Density', score: resumeData.analysis?.keyword_score },
                    { label: 'Skills Alignment', score: resumeData.analysis?.skills_score },
                    { label: 'Formatting Integrity', score: resumeData.analysis?.formatting_score },
                    { label: 'Experience Depth', score: resumeData.analysis?.experience_score }
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs font-semibold mb-2">
                        <span className="text-slate-400">{item.label}</span>
                        <span className="text-slate-200">{item.score}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full gradient-accent" style={{ width: `${item.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-900 mt-4">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-2">Parser Diagnosis</span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    The document exhibits clean section demarcation and is highly readable. Adding specialized developer keywords like Docker/AWS ECS in active phrases will optimize match frequencies.
                  </p>
                </div>
              </div>
            )}

            {/* Rewrite Suggestions Content */}
            {activeTab === 'suggestions' && (
              <div className="flex flex-col gap-6">
                {improvements.length === 0 ? (
                  <div className="glass p-8 rounded-2xl text-center text-xs text-slate-500">
                    No active rewrite suggestions computed. Make sure your uploaded resume lists summary/experience sections.
                  </div>
                ) : (
                  improvements.map((imp, idx) => (
                    <div key={idx} className="glass p-6 rounded-2xl flex flex-col gap-4 relative overflow-hidden">
                      <div className="absolute top-0 left-0 h-1 w-12 bg-indigo-500" />
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded">
                          {imp.section}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-900">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Current Resume Text</span>
                          <p className="text-xs text-slate-400 leading-relaxed italic">"{imp.current}"</p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 relative group">
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">AI Professional Suggestion</span>
                          <p className="text-xs text-slate-200 leading-relaxed font-medium">"{imp.suggestion}"</p>
                          <button 
                            onClick={() => copyToClipboard(imp.suggestion, idx)}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-950 border border-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title="Copy Suggestion"
                          >
                            {copiedId === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-900/30 border border-slate-950 text-xs text-slate-400 leading-relaxed">
                        <strong className="text-slate-300">Why? </strong>{imp.why}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResumeAnalyzer() {
  return (
    <Suspense fallback={<div className="text-slate-400">Loading Resume Analyzer...</div>}>
      <AnalyzerContent />
    </Suspense>
  );
}
