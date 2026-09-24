import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Modal } from '@/components/Modal';
import { CameraStatusBadge } from '@/components/StatusBadge';
import { useToast } from '@/context/ToastContext';
import { useZones } from '@/context/ZoneContext';
import { cameras as initialCameras } from '@/data/mock';
import type { Zone, Camera } from '@/data/types';
import {
  MapPin, Plus, Search, Pencil, Trash2, Cctv, AlertTriangle,
  Building2, Layers, CheckCircle2, Eye, ShieldCheck
} from 'lucide-react';

interface Props {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function ZoneManagement({ currentPath, onNavigate }: Props) {
  const { push } = useToast();
  const { zones, addZone, updateZone, deleteZone } = useZones();

  // Local state
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Zone | null>(null);
  const [viewingCamerasZone, setViewingCamerasZone] = useState<Zone | null>(null);

  // Form inputs
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formError, setFormError] = useState('');

  // Map cameras to zones
  const zoneCameraMap = useMemo(() => {
    const map = new Map<string, Camera[]>();
    zones.forEach((z) => map.set(z.id, []));

    initialCameras.forEach((cam) => {
      // Find matching zone either by zone_id or matching location text
      let matchedZone = zones.find((z) => z.id === cam.zone_id);
      if (!matchedZone) {
        matchedZone = zones.find((z) => z.name.includes(cam.location) || cam.location.includes(z.name));
      }
      if (matchedZone) {
        const list = map.get(matchedZone.id) || [];
        list.push(cam);
        map.set(matchedZone.id, list);
      }
    });
    return map;
  }, [zones]);

