'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/app-shell';
import QueryProvider from '@/components/query-provider';
import { supabase } from '@/lib/supabase';
import { LoadingState } from '@pgs/ui-web';
import { Bell, MailOpen, CheckCircle, Archive } from 'lucide-react';

function NotificationsList() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const fetchNotifications = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const headers = { 'Authorization': `Bearer ${session.access_token}` };
      const res = await fetch(`${apiBase}/api/notifications`, { headers });
      if (res.ok) {
        const { data } = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      await fetch(`${apiBase}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Thông báo</h1>
          <p className="text-slate-500 text-sm mt-1">Xem tất cả các thông báo và cảnh báo từ hệ thống PGS Hub</p>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-xl p-8 text-center space-y-3">
          <Bell className="h-10 w-10 text-slate-400 mx-auto" />
          <h3 className="text-lg font-semibold text-slate-950">Hộp thư trống</h3>
          <p className="text-slate-500 text-sm">Bạn chưa nhận được bất kỳ thông báo nào.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden divide-y divide-slate-100 shadow-sm">
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                notif.read_at ? 'bg-white' : 'bg-indigo-50/20 hover:bg-indigo-50/40'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${notif.read_at ? 'bg-transparent' : 'bg-indigo-500'}`} />
                  <h4 className="font-semibold text-slate-900 text-sm">{notif.title}</h4>
                </div>
                <p className="text-xs text-slate-650 pl-4">{notif.body}</p>
                <p className="text-[10px] text-slate-400 pl-4">{new Date(notif.created_at).toLocaleString('vi-VN')}</p>
              </div>

              {!notif.read_at && (
                <button
                  onClick={() => handleMarkRead(notif.id)}
                  className="text-slate-400 hover:text-slate-950 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Đánh dấu đã đọc"
                >
                  <MailOpen className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <QueryProvider>
      <AppShell>
        <NotificationsList />
      </AppShell>
    </QueryProvider>
  );
}
