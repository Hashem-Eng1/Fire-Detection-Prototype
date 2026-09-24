import type { CameraStatus, IncidentStatus, Severity } from '@/data/types';

const cameraStatusMap: Record<CameraStatus, { label: string; cls: string; dot: string }> = {
  online: { label: 'متصلة', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  offline: { label: 'غير متصلة', cls: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
  unstable: { label: 'اتصال غير مستقر', cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  disabled: { label: 'غير مفعلة', cls: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' },
};

const incidentStatusMap: Record<IncidentStatus, { label: string; cls: string }> = {
  new: { label: 'جديدة', cls: 'bg-accent-50 text-accent-700 border-accent-200' },
  confirmed: { label: 'تم الإقرار', cls: 'bg-violet-50 text-violet-700 border-violet-200' },
  following: { label: 'قيد المتابعة', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  resolved: { label: 'تمت المعالجة', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  false_alarm: { label: 'إنذار خاطئ', cls: 'bg-gray-100 text-gray-700 border-gray-200' },
  closed: { label: 'مغلقة', cls: 'bg-gray-100 text-gray-500 border-gray-200' },
};

const severityMap: Record<Severity, { label: string; cls: string }> = {
  low: { label: 'منخفض', cls: 'bg-accent-50 text-accent-700 border-accent-200' },
  medium: { label: 'متوسط', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  high: { label: 'مرتفع', cls: 'bg-red-50 text-red-700 border-red-200' },
};

export function CameraStatusBadge({ status }: { status: CameraStatus }) {
  const s = cameraStatusMap[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export function IncidentStatusBadge({ status }: { status: IncidentStatus }) {
  const s = incidentStatusMap[status];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const s = severityMap[severity];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
}
