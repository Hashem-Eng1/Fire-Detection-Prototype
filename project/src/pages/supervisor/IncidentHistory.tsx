import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { IncidentStatusBadge, SeverityBadge } from '@/components/StatusBadge';
import { useIncidents } from '@/context/IncidentContext';
import { useZones } from '@/context/ZoneContext';
import { useCameras } from '@/context/CameraContext';
import type { Severity, IncidentStatus, DetectionType } from '@/data/types';
import { Search, Eye, Calendar, Cctv, Flame, Wind, UserCheck } from 'lucide-react';

interface Props {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function IncidentHistory({ currentPath, onNavigate }: Props) {
  const { incidents } = useIncidents();
  const { zones } = useZones();
  const { cameras } = useCameras();
  const [camera, setCamera] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [detectionType, setDetectionType] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [severity, setSeverity] = useState('');
  const [status, setStatus] = useState('');
  const [searched, setSearched] = useState(false);

  const cameraIds = [...new Set(incidents.map((i) => i.cameraId))];

  const filtered = incidents.filter((i) => {
    if (camera && i.cameraId !== camera) return false;
    if (severity && i.severity !== (severity as Severity)) return false;
    if (status && i.status !== (status as IncidentStatus)) return false;
    if (detectionType && i.primary_type !== (detectionType as DetectionType)) return false;
    if (zoneId) {
      const cam = cameras.find((c) => c.id === i.camera_id || c.id === i.cameraId);
      if (cam && cam.zone_id !== zoneId) return false;
    }
    if (from && i.date < from) return false;
    if (to && i.date > to) return false;
    return true;
  });

  return (
    <DashboardLayout title="سجل وأرشيف الحوادث" currentPath={currentPath} onNavigate={onNavigate}>
      <div className="space-y-5">
        {/* Filters */}
        <div className="rounded-2xl bg-white shadow-card border border-gray-100/80 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">المنطقة الجغرافية (Zone)</label>
              <select value={zoneId} onChange={(e) => setZoneId(e.target.value)} className="form-input">
                <option value="">جميع المناطق ({zones.length})</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">نوع الكشف (Detection Type)</label>
              <select value={detectionType} onChange={(e) => setDetectionType(e.target.value)} className="form-input">
                <option value="">الكل (حريق ودخان)</option>
                <option value="fire">حريق (Fire)</option>
                <option value="smoke">دخان (Smoke)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">الكاميرا</label>
              <select value={camera} onChange={(e) => setCamera(e.target.value)} className="form-input">
                <option value="">جميع الكاميرات</option>
                {cameraIds.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">مستوى الخطورة</label>
              <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="form-input">
                <option value="">الكل</option>
                <option value="low">منخفض</option>
                <option value="medium">متوسط</option>
                <option value="high">مرتفع</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">من تاريخ</label>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="form-input" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">إلى تاريخ</label>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="form-input" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">الحالة النهائية</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="form-input">
                <option value="">الكل</option>
                <option value="new">جديدة</option>
                <option value="confirmed">تم الإقرار</option>
                <option value="following">قيد المتابعة</option>
                <option value="resolved">تمت المعالجة</option>
                <option value="false_alarm">إنذار خاطئ</option>
                <option value="closed">مغلقة</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setSearched(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-accent-600 transition"
              >
                <Search className="h-4 w-4" /> تطبيق الفلترة
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-white shadow-card border border-gray-100/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-right">
                  <th className="px-4 py-3 font-semibold text-gray-600">Incident ID</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">الكاميرا والمنطقة</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">التاريخ والوقت</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">نوع الكشف</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">المشرف المسؤول</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">الخطورة</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">الحالة النهائية</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(searched ? filtered : incidents).map((inc) => {
                  const cam = cameras.find((c) => c.id === inc.camera_id || c.id === inc.cameraId);
                  const zone = cam ? zones.find((z) => z.id === cam.zone_id) : undefined;
                  return (
                    <tr key={inc.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-4 py-3 font-bold text-gray-900 font-mono text-xs">{inc.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-mono text-xs text-gray-800 font-semibold">{inc.cameraId}</span>
                          <span className="text-[11px] text-gray-500 truncate">{zone?.name || inc.location}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">{inc.date} {inc.time}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 font-semibold text-xs text-red-600">
                          {inc.primary_type === 'fire' ? <Flame className="h-3.5 w-3.5" /> : <Wind className="h-3.5 w-3.5" />}
                          {inc.primary_type === 'fire' ? 'حريق' : 'دخان'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 text-xs">
                        {inc.acknowledged_by || inc.supervisor ? (
                          <span className="flex items-center gap-1">
                            <UserCheck className="h-3.5 w-3.5 text-accent-600" />
                            {inc.acknowledged_by || inc.supervisor}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3"><SeverityBadge severity={inc.severity} /></td>
                      <td className="px-4 py-3"><IncidentStatusBadge status={inc.status} /></td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => onNavigate(`/supervisor/history/${inc.id}`)}
                          className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                        >
                          <Eye className="h-3.5 w-3.5" /> عرض التفاصيل
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {(searched ? filtered : incidents).length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">لا توجد سجلات مطابقة</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
