import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Modal } from '@/components/Modal';
import { IncidentStatusBadge, SeverityBadge } from '@/components/StatusBadge';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { useIncidents } from '@/context/IncidentContext';
import { useAudit } from '@/context/AuditContext';
import type { Incident, IncidentStatus, Detection, IncidentImage } from '@/data/types';
import {
  ArrowRight, Flame, Wind, MapPin, Video, Clock, Target, Activity,
  ShieldCheck, CheckCircle2, Eye, XCircle, Camera, AlertTriangle,
  Layers, Maximize2, Sparkles, Check, FileText, CheckSquare, Image as ImageIcon,
} from 'lucide-react';

interface Props {
  incidentId: string;
  currentPath: string;
  onNavigate: (path: string) => void;
  readOnly?: boolean;
}

const statusLabel: Record<IncidentStatus, string> = {
  new: 'جديدة',
  confirmed: 'تم الإقرار',
  following: 'قيد المتابعة',
  resolved: 'تمت المعالجة',
  false_alarm: 'إنذار خاطئ',
  closed: 'مغلقة',
};

export function IncidentReview({ incidentId, currentPath, onNavigate, readOnly }: Props) {
  const { push } = useToast();
  const { user } = useAuth();
  const {
    getIncident,
    getIncidentDetections,
    getIncidentImages,
    acknowledgeIncident,
    setIncidentFollowing,
    resolveIncident,
    rejectIncident,
    closeIncident,
  } = useIncidents();

  const incident = getIncident(incidentId);
  const detections = incident ? getIncidentDetections(incident.id) : [];
  const images = incident ? getIncidentImages(incident.id) : [];

  const [activeFrameIndex, setActiveFrameIndex] = useState(0);
  const [showBBox, setShowBBox] = useState(true);
  const [mediaTab, setMediaTab] = useState<'detections' | 'images'>('detections');
  const [selectedImage, setSelectedImage] = useState<IncidentImage | null>(null);

  // Modals
  const [showFalseAlarm, setShowFalseAlarm] = useState(false);
  const [falseAlarmReason, setFalseAlarmReason] = useState('');
  const [falseAlarmError, setFalseAlarmError] = useState(false);

  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');
  const [resolveError, setResolveError] = useState(false);

  if (!incident) {
    return (
      <DashboardLayout title="مراجعة الحادثة" currentPath={currentPath} onNavigate={onNavigate}>
        <div className="text-center py-20">
          <p className="text-gray-500 text-base">الحادثة غير موجودة أو تم حذفها</p>
          <button
            onClick={() => onNavigate(readOnly ? '/supervisor/history' : '/supervisor/incidents')}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-accent-600 transition"
          >
            <ArrowRight className="h-4 w-4" />
            العودة للحوادث
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Active detection frame (fallback to synthesized default if no detections array)
  const activeDetection: Detection = detections[activeFrameIndex] || {
    id: `DET-DEF-01`,
    camera_id: incident.camera_id,
    incident_id: incident.id,
    class_detected: incident.primary_type,
    confidence: incident.confidence,
    bbox: { x: 25, y: 22, width: 45, height: 50 },
    area_ratio: 0.18,
    timestamp: incident.started_at,
  };

  const { createLog } = useAudit();
  const supervisorName = user?.username || 'supervisor';

  const handleAcknowledge = () => {
    acknowledgeIncident(incident.id, supervisorName);
    createLog('تأكيد حادثة', `إقرار واستلام الحادثة ${incident.id} (${incident.cameraName})`, supervisorName, 'supervisor');
    push('تم إقرار الحادثة وتأكيد صحتها بنجاح');
  };

  const handleFollowing = () => {
    setIncidentFollowing(incident.id, supervisorName);
    createLog('متابعة حادثة', `وضع الحادثة ${incident.id} قيد المتابعة البصرية المستمرة`, supervisorName, 'supervisor');
    push('تم وضع الحادثة قيد المتابعة البصرية', 'info');
  };

  const handleClose = () => {
    closeIncident(incident.id, supervisorName);
    createLog('إغلاق حادثة', `أرشفة وإغلاق بلاغ الحادثة ${incident.id}`, supervisorName, 'supervisor');
    push('تم إغلاق البلاغ وأرشفة السجل');
  };

  const submitFalseAlarm = () => {
    if (!falseAlarmReason.trim()) {
      setFalseAlarmError(true);
      return;
    }
    rejectIncident(incident.id, supervisorName, falseAlarmReason.trim());
    createLog('تصنيف إنذار خاطئ', `تصنيف الحادثة ${incident.id} كإنذار خاطئ: ${falseAlarmReason.trim()}`, supervisorName, 'supervisor');
    push('تم تصنيف الحادثة كإنذار خاطئ', 'info');
    setShowFalseAlarm(false);
    setFalseAlarmReason('');
    setFalseAlarmError(false);
  };

  const submitResolution = () => {
    if (!resolutionNote.trim()) {
      setResolveError(true);
      return;
    }
    resolveIncident(incident.id, supervisorName, resolutionNote.trim());
    createLog('معالجة حادثة', `معالجة وتوثيق تقرير إغلاق الحادثة ${incident.id}: ${resolutionNote.trim()}`, supervisorName, 'supervisor');
    push('تمت معالجة الحادثة وتوثيق تقرير الإجراء بنجاح');
    setShowResolveModal(false);
    setResolutionNote('');
    setResolveError(false);
  };

  const isFire = incident.primary_type === 'fire';

  return (
    <DashboardLayout title={`مراجعة الحادثة — ${incident.id}`} currentPath={currentPath} onNavigate={onNavigate}>
      <div className="space-y-5">
        {/* Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={() => onNavigate(readOnly ? '/supervisor/history' : '/supervisor/incidents')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800 transition"
          >
            <ArrowRight className="h-4 w-4" />
            {readOnly ? 'العودة لسجل الحوادث' : 'العودة للحوادث النشطة'}
          </button>

          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-gray-500">{incident.started_at}</span>
            <IncidentStatusBadge status={incident.status} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Main Visual Evidence Area (3 Columns) */}
          <div className="lg:col-span-3 space-y-4">
            {/* Viewport Card */}
            <div className="rounded-2xl bg-white shadow-card border border-gray-100/80 overflow-hidden">
              <div className="relative aspect-video bg-navy-950 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950" />
                <div
                  className="absolute inset-0 opacity-25"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 45% 35%, rgba(255,255,255,0.08) 0%, transparent 60%)',
                  }}
                />

                {/* Simulated visual plume for realism */}
                <div
                  className="absolute pointer-events-none transition-all duration-300"
                  style={{
                    top: `${activeDetection.bbox.y}%`,
                    left: `${activeDetection.bbox.x}%`,
                    width: `${activeDetection.bbox.width}%`,
                    height: `${activeDetection.bbox.height}%`,
                  }}
                >
                  <div
                    className={`w-full h-full rounded-full blur-2xl ${
                      isFire ? 'bg-amber-500/30' : 'bg-gray-400/25'
                    }`}
                  />
                </div>

                {/* Real-Coordinate AI Bounding Box (Entity 6: Detection.bbox) */}
                {showBBox && (
                  <div
                    className={`absolute border-2 rounded-lg transition-all duration-200 pointer-events-none ${
                      isFire
                        ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                        : 'border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                    }`}
                    style={{
                      top: `${activeDetection.bbox.y}%`,
                      left: `${activeDetection.bbox.x}%`,
                      width: `${activeDetection.bbox.width}%`,
                      height: `${activeDetection.bbox.height}%`,
                    }}
                  >
                    {/* Bounding Box Badge */}
                    <div
                      className={`absolute -top-8 right-0 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-white text-xs font-bold shadow-md ${
                        isFire ? 'bg-red-600' : 'bg-blue-600'
                      }`}
                    >
                      {isFire ? <Flame className="h-3.5 w-3.5" /> : <Wind className="h-3.5 w-3.5" />}
                      <span>{isFire ? 'حريق / FIRE' : 'دخان / SMOKE'}</span>
                      <span className="font-mono">({activeDetection.confidence}%)</span>
                    </div>

                    {/* Area Ratio Tag */}
                    <div className="absolute -bottom-6 left-0 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-gray-200 backdrop-blur font-mono">
                      مساحة الرقعة: {Math.round(activeDetection.area_ratio * 100)}%
                    </div>
                  </div>
                )}

                {/* Top Overlay Badges */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <span className="rounded-lg bg-black/60 px-2.5 py-1 text-xs text-white backdrop-blur border border-white/10 font-mono">
                    {incident.cameraId}
                  </span>
                  <span className="rounded-lg bg-black/60 px-2.5 py-1 text-xs font-mono text-gray-300 backdrop-blur border border-white/10">
                    {activeDetection.timestamp?.split('T')[1]?.replace('Z', '') || activeDetection.timestamp}
                  </span>
                </div>

                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBBox(!showBBox)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold backdrop-blur border transition ${
                      showBBox
                        ? 'bg-accent-500/80 text-white border-accent-400'
                        : 'bg-black/50 text-gray-300 border-white/10 hover:bg-black/70'
                    }`}
                  >
                    {showBBox ? 'صندوق التحديد: مُفعل' : 'إظهار التحديد'}
                  </button>
                  <span className="rounded-lg bg-black/60 px-2 py-1 text-xs font-mono text-gray-300 backdrop-blur border border-white/10">
                    إطار {activeFrameIndex + 1} / {detections.length || 1}
                  </span>
                </div>
              </div>

              {/* Viewport Footer info */}
              <div className="p-3 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4 text-gray-600">
                  <span><strong>معرف الإطار:</strong> <span className="font-mono">{activeDetection.id}</span></span>
                  <span><strong>نسبة المساحة (Area Ratio):</strong> <span className="font-mono font-bold text-accent-700">{(activeDetection.area_ratio * 100).toFixed(1)}%</span></span>
                  <span><strong>ثقة النموذج:</strong> <span className="font-mono font-bold text-gray-900">{activeDetection.confidence}%</span></span>
                </div>
              </div>
            </div>

            {/* Media Tabs: Detection Frames vs Incident Images (Entity 7) */}
            <div className="rounded-2xl bg-white shadow-card border border-gray-100/80 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMediaTab('detections')}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                      mediaTab === 'detections'
                        ? 'bg-accent-50 text-accent-700 border border-accent-200'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    إطارات الاستدلال اللحظي ({detections.length})
                  </button>
                  <button
                    onClick={() => setMediaTab('images')}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
                      mediaTab === 'images'
                        ? 'bg-accent-50 text-accent-700 border border-accent-200'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    الأدلة البصرية واللقطات ({images.length})
                  </button>
                </div>
                <span className="text-[11px] text-gray-400">انقر للتبديل والمعاينة</span>
              </div>

              {/* Detection Frames Grid */}
              {mediaTab === 'detections' && (
                <div className="grid grid-cols-4 gap-3">
                  {detections.map((det, idx) => (
                    <button
                      key={det.id}
                      onClick={() => setActiveFrameIndex(idx)}
                      className={`group rounded-xl overflow-hidden border-2 transition text-right ${
                        activeFrameIndex === idx
                          ? 'border-accent-500 ring-2 ring-accent-100 shadow-sm'
                          : 'border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <div className="relative aspect-video bg-navy-950">
                        <div className="absolute inset-0 bg-gradient-to-br from-navy-800 to-navy-950" />
                        {/* Mini bbox */}
                        <div
                          className="absolute border border-red-400/80 rounded"
                          style={{
                            top: `${det.bbox.y}%`,
                            left: `${det.bbox.x}%`,
                            width: `${det.bbox.width}%`,
                            height: `${det.bbox.height}%`,
                          }}
                        />
                        <div className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-mono text-white">
                          {det.confidence}%
                        </div>
                      </div>
                      <div className="p-2">
                        <p className="text-[11px] font-bold text-gray-800 truncate">{det.id}</p>
                        <p className="text-[10px] text-gray-400 font-mono">
                          {det.timestamp?.split('T')[1]?.replace('Z', '') || det.timestamp}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Incident Images (Entity 7: IncidentImage) */}
              {mediaTab === 'images' && (
                <div className="grid grid-cols-3 gap-3">
                  {images.map((img) => (
                    <div
                      key={img.id}
                      onClick={() => setSelectedImage(img)}
                      className="group rounded-xl border border-gray-200 bg-white p-2 hover:border-accent-300 hover:shadow-md transition cursor-pointer"
                    >
                      <div className="relative aspect-video rounded-lg bg-navy-900 overflow-hidden mb-2">
                        <div className="absolute inset-0 bg-gradient-to-br from-navy-800 to-navy-950 flex items-center justify-center text-navy-400">
                          <ImageIcon className="h-6 w-6 opacity-40 group-hover:scale-110 transition duration-300" />
                        </div>
                        <div className="absolute top-1 right-1">
                          <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold text-white uppercase ${
                            img.image_type === 'vlm_crop'
                              ? 'bg-purple-600'
                              : img.image_type === 'evidence'
                              ? 'bg-red-600'
                              : 'bg-navy-700'
                          }`}>
                            {img.image_type}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] font-bold text-gray-800 truncate">{img.caption || img.id}</p>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">{img.captured_at}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Incident Details & Verification Column (2 Columns) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Core Incident Details (Entity 5: Incident) */}
            <div className="rounded-2xl bg-white shadow-card border border-gray-100/80 p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-bold text-gray-900">بيانات الحادثة والتقييم</h3>
                <IncidentStatusBadge status={incident.status} />
              </div>

              <div className="space-y-2">
                <DetailRow label="رقم الحادثة (Incident ID)" value={incident.id} fontMono />
                <DetailRow label="الكاميرا المرتبطة" value={incident.cameraName} />
                <DetailRow icon={MapPin} label="الموقع الجغرافي" value={incident.location} />
                <DetailRow
                  icon={isFire ? Flame : Wind}
                  label="نوع الكشف الأساسي"
                  value={isFire ? 'حريق مؤكد' : 'دخان متصاعد'}
                  highlight={isFire}
                />
                <DetailRow label="أعلى نسبة ثقة (max_confidence)" value={`${incident.max_confidence}%`} fontMono />
                <DetailRow
                  label="درجة الخطورة المحسوبة"
                  value={`${(incident.max_severity_score * 100).toFixed(0)}% (${incident.max_severity_score.toFixed(2)})`}
                  fontMono
                />
                <div className="flex items-center justify-between rounded-xl bg-gray-50 border border-gray-100 px-3.5 py-2">
                  <span className="text-xs text-gray-500">مستوى الخطورة الإجمالي</span>
                  <SeverityBadge severity={incident.severity} />
                </div>
                <DetailRow icon={Clock} label="توقيت بداية الرصد" value={incident.started_at} fontMono />
                {incident.acknowledged_by && (
                  <DetailRow label="المشرف المقر بالحادثة" value={incident.acknowledged_by} />
                )}
              </div>
            </div>

            {/* VLM Smart Verification Card (Entity 5: vlm_verdict & vlm_reason) */}
            <div className="rounded-2xl bg-white shadow-card border border-gray-100/80 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-accent-600" />
                  التحقق المعرفي الذكي (VLM Verdict)
                </h4>
                {incident.vlm_verdict !== undefined && (
                  <span
                    className={`rounded-lg px-2.5 py-0.5 text-xs font-bold border ${
                      incident.vlm_verdict
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {incident.vlm_verdict ? 'مؤكد كحدث حقيقي' : 'مشتبه / غير مؤكد'}
                  </span>
                )}
              </div>

              {incident.vlm_reason && (
                <div className="rounded-xl bg-accent-50/50 border border-accent-100 p-3 text-xs leading-relaxed text-accent-900">
                  {incident.vlm_reason}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-2.5">
                  <span className="text-gray-400 block mb-0.5">استمرارية الكشف</span>
                  <span className="font-bold text-gray-900">{incident.persistence} إطارات</span>
                </div>
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-2.5">
                  <span className="text-gray-400 block mb-0.5">الحركة والتمدد</span>
                  <span className={`font-bold ${incident.movement ? 'text-emerald-600' : 'text-gray-500'}`}>
                    {incident.movement ? 'تمدد نشط' : 'ثابت'}
                  </span>
                </div>
              </div>
            </div>

            {/* False Alarm / Resolution Note Alerts */}
            {incident.status === 'false_alarm' && incident.falseAlarmReason && (
              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 space-y-1 text-xs">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span>سبب تصنيف الإنذار الخاطئ:</span>
                </div>
                <p className="text-amber-800 leading-relaxed pr-6">{incident.falseAlarmReason}</p>
              </div>
            )}

            {incident.resolution_note && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 space-y-1 text-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>تقرير المعالجة والإغلاق:</span>
                </div>
                <p className="text-emerald-800 leading-relaxed pr-6">{incident.resolution_note}</p>
              </div>
            )}

            {/* Incident Lifecycle Timeline */}
            <div className="rounded-2xl bg-white shadow-card border border-gray-100/80 p-5 space-y-3">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-accent-500" />
                الجدول الزمني للحادثة (Timeline)
              </h4>

              <div className="space-y-3 pt-1">
                {incident.timeline.map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          idx === incident.timeline.length - 1 ? 'bg-accent-500' : 'bg-gray-300'
                        }`}
                      />
                      {idx < incident.timeline.length - 1 && <div className="w-px h-8 bg-gray-200" />}
                    </div>
                    <div className="pb-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{statusLabel[item.status]}</span>
                        <span className="text-gray-400 font-mono">{item.time}</span>
                      </div>
                      <p className="text-gray-500 text-[11px] mt-0.5">
                        بواسطة: <strong>{item.actor}</strong>
                        {item.note && ` — ${item.note}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Supervisor Action Buttons (Class Diagram Operations) */}
            {!readOnly && incident.status !== 'false_alarm' && incident.status !== 'closed' && (
              <div className="rounded-2xl bg-white shadow-card border border-gray-100/80 p-5 space-y-3">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">إجراءات المشرف</h4>
                <div className="grid grid-cols-2 gap-2.5">
                  {incident.status === 'new' && (
                    <button
                      onClick={handleAcknowledge}
                      className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-3 py-2.5 text-xs font-bold text-white hover:bg-emerald-600 transition shadow-sm"
                    >
                      <CheckCircle2 className="h-4 w-4" /> إقرار وتأكيد الحادثة
                    </button>
                  )}

                  {incident.status !== 'following' && incident.status !== 'resolved' && (
                    <button
                      onClick={handleFollowing}
                      className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-3 py-2.5 text-xs font-bold text-white hover:bg-amber-600 transition shadow-sm"
                    >
                      <Eye className="h-4 w-4" /> وضع قيد المتابعة
                    </button>
                  )}

                  {incident.status !== 'resolved' && (
                    <button
                      onClick={() => setShowResolveModal(true)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-3 py-2.5 text-xs font-bold text-white hover:bg-accent-600 transition shadow-sm"
                    >
                      <CheckSquare className="h-4 w-4" /> معالجة الحادثة
                    </button>
                  )}

                  {incident.status === 'resolved' && (
                    <button
                      onClick={handleClose}
                      className="flex items-center justify-center gap-2 rounded-xl bg-navy-700 px-3 py-2.5 text-xs font-bold text-white hover:bg-navy-800 transition shadow-sm"
                    >
                      <Check className="h-4 w-4" /> إغلاق نهائي للبلاغ
                    </button>
                  )}

                  <button
                    onClick={() => setShowFalseAlarm(true)}
                    className="flex items-center justify-center gap-2 rounded-xl border-2 border-red-200 text-red-600 px-3 py-2.5 text-xs font-bold hover:bg-red-50 transition"
                  >
                    <XCircle className="h-4 w-4" /> تصنيف كإنذار خاطئ
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal for IncidentImage */}
      <Modal
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        title={selectedImage?.caption || 'معاينة الدليل البصري'}
        footer={
          <button
            onClick={() => setSelectedImage(null)}
            className="rounded-xl bg-accent-500 px-5 py-2 text-sm font-bold text-white hover:bg-accent-600 transition"
          >
            إغلاق
          </button>
        }
      >
        {selectedImage && (
          <div className="space-y-3">
            <div className="relative aspect-video rounded-xl bg-navy-950 overflow-hidden flex items-center justify-center text-navy-400">
              <ImageIcon className="h-16 w-16 opacity-30" />
              <div className="absolute top-3 right-3 rounded-lg bg-black/70 px-2.5 py-1 text-xs text-white backdrop-blur">
                نوع الصورة: {selectedImage.image_type}
              </div>
              <div className="absolute bottom-3 left-3 rounded-lg bg-black/70 px-2.5 py-1 text-xs font-mono text-gray-300 backdrop-blur">
                {selectedImage.captured_at}
              </div>
            </div>
            <p className="text-xs text-gray-600">{selectedImage.caption}</p>
          </div>
        )}
      </Modal>

      {/* False Alarm Modal */}
      <Modal
        open={showFalseAlarm}
        onClose={() => {
          setShowFalseAlarm(false);
          setFalseAlarmError(false);
        }}
        title="تصنيف الحادثة كإنذار خاطئ (Rejection / False Alarm)"
        footer={
          <>
            <button
              onClick={() => {
                setShowFalseAlarm(false);
                setFalseAlarmError(false);
                setFalseAlarmReason('');
              }}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition"
            >
              إلغاء
            </button>
            <button
              onClick={submitFalseAlarm}
              className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-600 transition shadow-sm"
            >
              تأكيد تصنيف الإنذار الخاطئ
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-gray-600 leading-relaxed">
            سيتم استبعاد هذا البلاغ وتسجيله كإنذار خاطئ في أرشيف الحوادث وتحديث سجل دقة الخوارزمية.
          </p>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              سبب تصنيف الحادثة كإنذار خاطئ <span className="text-red-500">*</span>
            </label>
            <textarea
              value={falseAlarmReason}
              onChange={(e) => {
                setFalseAlarmReason(e.target.value);
                setFalseAlarmError(false);
              }}
              rows={4}
              placeholder="مثال: انعكاس ضوئي من زجاج النوافذ، أو بخار صناعي مؤقت من غلاية التبريد..."
              className={`w-full rounded-xl border bg-gray-50 p-3.5 text-sm outline-none transition focus:bg-white focus:ring-2 ${
                falseAlarmError
                  ? 'border-red-300 focus:ring-red-100'
                  : 'border-gray-200 focus:border-accent-400 focus:ring-accent-100'
              }`}
            />
            {falseAlarmError && <p className="mt-1 text-xs text-red-600">يرجى إدخال سبب التصنيف</p>}
          </div>
        </div>
      </Modal>

      {/* Resolve Incident Modal */}
      <Modal
        open={showResolveModal}
        onClose={() => {
          setShowResolveModal(false);
          setResolveError(false);
        }}
        title="توثيق معالجة الحادثة (Resolve Incident)"
        footer={
          <>
            <button
              onClick={() => {
                setShowResolveModal(false);
                setResolveError(false);
                setResolutionNote('');
              }}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition"
            >
              إلغاء
            </button>
            <button
              onClick={submitResolution}
              className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-600 transition shadow-sm"
            >
              توثيق المعالجة
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-gray-600 leading-relaxed">
            يرجى تدوين الإجراءات الميدانية التي تم اتخاذها للسيطرة على الحادثة والتأكد من سلامة الموقع.
          </p>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              تقرير وملاحظات المعالجة <span className="text-red-500">*</span>
            </label>
            <textarea
              value={resolutionNote}
              onChange={(e) => {
                setResolutionNote(e.target.value);
                setResolveError(false);
              }}
              rows={4}
              placeholder="مثال: تم إخماد البؤرة بواسطة طاقم السلامة، وفحص تبريد المحيط والتأكد من انعدام الأدخنة..."
              className={`w-full rounded-xl border bg-gray-50 p-3.5 text-sm outline-none transition focus:bg-white focus:ring-2 ${
                resolveError
                  ? 'border-red-300 focus:ring-red-100'
                  : 'border-gray-200 focus:border-accent-400 focus:ring-accent-100'
              }`}
            />
            {resolveError && <p className="mt-1 text-xs text-red-600">يرجى كتابة تقرير المعالجة</p>}
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  fontMono,
  highlight,
}: {
  icon?: typeof Video;
  label: string;
  value: string;
  fontMono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-gray-50/70 border border-gray-100 px-3.5 py-2 text-xs">
      <span className="flex items-center gap-1.5 text-gray-500">
        {Icon && <Icon className="h-3.5 w-3.5 text-gray-400" />} {label}
      </span>
      <span className={`font-semibold ${highlight ? 'text-red-600 font-bold' : 'text-gray-900'} ${fontMono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  );
}
