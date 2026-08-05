'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/app-shell';
import QueryProvider from '@/components/query-provider';
import { supabase } from '@/lib/supabase';
import { LoadingState } from '@pgs/ui-web';
import { UserCheck, ShieldAlert, Award } from 'lucide-react';

function PendingUsersList() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [accountType, setAccountType] = useState<'INTERNAL' | 'CLIENT'>('INTERNAL');

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const headers = { 'Authorization': `Bearer ${session.access_token}` };

      const [usersRes, rolesRes, deptsRes, orgsRes] = await Promise.all([
        fetch(`${apiBase}/api/admin/users`, { headers }),
        fetch(`${apiBase}/api/roles`, { headers }),
        fetch(`${apiBase}/api/departments`, { headers }),
        fetch(`${apiBase}/api/customer-organizations`, { headers })
      ]);

      if (usersRes.ok && rolesRes.ok && deptsRes.ok && orgsRes.ok) {
        const u = await usersRes.json();
        const r = await rolesRes.json();
        const d = await deptsRes.json();
        const o = await orgsRes.json();

        // Filter for PENDING_ASSIGNMENT
        setUsers(u.data.filter((user: any) => user.status === 'PENDING_ASSIGNMENT'));
        setRoles(r.data);
        setDepartments(d.data);
        setOrgs(o.data);

        if (r.data.length > 0) setSelectedRole(r.data[0].code);
        if (d.data.length > 0) setSelectedDept(d.data[0].id);
        if (o.data.length > 0) setSelectedOrg(o.data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (userId: string) => {
    setProcessingId(userId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const headers = { 
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      };

      // 1. Assign role and metadata
      const accessRes = await fetch(`${apiBase}/api/admin/users/${userId}/access`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          account_type: accountType,
          role_code: selectedRole,
          department_id: accountType === 'INTERNAL' && selectedRole !== 'ADMIN' ? selectedDept : null,
          customer_organization_id: accountType === 'CLIENT' ? selectedOrg : null
        })
      });

      if (!accessRes.ok) {
        const errJson = await accessRes.json();
        alert(errJson.error?.message || 'Không thể thiết lập quyền hạn.');
        return;
      }

      // 2. Activate profile
      const statusRes = await fetch(`${apiBase}/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: 'ACTIVE' })
      });

      if (statusRes.ok) {
        alert('Đã phê duyệt tài khoản thành công!');
        fetchData();
      } else {
        alert('Lỗi kích hoạt trạng thái.');
      }
    } catch (err) {
      console.error(err);
      alert('Có lỗi kết nối hệ thống.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Phê duyệt tài khoản</h1>
        <p className="text-slate-500 text-sm mt-1">Duyệt tài khoản mới đăng nhập lần đầu và phân phối vai trò</p>
      </div>

      {users.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-xl p-8 text-center space-y-3">
          <Award className="h-10 w-10 text-slate-400 mx-auto" />
          <h3 className="text-lg font-semibold text-slate-950">Không có tài khoản nào chờ duyệt</h3>
          <p className="text-slate-500 text-sm">Hệ thống hiện tại sạch, tất cả người dùng đã được cấu hình vai trò.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="p-4">Họ và tên / Email</th>
                  <th className="p-4">Loại tài khoản</th>
                  <th className="p-4">Gán vai trò & Phòng ban/Tổ chức</th>
                  <th className="p-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50">
                    <td className="p-4">
                      <div>
                        <div className="font-semibold text-slate-900">{user.full_name || 'N/A'}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <select 
                        value={accountType} 
                        onChange={(e: any) => setAccountType(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      >
                        <option value="INTERNAL">Nội bộ (Internal)</option>
                        <option value="CLIENT">Khách hàng (Client)</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-3">
                        <select 
                          value={selectedRole} 
                          onChange={(e) => setSelectedRole(e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-900"
                        >
                          {roles.map((r) => (
                            <option key={r.id} value={r.code}>{r.name}</option>
                          ))}
                        </select>

                        {accountType === 'INTERNAL' && selectedRole !== 'ADMIN' && (
                          <select 
                            value={selectedDept} 
                            onChange={(e) => setSelectedDept(e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-900"
                          >
                            {departments.map((d) => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                        )}

                        {accountType === 'CLIENT' && (
                          <select 
                            value={selectedOrg} 
                            onChange={(e) => setSelectedOrg(e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-900"
                          >
                            {orgs.map((o) => (
                              <option key={o.id} value={o.id}>{o.name}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleApprove(user.id)}
                        disabled={processingId === user.id}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs px-4 py-2 rounded-lg inline-flex items-center gap-1.5"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>Kích hoạt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PendingUsersPage() {
  return (
    <QueryProvider>
      <AppShell>
        <PendingUsersList />
      </AppShell>
    </QueryProvider>
  );
}
