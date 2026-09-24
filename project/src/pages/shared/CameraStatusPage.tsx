import { DashboardLayout } from '@/components/DashboardLayout';
import { cameras } from '@/data/mock';
import type { CameraStatus as CamStatus } from '@/data/types';
import { Cctv, MapPin, Clock, RefreshCw, Wifi, Video } from 'lucide-react';

interface Props {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const statusConfig: Record<CamStatus, { label: string; color: string; bg: string; dot: string }> = {
  online: { label: '🟢 متصلة', color: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
  unstable: { label: '🟠 اتصال غير مستقر', color: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-500' },
  offline: { label: '🔴 غير متصلة', color: 'text-red-700', bg: 'bg-red-50', dot: 'bg-red-500' },
  disabled: { label: '⚪ غير مفعلة', color: 'text-gray-600', bg: 'bg-gray-100', dot: 'bg-gray-400' },
};

export function CameraStatusPage({ currentPath, onNavigate }: Props) {
  return (
    <DashboardLayout title="حالة الكاميرات" currentPath={currentPath} onNavigate={onNavigate}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cameras.map((c) => {
          const s = statusConfig[c.status];
          return (
            <div key={c.id} className="rounded-2xl bg-white shadow-card border border-gray-100/80 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.bg} ${s.color}`}>
                    <Cctv className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{c.name}</p>
                    <p className="text-xs text-gray-400 font-mono">{c.id}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${s.color}`}>{s.label}</span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <MapPin className="h-4 w-4" />
                  <span>{c.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-500">
                    <Video className="h-4 w-4" /> حالة البث
                  </span>
                  <span className={`font-semibold ${c.status === 'online' ? 'text-emerald-600' : c.status === 'disabled' ? 'text-gray-400' : 'text-red-600'}`}>
                    {c.status === 'online' ? 'نشط' : c.status === 'disabled' ? 'متوقف' : 'متوقف'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-500">
                    <Clock className="h-4 w-4" /> آخر إطار
                  </span>
                  <span className="font-semibold text-gray-700 font-mono text-xs">{c.lastFrame}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-500">
                    <Wifi className="h-4 w-4" /> آخر اتصال
                  </span>
                  <span className="font-semibold text-gray-700 font-mono text-xs">{c.lastConnection}</span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-50 pt-2">
                  <span className="flex items-center gap-2 text-gray-500">
                    <RefreshCw className="h-4 w-4" /> إعادة الاتصال
                  </span>
                  {c.status === 'offline' ? (
                    <span className="text-xs font-semibold text-amber-600">جارٍ المحاولة... ({c.reconnectAttempts})</span>
                  ) : c.autoReconnect ? (
                    <span className="text-xs font-semibold text-emerald-600">تلقائي</span>
                  ) : (
                    <span className="text-xs font-semibold text-gray-400">معطّل</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
