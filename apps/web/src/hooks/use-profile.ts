'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Chưa đăng nhập');
      }

      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiBase}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });

      if (!res.ok) {
        throw new Error('Không thể tải thông tin cá nhân');
      }

      const { data } = await res.json();
      return data;
    },
  });
}
