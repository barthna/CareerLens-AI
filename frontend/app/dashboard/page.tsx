'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, Briefcase, Award, AlertTriangle, 
  BarChart3, TrendingUp, CheckCircle
} from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

export default function DashboardOverview() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    resume_score: 0,
    ats_score: 0,
    job_matches: 0,
    missing_skills: 0,
    profile_strength: 0
  });

  const [analytics, setAnalytics] = useState<any>({
    resume_score_history: [],
    job_match_distribution: { excellent: 0, good: 0, moderate: 0, low: 0 },
    skills_overview: [],
    weekly_activity: []
  });

  useEffect(() => {
    async function loadData() {
      const isDemo = localStorage.getItem('demo_mode') === 'true';
      if (isDemo) {
        // Load Sandbox Demo Data
        setTimeout(() => {
          setSummary({
            resume_score: 87,
            ats_score: 92,
            job_matches: 24,
            missing_skills: 7,
            profile_strength: 89
          });
          setAnalytics({
            resume_score_history: [
              { date: 'June 1', score: 72 },
              { date: 'June 15', score: 78 },
              { date: 'July 1', score: 81 },
              { date: 'July 20', score: 87 }
            ],
            job_match_distribution: { excellent: 4, good: 12, moderate: 6, low: 2 },
            skills_overview: [
              { skill: 'React', level: 90 },
              { skill: 'TypeScript', level: 85 },
              { skill: 'Python', level: 75 },
              { skill: 'FastAPI', level: 80 },
              { skill: 'Docker', level: 60 }
            ],
            weekly_activity: [
              { day: 'Mon', count: 1 },
              { day: 'Tue', count: 3 },
              { day: 'Wed', count: 2 },
              { day: 'Thu', count: 5 },
              { day: 'Fri', count: 4 },
              { day: 'Sat', count: 0 },
              { day: 'Sun', count: 1 }
            ]
          });
          setLoading(false);
        }, 800);
        return;
      }

      try {
        const sumData = await api.request('/dashboard/summary');
        const analData = await api.request('/dashboard/analytics');
        setSummary(sumData);
        setAnalytics(analData);
      } catch (err: any) {
        toast('Failed to load dashboard data.', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [toast]);

  // Color constants for charts
  const COLORS = ['#8b5cf6', '#6366f1', '#a5b4fc', '#475569'];

  const pieData = [
    { name: 'Excellent Match', value: analytics.job_match_distribution.excellent },
    { name: 'Good Match', value: analytics.job_match_distribution.good },
    { name: 'Moderate Match', value: analytics.job_match_distribution.moderate },
    { name: 'Low Match', value: analytics.job_match_distribution.low },
  ].filter(item => item.value > 0);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 bg-slate-900 rounded-lg w-48 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-900 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
          <div className="h-80 bg-slate-900 rounded-2xl" />
          <div className="h-80 bg-slate-900 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Overview Dashboard</h1>
        <p className="text-xs text-slate-400 mt-1">Real-time statistics & compatibility scoring diagnostics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="glass p-5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Resume Score</span>
            <span className="text-2xl font-extrabold text-white mt-1 block">{summary.resume_score} <span className="text-xs font-semibold text-slate-500">/ 100</span></span>
          </div>
          <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="glass p-5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ATS Score</span>
            <span className="text-2xl font-extrabold text-white mt-1 block">{summary.ats_score}%</span>
          </div>
          <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="glass p-5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Job Matches</span>
            <span className="text-2xl font-extrabold text-white mt-1 block">{summary.job_matches}</span>
          </div>
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="glass p-5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Missing Skills</span>
            <span className="text-2xl font-extrabold text-slate-300 mt-1 block">{summary.missing_skills}</span>
          </div>
          <div className="p-3 rounded-lg bg-red-500/10 text-red-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="glass p-5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Profile Strength</span>
            <span className="text-2xl font-extrabold text-white mt-1 block">{summary.profile_strength}%</span>
          </div>
          <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-300">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Score History */}
        <div className="glass p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider">Resume Score History</h3>
            <span className="text-xs text-indigo-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Standard Progression</span>
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.resume_score_history}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#475569" fontSize={11} />
                <YAxis stroke="#475569" fontSize={11} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#11131e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8' }}
                  itemStyle={{ color: '#8b5cf6' }}
                />
                <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Job Matches distribution */}
        <div className="glass p-6 rounded-2xl">
          <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider mb-6">Job Match Distribution</h3>
          <div className="h-64 w-full flex flex-col sm:flex-row items-center justify-center gap-6">
            {pieData.length > 0 ? (
              <>
                <div className="w-1/2 h-full min-h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#11131e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {pieData.map((item, idx) => (
                    <div key={item.name} className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span>{item.name}: <strong className="text-slate-200">{item.value}</strong></span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <span className="text-xs text-slate-500">No match records logged.</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Skills Overview */}
        <div className="glass p-6 rounded-2xl">
          <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider mb-6">Skills Mastery level</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.skills_overview}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="skill" stroke="#475569" fontSize={11} />
                <YAxis stroke="#475569" fontSize={11} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#11131e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                  itemStyle={{ color: '#6366f1' }}
                />
                <Bar dataKey="level" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="glass p-6 rounded-2xl">
          <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider mb-6">Weekly Platform Activity</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.weekly_activity}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#475569" fontSize={11} />
                <YAxis stroke="#475569" fontSize={11} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#11131e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                  itemStyle={{ color: '#a5b4fc' }}
                />
                <Bar dataKey="count" fill="#a5b4fc" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
