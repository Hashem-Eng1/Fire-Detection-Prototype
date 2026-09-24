import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Modal } from '@/components/Modal';
import { useToast } from '@/context/ToastContext';
import { useAudit } from '@/context/AuditContext';
import { users as initialUsers, permissions as rolePermissions } from '@/data/mock';
import type { User, Role } from '@/data/types';
import { Plus, Pencil, Trash2, Shield, Ban, CheckCircle2, Search, Phone, Send, Check } from 'lucide-react';

const USERS_STORAGE_KEY = 'prototype_v2_users';

interface Props {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function UserManagement({ currentPath, onNavigate }: Props) {
  const { push } = useToast();
  const { createLog } = useAudit();

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(USERS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return initialUsers;
  });

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [permissionsTarget, setPermissionsTarget] = useState<User | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch {
      // ignore
    }
  }, [users]);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone_number && u.phone_number.includes(search)) ||
      (u.telegram_chat_id && u.telegram_chat_id.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSave = (data: Partial<User>) => {
    if (editing) {
      setUsers((us) =>
        us.map((u) => (u.id === editing.id ? { ...u, ...data } : u))
      );
      createLog('تعديل مستخدم', `تحديث بيانات المستخدم ${editing.username} (${data.name})`);
      push('تم تحديث بيانات المستخدم بنجاح');
    } else {
      const newUser: User = {
        id: `U-${String(users.length + 1).padStart(2, '0')}`,
        name: data.name ?? '',
        username: data.username ?? '',
        phone_number: data.phone_number ?? '',
        telegram_chat_id: data.telegram_chat_id ?? '',
        role: data.role ?? 'supervisor',
        active: data.active ?? true,
        lastLogin: '—',
      };
      setUsers((us) => [...us, newUser]);
      createLog('إضافة مستخدم', `إضافة حساب جديد: ${newUser.username} (${newUser.role === 'admin' ? 'مدير' : 'مشرف'})`);
      push('تمت إضافة المستخدم بنجاح');
    }
    setShowForm(false);
    setEditing(null);
  };

  const toggleActive = (u: User) => {
    const newStatus = !u.active;
    setUsers((us) =>
      us.map((x) => (x.id === u.id ? { ...x, active: newStatus } : x))
    );
    createLog('تعديل حالة حساب', `${newStatus ? 'تفعيل' : 'تعطيل'} حساب المستخدم ${u.username}`);
    push(newStatus ? 'تم تفعيل الحساب' : 'تم تعطيل الحساب', 'info');
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setUsers((us) => us.filter((u) => u.id !== deleteTarget.id));
    createLog('حذف مستخدم', `حذف حساب المستخدم ${deleteTarget.username} (${deleteTarget.name})`);
    push('تم حذف المستخدم بنجاح');
    setDeleteTarget(null);
  };

  return (
    <DashboardLayout title="إدارة المستخدمين والصلاحيات" currentPath={currentPath} onNavigate={onNavigate}>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث بالاسم، اسم المستخدم، الهاتف، أو التيليجرام..."
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-11 pl-4 text-sm font-medium outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
            />
          </div>
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-accent-500 px-4 py-2.5 font-bold text-white shadow-soft hover:bg-accent-600 transition"
          >
            <Plus className="h-5 w-5" /> إضافة مستخدم
          </button>
        </div>

        <div className="rounded-2xl bg-white shadow-card border border-gray-100/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-right">
                  <th className="px-4 py-3 font-semibold text-gray-600">الاسم والبيانات</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">اسم المستخدم</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">قنوات التنبيه (SMS / Telegram)</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">الدور</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">الحالة</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">آخر دخول</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-semibold text-gray-900">{u.name}</div>
                        <div className="text-xs text-gray-400 font-mono">{u.id}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{u.username}</td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Phone className="h-3 w-3 text-emerald-600 shrink-0" />
                          <span dir="ltr" className="font-mono">{u.phone_number || '—'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Send className="h-3 w-3 text-sky-600 shrink-0" />
                          <span dir="ltr" className="font-mono">{u.telegram_chat_id || '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border ${
                          u.role === 'admin'
                            ? 'bg-navy-50 text-navy-700 border-navy-200'
                            : 'bg-accent-50 text-accent-700 border-accent-200'
                        }`}
                      >
                        {u.role === 'admin' ? 'مدير النظام' : 'مشرف النظام'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border ${
                          u.active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${u.active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        {u.active ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs font-mono">{u.lastLogin}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditing(u);
                            setShowForm(true);
                          }}
                          title="تعديل المستخدم"
                          className="rounded-lg p-2 text-accent-600 hover:bg-accent-50 transition"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleActive(u)}
                          title={u.active ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                          className={`rounded-lg p-2 transition ${
                            u.active ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {u.active ? <Ban className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => setPermissionsTarget(u)}
                          title="استعراض مصفوفة الصلاحيات"
                          className="rounded-lg p-2 text-navy-600 hover:bg-navy-50 transition"
                        >
                          <Shield className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(u)}
                          title="حذف المستخدم"
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                      لا يوجد مستخدمون مطابقون لبحثك
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Form Modal for Add/Edit */}
      <UserFormModal
        open={showForm}
        editing={editing}
        onClose={() => {
          setShowForm(false);
          setEditing(null);
        }}
        onSave={handleSave}
      />

      {/* Role & Permissions Modal */}
      <PermissionsModal
        open={!!permissionsTarget}
        user={permissionsTarget}
        onClose={() => setPermissionsTarget(null)}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="تأكيد حذف المستخدم"
        footer={
          <>
            <button
              onClick={() => setDeleteTarget(null)}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100"
            >
              إلغاء
            </button>
            <button
              onClick={handleDelete}
              className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-600"
            >
              تأكيد الحذف
            </button>
          </>
        }
      >
        <p className="text-gray-600">
          هل أنت متأكد من رغبتك في حذف حساب المستخدم{' '}
          <span className="font-bold text-gray-900">{deleteTarget?.name}</span> ({deleteTarget?.username})؟
        </p>
      </Modal>
    </DashboardLayout>
  );
}

