'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Sparkles, ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { ToastProvider, useToast } from '@/components/Toast';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const t = searchParams.get('token');
    if (t) {
      setToken(t);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setErrorMsg('Token is missing. Return to forgot password page.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      await api.request('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, new_password: newPassword }),
      });
      setSuccess(true);
      toast('Password reset successfully!', 'success');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.error?.message || 'Failed to reset password. Token may have expired.');
      toast('Failed to reset password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass max-w-md w-full p-8 rounded-2xl relative z-10">
      <div className="flex items-center gap-2 mb-8 justify-center">
        <div className="gradient-accent p-2 rounded-lg text-white">
          <Sparkles className="w-5 h-5" />
        </div>
        <span className="font-bold text-xl tracking-tight gradient-text">CareerLens AI</span>
      </div>

      {!success ? (
        <>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">New Password</h2>
            <p className="text-sm text-slate-400 mt-1">Set a secure password for your account</p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Reset Token</label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter token from email"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
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
              <span>{loading ? 'Resetting Password...' : 'Reset Password'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </>
      ) : (
        <div className="text-center py-4">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold">Password Reset!</h2>
          <p className="text-sm text-slate-400 mt-2">
            Your password was updated. Redirecting you to login...
          </p>
        </div>
      )}

      <p className="text-center text-sm text-slate-500 mt-6">
        Back to{' '}
        <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#090a0f] text-slate-100 flex items-center justify-center p-6 relative">
        <Suspense fallback={<div className="text-slate-400">Loading form parameters...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </ToastProvider>
  );
}
