'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, Trash2, Download, RefreshCw, Edit2, 
  Calendar, Award, ArrowUpRight, Search, Plus
} from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/Toast';

export default function MyResumes() {
  const { toast } = useToast();
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newName, setNewName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const loadResumes = async () => {
    const isDemo = localStorage.getItem('demo_mode') === 'true';
    if (isDemo) {
      setResumes([
        {
          id: 101,
          filename: 'software_engineer_cv.pdf',
          file_type: 'pdf',
          created_at: new Date().toISOString(),
          analysis: {
            overall_score: 87,
            ats_score: 92,
          }
        },
        {
          id: 102,
          filename: 'product_manager_resume.docx',
          file_type: 'docx',
          created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
          analysis: {
            overall_score: 74,
            ats_score: 79,
          }
        }
      ]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await api.request('/resumes');
      // Fetch details to get scores for each
      const detailed = await Promise.all(
        data.map(async (r: any) => {
          try {
            return await api.request(`/resumes/${r.id}`);
          } catch {
            return r;
          }
        })
      );
      setResumes(detailed);
    } catch (err: any) {
      toast('Failed to load resumes catalog.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const handleDownload = (id: number, filename: string) => {
    const isDemo = localStorage.getItem('demo_mode') === 'true';
    if (isDemo) {
      toast('Downloading is simulated in Demo Mode.', 'success');
      return;
    }
    window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/resumes/${id}/download`);
    toast('Download started.', 'success');
  };

  const handleRename = async (id: number) => {
    if (!newName.trim()) return;
    const isDemo = localStorage.getItem('demo_mode') === 'true';
    if (isDemo) {
      setResumes(prev => prev.map(r => r.id === id ? { ...r, filename: newName } : r));
      setEditingId(null);
      toast('Resume renamed (Sandbox).', 'success');
      return;
    }

    try {
      await api.request(`/resumes/${id}/rename`, {
        method: 'PUT',
        body: JSON.stringify({ filename: newName }),
      });
      toast('Resume renamed successfully.', 'success');
      loadResumes();
      setEditingId(null);
    } catch (err: any) {
      toast('Failed to rename resume.', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this resume? All associated analysis and matches will be lost.')) return;
    const isDemo = localStorage.getItem('demo_mode') === 'true';
    if (isDemo) {
      setResumes(prev => prev.filter(r => r.id !== id));
      toast('Resume deleted (Sandbox).', 'success');
      return;
    }

    try {
      await api.request(`/resumes/${id}`, { method: 'DELETE' });
      toast('Resume deleted successfully.', 'success');
      loadResumes();
    } catch (err: any) {
      toast('Failed to delete resume.', 'error');
    }
  };

  const filteredResumes = resumes.filter(r => 
    r.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">My Resumes</h1>
          <p className="text-xs text-slate-400 mt-1">Manage and inspect your uploaded files</p>
        </div>
        <Link 
          href="/dashboard/analyzer"
          className="gradient-accent text-white px-4 py-2.5 rounded-xl font-bold hover:opacity-90 transition-opacity glow text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Resume</span>
        </Link>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Filter by filename..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-950 border border-slate-900 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 bg-slate-900 rounded-2xl" />
          ))}
        </div>
      ) : filteredResumes.length === 0 ? (
        <div className="glass p-12 rounded-2xl text-center max-w-lg mx-auto w-full mt-10">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold">No Resumes Found</h3>
          <p className="text-sm text-slate-400 mt-2 mb-6">
            Upload your first resume to start analyzing your career profile.
          </p>
          <Link href="/dashboard/analyzer" className="gradient-accent text-white px-5 py-2.5 rounded-xl font-bold hover:opacity-90 inline-flex items-center gap-2">
            Get Started
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResumes.map((r) => (
            <div key={r.id} className="glass p-5 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-center text-indigo-400 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>

                  {r.analysis?.overall_score ? (
                    <div className="text-right">
                      <div className="inline-flex items-center gap-1 bg-indigo-500/10 px-2.5 py-1 rounded-full text-indigo-300 text-xs font-semibold border border-indigo-500/15">
                        <Award className="w-3 h-3" />
                        <span>Score {r.analysis.overall_score}</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-[10px] bg-slate-900 text-slate-500 px-2 py-1 rounded-md">Pending</span>
                  )}
                </div>

                {editingId === r.id ? (
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-slate-950 border border-slate-850 px-2.5 py-1 rounded-md text-xs text-white focus:outline-none"
                    />
                    <button 
                      onClick={() => handleRename(r.id)}
                      className="text-xs text-emerald-400 font-bold"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => setEditingId(null)}
                      className="text-xs text-slate-500"
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <h3 className="font-semibold text-slate-200 text-sm truncate pr-6 group-hover:text-white transition-colors">{r.filename}</h3>
                )}

                <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(r.created_at).toLocaleDateString()}</span>
                  </span>
                  <span className="uppercase text-[10px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-850 text-slate-400">
                    {r.file_type}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-900 pt-4 mt-6">
                <Link 
                  href={`/dashboard/analyzer?id=${r.id}`}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <span>View Details</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      setEditingId(r.id);
                      setNewName(r.filename);
                    }}
                    className="text-slate-400 hover:text-slate-200"
                    title="Rename"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDownload(r.id, r.filename)}
                    className="text-slate-400 hover:text-slate-200"
                    title="Download Original"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(r.id)}
                    className="text-red-400 hover:text-red-300"
                    title="Delete"
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
