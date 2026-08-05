'use client';

import React from 'react';
import AppShell from '@/components/app-shell';
import QueryProvider from '@/components/query-provider';

function ClientDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Trang chủ Khách hàng</h1>
        <p className="text-slate-500 text-sm mt-1">Giám sát tiến độ dự án, xem deliverables bàn giao và gửi phản hồi</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-950">Tiến độ Dự án</h3>
          <p className="text-slate-500 text-xs">Tổng quan các mốc thời gian và deliverables đang triển khai của tổ chức.</p>
          <div className="bg-slate-50 text-slate-500 text-xs p-4 rounded-lg text-center font-medium border border-dashed border-slate-200">
            Dự án của bạn đang chạy đúng tiến độ 100%.
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-950">Việc cần xử lý</h3>
          <p className="text-slate-500 text-xs">Các yêu cầu phản hồi hoặc duyệt deliverables đang chờ bạn quyết định.</p>
          <div className="bg-slate-50 text-slate-500 text-xs p-4 rounded-lg text-center font-medium border border-dashed border-slate-200">
            Không có deliverables cần duyệt phản hồi.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <QueryProvider>
      <AppShell>
        <ClientDashboard />
      </AppShell>
    </QueryProvider>
  );
}