function UserFormModal({
  open,
  editing,
  onClose,
  onSave,
}: {
  open: boolean;
  editing: User | null;
  onClose: () => void;
  onSave: (d: Partial<User>) => void;
}) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [role, setRole] = useState<Role>('supervisor');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name);
      setUsername(editing.username);
      setPhoneNumber(editing.phone_number || '');
      setTelegramChatId(editing.telegram_chat_id || '');
      setRole(editing.role);
      setActive(editing.active);
      setPassword('');
    } else {
      setName('');
      setUsername('');
      setPassword('');
      setPhoneNumber('+9665');
      setTelegramChatId('@');
      setRole('supervisor');
      setActive(true);
    }
  }, [open, editing]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? `تعديل مستخدم: ${editing.username}` : 'إضافة مستخدم جديد'}
      footer={
        <>
          <button onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100">
            إلغاء
          </button>
          <button
            onClick={() =>
              onSave({
                name,
                username,
                phone_number: phoneNumber,
                telegram_chat_id: telegramChatId,
                role,
                active,
              })
            }
            disabled={!name || !username}
            className="rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-accent-600 transition disabled:opacity-50"
          >
            حفظ البيانات
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">الاسم الكامل</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              placeholder="مثال: تركي الشمري"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">اسم المستخدم (للدخول)</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              dir="ltr"
              disabled={!!editing}
              placeholder="t.alshammari"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">كلمة المرور</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
            dir="ltr"
            placeholder={editing ? 'اتركها فارغة للإبقاء على الحالية' : 'أدخل كلمة مرور قوية'}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              رقم الجوال (لتنبيهات SMS)
            </label>
            <input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="form-input font-mono text-sm"
              dir="ltr"
              placeholder="+9665xxxxxxxx"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              معرف التيليجرام (Telegram Chat ID)
            </label>
            <input
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value)}
              className="form-input font-mono text-sm"
              dir="ltr"
              placeholder="@username أو معرف رقمي"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">الدور الوظيفي (Role)</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="form-input"
            >
              <option value="admin">مدير النظام (Admin)</option>
              <option value="supervisor">مشرف النظام (Supervisor)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">حالة الحساب</label>
            <select
              value={active ? 'active' : 'inactive'}
              onChange={(e) => setActive(e.target.value === 'active')}
              className="form-input"
            >
              <option value="active">نشط (مفعل)</option>
              <option value="inactive">غير نشط (معطل)</option>
            </select>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function PermissionsModal({
  open,
  user,
  onClose,
}: {
  open: boolean;
  user: User | null;
  onClose: () => void;
}) {
  if (!user) return null;
  const roleInfo = rolePermissions[user.role];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`مصفوفة الصلاحيات: ${user.name} (${roleInfo?.label || user.role})`}
      footer={
        <button
          onClick={onClose}
          className="rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-accent-600 transition"
        >
          إغلاق النافذة
        </button>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
          <div className="h-10 w-10 rounded-lg bg-navy-100 text-navy-700 flex items-center justify-center font-bold">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900">{roleInfo?.label}</h4>
            <p className="text-xs text-gray-500 font-mono">Role ID: {user.role.toUpperCase()}</p>
          </div>
        </div>

        <div>
          <h5 className="font-bold text-sm text-gray-800 mb-2">الأذونات والصلاحيات الممنوحة:</h5>
          <div className="space-y-2">
            {roleInfo?.permissions.map((perm, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 p-2.5 rounded-lg border border-gray-100 bg-white hover:bg-accent-50/30 transition text-sm text-gray-700"
              >
                <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span>{perm}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
