'use client';

import React from 'react';
import AppShell from '@/components/app-shell';
import QueryProvider from '@/components/query-provider';
import { UserCheck, Shield, Users, Building, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

function AdminOverview() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tổng quan quản trị</h1>
        <p className="text-slate-500 text-sm mt-1">Quản lý tài khoản, phòng ban, và phân quyền PGS Hub</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => router.push('/admin/users/pending')}
          className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">Tài khoản chờ duyệt</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">Duyệt</h3>
            </div>
            <div className="h-12 w-12 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <UserCheck className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-indigo-600">
            <span>Đi tới phê duyệt</span>
            <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">Quy tắc phân quyền</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">5 Roles</h3>
            </div>
            <div className="h-12 w-12 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center">
              <Shield className="h-6 w-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">ADMIN, MANAGER, EMPLOYEE, ACCOUNTANT, CLIENT</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">Phòng ban nội bộ</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">4 nhóm</h3>
            </div>
            <div className="h-12 w-12 rounded-lg bg-cyan-50 text-cyan-500 flex items-center justify-center">
              <Building className="h-6 w-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">Thiết kế Website, SEO, Facebook, YouTube</p>
        </div>
      </div>

      {/* System Status Section */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-lg font-bold">Nền tảng PGS Hub đang chạy ở chế độ local</h3>
          <p className="text-slate-400 text-sm mt-2 max-w-xl">
            Tất cả các module quản trị tài khoản, danh mục và cấu hình phân quyền hệ thống đã sẵn sàng hoạt động. 
            Vui lòng đăng nhập Google OAuth và phân loại quyền cho nhân viên.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-indigo-500/20 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <QueryProvider>
      <AppShell>
        <AdminOverview />
      </AppShell>
    </QueryProvider>
  );
}
