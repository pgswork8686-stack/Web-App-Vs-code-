'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { Clock, LogOut } from 'lucide-react';

export default function PendingAccessPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white border border-slate-100 rounded-2xl p-8 shadow-xl text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-amber-50 text-amber-500 mb-6">
          <Clock className="h-8 w-8 animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Chờ phân quyền truy cập</h1>
        <p className="text-slate-500 text-sm mt-3 leading-relaxed">
          Tài khoản của bạn đã được đăng ký thành công trên PGS Hub. 
          Vui lòng liên hệ quản trị viên (Admin) để thiết lập vai trò, phòng ban và kích hoạt quyền truy cập trước khi tiếp tục.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold h-11 rounded-xl transition-all"
          >
            Kiểm tra lại trạng thái
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold h-11 rounded-xl transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </div>
  );
}
