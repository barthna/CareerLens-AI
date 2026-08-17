'use client';

import React, { useState, useEffect } from 'react';
import { User, Briefcase, MapPin, ListPlus, Shield, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/Toast';

export default function UserProfile() {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [years, setYears] = useState(0);
  const [location, setLocation] = useState('');
  const [industry, setIndustry] = useState('');
  const [workType, setWorkType] = useState('Remote');
  const [skillsText, setSkillsText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const isDemo = localStorage.getItem('demo_mode') === 'true';
      if (isDemo) {
        setName('Demo Visitor');
        setEmail('demo@careerlens.ai');
        setRole('Full Stack Engineer');
        setYears(3);
        setLocation('San Francisco, CA');
        setIndustry('SaaS');
        setWorkType('Remote');
        setSkillsText('React, TypeScript, Node.js, PostgreSQL, Docker');
        return;
      }

      try {
        const user = await api.request('/profile');
        setName(user.name);
        setEmail(user.email);
        
        if (user.profile) {
          setRole(user.profile.target_role || '');
          setYears(user.profile.experience_years || 0);
          setLocation(user.profile.location || '');
          setIndustry(user.profile.preferred_industry || '');
          setWorkType(user.profile.preferred_work_type || 'Remote');
        }

        const userSkills = await api.request('/profile/skills');
        if (userSkills && userSkills.length > 0) {
          setSkillsText(userSkills.map((s: any) => s.name).join(', '));
        }
      } catch (err: any) {
        toast('Failed to load profile details.', 'error');
      }
    }
    loadProfile();
  }, [toast]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const isDemo = localStorage.getItem('demo_mode') === 'true';
    if (isDemo) {
      setTimeout(() => {
        setSaving(false);
        toast('Profile updated successfully (Sandbox).', 'success');
      }, 600);
      return;
    }

    try {
      // 1. Update Profile details
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

      // 2. Update user skills
      const skillsArray = skillsText.split(',').map(s => ({
        name: s.trim(),
        proficiency: 'Intermediate'
      })).filter(s => s.name);
      
      await api.request('/profile/skills', {
        method: 'PUT',
        body: JSON.stringify({ skills: skillsArray }),
      });

      toast('Profile updated successfully.', 'success');
    } catch (err: any) {
      toast('Failed to save profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">My Profile</h1>
        <p className="text-xs text-slate-400 mt-1">Configure your primary professional coordinate details</p>
      </div>

      <form onSubmit={handleSave} className="glass p-6 md:p-8 rounded-2xl flex flex-col gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4 pb-6 border-b border-slate-900">
          <div className="w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xl">
            {name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-lg">{name}</h3>
            <p className="text-xs text-slate-500">{email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Target Job Title</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
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
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Preferred Work Style</label>
            <select
              value={workType}
              onChange={(e) => setWorkType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none"
            >
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Target Industry</label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Primary Core Skills (Comma-separated)</label>
            <div className="relative">
              <ListPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto self-end px-8 py-3.5 rounded-xl font-bold bg-white text-[#090a0f] hover:bg-slate-100 transition-colors mt-4 cursor-pointer"
        >
          <span>{saving ? 'Saving Profile...' : 'Save Profile Details'}</span>
        </button>
      </form>
    </div>
  );
}
