import { DashboardLayout } from '@/components/DashboardLayout';
import { StatCard } from '@/components/StatCard';
import { ChartCard } from '@/components/ChartCard';
import { CameraStatusBadge, IncidentStatusBadge, SeverityBadge } from '@/components/StatusBadge';
import { BarChart, DonutChart } from '@/components/Charts';
import { useCameras } from '@/context/CameraContext';
import { useZones } from '@/context/ZoneContext';
import { useIncidents } from '@/context/IncidentContext';
import { statsSeverityData, statsCameraData } from '@/data/mock';
import {
  Cctv, Wifi, WifiOff, Flame, Send, Signal, Server, Video, Activity,
  Clock, CheckCircle2, MapPin,
} from 'lucide-react';

interface Props {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function AdminDashboard({ currentPath, onNavigate }: Props) {
  const { cameras } = useCameras();
  const { zones } = useZones();
  const { incidents } = useIncidents();

  const online = cameras.filter((c) => c.status === 'online').length;
  const offline = cameras.filter((c) => c.status === 'offline' || c.status === 'disabled').length;
  const activeIncidents = incidents.filter((i) => ['new', 'confirmed', 'following'].includes(i.status)).length;
  const recentIncidents = incidents.slice(0, 4);

  return (
    <DashboardLayout title="لوحة تحكم مدير النظام" currentPath={currentPath} onNavigate={onNavigate}>
      <div className="space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-7">
          <StatCard title="المناطق الجغرافية" value={zones.length} icon={MapPin} tone="navy" />
          <StatCard title="إجمالي الكاميرات" value={cameras.length} icon={Cctv} tone="navy" />
          <StatCard title="الكاميرات المتصلة" value={online} icon={Wifi} tone="green" />
          <StatCard title="غير المتصلة" value={offline} icon={WifiOff} tone="red" />
          <StatCard title="الحوادث النشطة" value={activeIncidents} icon={Flame} tone="amber" />
          <StatCard title="حالة Telegram" value="متصل" icon={Send} tone="green" />
          <StatCard title="حالة GSM" value="متصل" icon={Signal} tone="green" />
        </div>

        {/* System status */}
        <div className="rounded-2xl bg-white p-5 shadow-card border border-gray-100/80">
          <h3 className="font-bold text-gray-900 mb-4">حالة النظام</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SystemStatusItem icon={Server} label="خادم الكشف" value="يعمل" tone="green" />
            <SystemStatusItem icon={Video} label="معالجة الفيديو" value="نشطة" tone="green" />
            <SystemStatusItem icon={Activity} label="حالة المراقبة" value="نشطة" tone="green" />
            <SystemStatusItem icon={Clock} label="آخر تحديث" value="منذ 12 ثانية" tone="navy" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Camera status preview */}
          <div className="lg:col-span-2 rounded-2xl bg-white p-5 shadow-card border border-gray-100/80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">حالة الكاميرات</h3>
              <button onClick={() => onNavigate('/admin/camera-status')} className="text-sm font-semibold text-accent-600 hover:text-accent-700">
                عرض الكل
              </button>
            </div>
            <div className="space-y-2">
              {cameras.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-50 px-4 py-3 hover:bg-gray-50 transition">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      c.status === 'online' ? 'bg-emerald-50 text-emerald-600' :
                      c.status === 'offline' ? 'bg-red-50 text-red-600' :
                      c.status === 'unstable' ? 'bg-amber-50 text-amber-600' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      <Cctv className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                      <p className="text-xs text-gray-500 truncate">{c.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-gray-400 hidden sm:block">آخر إطار: {c.lastFrame}</span>
                    <CameraStatusBadge status={c.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent incidents */}
          <div className="rounded-2xl bg-white p-5 shadow-card border border-gray-100/80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">الحوادث الأخيرة</h3>
              <button onClick={() => onNavigate('/admin/camera-status')} className="text-sm font-semibold text-accent-600 hover:text-accent-700">
                عرض الكل
              </button>
            </div>
            <div className="space-y-3">
              {recentIncidents.map((inc) => (
                <div key={inc.id} className="rounded-xl border border-gray-50 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-gray-900">{inc.id}</span>
                    <SeverityBadge severity={inc.severity} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{inc.cameraName}</span>
                    <span>{inc.time}</span>
                  </div>
                  <div className="mt-2">
                    <IncidentStatusBadge status={inc.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartCard title="الحوادث حسب الكاميرا" icon={Cctv}>
            <BarChart data={statsCameraData} />
          </ChartCard>
          <ChartCard title="الحوادث حسب مستوى الخطورة" icon={Flame}>
            <DonutChart data={statsSeverityData} />
          </ChartCard>
        </div>

        {/* Safety message */}
        <div className="flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-200 p-4">
          <CheckCircle2 className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 font-medium">
            هذا النظام أداة مساعدة للكشف المبكر عن الحريق ولا يُعد بديلاً عن أنظمة الإنذار أو الإطفاء المعتمدة.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

function SystemStatusItem({ icon: Icon, label, value, tone }: { icon: typeof Server; label: string; value: string; tone: 'green' | 'navy' }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-50 p-3">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
        tone === 'green' ? 'bg-emerald-50 text-emerald-600' : 'bg-navy-50 text-navy-600'
      }`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <div className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${tone === 'green' ? 'bg-emerald-500 animate-pulse' : 'bg-navy-500'}`} />
          <p className="text-sm font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
