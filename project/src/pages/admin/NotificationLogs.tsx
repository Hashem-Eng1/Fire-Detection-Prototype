import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Modal } from '@/components/Modal';
import { useNotificationLogs } from '@/context/NotificationLogContext';
import { useToast } from '@/context/ToastContext';
import type { NotificationLog, NotificationChannel, NotificationStatus } from '@/data/types';
import {
  Send, Signal, MessageSquare, Phone, CheckCircle2, XCircle, RefreshCw,
  Search, Filter, AlertTriangle, ArrowRight, ExternalLink, Trash2,
  Clock, ShieldAlert, Radio, Globe, MessageCircle, FileText, Check,
} from 'lucide-react';

interface Props {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function NotificationLogs({ currentPath, onNavigate }: Props) {
  const { logs, retrySending, deleteLog, clearLogs, metrics } = useNotificationLogs();
  const { push } = useToast();

  const [channelFilter, setChannelFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<NotificationLog | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filteredLogs = logs.filter((log) => {
    if (channelFilter && log.channel !== channelFilter) return false;
    if (statusFilter && log.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchRecipient = log.recipient.toLowerCase().includes(q);
      const matchName = log.recipient_name?.toLowerCase().includes(q);
      const matchPayload = log.message_payload.toLowerCase().includes(q);
      const matchIncident = log.incident_id?.toLowerCase().includes(q);
      const matchId = log.id.toLowerCase().includes(q);
      if (!matchRecipient && !matchName && !matchPayload && !matchIncident && !matchId) {
        return false;
      }
    }
    return true;
  });

  const handleRetry = async (log: NotificationLog) => {
    setRetryingId(log.id);
    try {
      await retrySending(log.id);
      push(`تمت إعادة إرسال التنبيه (${log.id}) بنجاح عبر قناة ${log.channel.toUpperCase()}`);
    } catch {
      push('تعذرت إعادة الإرسال، يرجى فحص الاتصال بالشبكة', 'info');
    } finally {
      setRetryingId(null);
    }
  };

  const getChannelBadge = (channel: NotificationChannel) => {
    switch (channel) {
      case 'telegram':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 border border-sky-200 px-2.5 py-1 text-xs font-bold text-sky-700">
            <Send className="h-3.5 w-3.5" /> Telegram
          </span>
        );
      case 'sms':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-700">
            <Phone className="h-3.5 w-3.5" /> SMS GSM
          </span>
        );
      case 'webhook':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 border border-purple-200 px-2.5 py-1 text-xs font-bold text-purple-700">
            <Globe className="h-3.5 w-3.5" /> Webhook API
          </span>
        );
    }
  };

  const getStatusBadge = (status: NotificationStatus) => {
    switch (status) {
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> تم التسليم
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-xs font-bold text-red-700">
            <XCircle className="h-3.5 w-3.5" /> تعذر الإرسال
          </span>
        );
      case 'retrying':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-700 animate-pulse">
            <RefreshCw className="h-3.5 w-3.5 animate-spin" /> قيد المحاولة...
          </span>
        );
    }
  };

  return (
    <DashboardLayout title="سجل التنبيهات والرسائل الخارجية" currentPath={currentPath} onNavigate={onNavigate}>
      <div className="space-y-6">
        {/* Header & Quick stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-white shadow-card border border-gray-100/80 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500">إجمالي الرسائل المرسلة</p>
                <p className="mt-1 text-2xl font-bold font-mono text-gray-900">{metrics.total}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
                <MessageSquare className="h-6 w-6" />
              </div>
            </div>
            <p className="mt-2 text-[11px] text-gray-400">كافة القنوات (Telegram / SMS / Webhook)</p>
          </div>

          <div className="rounded-2xl bg-white shadow-card border border-gray-100/80 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500">تم التسليم بنجاح</p>
                <p className="mt-1 text-2xl font-bold font-mono text-emerald-600">{metrics.sent}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
            <p className="mt-2 text-[11px] text-emerald-600 font-medium">وصلت للمستلمين بنجاح</p>
          </div>

          <div className="rounded-2xl bg-white shadow-card border border-gray-100/80 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500">تنبيهات متعثرة (فشل)</p>
                <p className="mt-1 text-2xl font-bold font-mono text-red-600">{metrics.failed}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
            <p className="mt-2 text-[11px] text-red-600 font-medium">بحاجة لإعادة الإرسال أو التدقيق</p>
          </div>

          <div className="rounded-2xl bg-white shadow-card border border-gray-100/80 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500">نسبة نجاح التسليم</p>
                <p className="mt-1 text-2xl font-bold font-mono text-accent-700">{metrics.successRate}%</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 text-accent-700">
                <Radio className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-accent-600 rounded-full" style={{ width: `${metrics.successRate}%` }} />
            </div>
          </div>
        </div>

        {/* Filters & Actions Bar */}
        <div className="rounded-2xl bg-white shadow-card border border-gray-100/80 p-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
              <div className="relative">
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="بحث بالمستلم، الحادثة، أو النص..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input pr-10 text-xs"
                />
              </div>

              <div>
                <select
                  value={channelFilter}
                  onChange={(e) => setChannelFilter(e.target.value)}
                  className="form-input text-xs"
                >
                  <option value="">جميع القنوات ({metrics.total})</option>
                  <option value="telegram">Telegram</option>
                  <option value="sms">SMS GSM</option>
                  <option value="webhook">Webhook API</option>
                </select>
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-input text-xs"
                >
                  <option value="">جميع الحالات</option>
                  <option value="sent">تم التسليم (ناجح)</option>
                  <option value="failed">تعذر الإرسال (فشل)</option>
                  <option value="retrying">قيد المحاولة</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onNavigate('/admin/notifications')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
              >
                <Signal className="h-4 w-4 text-gray-500" />
                إعداد القنوات
              </button>

              <button
                onClick={() => setShowClearConfirm(true)}
                disabled={logs.length === 0}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/50 px-3.5 py-2.5 text-xs font-bold text-red-700 hover:bg-red-100 transition disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" />
                مسح السجل
              </button>
            </div>
          </div>
        </div>

        {/* Table of Notification Logs */}
        <div className="rounded-2xl bg-white shadow-card border border-gray-100/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-right">
                  <th className="px-4 py-3.5 font-semibold text-gray-600 text-xs">معرّف الإرسال</th>
                  <th className="px-4 py-3.5 font-semibold text-gray-600 text-xs">الحادثة المرتبطة</th>
                  <th className="px-4 py-3.5 font-semibold text-gray-600 text-xs">القناة</th>
                  <th className="px-4 py-3.5 font-semibold text-gray-600 text-xs">المستلم</th>
                  <th className="px-4 py-3.5 font-semibold text-gray-600 text-xs">مقتطف الرسالة</th>
                  <th className="px-4 py-3.5 font-semibold text-gray-600 text-xs">وقت الإرسال</th>
                  <th className="px-4 py-3.5 font-semibold text-gray-600 text-xs">المحاولات</th>
                  <th className="px-4 py-3.5 font-semibold text-gray-600 text-xs">الحالة</th>
                  <th className="px-4 py-3.5 font-semibold text-gray-600 text-xs text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className={`hover:bg-gray-50/60 transition ${
                      log.status === 'failed' ? 'bg-red-50/20' : ''
                    }`}
                  >
                    <td className="px-4 py-3.5 font-mono text-xs font-bold text-gray-900">
                      {log.id}
                    </td>

                    <td className="px-4 py-3.5">
                      {log.incident_id ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-navy-50 text-navy-700 px-2 py-0.5 text-xs font-mono font-bold">
                          {log.incident_id}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">تنبيه نظام عام</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      {getChannelBadge(log.channel)}
                    </td>

                    <td className="px-4 py-3.5">
                      <div>
                        {log.recipient_name && (
                          <p className="font-semibold text-xs text-gray-900">{log.recipient_name}</p>
                        )}
                        <p className="font-mono text-[11px] text-gray-500" dir="ltr">
                          {log.recipient}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 max-w-xs">
                      <p className="truncate text-xs text-gray-600" title={log.message_payload}>
                        {log.message_payload}
                      </p>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-xs text-gray-500 whitespace-nowrap">
                      {log.sent_at?.replace('T', ' ')?.slice(0, 19)}
                    </td>

                    <td className="px-4 py-3.5 font-mono text-xs text-center text-gray-700">
                      <span className={`inline-block rounded px-1.5 py-0.5 ${
                        log.retry_count > 0 ? 'bg-amber-100 text-amber-800 font-bold' : 'text-gray-500'
                      }`}>
                        {log.retry_count}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {getStatusBadge(log.status)}
                    </td>

                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition"
                        >
                          تفاصيل
                        </button>

                        {log.status === 'failed' && (
                          <button
                            onClick={() => handleRetry(log)}
                            disabled={retryingId === log.id}
                            className="inline-flex items-center gap-1 rounded-lg bg-accent-500 text-white px-2.5 py-1 text-xs font-bold hover:bg-accent-600 transition disabled:opacity-50"
                          >
                            <RefreshCw className={`h-3 w-3 ${retryingId === log.id ? 'animate-spin' : ''}`} />
                            إعادة إرسال
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-16 text-center text-gray-400">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      لا توجد سجلات تنبيهات تطابق معايير الفلترة الحالية
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Log Detail Modal */}
      <Modal
        open={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title={`تفاصيل سجل التنبيه — ${selectedLog?.id}`}
        footer={
          <div className="flex items-center justify-between w-full">
            {selectedLog?.status === 'failed' ? (
              <button
                onClick={() => {
                  if (selectedLog) handleRetry(selectedLog);
                  setSelectedLog(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-accent-500 text-white px-4 py-2 text-xs font-bold hover:bg-accent-600 transition"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                إعادة المحاولة الآن
              </button>
            ) : (
              <div />
            )}
            <button
              onClick={() => setSelectedLog(null)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              إغلاق
            </button>
          </div>
        }
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-gray-50 p-3">
                <span className="text-gray-400 block mb-1">القناة</span>
                <div>{getChannelBadge(selectedLog.channel)}</div>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <span className="text-gray-400 block mb-1">حالة الإرسال</span>
                <div>{getStatusBadge(selectedLog.status)}</div>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <span className="text-gray-400 block mb-1">المستلم</span>
                <span className="font-bold text-gray-900 block">{selectedLog.recipient_name || '—'}</span>
                <span className="font-mono text-gray-600 text-[11px]" dir="ltr">{selectedLog.recipient}</span>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <span className="text-gray-400 block mb-1">الحادثة المرتبطة</span>
                {selectedLog.incident_id ? (
                  <span className="font-mono font-bold text-accent-700">{selectedLog.incident_id}</span>
                ) : (
                  <span className="text-gray-400">تنبيه نظام داخلي</span>
                )}
              </div>
            </div>

            {/* Error Message if Failed */}
            {selectedLog.error_message && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-red-800">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span>تفاصيل خطأ الشبكة / الخادم:</span>
                </div>
                <p className="text-red-700 font-mono text-[11px] leading-relaxed pr-5">
                  {selectedLog.error_message}
                </p>
              </div>
            )}

            {/* Full Payload Content */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">محتوى الرسالة المرسلة (Payload)</label>
              <div className="rounded-xl bg-navy-950 text-emerald-400 p-3.5 font-mono text-xs leading-relaxed overflow-x-auto border border-navy-800 whitespace-pre-wrap">
                {selectedLog.message_payload}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-gray-100">
              <span>وقت الإرسال: <strong className="font-mono">{selectedLog.sent_at}</strong></span>
              <span>مرات المحاولة: <strong className="font-mono">{selectedLog.retry_count}</strong></span>
            </div>
          </div>
        )}
      </Modal>

      {/* Clear Logs Confirm Modal */}
      <Modal
        open={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title="تأكيد مسح سجل التنبيهات"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setShowClearConfirm(false)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              إلغاء
            </button>
            <button
              onClick={() => {
                clearLogs();
                setShowClearConfirm(false);
                push('تم مسح سجل الرسائل والتنبيهات بنجاح');
              }}
              className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition"
            >
              تأكيد المسح
            </button>
          </div>
        }
      >
        <p className="text-sm text-gray-600">
          هل أنت متأكد من رغبتك في مسح كافة سجلات التنبيهات الخارجية؟ لا يمكن التراجع عن هذا الإجراء بعد تنفيذه.
        </p>
      </Modal>
    </DashboardLayout>
  );
}
