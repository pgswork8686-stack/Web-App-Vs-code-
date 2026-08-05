'use client';

import React from 'react';
import AppShell from '@/components/app-shell';
import QueryProvider from '@/components/query-provider';

function ManagerDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Bảng điều khiển Quản lý</h1>
        <p className="text-slate-500 text-sm mt-1">Quản lý chấm công phòng ban, phê duyệt nghỉ phép và giám sát dự án</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-950">Yêu cầu chờ duyệt</h3>
          <p className="text-slate-500 text-xs">Các yêu cầu nghỉ phép, chấm công hoặc báo cáo của nhân sự phòng ban đang chờ phê duyệt.</p>
          <div className="bg-slate-50 text-slate-500 text-xs p-4 rounded-lg text-center font-medium border border-dashed border-slate-200">
            Hiện không có yêu cầu nào cần xử lý.
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-950">Dự án & deliverables</h3>
          <p className="text-slate-500 text-xs">Tổng hợp danh sách các deliverables cần bàn giao hoặc xem xét phản hồi từ khách hàng.</p>
          <div className="bg-slate-50 text-slate-500 text-xs p-4 rounded-lg text-center font-medium border border-dashed border-slate-200">
            Không có deliverables cần duyệt.
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
        <ManagerDashboard />
      </AppShell>
    </QueryProvider>
  );
}
