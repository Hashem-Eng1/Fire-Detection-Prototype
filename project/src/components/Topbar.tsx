import { useState, useRef, useEffect } from 'react';
import { Bell, Menu, AlertTriangle, CameraOff, Camera, Flame } from 'lucide-react';
import { notifications as mockNotifications } from '@/data/mock';

interface TopbarProps {
  title: string;
  onMenuClick: () => void;
}

const iconFor = {
  high: Flame,
  camera_off: CameraOff,
  camera_restore: Camera,
  info: AlertTriangle,
};

export function Topbar({ title, onMenuClick }: TopbarProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = mockNotifications.length;

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-3 lg:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100">
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-gray-900 lg:text-xl">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-3 py-1.5">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <span className="text-xs font-medium text-amber-800">نظام مساعد للكشف المبكر</span>
        </div>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((o) => !o)}
            className="relative rounded-xl p-2.5 text-gray-600 hover:bg-gray-100 transition"
          >
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute top-1 left-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-white shadow-lift border border-gray-100 overflow-hidden animate-fade-in">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <span className="font-bold text-gray-900">التنبيهات</span>
                <span className="text-xs text-gray-400">{unread} جديدة</span>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {mockNotifications.map((n) => {
                  const Icon = iconFor[n.type];
                  return (
                    <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition">
                      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        n.type === 'high' ? 'bg-red-50 text-red-500' :
                        n.type === 'camera_off' ? 'bg-gray-100 text-gray-500' :
                        n.type === 'camera_restore' ? 'bg-emerald-50 text-emerald-500' :
                        'bg-accent-50 text-accent-500'
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                        <p className="text-xs text-gray-500">{n.subtitle}</p>
                      </div>
                      <span className="text-[11px] text-gray-400 shrink-0">{n.time}</span>
                    </div>
                  );
                })}
              </div>
              <button className="w-full border-t border-gray-100 py-3 text-center text-sm font-semibold text-accent-600 hover:bg-accent-50 transition">
                عرض جميع التنبيهات
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
