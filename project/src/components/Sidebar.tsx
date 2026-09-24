import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/data/types';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, Cctv, Camera, Users, Bell, ScrollText,
  Monitor, Flame, History, LogOut, FlameKindling, MapPin, Send,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

const adminNav: NavItem[] = [
  { label: 'لوحة التحكم', path: '/admin', icon: LayoutDashboard },
  { label: 'إدارة المناطق', path: '/admin/zones', icon: MapPin },
  { label: 'إدارة الكاميرات', path: '/admin/cameras', icon: Cctv },
  { label: 'حالة الكاميرات', path: '/admin/camera-status', icon: Camera },
  { label: 'إدارة المستخدمين', path: '/admin/users', icon: Users },
  { label: 'إعداد قنوات التنبيه', path: '/admin/notifications', icon: Bell },
  { label: 'سجل التنبيهات الخارجية', path: '/admin/notification-logs', icon: Send },
  { label: 'سجل الإجراءات', path: '/admin/audit', icon: ScrollText },
];

const supervisorNav: NavItem[] = [
  { label: 'لوحة المراقبة', path: '/supervisor', icon: Monitor },
  { label: 'المراقبة المباشرة', path: '/supervisor/live', icon: Cctv },
  { label: 'حالة الكاميرات', path: '/supervisor/camera-status', icon: Camera },
  { label: 'الحوادث النشطة', path: '/supervisor/incidents', icon: Flame },
  { label: 'سجل الحوادث', path: '/supervisor/history', icon: History },
];

interface SidebarProps {
  current: string;
  onNavigate: (path: string) => void;
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ current, onNavigate, open, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const role: Role = user?.role ?? 'admin';
  // Administrators see only admin interfaces, while supervisors see only supervisor interfaces.
  const nav = role === 'admin' ? adminNav : supervisorNav;

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-navy-950/40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed lg:static inset-y-0 right-0 z-40 flex w-72 flex-col bg-navy-900 text-white transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500/20 text-accent-300">
            <FlameKindling className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">نظام كشف الحرائق</p>
            <p className="text-[11px] text-navy-300">مراقبة المستودعات</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {nav.map((item) => {
            const isActive = current === item.path || (item.path !== '/admin' && item.path !== '/supervisor' && current.startsWith(item.path));
            return (
              <button
                key={item.path}
                onClick={() => { onNavigate(item.path); onClose(); }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-accent-500 text-white shadow-soft'
                    : 'text-navy-200 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="mb-2 rounded-xl bg-white/5 px-4 py-3">
            <p className="text-xs text-navy-300">المستخدم الحالي</p>
            <p className="text-sm font-semibold text-white">{user?.username}</p>
            <p className="text-[11px] text-accent-300">{role === 'admin' ? 'مدير النظام' : 'مشرف النظام'}</p>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-navy-200 hover:bg-red-500/20 hover:text-red-300 transition"
          >
            <LogOut className="h-5 w-5" />
            تسجيل الخروج
          </button>
        </div>
      </aside>
    </>
  );
}
