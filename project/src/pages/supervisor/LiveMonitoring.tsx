import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { CameraCard } from '@/components/CameraCard';
import { useZones } from '@/context/ZoneContext';
import { useCameras } from '@/context/CameraContext';
import { useIncidents } from '@/context/IncidentContext';
import type { CameraStatus } from '@/data/types';
import { Search, Flame, Wind, AlertTriangle, ArrowLeft, ShieldAlert } from 'lucide-react';

interface Props {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function LiveMonitoring({ currentPath, onNavigate }: Props) {
  const { zones } = useZones();
  const { cameras, getCameraMasks } = useCameras();
  const { getLatestCameraDetection, getActiveIncidentForCamera } = useIncidents();
  const [region, setRegion] = useState('');
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = cameras.filter((c) => {
    if (region) {
      const matchZone = c.zone_id === region || c.location.includes(region);
      if (!matchZone) return false;
    }
    if (status && c.status !== (status as CameraStatus)) return false;
    return true;
  });

  const selectedCam = cameras.find((c) => c.id === selected);
  const activeDetection = selectedCam ? getLatestCameraDetection(selectedCam.id) : undefined;
  const activeIncident = selectedCam ? getActiveIncidentForCamera(selectedCam.id) : undefined;
  const selectedZone = selectedCam ? zones.find((z) => z.id === selectedCam.zone_id) : undefined;

