'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Briefcase, MapPin, ListPlus } from 'lucide-react';
import { api } from '@/lib/api';
import { ToastProvider, useToast } from '@/components/Toast';

function OnboardingContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [role, setRole] = useState('');
  const [years, setYears] = useState(0);
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [industry, setIndustry] = useState('');
  const [workType, setWorkType] = useState('Remote');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Save profile details
      await api.request('/profile', {
        method: 'PUT',
        body: JSON.stringify({
          target_role: role,
          experience_years: years,
          location: location,
          preferred_industry: industry,
          preferred_work_type: workType
        }),
      });

      // 2. Save skills if provided
      if (skills) {
        const skillsArray = skills.split(',').map(s => ({
          name: s.trim(),
          proficiency: 'Intermediate'
        })).filter(s => s.name);
        
        await api.request('/profile/skills', {
          method: 'PUT',
          body: JSON.stringify({ skills: skillsArray }),
        });
      }

      toast('Profile configured successfully!', 'success');
      router.push('/dashboard');
    } catch (err: any) {
      toast('Failed to save profile configs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    toast('Onboarding skipped. You can configure this later.', 'info');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none w-[400px] h-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      
      <div className="glass max-w-lg w-full p-8 rounded-2xl relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="gradient-accent p-2 rounded-lg text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight gradient-text">CareerLens AI</span>
          </div>
          <button 
            onClick={handleSkip}
            className="text-xs text-slate-500 hover:text-slate-300 font-semibold"
          >
            Skip Onboarding
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold">Personalize Your Matcher</h2>
          <p className="text-sm text-slate-400 mt-1">Specify your target role parameters to boost AI matches</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Target Job Title</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Software Engineer"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Years of Experience</label>
              <input
                type="number"
                min="0"
                value={years}
                onChange={(e) => setYears(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Remote / New York"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Work Style</label>
              <select
                value={workType}
                onChange={(e) => setWorkType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Industry Sector</label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Fintech, Healthcare, SaaS"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
              Primary Skills (comma-separated)
            </label>
            <div className="relative">
              <ListPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, TypeScript, FastAPI, PostgreSQL"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold bg-white text-[#090a0f] hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 mt-6 cursor-pointer"
          >
            <span>{loading ? 'Saving configs...' : 'Finish Setup'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <ToastProvider>
      <OnboardingContent />
    </ToastProvider>
  );
}
