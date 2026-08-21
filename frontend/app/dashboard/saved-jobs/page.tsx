'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, Trash2, ArrowUpRight, Search, Plus, Sparkles, Briefcase } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/Toast';

export default function SavedJobs() {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Add Job Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [url, setUrl] = useState('');
  const [desc, setDesc] = useState('');

  const loadSavedJobs = async () => {
    const isDemo = localStorage.getItem('demo_mode') === 'true';
    if (isDemo) {
      setJobs([
        {
          id: 201,
          title: 'Full Stack Engineer',
          company: 'Stripe',
          job_url: 'https://stripe.com/jobs',
          description: 'Looking for a generalist engineer with deep expertise in React and Python.',
          created_at: new Date().toISOString()
        },
        {
          id: 202,
          title: 'Senior Frontend Developer',
          company: 'Vercel',
          job_url: 'https://vercel.com/careers',
          description: 'Work on building the next generation of Next.js features and layouts.',
          created_at: new Date(Date.now() - 86400000 * 3).toISOString()
        }
      ]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await api.request('/jobs/saved');
      setJobs(data);
    } catch (err) {
      toast('Failed to load saved jobs catalog.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedJobs();
  }, []);

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !company) return;

    const isDemo = localStorage.getItem('demo_mode') === 'true';
    if (isDemo) {
      const newJob = {
        id: Math.random(),
        title,
        company,
        job_url: url,
        description: desc,
        created_at: new Date().toISOString()
      };
      setJobs(prev => [newJob, ...prev]);
      setShowAddForm(false);
      setTitle('');
      setCompany('');
      setUrl('');
      setDesc('');
      toast('Job saved to sandbox.', 'success');
      return;
    }

    try {
      await api.request('/jobs/saved', {
        method: 'POST',
        body: JSON.stringify({
          title,
          company,
          job_url: url,
          description: desc
        })
      });
      toast('Job saved successfully.', 'success');
      loadSavedJobs();
      setShowAddForm(false);
      setTitle('');
      setCompany('');
      setUrl('');
      setDesc('');
    } catch (err) {
      toast('Failed to save job.', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    const isDemo = localStorage.getItem('demo_mode') === 'true';
    if (isDemo) {
      setJobs(prev => prev.filter(j => j.id !== id));
      toast('Job removed from sandbox.', 'success');
      return;
    }

    try {
      await api.request(`/jobs/saved/${id}`, { method: 'DELETE' });
      toast('Job deleted.', 'success');
      loadSavedJobs();
    } catch (err) {
      toast('Failed to delete job.', 'error');
    }
  };

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Saved Jobs</h1>
          <p className="text-xs text-slate-400 mt-1">Audit and organize positions you intend to apply for</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="gradient-accent text-white px-4 py-2.5 rounded-xl font-bold text-xs hover:opacity-90 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Cancel' : 'Add Position'}</span>
        </button>
      </div>

      {/* Add Position Form */}
      {showAddForm && (
        <form onSubmit={handleAddJob} className="glass p-6 rounded-2xl max-w-xl flex flex-col gap-4">
          <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold mb-2">
            <Sparkles className="w-4.5 h-4.5" />
            <span>Add Position Details</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Role Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Frontend Engineer"
                className="w-full bg-slate-950 border border-slate-900 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Company</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Stripe"
                className="w-full bg-slate-950 border border-slate-900 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Job posting URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://company.com/job-post"
              className="w-full bg-slate-950 border border-slate-900 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Short Description</label>
            <textarea
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="React and Python requirements description..."
              className="w-full bg-slate-950 border border-slate-900 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto self-end bg-white text-[#090a0f] hover:bg-slate-100 px-6 py-2.5 rounded-xl font-bold text-xs cursor-pointer"
          >
            Save Position
          </button>
        </form>
      )}

      {/* Filter search */}
      <div className="relative max-w-md w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Filter by title or company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-950 border border-slate-900 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Grid listing */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          <div className="h-32 bg-slate-900 rounded-2xl" />
          <div className="h-32 bg-slate-900 rounded-2xl" />
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="glass p-12 rounded-2xl text-center max-w-md mx-auto w-full mt-10">
          <Bookmark className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold">No Saved Jobs</h3>
          <p className="text-sm text-slate-400 mt-2 mb-6">
            Save interesting jobs to compare them later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredJobs.map((j) => (
            <div key={j.id} className="glass p-5 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="font-bold text-slate-200 text-sm group-hover:text-white transition-colors">{j.title}</h3>
                    <span className="text-xs text-indigo-400 font-semibold">{j.company}</span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-center text-slate-400">
                    <Bookmark className="w-4 h-4" />
                  </div>
                </div>

                {j.description && (
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-4">{j.description}</p>
                )}
              </div>

              <div className="flex flex-col gap-3 mt-4 border-t border-slate-900 pt-3">
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/matcher?saved_job_id=${j.id}`}
                    className="flex-1 text-center bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Match Resume</span>
                  </Link>
                  <Link
                    href={`/dashboard/interview-simulator?saved_job_id=${j.id}`}
                    className="flex-1 text-center bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Practice Interview</span>
                  </Link>
                </div>

                <div className="flex items-center justify-between mt-1">
                  {j.job_url ? (
                    <a 
                      href={j.job_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-slate-400 hover:text-slate-200 flex items-center gap-0.5 transition-colors"
                    >
                      <span>Visit Job Page</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-[10px] text-slate-500">No URL link</span>
                  )}

                  <button
                    onClick={() => handleDelete(j.id)}
                    className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition-colors cursor-pointer"
                    title="Remove Job"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
