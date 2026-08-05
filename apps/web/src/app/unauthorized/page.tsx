'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { ShieldAlert, LogOut } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white border border-red-100 rounded-2xl p-8 shadow-xl text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-50 text-red-500 mb-6">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Không có quyền truy cập</h1>
        <p className="text-slate-500 text-sm mt-3 leading-relaxed">
          Tài khoản của bạn hiện bị vô hiệu hóa hoặc không có quyền truy cập ứng dụng này. 
          Vui lòng liên hệ với quản trị viên hệ thống để kiểm tra lại thông tin.
        </p>

        <div className="mt-8">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold h-11 rounded-xl transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </div>
  );
}
