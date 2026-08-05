'use client';

import React from 'react';
import AppShell from '@/components/app-shell';
import QueryProvider from '@/components/query-provider';

function EmployeeDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Trang chủ nhân viên</h1>
        <p className="text-slate-500 text-sm mt-1">Chấm công hàng ngày, xem việc của tôi và gửi yêu cầu nghỉ phép</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-950">Chấm công hôm nay</h3>
          <p className="text-slate-500 text-xs">Vui lòng bấm nút check-in/check-out để ghi nhận thời gian làm việc hàng ngày.</p>
          <div className="flex gap-4">
            <button className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm h-10 rounded-lg">Check-in</button>
            <button className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-sm h-10 rounded-lg">Check-out</button>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-950">Công việc của tôi</h3>
          <p className="text-slate-500 text-xs">Danh sách các nhiệm vụ được giao trong tuần.</p>
          <div className="bg-slate-50 text-slate-500 text-xs p-4 rounded-lg text-center font-medium border border-dashed border-slate-200">
            Tuyệt vời! Bạn đã hoàn thành toàn bộ công việc hôm nay.
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
        <EmployeeDashboard />
      </AppShell>
    </QueryProvider>
  );
}
