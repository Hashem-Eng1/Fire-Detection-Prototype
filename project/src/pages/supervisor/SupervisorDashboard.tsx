import { DashboardLayout } from '@/components/DashboardLayout';
import { StatCard } from '@/components/StatCard';
import { CameraCard } from '@/components/CameraCard';
import { IncidentStatusBadge, SeverityBadge } from '@/components/StatusBadge';
import { useCameras } from '@/context/CameraContext';
import { useIncidents } from '@/context/IncidentContext';
import { Cctv, WifiOff, Flame, AlertTriangle, ArrowLeft } from 'lucide-react';

interface Props {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function SupervisorDashboard({ currentPath, onNavigate }: Props) {
  const { cameras } = useCameras();
  const { incidents } = useIncidents();
  const activeCams = cameras.filter((c) => c.status === 'online').length;
  const offlineCams = cameras.filter((c) => c.status === 'offline' || c.status === 'disabled').length;
  const activeIncidents = incidents.filter((i) => ['new', 'confirmed', 'following'].includes(i.status));
  const highSeverity = activeIncidents.filter((i) => i.severity === 'high').length;

  return (
    <DashboardLayout title="لوحة المراقبة" currentPath={currentPath} onNavigate={onNavigate}>
      <div className="space-y-6">
        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard title="الكاميرات النشطة" value={`${activeCams} / ${cameras.length}`} icon={Cctv} tone="green" />
          <StatCard title="الكاميرات المتوقفة" value={offlineCams} icon={WifiOff} tone="red" />
          <StatCard title="الحوادث النشطة" value={activeIncidents.length} icon={Flame} tone="amber" />
          <StatCard title="الحوادث عالية الخطورة" value={highSeverity} icon={AlertTriangle} tone="red" />
        </div>

        {/* Live camera grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">شبكة الكاميرات المباشرة</h2>
            <button onClick={() => onNavigate('/supervisor/live')} className="flex items-center gap-1 text-sm font-semibold text-accent-600 hover:text-accent-700">
              عرض الكل <ArrowLeft className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {cameras.slice(0, 4).map((c) => (
              <CameraCard key={c.id} camera={c} onClick={() => onNavigate('/supervisor/live')} />
            ))}
          </div>
        </div>

        {/* Active incidents panel */}
        <div className="rounded-2xl bg-white shadow-card border border-gray-100/80 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">الحوادث النشطة</h3>
            <button onClick={() => onNavigate('/supervisor/incidents')} className="text-sm font-semibold text-accent-600 hover:text-accent-700">
              عرض الكل
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeIncidents.map((inc) => (
              <div
                key={inc.id}
                className={`rounded-xl border p-4 transition hover:shadow-soft ${
                  inc.severity === 'high' ? 'border-red-200 bg-red-50/30' : 'border-gray-100 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-900">{inc.id}</span>
                  <SeverityBadge severity={inc.severity} />
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">الكاميرا</span>
                    <span className="font-semibold text-gray-700">{inc.cameraId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">الوقت</span>
                    <span className="font-semibold text-gray-700 font-mono text-xs">{inc.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">الكشف</span>
                    <span className="font-semibold text-red-600">
                      {inc.detection === 'smoke' ? 'دخان مكتشف' : 'حريق مكتشف'} — {inc.confidence}%
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <IncidentStatusBadge status={inc.status} />
                  <button
                    onClick={() => onNavigate(`/supervisor/incidents/${inc.id}`)}
                    className="flex items-center gap-1 rounded-lg bg-accent-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-accent-600 transition"
                  >
                    مراجعة الحادثة <ArrowLeft className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
