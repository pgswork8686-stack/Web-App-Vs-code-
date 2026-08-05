'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useProfile } from '../hooks/use-profile';
import { supabase } from '../lib/supabase';
import { 
  Users, Building, ShieldCheck, UserCheck, Briefcase, Clock, FileText, 
  Settings, LogOut, Bell, Menu, X, ChevronRight, LayoutDashboard,
  CheckSquare, FileSpreadsheet, CreditCard, DollarSign, Wallet, FilePlus, AlertCircle
} from 'lucide-react';
import { LoadingState } from '@pgs/ui-web';

interface NavItem {
  name: string;
  href: string;
  icon: any;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: profile, isLoading, error } = useProfile();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Auto redirect on auth check
  useEffect(() => {
    if (error) {
      router.push('/login');
    }
  }, [error, router]);

  // Fetch unread notifications count
  useEffect(() => {
    if (!profile) return;
    const fetchUnreadCount = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const res = await fetch(`${apiBase}/api/notifications/unread-count`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const { data } = await res.json();
          setUnreadCount(data.count);
        }
      } catch (err) {
        console.error('Failed to load notifications count', err);
      }
    };
    fetchUnreadCount();
  }, [profile]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingState />
      </div>
    );
  }

  if (!profile) return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const getNavigation = (role: string): NavItem[] => {
    switch (role) {
      case 'ADMIN':
        return [
          { name: 'Tổng quan', href: '/admin', icon: LayoutDashboard },
          { name: 'Người dùng chờ duyệt', href: '/admin/users/pending', icon: UserCheck },
          { name: 'Quản lý Người dùng', href: '/admin/users', icon: Users },
          { name: 'Phòng ban', href: '/admin/departments', icon: Building },
          { name: 'Phân quyền', href: '/admin/permissions', icon: ShieldCheck },
          { name: 'Nhân sự', href: '/admin/employees', icon: Users },
          { name: 'Khách hàng', href: '/admin/customers', icon: Building },
          { name: 'Dự án', href: '/admin/projects', icon: Briefcase },
          { name: 'Chấm công', href: '/admin/attendance', icon: Clock },
          { name: 'Kỳ công & Lương', href: '/admin/payroll', icon: DollarSign },
          { name: 'Tài liệu', href: '/admin/docs', icon: FileText },
          { name: 'Audit Log', href: '/admin/audit-logs', icon: FileText },
          { name: 'Cấu hình', href: '/admin/settings', icon: Settings },
        ];
      case 'MANAGER':
        return [
          { name: 'Tổng quan', href: '/manager', icon: LayoutDashboard },
          { name: 'Chấm công của tôi', href: '/manager/my-attendance', icon: Clock },
          { name: 'Chấm công phòng ban', href: '/manager/dept-attendance', icon: Users },
          { name: 'Dự án', href: '/manager/projects', icon: Briefcase },
          { name: 'Công việc', href: '/manager/tasks', icon: CheckSquare },
          { name: 'Yêu cầu chờ duyệt', href: '/manager/approvals', icon: UserCheck },
          { name: 'Deliverable', href: '/manager/deliverables', icon: FileSpreadsheet },
          { name: 'Ticket khách hàng', href: '/manager/tickets', icon: AlertCircle },
          { name: 'Nghỉ phép', href: '/manager/leaves', icon: Clock },
          { name: 'Báo cáo', href: '/manager/reports', icon: FileText },
        ];
      case 'EMPLOYEE':
        return [
          { name: 'Trang chủ', href: '/employee', icon: LayoutDashboard },
          { name: 'Chấm công', href: '/employee/attendance', icon: Clock },
          { name: 'Việc của tôi', href: '/employee/tasks', icon: CheckSquare },
          { name: 'Dự án của tôi', href: '/employee/projects', icon: Briefcase },
          { name: 'Báo cáo', href: '/employee/reports', icon: FileText },
          { name: 'Nghỉ phép', href: '/employee/leaves', icon: Clock },
          { name: 'Tạm ứng', href: '/employee/advances', icon: Wallet },
          { name: 'Lương của tôi', href: '/employee/salary', icon: DollarSign },
          { name: 'File tài liệu', href: '/employee/files', icon: FileText },
          { name: 'Thông báo', href: '/notifications', icon: Bell },
        ];
      case 'ACCOUNTANT':
        return [
          { name: 'Tổng quan', href: '/accounting', icon: LayoutDashboard },
          { name: 'Chấm công của tôi', href: '/accounting/my-attendance', icon: Clock },
          { name: 'Thống kê chấm công', href: '/accounting/attendance-stats', icon: Users },
          { name: 'Kỳ công', href: '/accounting/periods', icon: FileSpreadsheet },
          { name: 'Mức lương', href: '/accounting/salaries', icon: DollarSign },
          { name: 'Kỳ lương', href: '/accounting/payrolls', icon: CreditCard },
          { name: 'Tạm ứng', href: '/accounting/advances', icon: Wallet },
          { name: 'Thanh toán lương', href: '/accounting/payments', icon: DollarSign },
          { name: 'Hóa đơn', href: '/accounting/invoices', icon: FileSpreadsheet },
          { name: 'Thanh toán', href: '/accounting/transactions', icon: CreditCard },
          { name: 'Công nợ', href: '/accounting/debts', icon: AlertCircle },
          { name: 'Báo cáo', href: '/accounting/reports', icon: FileText },
        ];
      case 'CLIENT':
        return [
          { name: 'Trang chủ', href: '/client', icon: LayoutDashboard },
          { name: 'Dự án', href: '/client/projects', icon: Briefcase },
          { name: 'Việc cần xử lý', href: '/client/tasks', icon: CheckSquare },
          { name: 'Deliverable', href: '/client/deliverables', icon: FileSpreadsheet },
          { name: 'Phản hồi', href: '/client/feedback', icon: FileSpreadsheet },
          { name: 'Hỗ trợ Ticket', href: '/client/tickets', icon: AlertCircle },
          { name: 'File tài liệu', href: '/client/files', icon: FileText },
          { name: 'Hóa đơn', href: '/client/invoices', icon: FileSpreadsheet },
          { name: 'Thanh toán', href: '/client/payments', icon: CreditCard },
          { name: 'Dự án giới thiệu', href: '/client/referrals', icon: Users },
          { name: 'Thông báo', href: '/notifications', icon: Bell },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavigation(profile.role?.code || '');

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className={`bg-slate-900 text-slate-300 w-64 flex-shrink-0 transition-all duration-300 flex flex-col border-r border-slate-800 ${sidebarOpen ? 'ml-0' : '-ml-64'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-400 text-white font-bold flex items-center justify-center text-sm shadow-md">
              PGS
            </div>
            <span className="font-bold text-white text-base tracking-tight">PGS Hub</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive 
                    ? 'bg-gradient-to-r from-slate-800 to-slate-800/60 text-white border-l-2 border-indigo-400' 
                    : 'hover:bg-slate-800/40 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-white'}`} />
                  <span>{item.name}</span>
                </div>
                <ChevronRight className={`h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'text-indigo-400' : ''}`} />
              </a>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-850 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold text-white uppercase">
              {profile.full_name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{profile.full_name}</p>
              <p className="text-[10px] text-slate-500 truncate">{profile.role?.name || 'Chưa gán vai trò'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800/50 transition-colors"
            title="Đăng xuất"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar Header */}
        <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="text-sm font-medium text-slate-500">
              Trang quản trị / <span className="text-slate-900 font-semibold">{pathname.split('/').pop() || 'Tổng quan'}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => router.push('/notifications')}
                className="p-2 rounded-full text-slate-600 hover:bg-slate-100 transition-colors relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            <div className="h-8 w-px bg-slate-200" />

            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-900">{profile.full_name}</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{profile.role?.code}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-700">
                {profile.full_name?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
