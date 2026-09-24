import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Tabs } from '@/components/Tabs';
import { CameraStatusBadge } from '@/components/StatusBadge';
import { Toggle } from '@/components/Toggle';
import { Modal } from '@/components/Modal';
import { useToast } from '@/context/ToastContext';
import { useZones } from '@/context/ZoneContext';
import { useCameras, DEFAULT_CAMERA_SETTING } from '@/context/CameraContext';
import type { Camera, Severity, MaskType, Point, CameraMask, CameraSetting } from '@/data/types';
import {
  ArrowRight, Video, MapPin, Link2, Wifi, Clock, Pencil, Power,
  Sliders, Shield, RotateCcw, Save, MousePointer2, Trash2, Redo2, Info,
  Cctv, Crosshair, Sparkles, Check, AlertTriangle, Eye, EyeOff, Layers,
  Plus, Undo2, Flame, Wind, Activity, Cpu, CheckCircle2,
} from 'lucide-react';

interface Props {
  cameraId: string;
  currentPath: string;
  onNavigate: (path: string) => void;
}

const sourceTypeLabel = { rtsp: 'RTSP', network: 'كاميرا شبكية', file: 'ملف فيديو' };
const severityLabel: Record<Severity, string> = { low: 'منخفض', medium: 'متوسط', high: 'مرتفع' };

