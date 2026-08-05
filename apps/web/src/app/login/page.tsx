'use client';

import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { env } from '../../config/env';
import { Chrome } from 'lucide-react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
      });
      if (err) throw err;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi bắt đầu đăng nhập bằng Google.';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-950 px-4">
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 text-white font-bold text-2xl shadow-lg shadow-cyan-500/20 mb-4">
            PGS
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">PGS Hub</h1>
          <p className="text-sm text-slate-400 mt-2">Đăng nhập vào hệ thống đại lý & nhân sự nội bộ</p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/30 text-red-200 rounded-lg p-3 text-sm text-center mb-6">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-900 font-semibold h-12 rounded-xl transition-all shadow-md active:scale-[0.98]"
        >
          {loading ? (
            <div className="h-5 w-5 border-2 border-slate-900 border-t-transparent animate-spin rounded-full" />
          ) : (
            <Chrome className="h-5 w-5 text-red-500" />
          )}
          <span>Đăng nhập bằng Google</span>
        </button>

        <div className="mt-8 text-center text-xs text-slate-500">
          Chính sách bảo mật & Điều khoản sử dụng &copy; {new Date().getFullYear()} PGS Agency
        </div>
      </div>
    </div>
  );
}