  // Filtered zones
  const filteredZones = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return zones;
    return zones.filter(
      (z) =>
        z.name.toLowerCase().includes(q) ||
        z.id.toLowerCase().includes(q) ||
        (z.description && z.description.toLowerCase().includes(q))
    );
  }, [zones, search]);

  // Statistics
  const totalZones = zones.length;
  const totalAssignedCameras = Array.from(zoneCameraMap.values()).reduce((acc, cams) => acc + cams.length, 0);
  const activeMonitoredZones = Array.from(zoneCameraMap.entries()).filter(
    ([_, cams]) => cams.some((c) => c.status === 'online')
  ).length;

  const handleOpenAdd = () => {
    setEditingZone(null);
    setFormName('');
    setFormDesc('');
    setFormError('');
    setShowForm(true);
  };

  const handleOpenEdit = (zone: Zone) => {
    setEditingZone(zone);
    setFormName(zone.name);
    setFormDesc(zone.description || '');
    setFormError('');
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('يرجى إدخال اسم المنطقة');
      return;
    }

    if (editingZone) {
      updateZone(editingZone.id, { name: formName, description: formDesc });
      push(`تم تحديث بيانات المنطقة "${formName.trim()}" بنجاح`, 'success');
    } else {
      const created = addZone({ name: formName, description: formDesc });
      push(`تمت إضافة المنطقة الجديدة "${created.name}" بنجاح`, 'success');
    }

    setShowForm(false);
    setEditingZone(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;

    const result = deleteZone(deleteTarget.id, initialCameras);
    if (!result.success) {
      push(result.error || 'فشل حذف المنطقة', 'error');
    } else {
      push(`تم حذف المنطقة "${deleteTarget.name}" بنجاح`, 'info');
      setDeleteTarget(null);
    }
  };

  const deleteTargetCameras = deleteTarget ? zoneCameraMap.get(deleteTarget.id) || [] : [];

  return (
    <DashboardLayout title="إدارة المناطق الجغرافية" currentPath={currentPath} onNavigate={onNavigate}>
      <div className="space-y-6">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-card border border-gray-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-500/10 text-accent-600">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500">إجمالي المناطق</p>
              <p className="text-2xl font-black text-gray-900">{totalZones}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-card border border-gray-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
              <Cctv className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500">الكاميرات الموزعة</p>
              <p className="text-2xl font-black text-gray-900">{totalAssignedCameras}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-card border border-gray-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500">مناطق قيد المراقبة النشطة</p>
              <p className="text-2xl font-black text-emerald-600">{activeMonitoredZones} من {totalZones}</p>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث باسم المنطقة، المعرف، أو الوصف..."
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-11 pl-4 text-sm font-medium outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-100 transition shadow-sm"
            />
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-5 py-2.5 font-bold text-white shadow-soft hover:bg-accent-600 transition"
          >
            <Plus className="h-5 w-5" />
            إضافة منطقة جديدة
          </button>
        </div>

        {/* Zones Table */}
        <div className="rounded-2xl bg-white shadow-card border border-gray-100/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70 text-right">
                  <th className="px-5 py-3.5 font-semibold text-gray-700">معرف المنطقة</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-700">اسم المنطقة الجغرافية</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-700">الوصف التشغيلي</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-700 text-center">الكاميرات المرتبطة</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-700">تاريخ الإنشاء</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-700 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredZones.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <MapPin className="h-10 w-10 text-gray-300" />
                        <p className="font-semibold text-gray-600">لا توجد مناطق مطابقة للبحث</p>
                        <p className="text-xs text-gray-400">يمكنك إضافة منطقة جديدة باستخدام الزر أعلاه</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredZones.map((z) => {
                    const cams = zoneCameraMap.get(z.id) || [];
                    const onlineCount = cams.filter((c) => c.status === 'online').length;
                    const dateFormatted = new Date(z.created_at).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    });

                    return (
                      <tr key={z.id} className="hover:bg-gray-50/60 transition group">
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-navy-50 text-navy-800 border border-navy-100">
                            {z.id}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
                              <MapPin className="h-4 w-4" />
                            </div>
                            <div>
                              <span className="font-bold text-gray-900 block">{z.name}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 max-w-xs text-gray-600">
                          <span className="line-clamp-2 text-xs leading-relaxed">
                            {z.description || '— لا يوجد وصف —'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          {cams.length > 0 ? (
                            <button
                              onClick={() => setViewingCamerasZone(z)}
                              className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/80 px-3 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100 transition cursor-pointer"
                              title="انقر لعرض الكاميرات التابعة لهذه المنطقة"
                            >
                              <Cctv className="h-3.5 w-3.5" />
                              {cams.length} كاميرا
                              {onlineCount > 0 && (
                                <span className="flex h-2 w-2 rounded-full bg-emerald-500" title={`${onlineCount} نشطة`} />
                              )}
                            </button>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-400 px-2.5 py-0.5 text-xs font-medium">
                              لا توجد كاميرات
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-500 font-medium">
                          {dateFormatted}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {cams.length > 0 && (
                              <button
                                onClick={() => setViewingCamerasZone(z)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                                title="عرض الكاميرات"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenEdit(z)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition"
                              title="تعديل بيانات المنطقة"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(z)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                              title="حذف المنطقة"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        <Modal
          open={showForm}
          onClose={() => setShowForm(false)}
          title={editingZone ? `تعديل المنطقة: ${editingZone.name}` : 'إضافة منطقة جغرافية جديدة'}
          size="md"
        >
          <form onSubmit={handleSave} className="space-y-4">
            {formError && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1.5">
                اسم المنطقة <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => {
                  setFormName(e.target.value);
                  if (formError) setFormError('');
                }}
                placeholder="مثال: المستودع الشمالي - قسم المواد الكيميائية"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100 transition"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1.5">
                الوصف والهدف التشغيلي (اختياري)
              </label>
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                rows={3}
                placeholder="أدخل وصفاً لطبيعة المواد المخزنة، درجة الخطورة، أو مسارات الحركة داخل هذه المنطقة..."
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100 transition resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-2 text-sm font-bold text-white shadow-soft hover:bg-accent-600 transition"
              >
                <CheckCircle2 className="h-4 w-4" />
                {editingZone ? 'حفظ التعديلات' : 'إضافة المنطقة'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal with Relational Integrity */}
        <Modal
          open={deleteTarget !== null}
          onClose={() => setDeleteTarget(null)}
          title="تأكيد حذف المنطقة الجغرافية"
          size="md"
        >
          {deleteTarget && (
            <div className="space-y-4">
              {deleteTargetCameras.length > 0 ? (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-amber-900">لا يمكن حذف هذه المنطقة حالياً</h4>
                      <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                        المنطقة <span className="font-bold">"{deleteTarget.name}"</span> مرتبطة حالياً بـ{' '}
                        <span className="font-bold text-amber-950">{deleteTargetCameras.length} كاميرا مراقبة</span>. للحفاظ على
                        سلامة التكامل المرجعي للبيانات، يرجى إعادة تعيين موقع الكاميرات أو حذفها أولاً.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/80 rounded-lg p-2.5 border border-amber-200/60 max-h-36 overflow-y-auto divide-y divide-gray-100">
                    {deleteTargetCameras.map((c) => (
                      <div key={c.id} className="py-1.5 flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-800">{c.name} ({c.id})</span>
                        <CameraStatusBadge status={c.status} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-gray-700 space-y-2">
                  <p className="text-sm">
                    هل أنت متأكد من رغبتك في حذف المنطقة{' '}
                    <span className="font-bold text-gray-900">"{deleteTarget.name}"</span> بشكل نهائي؟
                  </p>
                  <p className="text-xs text-gray-500">
                    هذا الإجراء لا يمكن التراجع عنه. لن تتأثر كاميرات المستودعات الأخرى.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
                >
                  إلغاء
                </button>
                {deleteTargetCameras.length === 0 && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-sm font-bold text-white shadow-soft hover:bg-red-700 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                    تأكيد الحذف
                  </button>
                )}
              </div>
            </div>
          )}
        </Modal>

        {/* View Linked Cameras Modal */}
        <Modal
          open={viewingCamerasZone !== null}
          onClose={() => setViewingCamerasZone(null)}
          title={viewingCamerasZone ? `الكاميرات التابعة لـ: ${viewingCamerasZone.name}` : 'الكاميرات'}
          size="lg"
        >
          {viewingCamerasZone && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs text-gray-600">
                <span>معرف المنطقة: <strong className="font-mono text-gray-900">{viewingCamerasZone.id}</strong></span>
                <span>إجمالي الكاميرات: <strong className="text-accent-600 font-bold">{(zoneCameraMap.get(viewingCamerasZone.id) || []).length}</strong></span>
              </div>

              <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                {(zoneCameraMap.get(viewingCamerasZone.id) || []).map((c) => (
                  <div key={c.id} className="p-3.5 flex items-center justify-between hover:bg-gray-50/70 transition">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
                        <Cctv className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{c.name}</p>
                        <p className="text-xs font-mono text-gray-500">{c.id} • {c.streamUrl}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <CameraStatusBadge status={c.status} />
                      <button
                        onClick={() => {
                          setViewingCamerasZone(null);
                          onNavigate(`/admin/cameras/${c.id}`);
                        }}
                        className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-accent-50 hover:text-accent-600 transition"
                      >
                        فتح الكاميرا
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