export function CameraDetails({ cameraId, currentPath, onNavigate }: Props) {
  const { push } = useToast();
  const { zones, getZoneById } = useZones();
  const {
    getCamera,
    updateCamera,
    getCameraSettings,
    updateCameraSettings,
    resetCameraSettings,
    getCameraMasks,
    addCameraMask,
    updateCameraMask,
    deleteCameraMask,
    toggleCameraMask,
  } = useCameras();

  const camera = getCamera(cameraId);
  const [tab, setTab] = useState('overview');
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editStreamUrl, setEditStreamUrl] = useState('');
  const [editZoneId, setEditZoneId] = useState('');

  // Sync edit form with camera
  useEffect(() => {
    if (camera) {
      setEditName(camera.name);
      setEditLocation(camera.location);
      setEditStreamUrl(camera.streamUrl);
      setEditZoneId(camera.zone_id ?? '');
    }
  }, [camera]);

  if (!camera) {
    return (
      <DashboardLayout title="تفاصيل الكاميرا" currentPath={currentPath} onNavigate={onNavigate}>
        <div className="text-center py-20">
          <p className="text-gray-500 text-base">الكاميرا غير موجودة أو تم حذفها</p>
          <button
            onClick={() => onNavigate('/admin/cameras')}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-accent-600 transition"
          >
            <ArrowRight className="h-4 w-4" />
            العودة لإدارة الكاميرات
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const zone = camera.zone_id ? getZoneById(camera.zone_id) : undefined;
  const settings = getCameraSettings(camera.id);
  const masks = getCameraMasks(camera.id);

  const tabs = [
    { key: 'overview', label: 'نظرة عامة', icon: <Video className="h-4 w-4" /> },
    { key: 'detection', label: 'إعدادات الكشف والخوارزمية', icon: <Sliders className="h-4 w-4" /> },
    { key: 'roi', label: `أقنعة ومناطق الاهتمام (${masks.length})`, icon: <Crosshair className="h-4 w-4" /> },
  ];

  const handleToggleDisable = () => {
    const isCurrentlyDisabled = camera.status === 'disabled';
    const nextStatus = isCurrentlyDisabled ? 'online' : 'disabled';
    updateCamera(camera.id, { status: nextStatus });
    push(isCurrentlyDisabled ? 'تم تفعيل الكاميرا بنجاح' : 'تم تعطيل الكاميرا', 'info');
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) {
      push('يرجى إدخال اسم الكاميرا', 'error');
      return;
    }
    updateCamera(camera.id, {
      name: editName.trim(),
      location: editLocation.trim(),
      streamUrl: editStreamUrl.trim(),
      zone_id: editZoneId || undefined,
    });
    setShowEdit(false);
    push('تم تحديث بيانات الكاميرا بنجاح');
  };

  return (
    <DashboardLayout title={`تفاصيل الكاميرا — ${camera.name}`} currentPath={currentPath} onNavigate={onNavigate}>
      <div className="space-y-5">
        {/* Header Breadcrumb & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={() => onNavigate('/admin/cameras')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800 transition"
          >
            <ArrowRight className="h-4 w-4" />
            العودة لقائمة الكاميرات
          </button>

          <div className="flex items-center gap-3">
            {zone && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 border border-accent-200 px-3 py-1 text-xs font-bold text-accent-700">
                <MapPin className="h-3.5 w-3.5 text-accent-500" />
                {zone.name}
              </span>
            )}
            <CameraStatusBadge status={camera.status} />
          </div>
        </div>

        {/* Main Content Box with Tabs */}
        <div className="rounded-2xl bg-white shadow-card border border-gray-100/80 overflow-hidden">
          <div className="border-b border-gray-100 px-5 pt-2">
            <Tabs tabs={tabs} active={tab} onChange={setTab} />
          </div>

          <div className="p-6">
            {tab === 'overview' && (
              <OverviewTab
                camera={camera}
                zoneName={zone?.name}
                settings={settings}
                masks={masks}
                onEdit={() => setShowEdit(true)}
                onToggleDisable={handleToggleDisable}
              />
            )}
            {tab === 'detection' && (
              <DetectionTab
                cameraId={camera.id}
                camera={camera}
                initialSettings={settings}
                onSave={(newSettings) => {
                  updateCameraSettings(camera.id, newSettings);
                  push('تم حفظ وتطبيق إعدادات الخوارزمية بنجاح');
                }}
                onReset={() => {
                  const reset = resetCameraSettings(camera.id);
                  push('تمت استعادة إعدادات الخوارزمية الافتراضية', 'info');
                  return reset;
                }}
              />
            )}
            {tab === 'roi' && (
              <RoiTab
                camera={camera}
                masks={masks}
                onAddMask={(data) => {
                  addCameraMask({ ...data, camera_id: camera.id });
                  push('تمت إضافة قناع الكاميرا بنجاح');
                }}
                onToggleMask={(maskId) => {
                  toggleCameraMask(maskId);
                  push('تم تغيير حالة تفعيل القناع', 'info');
                }}
                onDeleteMask={(maskId) => {
                  deleteCameraMask(maskId);
                  push('تم حذف القناع بنجاح');
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Edit Camera Modal */}
      <Modal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        title="تعديل بيانات الكاميرا والمنطقة"
        footer={
          <>
            <button
              onClick={() => setShowEdit(false)}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition"
            >
              إلغاء
            </button>
            <button
              onClick={handleSaveEdit}
              className="rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-accent-600 transition shadow-sm"
            >
              حفظ التعديلات
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">اسم الكاميرا *</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">معرف الكاميرا (ID)</label>
              <input
                value={camera.id}
                disabled
                className="w-full rounded-xl border border-gray-100 bg-gray-50 px-3.5 py-2.5 text-sm font-medium text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">المنطقة التابعة لها (Zone)</label>
            <select
              value={editZoneId}
              onChange={(e) => setEditZoneId(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
            >
              <option value="">-- بدون منطقة محددة --</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name} ({z.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">الموقع الوصفي</label>
            <input
              type="text"
              value={editLocation}
              onChange={(e) => setEditLocation(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">رابط البث (Stream URL)</label>
            <input
              type="text"
              dir="ltr"
              value={editStreamUrl}
              onChange={(e) => setEditStreamUrl(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-100 text-left font-mono"
            />
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

// ==========================================
// 1. OVERVIEW TAB
// ==========================================
function OverviewTab({
  camera,
  zoneName,
  settings,
  masks,
  onEdit,
  onToggleDisable,
}: {
  camera: Camera;
  zoneName?: string;
  settings: CameraSetting;
  masks: CameraMask[];
  onEdit: () => void;
  onToggleDisable: () => void;
}) {
  const disabled = camera.status === 'disabled';
  const exclusionCount = masks.filter((m) => m.mask_type === 'exclusion').length;
  const inclusionCount = masks.filter((m) => m.mask_type === 'inclusion').length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Live Stream Viewport */}
      <div className="lg:col-span-2 space-y-4">
        <div className="relative aspect-video rounded-2xl bg-navy-950 overflow-hidden shadow-inner border border-navy-800">
          <div className="absolute inset-0 bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950" />
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: 'radial-gradient(circle at 35% 45%, rgba(255,255,255,0.08) 0%, transparent 60%)',
            }}
          />

          {/* Grid guides */}
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-10">
            <div className="border-r border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-b border-white" />
            <div className="border-r border-white" />
            <div className="border-r border-white" />
            <div />
          </div>

          {/* Stream Overlay info */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="rounded-lg bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur flex items-center gap-2 border border-white/10">
              <span className={`h-2 w-2 rounded-full ${disabled ? 'bg-gray-500' : 'bg-red-500 animate-pulse'}`} />
              {disabled ? 'متوقفة' : 'بث مباشر'}
            </span>
            <span className="rounded-lg bg-black/60 px-2.5 py-1 text-xs font-mono font-medium text-emerald-400 backdrop-blur border border-white/10">
              {settings.fps_target} FPS
            </span>
          </div>

          <div className="absolute bottom-4 right-4 left-4 flex items-center justify-between text-xs text-navy-200">
            <div className="rounded-lg bg-black/60 px-3 py-1.5 backdrop-blur border border-white/10 flex items-center gap-3">
              <span className="font-bold text-white">{camera.name}</span>
              <span className="text-gray-400">|</span>
              <span className="font-mono text-gray-300">{camera.id}</span>
            </div>
            <div className="rounded-lg bg-black/60 px-3 py-1.5 backdrop-blur border border-white/10 font-mono text-gray-300">
              {camera.lastFrame || '00:00:00'}
            </div>
          </div>

          {disabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-navy-950/80 backdrop-blur-sm text-navy-300">
              <div className="text-center p-6">
                <Power className="h-12 w-12 mx-auto mb-3 text-gray-500" />
                <h4 className="text-base font-bold text-white mb-1">الكاميرا معطلة حالياً</h4>
                <p className="text-xs text-gray-400">تم إيقاف معالجة الإطارات والإنذارات لهذه الكاميرا</p>
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-accent-600 transition shadow-sm"
          >
            <Pencil className="h-4 w-4" /> تعديل بيانات الكاميرا
          </button>
          <button
            onClick={onToggleDisable}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition border ${
              disabled
                ? 'bg-emerald-500 border-emerald-600 text-white hover:bg-emerald-600'
                : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            <Power className="h-4 w-4" /> {disabled ? 'تفعيل الكاميرا' : 'تعطيل الكاميرا مؤقتاً'}
          </button>
        </div>
      </div>

      {/* Info & Specifications Column */}
      <div className="space-y-4">
        {/* Basic Info Card */}
        <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 space-y-3">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">بيانات المصدر والشبكة</h4>
          <InfoRow icon={Cctv} label="اسم الكاميرا" value={camera.name} />
          <InfoRow icon={Video} label="معرف الكاميرا ID" value={camera.id} fontMono />
          <InfoRow
            icon={MapPin}
            label="المنطقة المخصصة"
            value={zoneName ? `${zoneName} (${camera.zone_id})` : 'غير مخصصة لمنطقة'}
            highlight={!!zoneName}
          />
          <InfoRow icon={MapPin} label="الموقع الوصفي" value={camera.location || '—'} />
          <InfoRow icon={Link2} label="Stream URL" value={camera.streamUrl} dir="ltr" fontMono />
          <InfoRow icon={Video} label="نوع المصدر" value={sourceTypeLabel[camera.sourceType]} />
          <div className="flex items-center justify-between rounded-xl bg-white border border-gray-100 px-3.5 py-2.5">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Wifi className="h-4 w-4 text-accent-500" /> حالة الاتصال
            </div>
            <CameraStatusBadge status={disabled ? 'disabled' : camera.status} />
          </div>
          <InfoRow icon={Clock} label="آخر إطار مستلم" value={camera.lastFrame} fontMono />
        </div>

        {/* Algorithm Settings Snapshot Card (Entity 3 & 4) */}
        <div className="rounded-2xl border border-accent-100 bg-accent-50/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-accent-800 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-accent-600" />
              مواصفات الخوارزمية والأقنعة
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-white border border-accent-100 p-2.5">
              <span className="text-gray-400 block mb-0.5">معدل الإطارات</span>
              <span className="font-bold text-gray-900">{settings.fps_target} FPS</span>
            </div>
            <div className="rounded-xl bg-white border border-accent-100 p-2.5">
              <span className="text-gray-400 block mb-0.5">نافذة التتبع (N)</span>
              <span className="font-bold text-gray-900">{settings.n_frames} إطار (K={settings.k_frames})</span>
            </div>
            <div className="rounded-xl bg-white border border-accent-100 p-2.5">
              <span className="text-gray-400 block mb-0.5">عتبة الدخان</span>
              <span className="font-bold text-gray-900">{settings.smoke_conf_thresh}%</span>
            </div>
            <div className="rounded-xl bg-white border border-accent-100 p-2.5">
              <span className="text-gray-400 block mb-0.5">عتبة الحريق</span>
              <span className="font-bold text-gray-900">{settings.fire_conf_thresh}%</span>
            </div>
          </div>

          <div className="rounded-xl bg-white border border-accent-100 p-3 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">أقنعة الحجب والاستبعاد:</span>
              <span className="font-bold text-red-600">{exclusionCount} قناع</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">أقنعة التركيز والاهتمام:</span>
              <span className="font-bold text-blue-600">{inclusionCount} قناع</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-gray-100">
              <span className="text-gray-500">فحص السياق الذكي VLM:</span>
              <span className={`font-bold ${settings.vlm_enabled ? 'text-emerald-600' : 'text-gray-400'}`}>
                {settings.vlm_enabled ? 'مفعل نشط' : 'معطل'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  dir,
  fontMono,
  highlight,
}: {
  icon: typeof Video;
  label: string;
  value: string;
  dir?: string;
  fontMono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white border border-gray-100 px-3.5 py-2.5">
      <div className="flex items-center gap-2 text-sm text-gray-500 min-w-0">
        <Icon className="h-4 w-4 shrink-0 text-gray-400" />
        <span className="truncate">{label}</span>
      </div>
      <span
        className={`text-sm font-semibold truncate ${
          highlight ? 'text-accent-600' : 'text-gray-900'
        } ${fontMono ? 'font-mono' : ''}`}
        dir={dir}
      >
        {value}
      </span>
    </div>
  );
}

// ==========================================
// 2. DETECTION & ALGORITHM TAB (Entity 3: CameraSetting)
// ==========================================
function DetectionTab({
  cameraId,
  camera,
  initialSettings,
  onSave,
  onReset,
}: {
  cameraId: string;
  camera: Camera;
  initialSettings: CameraSetting;
  onSave: (settings: CameraSetting) => void;
  onReset: () => CameraSetting;
}) {
  const [fpsTarget, setFpsTarget] = useState(initialSettings.fps_target);
  const [smokeThresh, setSmokeThresh] = useState(initialSettings.smoke_conf_thresh);
  const [fireThresh, setFireThresh] = useState(initialSettings.fire_conf_thresh);
  const [nFrames, setNFrames] = useState(initialSettings.n_frames);
  const [kFrames, setKFrames] = useState(initialSettings.k_frames);

  // Weights (w1 to w5)
  const [w1, setW1] = useState(initialSettings.w1_conf);
  const [w2, setW2] = useState(initialSettings.w2_temporal);
  const [w3, setW3] = useState(initialSettings.w3_area);
  const [w4, setW4] = useState(initialSettings.w4_growth);
  const [w5, setW5] = useState(initialSettings.w5_vlm);
  const [vlmEnabled, setVlmEnabled] = useState(initialSettings.vlm_enabled);

  // Additional settings
  const [severityRule, setSeverityRule] = useState<Severity>(camera.severityRule ?? 'high');

  // Sum of weights
  const totalWeight = Math.round((w1 + w2 + w3 + w4 + w5) * 100) / 100;
  const isWeightValid = Math.abs(totalWeight - 1.0) < 0.02;

  // Auto-normalize weights so sum = 1.00
  const handleNormalize = () => {
    const sum = w1 + w2 + w3 + w4 + w5;
    if (sum <= 0) return;
    setW1(Math.round((w1 / sum) * 100) / 100);
    setW2(Math.round((w2 / sum) * 100) / 100);
    setW3(Math.round((w3 / sum) * 100) / 100);
    setW4(Math.round((w4 / sum) * 100) / 100);
    setW5(Math.round((w5 / sum) * 100) / 100);
  };

  const handleApplySave = () => {
    onSave({
      camera_id: cameraId,
      fps_target: fpsTarget,
      smoke_conf_thresh: smokeThresh,
      fire_conf_thresh: fireThresh,
      n_frames: nFrames,
      k_frames: kFrames,
      w1_conf: w1,
      w2_temporal: w2,
      w3_area: w3,
      w4_growth: w4,
      w5_vlm: w5,
      vlm_enabled: vlmEnabled,
    });
  };

  const handleApplyReset = () => {
    const res = onReset();
    setFpsTarget(res.fps_target);
    setSmokeThresh(res.smoke_conf_thresh);
    setFireThresh(res.fire_conf_thresh);
    setNFrames(res.n_frames);
    setKFrames(res.k_frames);
    setW1(res.w1_conf);
    setW2(res.w2_temporal);
    setW3(res.w3_area);
    setW4(res.w4_growth);
    setW5(res.w5_vlm);
    setVlmEnabled(res.vlm_enabled);
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Overview Intro Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-accent-50 via-white to-accent-50/40 p-5 border border-accent-100 flex items-start gap-4">
        <div className="h-10 w-10 rounded-xl bg-accent-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
          <Cpu className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900">إعدادات محرك الذكاء الاصطناعي وخوارزمية القرار</h3>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
            تتحكم هذه الشاشة بمعاملات عتبات الكشف المستقلة للدخان والنار، ومعاملات المعالجة الزمنية، والأوزان الخمسة في معادلة تقييم خطورة الحادثة قبل إطلاق الإنذارات.
          </p>
        </div>
      </div>

      {/* Section 1: Independent Confidence Thresholds */}
      <div className="space-y-4">
        <div className="border-b border-gray-100 pb-2">
          <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Flame className="h-4 w-4 text-accent-500" />
            1. عتبات الثقة المستقلة (Independent Confidence Thresholds)
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">الحد الأدنى لثقة النموذج لاعتبار التنبؤ إيجابياً لكل نوع كشف بشكل منفصل</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Smoke Threshold */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wind className="h-5 w-5 text-gray-500" />
                <div>
                  <label className="text-sm font-bold text-gray-900 block">عتبة كشف الدخان (smoke_conf_thresh)</label>
                  <span className="text-[11px] text-gray-400">Smoke detection threshold</span>
                </div>
              </div>
              <span className="rounded-xl bg-gray-100 px-3 py-1 font-mono font-bold text-sm text-gray-800">
                {smokeThresh}%
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={95}
              value={smokeThresh}
              onChange={(e) => setSmokeThresh(Number(e.target.value))}
              className="w-full accent-gray-700"
            />
            <div className="flex justify-between text-[11px] text-gray-400">
              <span>حساسية عالية (10%)</span>
              <span>افتراضي (65%)</span>
              <span>صارم (95%)</span>
            </div>
          </div>

          {/* Fire Threshold */}
          <div className="rounded-2xl border border-red-100 bg-red-50/20 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-red-500" />
                <div>
                  <label className="text-sm font-bold text-gray-900 block">عتبة كشف النيران (fire_conf_thresh)</label>
                  <span className="text-[11px] text-gray-400">Fire detection threshold</span>
                </div>
              </div>
              <span className="rounded-xl bg-red-100 px-3 py-1 font-mono font-bold text-sm text-red-700">
                {fireThresh}%
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={95}
              value={fireThresh}
              onChange={(e) => setFireThresh(Number(e.target.value))}
              className="w-full accent-red-500"
            />
            <div className="flex justify-between text-[11px] text-gray-400">
              <span>حساسية عالية (10%)</span>
              <span>افتراضي (75%)</span>
              <span>صارم (95%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: FPS & Temporal Window Parameters */}
      <div className="space-y-4">
        <div className="border-b border-gray-100 pb-2">
          <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Activity className="h-4 w-4 text-accent-500" />
            2. المعالجة الزمنية ومعدل الإطارات (Temporal Window & Sampling)
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">تحديد معدل فحص الإطارات وأبعاد نافذة التحقق الزمني لمنع الإنذارات العابرة</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Target FPS */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-800">معدل الإطارات (fps_target)</label>
              <span className="font-mono font-bold text-sm text-accent-600">{fpsTarget} FPS</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              value={fpsTarget}
              onChange={(e) => setFpsTarget(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-[11px] text-gray-400 leading-tight">معدل سحب الإطارات للتحليل بالذكاء الاصطناعي</p>
          </div>

          {/* Temporal Window N */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-800">حجم النافذة الزمنية (n_frames)</label>
              <span className="font-mono font-bold text-sm text-accent-600">{nFrames} إطار</span>
            </div>
            <input
              type="range"
              min={3}
              max={30}
              value={nFrames}
              onChange={(e) => {
                const val = Number(e.target.value);
                setNFrames(val);
                if (kFrames > val) setKFrames(val);
              }}
              className="w-full"
            />
            <p className="text-[11px] text-gray-400 leading-tight">إجمالي الإطارات في نافذة التتبع التاريخي (N)</p>
          </div>

          {/* Required Positive Frames K */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-800">الإطارات الإيجابية (k_frames)</label>
              <span className="font-mono font-bold text-sm text-accent-600">{kFrames} إطار</span>
            </div>
            <input
              type="range"
              min={1}
              max={nFrames}
              value={kFrames}
              onChange={(e) => setKFrames(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-[11px] text-gray-400 leading-tight">الحد الأدنى للإطارات المتتالية لتأكيد الحدث (K)</p>
          </div>
        </div>
      </div>

      {/* Section 3: Multi-Factor Decision Weights (w1 to w5) */}
      <div className="space-y-4">
        <div className="border-b border-gray-100 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-accent-500" />
              3. أوزان معادلة اتخاذ القرار (Multi-Factor Scoring Weights)
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              معادلة التقييم التراكمي: Score = (w1 × Conf) + (w2 × Temporal) + (w3 × Area) + (w4 × Growth) + (w5 × VLM)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`rounded-xl px-3 py-1 font-mono text-xs font-bold border ${
                isWeightValid
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              مجموع الأوزان: {totalWeight.toFixed(2)} / 1.00
            </span>
            {!isWeightValid && (
              <button
                onClick={handleNormalize}
                className="rounded-xl bg-amber-500 px-3 py-1 text-xs font-bold text-white hover:bg-amber-600 transition"
              >
                موازنة تلقائية
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <WeightSlider
            label="w1_conf: وزن ثقة النموذج الفردي"
            desc="ثقة كاشف الكائنات (YOLO / Detector Confidence)"
            value={w1}
            onChange={setW1}
          />
          <WeightSlider
            label="w2_temporal: وزن الثبات والاتساق الزمني"
            desc="نسبة استقرار الرقعة وتكرار ظهورها في الإطارات المتتابعة"
            value={w2}
            onChange={setW2}
          />
          <WeightSlider
            label="w3_area: وزن نسبة مساحة الرقعة"
            desc="مساحة رقعة الدخان أو النار بالنسبة لمساحة الإطار الكلية"
            value={w3}
            onChange={setW3}
          />
          <WeightSlider
            label="w4_growth: وزن معدل نمو وتمدد الرقعة"
            desc="سرعة توسع رقعة الدخان/النار بين الإطارات المتعاقبة"
            value={w4}
            onChange={setW4}
          />
          <div className="md:col-span-2">
            <WeightSlider
              label="w5_vlm: وزن التحقق بالسياق البصري (VLM Score)"
              desc="درجة تأكيد النموذج اللغوي البصري لبيئة الحادثة ونفي الإيجابيات الكاذبة"
              value={w5}
              onChange={setW5}
            />
          </div>
        </div>
      </div>

      {/* Section 4: VLM Smart Verification Toggle & Severity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* VLM Verification */}
        <div className="rounded-2xl border border-accent-100 bg-accent-50/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-accent-600" />
              <div>
                <p className="text-sm font-bold text-gray-900">فحص الذكاء الاصطناعي البصري (VLM)</p>
                <p className="text-xs text-gray-500">Vision Language Model Confirmation</p>
              </div>
            </div>
            <Toggle checked={vlmEnabled} onChange={setVlmEnabled} />
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            عند تفعيله، يتم إرسال الإطارات المشتبه بها فورياً لنموذج VLM لتحليل دلالات المشهد واستبعاد الانعكاسات، البخار الصناعي، وغبار التهوية.
          </p>
        </div>

        {/* Severity Rule */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 space-y-3">
          <div>
            <label className="text-sm font-bold text-gray-900 block">قاعدة تصنيف الخطورة الافتراضية</label>
            <span className="text-xs text-gray-500">درجة إلحاح الإنذارات الصادرة من هذه الكاميرا</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['low', 'medium', 'high'] as Severity[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSeverityRule(s)}
                className={`rounded-xl py-2.5 text-xs font-bold transition border-2 ${
                  severityRule === s
                    ? s === 'high'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : s === 'medium'
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-accent-500 bg-accent-50 text-accent-700'
                    : 'border-gray-100 text-gray-500 hover:border-gray-200'
                }`}
              >
                {severityLabel[s]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-100">
        <button
          onClick={handleApplySave}
          className="flex items-center gap-2 rounded-xl bg-accent-500 px-6 py-3 text-sm font-bold text-white hover:bg-accent-600 transition shadow-sm"
        >
          <Save className="h-4 w-4" /> حفظ وتطبيق إعدادات الخوارزمية
        </button>
        <button
          onClick={handleApplyReset}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
        >
          <RotateCcw className="h-4 w-4" /> استعادة القيم الافتراضية
        </button>
      </div>
    </div>
  );
}

function WeightSlider({
  label,
  desc,
  value,
  onChange,
}: {
  label: string;
  desc: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-2.5">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-bold text-gray-900 block">{label}</label>
          <span className="text-[11px] text-gray-400">{desc}</span>
        </div>
        <span className="rounded-lg bg-accent-50 px-2.5 py-1 font-mono font-bold text-xs text-accent-700">
          {(value * 100).toFixed(0)}% ({value.toFixed(2)})
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(value * 100)}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="w-full accent-accent-500"
      />
    </div>
  );
}

// ==========================================
// 3. ROI & MASKS TAB (Entity 4: CameraMask)
// ==========================================
function RoiTab({
  camera,
  masks,
  onAddMask,
  onToggleMask,
  onDeleteMask,
}: {
  camera: Camera;
  masks: CameraMask[];
  onAddMask: (data: { name: string; mask_type: MaskType; polygon_points: Point[]; is_active: boolean }) => void;
  onToggleMask: (maskId: string) => void;
  onDeleteMask: (maskId: string) => void;
}) {
  const [drawing, setDrawing] = useState(false);
  const [points, setPoints] = useState<Point[]>([]);
  const [maskName, setMaskName] = useState('قناع حجب جديد');
  const [maskType, setMaskType] = useState<MaskType>('exclusion');

  // Handle canvas click to add polygon point
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!drawing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round((((e.clientX - rect.left) / rect.width) * 100) * 10) / 10;
    const y = Math.round((((e.clientY - rect.top) / rect.height) * 100) * 10) / 10;
    setPoints((prev) => [...prev, { x, y }]);
  };

  const handleStartDraw = (type: MaskType) => {
    setMaskType(type);
    setMaskName(type === 'exclusion' ? `حجب منطقة عازلة (${masks.length + 1})` : `تركيز عنبر تخزين (${masks.length + 1})`);
    setPoints([]);
    setDrawing(true);
  };

  const handleApplyPreset = (preset: 'center' | 'top' | 'bottom' | 'corridor') => {
    setDrawing(true);
    if (preset === 'center') {
      setPoints([
        { x: 25, y: 25 },
        { x: 75, y: 25 },
        { x: 75, y: 75 },
        { x: 25, y: 75 },
      ]);
    } else if (preset === 'top') {
      setPoints([
        { x: 5, y: 5 },
        { x: 95, y: 5 },
        { x: 95, y: 40 },
        { x: 5, y: 40 },
      ]);
    } else if (preset === 'bottom') {
      setPoints([
        { x: 5, y: 60 },
        { x: 95, y: 60 },
        { x: 95, y: 95 },
        { x: 5, y: 95 },
      ]);
    } else if (preset === 'corridor') {
      setPoints([
        { x: 35, y: 10 },
        { x: 65, y: 10 },
        { x: 65, y: 90 },
        { x: 35, y: 90 },
      ]);
    }
  };

  const handleSaveCurrentMask = () => {
    if (points.length < 3) return;
    onAddMask({
      name: maskName.trim() || 'قناع غير مسمى',
      mask_type: maskType,
      polygon_points: points,
      is_active: true,
    });
    setPoints([]);
    setDrawing(false);
  };

  const currentPolygonPointsStr = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Interactive Canvas Viewport */}
      <div className="lg:col-span-2 space-y-4">
        <div
          onClick={handleCanvasClick}
          className={`relative aspect-video rounded-2xl bg-navy-950 overflow-hidden shadow-inner border border-navy-800 ${
            drawing ? 'cursor-crosshair' : 'cursor-default'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle at 40% 40%, rgba(255,255,255,0.08) 0%, transparent 60%)',
            }}
          />

          {/* SVG Overlay: Render existing active masks */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            {masks.map((mask) => {
              if (!mask.is_active || mask.polygon_points.length < 3) return null;
              const pointsStr = mask.polygon_points.map((p) => `${p.x},${p.y}`).join(' ');
              const isExclusion = mask.mask_type === 'exclusion';

              return (
                <g key={mask.id}>
                  <polygon
                    points={pointsStr}
                    fill={isExclusion ? 'rgba(239, 68, 68, 0.25)' : 'rgba(59, 130, 246, 0.25)'}
                    stroke={isExclusion ? '#ef4444' : '#3b82f6'}
                    strokeWidth="0.8"
                    strokeDasharray={isExclusion ? '1.5 1' : 'none'}
                  />
                  {/* First point label */}
                  {mask.polygon_points[0] && (
                    <text
                      x={mask.polygon_points[0].x + 1}
                      y={mask.polygon_points[0].y + 3}
                      fill={isExclusion ? '#fca5a5' : '#93c5fd'}
                      fontSize="3"
                      fontWeight="bold"
                    >
                      {mask.name} ({isExclusion ? 'حجب' : 'تركيز'})
                    </text>
                  )}
                </g>
              );
            })}

            {/* Currently drawing polygon */}
            {points.length > 0 && (
              <g>
                {points.length >= 3 && (
                  <polygon
                    points={currentPolygonPointsStr}
                    fill={maskType === 'exclusion' ? 'rgba(239, 68, 68, 0.35)' : 'rgba(59, 130, 246, 0.35)'}
                    stroke={maskType === 'exclusion' ? '#ef4444' : '#3b82f6'}
                    strokeWidth="1"
                    strokeDasharray="2 1"
                  />
                )}
                {/* Connecting lines */}
                {points.map((p, idx) => {
                  if (idx === 0) return null;
                  const prev = points[idx - 1];
                  return (
                    <line
                      key={idx}
                      x1={prev.x}
                      y1={prev.y}
                      x2={p.x}
                      y2={p.y}
                      stroke={maskType === 'exclusion' ? '#ef4444' : '#3b82f6'}
                      strokeWidth="0.8"
                    />
                  );
                })}
                {/* Point handles */}
                {points.map((p, idx) => (
                  <circle
                    key={idx}
                    cx={p.x}
                    cy={p.y}
                    r="1.2"
                    fill={maskType === 'exclusion' ? '#ef4444' : '#3b82f6'}
                    stroke="#ffffff"
                    strokeWidth="0.4"
                  />
                ))}
              </g>
            )}
          </svg>

          {/* Help Overlay when idle */}
          {!drawing && masks.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-navy-300 text-center p-6 pointer-events-none">
              <div>
                <Crosshair className="h-12 w-12 mx-auto mb-2 opacity-40 text-accent-400" />
                <p className="text-sm font-bold text-white">لم يتم رسم أي قناع لهذه الكاميرا بعد</p>
                <p className="text-xs text-gray-400 mt-1">
                  اختر «قناع استبعاد/حجب» أو «قناع تركيز/اهتمام» للبدء بالرسم
                </p>
              </div>
            </div>
          )}

          {/* Top badges */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <span className="rounded-lg bg-black/60 px-2.5 py-1 text-xs text-white backdrop-blur border border-white/10 font-mono">
              {camera.id}
            </span>
            {drawing && (
              <span className={`rounded-lg px-2.5 py-1 text-xs font-bold text-white backdrop-blur animate-pulse ${
                maskType === 'exclusion' ? 'bg-red-600/80' : 'bg-blue-600/80'
              }`}>
                جاري الرسم: {maskType === 'exclusion' ? 'قناع حجب (استبعاد)' : 'قناع تركيز (اهتمام)'}
              </span>
            )}
          </div>

          {/* Drawing points counter */}
          {drawing && (
            <div className="absolute bottom-3 right-3 rounded-lg bg-black/70 px-3 py-1 text-xs text-white backdrop-blur border border-white/10">
              عدد النقاط: <span className="font-bold text-accent-400 font-mono">{points.length}</span> (انقر على الفيديو لإضافة نقطة)
            </div>
          )}
        </div>

        {/* Drawing Controls & Presets */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 space-y-4 shadow-sm">
          {!drawing ? (
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleStartDraw('exclusion')}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition shadow-sm"
              >
                <EyeOff className="h-4 w-4" /> إضافة قناع استبعاد / حجب (Exclusion)
              </button>
              <button
                onClick={() => handleStartDraw('inclusion')}
                className="flex items-center gap-2 rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-accent-600 transition shadow-sm"
              >
                <Crosshair className="h-4 w-4" /> إضافة قناع تركيز / اهتمام (Inclusion)
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">اسم القناع</label>
                  <input
                    type="text"
                    value={maskName}
                    onChange={(e) => setMaskName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-accent-400"
                    placeholder="مثال: حجب انعكاس النوافذ"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">نوع القناع (mask_type)</label>
                  <select
                    value={maskType}
                    onChange={(e) => setMaskType(e.target.value as MaskType)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-accent-400"
                  >
                    <option value="exclusion">حجب / استبعاد (Exclusion - أحمر)</option>
                    <option value="inclusion">تركيز / اهتمام (Inclusion - أزرق)</option>
                  </select>
                </div>
              </div>

              {/* Fast Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-400 ml-1">أشكال سريعة:</span>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('center')}
                  className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition"
                >
                  مستطيل وسطي
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('top')}
                  className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition"
                >
                  النصف العلوي (سقف/نوافذ)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('bottom')}
                  className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition"
                >
                  النصف السفلي (أرضيات)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('corridor')}
                  className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition"
                >
                  الممر الأوسط
                </button>
              </div>

              {/* Action buttons while drawing */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={handleSaveCurrentMask}
                  disabled={points.length < 3}
                  className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-600 transition disabled:opacity-40"
                >
                  <Save className="h-4 w-4" /> حفظ القناع
                </button>
                <button
                  onClick={() => setPoints((p) => p.slice(0, -1))}
                  disabled={points.length === 0}
                  className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-40"
                >
                  <Undo2 className="h-3.5 w-3.5" /> تراجع عن نقطة
                </button>
                <button
                  onClick={() => setPoints([])}
                  className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  <Trash2 className="h-3.5 w-3.5" /> مسح النقاط
                </button>
                <button
                  onClick={() => {
                    setDrawing(false);
                    setPoints([]);
                  }}
                  className="rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition mr-auto"
                >
                  إلغاء الرسم
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Masks List Sidebar */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h4 className="text-sm font-bold text-gray-900">الأقنعة المسجلة للكاميرا</h4>
              <p className="text-xs text-gray-400 mt-0.5">إجمالي: {masks.length} قناع</p>
            </div>
            <Layers className="h-5 w-5 text-accent-500" />
          </div>

          {masks.length === 0 ? (
            <div className="text-center py-8 px-4 border border-dashed border-gray-200 rounded-xl">
              <Layers className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-gray-700">لا توجد أقنعة مخصصة</p>
              <p className="text-[11px] text-gray-400 mt-1">
                قم برسم مناطق استبعاد لحجب الأجسام العاكسة، أو مناطق تركيز لتحديد مستودعات المواد الحساسة.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {masks.map((mask) => {
                const isExclusion = mask.mask_type === 'exclusion';

                return (
                  <div
                    key={mask.id}
                    className={`rounded-xl border p-3 transition space-y-2.5 ${
                      mask.is_active
                        ? isExclusion
                          ? 'border-red-200 bg-red-50/20'
                          : 'border-blue-200 bg-blue-50/20'
                        : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              isExclusion
                                ? 'bg-red-100 text-red-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {isExclusion ? <EyeOff className="h-3 w-3" /> : <Crosshair className="h-3 w-3" />}
                            {isExclusion ? 'استبعاد / حجب' : 'تركيز / اهتمام'}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {mask.polygon_points.length} نقاط
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-gray-900 truncate">{mask.name}</h5>
                      </div>

                      <button
                        onClick={() => onDeleteMask(mask.id)}
                        className="text-gray-400 hover:text-red-600 transition p-1"
                        title="حذف القناع"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-gray-100/80 text-[11px]">
                      <span className="text-gray-500">
                        حالة القناع: <span className="font-bold text-gray-800">{mask.is_active ? 'مفعل' : 'معطل'}</span>
                      </span>
                      <Toggle checked={mask.is_active} onChange={() => onToggleMask(mask.id)} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* System Guidance Card */}
        <div className="rounded-2xl border border-accent-100 bg-accent-50/40 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-accent-900">
            <Info className="h-4 w-4 text-accent-600 shrink-0" />
            <span>آلية عمل الأقنعة (Masks Engine)</span>
          </div>
          <p className="text-xs text-accent-800/90 leading-relaxed">
            • <strong>مناطق الاستبعاد (Exclusion):</strong> يتم تجاهل أي حركة أو انبعاث دخاني أو لهب يقع داخلها نهائياً لتفادي الإنذارات الخاطئة (مثل عوادم الرافعات أو أضواء النوافذ).
          </p>
          <p className="text-xs text-accent-800/90 leading-relaxed">
            • <strong>مناطق التركيز (Inclusion):</strong> يُعطى الكشف داخلها أولوية كبرى وحساسية مرتفعة لسرعة إطلاق الإنذار (مثل طبالي الكرتون وخزانات المواد الكيميائية).
          </p>
        </div>
      </div>
    </div>
  );
}
