import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAudit } from '@/context/AuditContext';
import type { Role } from '@/data/types';
import { Search, ScrollText, Calendar, Filter, RotateCcw } from 'lucide-react';

interface Props {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function AuditLog({ currentPath, onNavigate }: Props) {
  const { logs } = useAudit();
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Extract unique action types dynamically from live logs
  const actionTypes = Array.from(new Set(logs.map((l) => l.action)));

  const filtered = logs.filter((e) => {
    if (userFilter && !e.user.toLowerCase().includes(userFilter.toLowerCase())) return false;
    if (actionFilter && e.action !== actionFilter) return false;
    if (dateFilter && !e.time.startsWith(dateFilter)) return false;
    return true;
  });

  const resetFilters = () => {
    setUserFilter('');
    setActionFilter('');
    setDateFilter('');
  };

  return (
    <DashboardLayout title="سجل الإجراءات" currentPath={currentPath} onNavigate={onNavigate}>
      <div className="space-y-5">
        {/* Filters */}
        <div className="rounded-2xl bg-white shadow-card border border-gray-100/80 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">المستخدم</label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input value={userFilter} onChange={(e) => setUserFilter(e.target.value)} placeholder="اسم المستخدم" className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-10 pl-4 text-sm outline-none focus:border-accent-400 focus:bg-white focus:ring-2 focus:ring-accent-100" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">نوع الإجراء</label>
              <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="form-input">
                <option value="">الكل</option>
                {actionTypes.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">التاريخ</label>
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-10 pl-4 text-sm outline-none focus:border-accent-400 focus:bg-white focus:ring-2 focus:ring-accent-100" />
              </div>
            </div>
          </div>
          {(userFilter || actionFilter || dateFilter) && (
            <div className="mt-3 flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">تم تفعيل الفلترة ({filtered.length} نتيجة)</span>
              <button onClick={resetFilters} className="inline-flex items-center gap-1 text-xs font-bold text-accent-600 hover:text-accent-700">
                <RotateCcw className="h-3 w-3" /> إعادة تعيين الفلاتر
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-white shadow-card border border-gray-100/80 overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <ScrollText className="h-5 w-5 text-gray-400" />
              <h3 className="font-bold text-gray-900">سجل الإجراءات ({filtered.length})</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200 mr-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                مباشر وديناميكي
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-right">
                  <th className="px-4 py-3 font-semibold text-gray-600">الوقت</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">المستخدم</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">الدور</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">الإجراء</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">التفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{e.time}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{e.user}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border ${
                        (e.role as Role) === 'admin' ? 'bg-navy-50 text-navy-700 border-navy-200' : 'bg-accent-50 text-accent-700 border-accent-200'
                      }`}>
                        {e.role === 'admin' ? 'مدير النظام' : 'مشرف النظام'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{e.action}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{e.details}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">لا توجد سجلات مطابقة</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