  return (
    <DashboardLayout title="المراقبة المباشرة" currentPath={currentPath} onNavigate={onNavigate}>
      <div className="space-y-5">
        {/* Filters */}
        <div className="rounded-2xl bg-white shadow-card border border-gray-100/80 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">المنطقة الجغرافية</label>
              <select value={region} onChange={(e) => setRegion(e.target.value)} className="form-input">
                <option value="">جميع المناطق ({zones.length})</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">حالة الكاميرا</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="form-input">
                <option value="">جميع الحالات</option>
                <option value="online">متصلة</option>
                <option value="offline">غير متصلة</option>
                <option value="unstable">اتصال غير مستقر</option>
                <option value="disabled">غير مفعلة</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main view + grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Large preview */}
          <div className="xl:col-span-2">
            {selectedCam ? (
              <div className="rounded-2xl bg-white shadow-card border border-gray-100/80 overflow-hidden">
                <div className="relative aspect-video bg-navy-900">
                  <div className="absolute inset-0 bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950" />
                  <div className="absolute bottom-0 left-0 right-0 h-1/2 opacity-20">
                    <div className="flex h-full items-end gap-1 px-2">
                      {[...Array(8)].map((_, i) => <div key={i} className="flex-1 bg-navy-600" style={{ height: `${30 + (i % 3) * 20}%` }} />)}
                    </div>
                  </div>
                  {/* Masks SVG overlay */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {getCameraMasks(selectedCam.id).map((mask) => {
                      if (!mask.is_active || mask.polygon_points.length < 3) return null;
                      const pointsStr = mask.polygon_points.map((p) => `${p.x},${p.y}`).join(' ');
                      const isExclusion = mask.mask_type === 'exclusion';
                      return (
                        <polygon
                          key={mask.id}
                          points={pointsStr}
                          fill={isExclusion ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)'}
                          stroke={isExclusion ? '#ef4444' : '#3b82f6'}
                          strokeWidth="0.8"
                          strokeDasharray={isExclusion ? '1.5 1' : 'none'}
                        />
                      );
                    })}
                  </svg>

                  {/* Real-coordinate dynamic AI Bounding Box (Entity 6: Detection.bbox) */}
                  {activeDetection ? (
                    <div
                      className={`absolute border-2 rounded transition-all duration-300 pointer-events-none ${
                        activeDetection.class_detected === 'fire'
                          ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                          : 'border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                      }`}
                      style={{
                        top: `${activeDetection.bbox.y}%`,
                        left: `${activeDetection.bbox.x}%`,
                        width: `${activeDetection.bbox.width}%`,
                        height: `${activeDetection.bbox.height}%`,
                      }}
                    >
                      <div
                        className={`absolute -top-7 right-0 text-white text-xs font-bold px-2 py-0.5 rounded shadow flex items-center gap-1 ${
                          activeDetection.class_detected === 'fire' ? 'bg-red-600' : 'bg-blue-600'
                        }`}
                      >
                        {activeDetection.class_detected === 'fire' ? <Flame className="h-3 w-3" /> : <Wind className="h-3 w-3" />}
                        <span>{activeDetection.class_detected === 'fire' ? 'حريق' : 'دخان'}</span>
                        <span className="font-mono">({activeDetection.confidence}%)</span>
                      </div>
                      <div className="absolute -bottom-5 left-0 rounded bg-black/75 px-1.5 py-0.5 text-[10px] text-gray-200 backdrop-blur font-mono">
                        مساحة الرقعة: {Math.round(activeDetection.area_ratio * 100)}%
                      </div>
                    </div>
                  ) : selectedCam.detectionType !== 'none' ? (
                    <div className="absolute top-[28%] left-[25%] w-[45%] h-[40%] border-2 border-red-500 rounded animate-pulse pointer-events-none">
                      <div className="absolute -top-7 right-0 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded shadow">
                        {selectedCam.detectionType === 'fire' ? 'حريق' : 'دخان'} — {selectedCam.detectionConfidence}%
                      </div>
                      <div className="absolute -bottom-5 left-0 rounded bg-black/75 px-1.5 py-0.5 text-[10px] text-gray-200 backdrop-blur font-mono">
                        مساحة الرقعة: 18%
                      </div>
                    </div>
                  ) : null}

                  <div className="absolute top-3 right-3 left-3 flex items-center justify-between">
                    <span className="rounded-md bg-black/50 px-2 py-1 text-[11px] text-white backdrop-blur">{selectedCam.id}</span>
                    <span className="flex items-center gap-1 rounded-md bg-black/50 px-2 py-1 text-[11px] text-white backdrop-blur">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE
                    </span>
                  </div>
                </div>

                {/* Camera metadata & detection summary */}
                <div className="p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">{selectedCam.name}</h3>
                        {selectedZone && (
                          <span className="rounded-md bg-accent-50 text-accent-700 border border-accent-200 px-2 py-0.5 text-xs font-semibold">
                            {selectedZone.name}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{selectedCam.location}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-xs text-gray-500">حالة الكشف اللحظي</p>
                      <p className={`font-bold ${
                        (activeDetection?.class_detected || selectedCam.detectionType) !== 'none'
                          ? 'text-red-600'
                          : 'text-emerald-600'
                      }`}>
                        {activeDetection ? (
                          `${activeDetection.class_detected === 'fire' ? 'حريق مؤكد' : 'دخان متصاعد'} — ${activeDetection.confidence}%`
                        ) : selectedCam.detectionType !== 'none' ? (
                          `${selectedCam.detectionType === 'fire' ? 'حريق' : 'دخان'} — ${selectedCam.detectionConfidence}%`
                        ) : (
                          'طبيعي (لا يوجد إنذار)'
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Active Incident Alert Banner */}
                  {activeIncident && (
                    <div className="flex items-center justify-between gap-3 rounded-xl bg-red-50 border border-red-200 p-3">
                      <div className="flex items-center gap-2 text-xs text-red-800">
                        <ShieldAlert className="h-4 w-4 text-red-600 shrink-0" />
                        <span>
                          <strong>بلاغ نشط مرتبط:</strong> <span className="font-mono font-bold">{activeIncident.id}</span> ({activeIncident.primary_type === 'fire' ? 'حريق' : 'دخان'} — خطورة {activeIncident.severity_level})
                        </span>
                      </div>
                      <button
                        onClick={() => onNavigate(`/supervisor/incidents/${activeIncident.id}`)}
                        className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition shrink-0"
                      >
                        مراجعة الحادثة <ArrowLeft className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-white shadow-card border border-gray-100/80 p-12 text-center">
                <p className="text-gray-400">اختر كاميرا من القائمة لعرض البث المباشر</p>
              </div>
            )}
          </div>

          {/* Camera selector list */}
          <div className="rounded-2xl bg-white shadow-card border border-gray-100/80 p-4 max-h-[600px] overflow-y-auto">
            <h3 className="font-bold text-gray-900 mb-3">قائمة الكاميرات ({filtered.length})</h3>
            <div className="space-y-2">
              {filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-right transition ${
                    selected === c.id ? 'border-accent-400 bg-accent-50' : 'border-gray-50 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-100 text-navy-600 text-xs font-bold">
                    {c.id.slice(-2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                    <p className="text-xs text-gray-500 truncate">{c.location}</p>
                  </div>
                  {c.detectionType !== 'none' && (
                    <span className="rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600">
                      {c.detectionType === 'fire' ? 'حريق' : 'دخان'} {c.detectionConfidence}%
                    </span>
                  )}
                  <span className={`h-2 w-2 rounded-full shrink-0 ${
                    c.status === 'online' ? 'bg-emerald-500' : c.status === 'offline' ? 'bg-red-500' : c.status === 'unstable' ? 'bg-amber-500' : 'bg-gray-400'
                  }`} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">جميع الكاميرات</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((c) => (
              <CameraCard key={c.id} camera={c} onClick={() => setSelected(c.id)} />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
