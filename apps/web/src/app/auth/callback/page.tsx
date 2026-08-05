'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { LoadingState } from '@pgs/ui-web';

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
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const res = await fetch(`${apiBase}/api/auth/bootstrap`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            auth_user_id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name,
            avatar_url: session.user.user_metadata?.avatar_url,
          }),
        });

        if (!res.ok) {
          throw new Error('Đồng bộ dữ liệu người dùng thất bại.');
        }

        const { data: profile } = await res.json();
        
        // Fetch full profile info using token to inspect roles
        const profileRes = await fetch(`${apiBase}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` },
        });

        if (!profileRes.ok) {
          // If profile fetch fails or still pending, go to pending
          router.push('/pending-access');
          return;
        }

        const { data: fullProfile } = await profileRes.json();
        
        if (fullProfile.status === 'PENDING_ASSIGNMENT' || !fullProfile.role) {
          router.push('/pending-access');
          return;
        }

        if (fullProfile.status === 'SUSPENDED' || fullProfile.status === 'DISABLED') {
          router.push('/unauthorized');
          return;
        }

        // Role-based routing
        const role = fullProfile.role.code;
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
      } catch (err: any) {
        setErrorText(err.message || 'Xác thực không thành công.');
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
