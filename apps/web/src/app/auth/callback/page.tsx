'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { LoadingState } from '@pgs/ui-web';
import { env } from '../../../config/env';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Xác thực không thành công.';
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [statusText, setStatusText] = useState('Đang thiết lập phiên đăng nhập...');
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          throw new Error(error?.message || 'Không tìm thấy phiên đăng nhập Supabase.');
        }

        setStatusText('Đang đồng bộ hồ sơ người dùng...');
        const apiBase = env.NEXT_PUBLIC_API_URL;
        
        // POST /auth/bootstrap to idempotent register/bootstrap
        const res = await fetch(`${apiBase}/api/auth/bootstrap`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({})
        });

        if (res.status === 401) {
          router.push('/login');
          return;
        }

        if (!res.ok) {
          throw new Error(`Đồng bộ dữ liệu người dùng thất bại (Mã lỗi: ${res.status}).`);
        }

        const json = await res.json();
        const profile = json.data;

        if (!profile) {
          throw new Error('Dữ liệu hồ sơ không hợp lệ từ hệ thống.');
        }

        // Redirect based on profile status and role
        if (profile.status === 'PENDING_ASSIGNMENT') {
          router.push('/pending-access');
          return;
        }

        if (profile.status === 'SUSPENDED' || profile.status === 'DISABLED') {
          router.push('/unauthorized');
          return;
        }

        if (!profile.role) {
          // ACTIVE but no role is a configuration error
          router.push('/unauthorized');
          return;
        }

        // Role-based routing
        const role = profile.role.code;
        switch (role) {
          case 'ADMIN':
            router.push('/admin');
            break;
          case 'MANAGER':
            router.push('/manager');
            break;
          case 'EMPLOYEE':
            router.push('/employee');
            break;
          case 'ACCOUNTANT':
            router.push('/accounting');
            break;
          case 'CLIENT':
            router.push('/client');
            break;
          default:
            router.push('/unauthorized');
        }
      } catch (err: unknown) {
        setErrorText(getErrorMessage(err));
      }
    };

    handleAuthCallback();
  }, [router]);

  if (errorText) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-2xl border border-red-100 p-6 shadow-md text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Đăng nhập thất bại</h2>
          <p className="text-slate-600 text-sm mb-4">{errorText}</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 py-2 rounded-lg text-sm"
          >
            Quay về trang đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <LoadingState message={statusText} />
    </div>
  );
}
