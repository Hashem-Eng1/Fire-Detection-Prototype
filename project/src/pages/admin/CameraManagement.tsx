import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { CameraStatusBadge } from '@/components/StatusBadge';
import { Modal } from '@/components/Modal';
import { useToast } from '@/context/ToastContext';
import { useZones } from '@/context/ZoneContext';
import { useCameras } from '@/context/CameraContext';
import { useAudit } from '@/context/AuditContext';
import type { Camera, CameraStatus, Zone } from '@/data/types';
import {
  Search, Plus, Eye, Pencil, Trash2, Cctv, Plug, CheckCircle2, XCircle, MapPin,
} from 'lucide-react';

interface Props {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const sourceTypeLabel = { rtsp: 'RTSP', network: 'كاميرا شبكية', file: 'ملف فيديو' };

export function CameraManagement({ currentPath, onNavigate }: Props) {
  const { push } = useToast();
  const { zones } = useZones();
  const { cameras, addCamera, updateCamera, deleteCamera } = useCameras();
  const { createLog } = useAudit();
  const [search, setSearch] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Camera | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Camera | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'fail' | null>(null);

  const filtered = cameras.filter((c) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q);
    const matchesZone = selectedZone === 'all' || c.zone_id === selectedZone;
    return matchesSearch && matchesZone;
  });

  const handleSave = (data: Partial<Camera>) => {
    if (editing) {
      updateCamera(editing.id, data);
      createLog('تعديل الكاميرا', `تحديث إعدادات وبيانات الكاميرا ${editing.name} (${editing.id})`);
      push('تم تحديث بيانات الكاميرا بنجاح');
    } else {
      addCamera(data);
      createLog('إضافة كاميرا', `إضافة كاميرا جديدة ${data.name || ''} (${data.id || ''})`);
      push('تمت إضافة الكاميرا بنجاح');
    }
    setShowForm(false);
    setEditing(null);
    setTestResult(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteCamera(deleteTarget.id);
    createLog('حذف كاميرا', `حذف الكاميرا ${deleteTarget.name} (${deleteTarget.id}) من النظام`);
    push('تم حذف الكاميرا');
    setDeleteTarget(null);
  };

  const handleTest = () => {
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setTesting(false);
      setTestResult(Math.random() > 0.3 ? 'success' : 'fail');
    }, 1400);
  };

  return (
    <DashboardLayout title="إدارة الكاميرات" currentPath={currentPath} onNavigate={onNavigate}>
      <div className="space-y-5">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث باسم الكاميرا، المعرف، أو المنطقة..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-11 pl-4 text-sm font-medium outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-100 shadow-sm"
              />
            </div>

            {/* Zone Filter Dropdown */}
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
              <MapPin className="h-4 w-4 text-accent-500 shrink-0" />
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="bg-transparent text-sm font-semibold text-gray-700 outline-none cursor-pointer"
              >
                <option value="all">جميع المناطق ({zones.length})</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name} ({z.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => { setEditing(null); setShowForm(true); setTestResult(null); }}
            className="flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-4 py-2.5 font-bold text-white shadow-soft hover:bg-accent-600 transition"
          >
            <Plus className="h-5 w-5" />
            إضافة كاميرا
          </button>
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-white shadow-card border border-gray-100/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-right">
                  <th className="px-4 py-3 font-semibold text-gray-600">اسم الكاميرا</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Camera ID</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">المنطقة الجغرافية</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">مصدر البث</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">الحالة</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">ROI</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((c) => {
                  const matchedZone = zones.find((z) => z.id === c.zone_id || z.name.includes(c.location) || c.location.includes(z.name));
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Cctv className="h-4 w-4 text-gray-400" />
                          <span className="font-semibold text-gray-900">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{c.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-accent-500 shrink-0" />
                          <span className="font-medium text-gray-800">
                            {matchedZone ? matchedZone.name : c.location}
                          </span>
                          {matchedZone && (
                            <span className="font-mono text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">
                              {matchedZone.id}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{sourceTypeLabel[c.sourceType]}</td>
                      <td className="px-4 py-3"><CameraStatusBadge status={c.status} /></td>
                    <td className="px-4 py-3">
                      {c.roiEnabled ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-xs font-semibold">مفعلة</span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-500 border border-gray-200 px-2 py-0.5 text-xs font-semibold">غير مفعلة</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <ActionBtn icon={Eye} tone="blue" onClick={() => onNavigate(`/admin/cameras/${c.id}`)} title="عرض التفاصيل" />
                        <ActionBtn icon={Pencil} tone="amber" onClick={() => { setEditing(c); setShowForm(true); setTestResult(null); }} title="تعديل" />
                        <ActionBtn icon={Trash2} tone="red" onClick={() => setDeleteTarget(c)} title="حذف" />
                      </div>
                    </td>
                  </tr>
                );
              })}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">لا توجد كاميرات مطابقة</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit modal */}
      <CameraFormModal
        open={showForm}
        editing={editing}
        zones={zones}
        testing={testing}
        testResult={testResult}
        onClose={() => { setShowForm(false); setEditing(null); setTestResult(null); }}
        onSave={handleSave}
        onTest={handleTest}
      />

      {/* Delete confirmation */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="تأكيد الحذف"
        footer={
          <>
            <button onClick={() => setDeleteTarget(null)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100">إلغاء</button>
            <button onClick={handleDelete} className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-600">تأكيد الحذف</button>
          </>
        }
      >
        <p className="text-gray-600">هل أنت متأكد من حذف الكاميرا <span className="font-bold text-gray-900">{deleteTarget?.name}</span> ({deleteTarget?.id})؟ لا يمكن التراجع عن هذا الإجراء.</p>
      </Modal>
    </DashboardLayout>
  );
}

function ActionBtn({ icon: Icon, tone, onClick, title }: { icon: typeof Eye; tone: 'blue' | 'amber' | 'red'; onClick: () => void; title: string }) {
  const cls = { blue: 'text-accent-600 hover:bg-accent-50', amber: 'text-amber-600 hover:bg-amber-50', red: 'text-red-600 hover:bg-red-50' }[tone];
  return (
    <button onClick={onClick} title={title} className={`rounded-lg p-2 transition ${cls}`}>
      <Icon className="h-4 w-4" />
    </button>
  );
}

function CameraFormModal({
  open, editing, zones, testing, testResult, onClose, onSave, onTest,
}: {
  open: boolean; editing: Camera | null; zones: Zone[]; testing: boolean; testResult: 'success' | 'fail' | null;
  onClose: () => void; onSave: (data: Partial<Camera>) => void; onTest: () => void;
}) {
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [location, setLocation] = useState('');
  const [sourceType, setSourceType] = useState<Camera['sourceType']>('rtsp');
  const [streamUrl, setStreamUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // sync form fields when modal opens or editing target changes
  useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name);
      setId(editing.id);
      setZoneId(editing.zone_id ?? '');
      setLocation(editing.location);
      setSourceType(editing.sourceType);
      setStreamUrl(editing.streamUrl);
      setUsername(editing.username ?? '');
      setPassword(editing.password ?? '');
    } else {
      setName('');
      setId('');
      setZoneId(zones[0]?.id ?? '');
      setLocation(zones[0]?.name ?? '');
      setSourceType('rtsp');
      setStreamUrl('');
      setUsername('');
      setPassword('');
    }
  }, [open, editing, zones]);

  const handleZoneChange = (newZoneId: string) => {
    setZoneId(newZoneId);
    const selected = zones.find((z) => z.id === newZoneId);
    if (selected) {
      setLocation(selected.name);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'تعديل بيانات الكاميرا' : 'إضافة كاميرا جديدة'}
      size="lg"
      footer={
        <>
          <button onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100">إلغاء</button>
          <button
            onClick={() =>
              onSave({
                name,
                id,
                zone_id: zoneId || undefined,
                location: location || (zones.find((z) => z.id === zoneId)?.name ?? ''),
                sourceType,
                streamUrl,
                username,
                password,
              })
            }
            className="rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-accent-600"
          >
            حفظ
          </button>
        </>
      }
    >
      <div className="space-y-6">
        <div>
          <h4 className="font-bold text-gray-900 mb-3 text-sm">المعلومات الأساسية</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="اسم الكاميرا">
              <input value={name} onChange={(e) => setName(e.target.value)} className="form-input" placeholder="مثال: كاميرا المنطقة A" />
            </Field>
            <Field label="Camera ID">
              <input value={id} onChange={(e) => setId(e.target.value)} className="form-input" placeholder="CAM-01" disabled={!!editing} />
            </Field>
            <Field label="المنطقة الجغرافية التابعة لها (Zone)">
              <select
                value={zoneId}
                onChange={(e) => handleZoneChange(e.target.value)}
                className="form-input"
              >
                <option value="">-- اختر المنطقة --</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name} ({z.id})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="وصف الموقع التفصيلي">
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="form-input"
                placeholder="مثال: الركن الشمالي الشرقي، بالقرب من الرافعة 3"
              />
            </Field>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-gray-900 mb-3 text-sm">مصدر الفيديو</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="نوع المصدر">
              <select value={sourceType} onChange={(e) => setSourceType(e.target.value as Camera['sourceType'])} className="form-input">
                <option value="rtsp">RTSP</option>
                <option value="network">كاميرا شبكية</option>
                <option value="file">ملف فيديو</option>
              </select>
            </Field>
            <Field label="Stream URL" className="sm:col-span-2">
              <input value={streamUrl} onChange={(e) => setStreamUrl(e.target.value)} className="form-input" dir="ltr" placeholder="rtsp://10.0.1.21:554/stream1" />
            </Field>
            <Field label="اسم المستخدم">
              <input value={username} onChange={(e) => setUsername(e.target.value)} className="form-input" dir="ltr" />
            </Field>
            <Field label="كلمة المرور">
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" dir="ltr" />
            </Field>
          </div>

          <button
            onClick={onTest}
            disabled={testing}
            className="mt-4 flex items-center gap-2 rounded-xl border border-accent-200 bg-accent-50 px-4 py-2.5 text-sm font-bold text-accent-700 hover:bg-accent-100 transition disabled:opacity-50"
          >
            <Plug className={`h-4 w-4 ${testing ? 'animate-spin' : ''}`} />
            {testing ? 'جارٍ الاختبار...' : 'اختبار الاتصال'}
          </button>

          {testResult === 'success' && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" /> تم الاتصال بالكاميرا بنجاح
            </div>
          )}
          {testResult === 'fail' && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm font-semibold text-red-700">
              <XCircle className="h-4 w-4" /> تعذر الاتصال بالكاميرا
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
