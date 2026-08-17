'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { ToastProvider, useToast } from '@/components/Toast';

function ForgotPasswordContent() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [devToken, setDevToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    try {
      const response = await api.request('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setSuccess(true);
      if (response.token) {
        setDevToken(response.token);
      }
      toast('Verification token sent!', 'success');
    } catch (err: any) {
      toast(err.error?.message || 'Error occurred.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex items-center justify-center p-6 relative">
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
              <h2 className="text-2xl font-bold">Reset Password</h2>
              <p className="text-sm text-slate-400 mt-1">Enter your email and we'll send a password recovery token</p>
            </div>

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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold bg-white text-[#090a0f] hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 mt-6 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Sending...' : 'Send Recovery Token'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold">Email Generated</h2>
            <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto">
              If an account matches your email address, you will find instructions to reset your password.
            </p>

            {devToken && (
              <div className="mt-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-left">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 block mb-1">Developer Testing Token</span>
                <code className="text-xs text-slate-300 break-all select-all font-mono">{devToken}</code>
                <Link 
                  href={`/reset-password?token=${devToken}`}
                  className="mt-3 block text-center text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 py-2 rounded-lg transition-colors"
                >
                  Proceed to Reset Page with Token
                </Link>
              </div>
            )}
          </div>
        )}

        <p className="text-center text-sm text-slate-500 mt-6">
          Back to{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <ToastProvider>
      <ForgotPasswordContent />
    </ToastProvider>
  );
}
