'use client';

import React from 'react';
import AppShell from '@/components/app-shell';
import QueryProvider from '@/components/query-provider';

function AccountantDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Bảng điều khiển Kế toán</h1>
        <p className="text-slate-500 text-sm mt-1">Quản lý kỳ công, tính lương nhân viên, thanh toán hóa đơn công nợ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-950">Kỳ công cần chốt</h3>
          <p className="text-slate-500 text-xs">Các kỳ công tháng trước của đại lý đang chờ chốt và tổng hợp bảng tính lương.</p>
          <div className="bg-slate-50 text-slate-500 text-xs p-4 rounded-lg text-center font-medium border border-dashed border-slate-200">
            Tất cả các kỳ công đã được chốt và lập lương đầy đủ.
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-950">Hóa đơn công nợ</h3>
          <p className="text-slate-500 text-xs">Danh sách các hóa đơn đến hạn thu hoặc chi của đại lý.</p>
          <div className="bg-slate-50 text-slate-500 text-xs p-4 rounded-lg text-center font-medium border border-dashed border-slate-200">
            Không có hóa đơn công nợ đến hạn trong tuần này.
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
        <AccountantDashboard />
      </AppShell>
    </QueryProvider>
  );
}
