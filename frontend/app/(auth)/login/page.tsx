'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Lock, Mail, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import { ToastProvider, useToast } from '@/components/Toast';

function LoginContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await api.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      api.setTokens(response.access_token, response.refresh_token);
      
      // Fetch user profile info
      const profile = await api.request('/profile');
      api.setUser(profile);

      toast('Welcome back to CareerLens AI!', 'success');
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.error?.message || 'Login failed. Please verify credentials.');
      toast('Login failed. Check your inputs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none w-[400px] h-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      
      <div className="glass max-w-md w-full p-8 rounded-2xl relative z-10">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="gradient-accent p-2 rounded-lg text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight gradient-text">CareerLens AI</span>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Welcome Back</h2>
          <p className="text-sm text-slate-400 mt-1">Sign in to resume analysis dashboard</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Password</label>
              <Link href="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold bg-white text-[#090a0f] hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 mt-6 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <span className="text-xs text-slate-600 bg-[#11131e] px-3 relative z-10 uppercase font-semibold">Or continue with</span>
          <hr className="absolute top-1/2 w-full border-slate-800" />
        </div>

        <button
          onClick={() => {
            toast('Google OAuth is simulated for development.', 'info');
          }}
          className="w-full py-3 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-900 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
        >
          <span>Continue with Google</span>
        </button>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account?{' '}
          <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <ToastProvider>
      <LoginContent />
    </ToastProvider>
  );
}
