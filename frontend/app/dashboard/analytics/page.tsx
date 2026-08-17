'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { api } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { TrendingUp, BarChart3, PieChart, Info } from 'lucide-react';

export default function AnalyticsDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>({
    resume_score_history: [],
    skills_overview: [],
    weekly_activity: []
  });

  useEffect(() => {
    async function loadData() {
      const isDemo = localStorage.getItem('demo_mode') === 'true';
      if (isDemo) {
        setTimeout(() => {
          setAnalytics({
            resume_score_history: [
              { date: 'June 1', score: 72 },
              { date: 'June 15', score: 78 },
              { date: 'July 1', score: 81 },
              { date: 'July 20', score: 87 }
            ],
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
        }, 600);
        return;
      }

      try {
        const analData = await api.request('/dashboard/analytics');
        setAnalytics(analData);
      } catch (err) {
        toast('Failed to load analytics details.', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 bg-slate-900 rounded-lg w-48 mb-4" />
        <div className="h-80 bg-slate-900 rounded-2xl" />
        <div className="h-80 bg-slate-900 rounded-2xl mt-6" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Detailed Analytics</h1>
        <p className="text-xs text-slate-400 mt-1">Audit score trajectories, skill indexes, and platform activity metrics</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Core Resume Score History Chart */}
        <div className="glass p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4 text-indigo-400 font-semibold">
            <TrendingUp className="w-5 h-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Historical Resume Score Progression</h3>
          </div>
          <p className="text-xs text-slate-500 mb-6 max-w-xl">
            Displays score evaluation metrics across successive uploads. A rising slope indicates successful keyword additions and better ATS readability.
          </p>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.resume_score_history}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#475569" fontSize={11} />
                <YAxis stroke="#475569" fontSize={11} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#11131e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                  itemStyle={{ color: '#8b5cf6' }}
                />
                <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: '#8b5cf6', strokeWidth: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skills Metrics bar */}
        <div className="glass p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4 text-indigo-400 font-semibold">
            <BarChart3 className="w-5 h-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Core Skills Index Evaluation</h3>
          </div>
          <p className="text-xs text-slate-500 mb-6 max-w-xl">
            A semantic score mapping representing your matching levels on core target role technologies.
          </p>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.skills_overview}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="skill" stroke="#475569" fontSize={11} />
                <YAxis stroke="#475569" fontSize={11} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#11131e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                  itemStyle={{ color: '#6366f1' }}
                />
                <Bar dataKey="level" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
