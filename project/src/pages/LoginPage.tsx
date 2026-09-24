import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FlameKindling, User, Lock, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onLoggedIn: () => void;
}

export function LoginPage({ onLoggedIn }: LoginPageProps) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim()) {
      setError('يرجى إدخال اسم المستخدم');
      return;
    }
    const ok = login(username, password);
    if (!ok) {
      setError('اسم المستخدم غير صحيح. استخدم admin أو supervisor');
      return;
    }
    onLoggedIn();
  };

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-navy-900 text-white flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(22,121,189,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(239,68,68,0.3) 0%, transparent 50%)',
        }} />
        <div className="relative flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-500/20 text-accent-300">
            <FlameKindling className="h-7 w-7" />
          </div>
          <div>
            <p className="font-bold text-lg">نظام كشف حرائق المستودعات</p>
            <p className="text-sm text-navy-300">AI-Based Warehouse Fire Detection</p>
          </div>
        </div>

        <div className="relative space-y-6">
          <h2 className="text-3xl font-bold leading-snug">
            مراقبة ذكية ومبكرة<br />للكشف عن الحرائق والدخان
          </h2>
          <p className="text-navy-200 leading-relaxed max-w-md">
            نظام متكامل لمراقبة الكاميرات في المستودعات ذات الأسقف العالية، مع كشف مبكر للدخان والحريق باستخدام الذكاء الاصطناعي، وتنبيهات فورية عبر Telegram و SMS.
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-md">
            {[
              { label: 'كشف مبكر', value: 'ذكي' },
              { label: 'تنبيهات فورية', value: 'Telegram + SMS' },
              { label: 'مراقبة مباشرة', value: '8 كاميرات' },
              { label: 'منطقة اهتمام', value: 'ROI' },
            ].map((f) => (
              <div key={f.label} className="rounded-xl bg-white/5 border border-white/10 p-4">
                <p className="text-xs text-navy-300">{f.label}</p>
                <p className="font-bold text-white">{f.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 max-w-lg">
          <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-100 leading-relaxed">
            هذا النظام أداة مساعدة للكشف المبكر عن الحريق ولا يُعد بديلاً عن أنظمة الإنذار أو الإطفاء المعتمدة.
          </p>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex items-center gap-3 justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-500 text-white">
              <FlameKindling className="h-7 w-7" />
            </div>
            <div>
              <p className="font-bold text-gray-900">نظام كشف حرائق المستودعات</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow-soft border border-gray-100 p-8">
            <h1 className="text-2xl font-bold text-gray-900">تسجيل الدخول</h1>
            <p className="mt-1 text-sm text-gray-500">أدخل بياناتك للوصول إلى لوحة المراقبة</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">اسم المستخدم</label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin أو supervisor"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pr-11 pl-4 text-sm font-medium text-gray-900 outline-none transition focus:border-accent-400 focus:bg-white focus:ring-2 focus:ring-accent-100"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pr-11 pl-4 text-sm font-medium text-gray-900 outline-none transition focus:border-accent-400 focus:bg-white focus:ring-2 focus:ring-accent-100"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-500 py-3 font-bold text-white shadow-soft transition hover:bg-accent-600 active:scale-[0.99]"
              >
                <ArrowLeft className="h-5 w-5" />
                تسجيل الدخول
              </button>
            </form>

            <div className="mt-6 rounded-xl bg-navy-50 border border-navy-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="h-4 w-4 text-navy-600" />
                <span className="text-xs font-bold text-navy-800">حسابات تجريبية</span>
              </div>
              <div className="space-y-1 text-xs text-navy-700">
                <p>مدير النظام: <code className="font-mono font-bold bg-white px-1.5 rounded">admin</code></p>
                <p>مشرف النظام: <code className="font-mono font-bold bg-white px-1.5 rounded">supervisor</code></p>
                <p className="text-navy-400 mt-1">أي كلمة مرور مقبولة للعرض التجريبي</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
