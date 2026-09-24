import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Toggle } from '@/components/Toggle';
import { useToast } from '@/context/ToastContext';
import { useNotificationLogs } from '@/context/NotificationLogContext';
import { useAudit } from '@/context/AuditContext';
import { defaultSystemSetting } from '@/data/mock';
import type { SystemSetting } from '@/data/types';
import {
  Send,
  Signal,
  MessageCircle,
  Phone,
  Plug,
  Save,
  Info,
  ShieldCheck,
  ArrowLeft,
  History,
  RotateCcw,
  Database,
  Calendar,
} from 'lucide-react';

const SETTINGS_STORAGE_KEY = 'prototype_v2_system_settings';

interface Props {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function NotificationConfig({ currentPath, onNavigate }: Props) {
  const { push } = useToast();
  const { sendNotification, logs } = useNotificationLogs();
  const { createLog } = useAudit();

  const [settings, setSettings] = useState<SystemSetting>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return defaultSystemSetting;
  });

  const [tgConnected] = useState(true);
  const [gsmConnected] = useState(true);
  const [testing, setTesting] = useState<'tg' | 'gsm' | null>(null);
  const [dedup, setDedup] = useState(true);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  const handleTest = (type: 'tg' | 'gsm') => {
    setTesting(type);
    setTimeout(() => {
      setTesting(null);
      if (type === 'tg') {
        sendNotification({
          channel: 'telegram',
          recipient: settings.telegram_channel_id || '-1001842093841',
          recipient_name: 'قناة اختبار تيليجرام',
          status: 'sent',
          message_payload: 'رسالة اختبار اتصال Telegram من لوحة إعدادات النظام - تم التحقق بنجاح.',
        });
        createLog('اختبار قناة تنبيه', 'إرسال رسالة اختبار عبر Telegram بنجاح');
        push('تم إرسال رسالة اختبار عبر Telegram وتسجيلها في السجل');
      } else {
        // Increment SMS count
        setSettings((prev) => ({
          ...prev,
          sms_current_count: Math.min(prev.sms_daily_limit, prev.sms_current_count + 1),
        }));

        sendNotification({
          channel: 'sms',
          recipient: '+96650000001',
          recipient_name: 'مشرف أول (اختبار GSM)',
          status: 'sent',
          message_payload: '[اختبار SMS] تجربة إرسال رسالة نصية قصيرة عبر مودم GSM المركزي - حالة الشبكة جيدة.',
        });
        createLog('اختبار قناة تنبيه', 'إرسال رسالة نصية SMS اختبارية وتحديث العداد اليومي');
        push('تم إرسال SMS اختباري بنجاح وتسجيلها في السجل');
      }
    }, 1200);
  };

  const handleSaveSettings = () => {
    const updated = {
      ...settings,
      updated_at: new Date().toISOString(),
    };
    setSettings(updated);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    createLog('تعديل إعدادات النظام', 'تحديث إعدادات قنوات التنبيه وسياسات حفظ البيانات');
    push('تم حفظ إعدادات النظام وقنوات التنبيه بنجاح');
  };

  const resetSmsCounter = () => {
    const today = new Date().toISOString().split('T')[0];
    setSettings((prev) => ({
      ...prev,
      sms_current_count: 0,
      last_sms_reset_date: today,
    }));
    createLog('تصفير عداد SMS', 'إعادة ضبط عداد رسائل SMS اليومي إلى 0');
    push('تم تصفير عداد رسائل SMS اليومية', 'info');
  };

  const smsPercentage = Math.min(100, Math.round((settings.sms_current_count / (settings.sms_daily_limit || 1)) * 100));

  return (
    <DashboardLayout title="إعداد قنوات التنبيه وسياسات النظام" currentPath={currentPath} onNavigate={onNavigate}>
      <div className="space-y-6">
        {/* Top banner to NotificationLogs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-white shadow-card border border-gray-100/80 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-700">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">سجل الرسائل والتنبيهات الصادرة</h4>
              <p className="text-xs text-gray-500">تم تسجيل {logs.length} رسالة وتنبيه طوارئ حتى الآن في النظام</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('/admin/notification-logs')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-accent-500 text-white px-4 py-2 text-xs font-bold hover:bg-accent-600 transition self-start sm:self-auto"
          >
            فتح السجل الكامل <ArrowLeft className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Telegram */}
        <div className="rounded-2xl bg-white shadow-card border border-gray-100/80 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <Send className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">إعدادات Telegram</h3>
                <p className="text-xs text-gray-500">قناة التنبيه الأساسية للحوادث والبلاغات الذكية</p>
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold border ${
                tgConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${tgConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              {tgConnected ? 'متصل وجاهز' : 'غير متصل'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bot Token</label>
              <input
                value={settings.telegram_bot_token}
                onChange={(e) => setSettings({ ...settings, telegram_bot_token: e.target.value })}
                className="form-input font-mono text-sm"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Telegram Channel / Recipient ID</label>
              <input
                value={settings.telegram_channel_id}
                onChange={(e) => setSettings({ ...settings, telegram_channel_id: e.target.value })}
                className="form-input font-mono text-sm"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">المستخدمون المخولون</label>
              <input defaultValue="admin, supervisor, supervisor02" className="form-input" dir="ltr" />
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={() => handleTest('tg')}
              disabled={testing === 'tg'}
              className="flex items-center gap-2 rounded-xl border border-accent-200 bg-accent-50 px-4 py-2.5 text-sm font-bold text-accent-700 hover:bg-accent-100 transition disabled:opacity-50"
            >
              <Plug className={`h-4 w-4 ${testing === 'tg' ? 'animate-spin' : ''}`} />
              {testing === 'tg' ? 'جارٍ الاختبار...' : 'اختبار الاتصال والإرسال'}
            </button>
            <button
              onClick={handleSaveSettings}
              className="flex items-center gap-2 rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-accent-600 transition"
            >
              <Save className="h-4 w-4" /> حفظ الإعدادات
            </button>
          </div>
        </div>

        {/* GSM / SMS with Quota */}
        <div className="rounded-2xl bg-white shadow-card border border-gray-100/80 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Signal className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">إعدادات GSM / SMS وسعة الرسائل</h3>
                <p className="text-xs text-gray-500">قناة التنبيه العاجلة للحوادث عالية الخطورة والحرائق المؤكدة</p>
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold border ${
                gsmConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${gsmConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              {gsmConnected ? 'متصل' : 'غير متصل'}
            </span>
          </div>

          {/* SMS Daily Limit Card */}
          <div className="mb-5 p-4 rounded-xl border border-emerald-100 bg-emerald-50/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-emerald-600" />
                <span className="font-bold text-sm text-gray-900">استهلاك رسائل SMS اليومية:</span>
                <span className="font-mono text-sm font-bold text-emerald-700">
                  {settings.sms_current_count} / {settings.sms_daily_limit} رسالة
                </span>
              </div>
              <button
                onClick={resetSmsCounter}
                className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition self-start sm:self-auto"
              >
                <RotateCcw className="h-3.5 w-3.5" /> إعادة تصفير العداد اليومي
              </button>
            </div>

            <div className="w-full bg-emerald-200/50 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  smsPercentage > 85 ? 'bg-red-500' : smsPercentage > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${smsPercentage}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[11px] text-gray-500 font-mono">
              <span>تاريخ آخر تصفير: {settings.last_sms_reset_date}</span>
              <span>المتبقي: {Math.max(0, settings.sms_daily_limit - settings.sms_current_count)} رسالة</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">الحد الأقصى لرسائل SMS اليومية</label>
              <input
                type="number"
                min="10"
                max="1000"
                value={settings.sms_daily_limit}
                onChange={(e) => setSettings({ ...settings, sms_daily_limit: Number(e.target.value) || 100 })}
                className="form-input font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">حالة مودم GSM</label>
              <select className="form-input" defaultValue="connected">
                <option value="connected">متصل (إشارة 4G قوية)</option>
                <option value="disconnected">غير متصل</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">أرقام هواتف الطوارئ الافتراضية</label>
              <input defaultValue="+96650000001, +96650000002" className="form-input font-mono text-sm" dir="ltr" />
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={() => handleTest('gsm')}
              disabled={testing === 'gsm'}
              className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-50"
            >
              <MessageCircle className={`h-4 w-4 ${testing === 'gsm' ? 'animate-spin' : ''}`} />
              {testing === 'gsm' ? 'جارٍ الإرسال...' : 'اختبار إرسال SMS'}
            </button>
            <button
              onClick={handleSaveSettings}
              className="flex items-center gap-2 rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-accent-600 transition"
            >
              <Save className="h-4 w-4" /> حفظ
            </button>
          </div>
        </div>

        {/* Data Retention & Storage Policy (SystemSetting) */}
        <div className="rounded-2xl bg-white shadow-card border border-gray-100/80 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">سياسات الاحتفاظ بالبيانات والأرشفة التلقائية</h3>
              <p className="text-xs text-gray-500">ضبط مدد التطهير والاحتفاظ بالاكتشافات والصور (SystemSetting)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                الاحتفاظ بسجلات الاكتشافات اللحظية (بالأيام)
              </label>
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  min="7"
                  max="365"
                  value={settings.cleanup_days_detections}
                  onChange={(e) =>
                    setSettings({ ...settings, cleanup_days_detections: Number(e.target.value) || 30 })
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-10 pl-4 text-sm font-medium outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-100 font-mono"
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">القيمة الافتراضية: 30 يوماً</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                الاحتفاظ بملفات الصور والأدلة البصرية (بالأيام)
              </label>
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  min="30"
                  max="730"
                  value={settings.cleanup_days_images}
                  onChange={(e) =>
                    setSettings({ ...settings, cleanup_days_images: Number(e.target.value) || 90 })
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-10 pl-4 text-sm font-medium outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-100 font-mono"
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">القيمة الافتراضية: 90 يوماً</p>
            </div>
          </div>

          <div className="mt-5">
            <button
              onClick={handleSaveSettings}
              className="flex items-center gap-2 rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-accent-600 transition"
            >
              <Save className="h-4 w-4" /> حفظ سياسات الأرشفة
            </button>
          </div>
        </div>

        {/* Notification Policy */}
        <div className="rounded-2xl bg-white shadow-card border border-gray-100/80 p-6">
          <h3 className="font-bold text-gray-900 mb-4">سياسة مسارات التنبيهات</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Send className="h-5 w-5 text-sky-600" />
                <span className="font-bold text-gray-900">Telegram</span>
              </div>
              <p className="text-sm text-gray-600">يستخدم لجميع الحوادث والبلاغات ورسائل التحقق البصري VLM.</p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="h-5 w-5 text-emerald-600" />
                <span className="font-bold text-gray-900">SMS</span>
              </div>
              <p className="text-sm text-gray-600">يستخدم حصراً للحوادث عالية الخطورة وتأكيدات الحرائق الميدانية.</p>
            </div>
            <div className="rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-navy-600" />
                  <span className="font-bold text-gray-900 text-sm">منع التنبيهات المكررة (Deduplication)</span>
                </div>
                <Toggle checked={dedup} onChange={setDedup} />
              </div>
              <p className="mt-2 text-sm text-gray-600">منع إرسال تنبيهات متكررة لنفس الحادثة خلال نافذة زمنية محددة.</p>
              <p className="mt-2 text-xs font-semibold text-gray-700">{dedup ? 'مفعّل' : 'معطّل'}</p>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-2xl bg-accent-50 border border-accent-100 p-4">
          <Info className="h-5 w-5 text-accent-600 shrink-0 mt-0.5" />
          <p className="text-sm text-accent-800 font-medium">
            يتم تسجيل كافة عمليات الإرسال تلقائياً في شاشة "سجل الرسائل والتنبيهات الصادرة" مع تتبع حالة التسليم ورمز الخطأ.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
