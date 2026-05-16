'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import {
  Building2,
  Users,
  Plug,
  Bell,
  Shield,
  Globe,
  Upload,
  Check,
  X,
  ChevronDown,
  Smartphone,
  CreditCard,
  HardDrive,
  Send,
  Eye,
  EyeOff,
  Monitor,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Tab = 'company' | 'team' | 'integrations' | 'notifications' | 'security' | 'language'

const TABS: { key: Tab; ar: string; en: string; icon: React.ElementType }[] = [
  { key: 'company', ar: 'الشركة', en: 'Company', icon: Building2 },
  { key: 'team', ar: 'الفريق', en: 'Team', icon: Users },
  { key: 'integrations', ar: 'التكاملات', en: 'Integrations', icon: Plug },
  { key: 'notifications', ar: 'الإشعارات', en: 'Notifications', icon: Bell },
  { key: 'security', ar: 'الأمان', en: 'Security', icon: Shield },
  { key: 'language', ar: 'اللغة', en: 'Language', icon: Globe },
]

const TEAM_MEMBERS = [
  {
    id: 'm1',
    nameAr: 'أحمد الهاشمي',
    nameEn: 'Ahmed Al-Hashimi',
    email: 'ahmed@ruya.iq',
    role: 'Owner',
    joinedAr: 'يناير 2025',
    joinedEn: 'Jan 2025',
  },
  {
    id: 'm2',
    nameAr: 'سارة محمد',
    nameEn: 'Sara Mohammed',
    email: 'sara@ruya.iq',
    role: 'Admin',
    joinedAr: 'مارس 2025',
    joinedEn: 'Mar 2025',
  },
  {
    id: 'm3',
    nameAr: 'علي حسن',
    nameEn: 'Ali Hassan',
    email: 'ali@ruya.iq',
    role: 'Member',
    joinedAr: 'يونيو 2025',
    joinedEn: 'Jun 2025',
  },
  {
    id: 'm4',
    nameAr: 'نور إبراهيم',
    nameEn: 'Noor Ibrahim',
    email: 'noor@ruya.iq',
    role: 'Member',
    joinedAr: 'سبتمبر 2025',
    joinedEn: 'Sep 2025',
  },
]

const INTEGRATIONS = [
  {
    id: 'telegram',
    nameAr: 'Telegram',
    nameEn: 'Telegram',
    descAr: 'إشعارات فورية عبر التليغرام',
    descEn: 'Instant notifications via Telegram',
    icon: Send,
    connected: true,
    color: 'text-sky-400',
    bg: 'bg-sky-400/10',
  },
  {
    id: 'fib',
    nameAr: 'FIB Bank',
    nameEn: 'FIB Bank',
    descAr: 'استقبال مدفوعات FIB',
    descEn: 'Accept FIB Bank payments',
    icon: CreditCard,
    connected: true,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
  },
  {
    id: 'stripe',
    nameAr: 'Stripe',
    nameEn: 'Stripe',
    descAr: 'استقبال مدفوعات USD',
    descEn: 'Accept USD payments',
    icon: CreditCard,
    connected: false,
    color: 'text-violet-400',
    bg: 'bg-violet-400/10',
  },
  {
    id: 'r2',
    nameAr: 'R2 Storage',
    nameEn: 'R2 Storage',
    descAr: 'تخزين الملفات والوسائط',
    descEn: 'File & media storage',
    icon: HardDrive,
    connected: true,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
  },
]

const NOTIFICATION_TYPES = [
  { id: 'new_invoice', ar: 'فواتير جديدة', en: 'New Invoices' },
  { id: 'review_request', ar: 'طلبات مراجعة', en: 'Review Requests' },
  { id: 'attendance', ar: 'حضور الموظفين', en: 'Employee Attendance' },
  { id: 'late_tasks', ar: 'مهام متأخرة', en: 'Late Tasks' },
]

const NOTIF_CHANNELS = ['Email', 'Telegram', 'Browser']

const ROLE_COLORS: Record<string, string> = {
  Owner: 'bg-purple-400/10 text-purple-400',
  Admin: 'bg-sky-400/10 text-sky-400',
  Member: 'bg-white/[0.06] text-white/60',
}

function SaveButton({ isAr, onClick }: { isAr: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg bg-sky-500/90 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-500"
    >
      <Check className="h-4 w-4" />
      {isAr ? 'حفظ التغييرات' : 'Save Changes'}
    </button>
  )
}

function InputField({
  label,
  placeholder,
  defaultValue,
}: {
  label: string
  placeholder: string
  defaultValue?: string
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-white/60">{label}</label>
      <input
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm outline-none placeholder:text-white/20 focus:border-white/[0.15] focus:bg-white/[0.05]"
      />
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
        checked ? 'bg-sky-500' : 'bg-white/[0.12]',
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
          checked ? 'translate-x-4' : 'translate-x-0',
        )}
      />
    </button>
  )
}

// ─── Tab Panels ───────────────────────────────────────────────────────────────

function CompanyTab({ isAr }: { isAr: boolean }) {
  return (
    <div className="space-y-6">
      {/* Logo upload */}
      <div>
        <label className="mb-2 block text-xs font-medium text-white/60">
          {isAr ? 'شعار الشركة' : 'Company Logo'}
        </label>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-white/[0.08] bg-gradient-to-br from-sky-500/30 to-purple-500/30 text-lg font-bold">
            R
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm transition-colors hover:bg-white/[0.08]">
            <Upload className="h-4 w-4" />
            {isAr ? 'رفع شعار' : 'Upload Logo'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          label={isAr ? 'اسم الشركة' : 'Company Name'}
          placeholder="Ru'ya"
          defaultValue="رؤية للإنتاج الفني"
        />
        <InputField
          label={isAr ? 'الموقع الإلكتروني' : 'Website'}
          placeholder="https://ruya.iq"
          defaultValue="https://ruya.iq"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-white/60">
          {isAr ? 'الوصف' : 'Description'}
        </label>
        <textarea
          rows={3}
          defaultValue={
            isAr
              ? 'وكالة إنتاج فني ومحتوى إبداعي في العراق'
              : 'Artistic production & creative content agency in Iraq'
          }
          className="w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm outline-none placeholder:text-white/20 focus:border-white/[0.15]"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <InputField
          label={isAr ? 'العنوان' : 'Address'}
          placeholder={isAr ? 'شارع المنصور' : 'Mansour St'}
          defaultValue={isAr ? 'شارع المنصور، بغداد' : 'Mansour St, Baghdad'}
        />
        <InputField
          label={isAr ? 'المدينة' : 'City'}
          placeholder={isAr ? 'بغداد' : 'Baghdad'}
          defaultValue={isAr ? 'بغداد' : 'Baghdad'}
        />
        <InputField
          label={isAr ? 'الدولة' : 'Country'}
          placeholder={isAr ? 'العراق' : 'Iraq'}
          defaultValue={isAr ? 'العراق' : 'Iraq'}
        />
      </div>
      <InputField
        label={isAr ? 'الهاتف' : 'Phone'}
        placeholder="+964 770 000 0000"
        defaultValue="+964 770 123 4567"
      />
    </div>
  )
}

function TeamTab({ isAr }: { isAr: boolean }) {
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('Member')

  return (
    <div className="space-y-6">
      {/* Invite */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <h3 className="mb-3 text-sm font-semibold">
          {isAr ? 'دعوة عضو جديد' : 'Invite New Member'}
        </h3>
        <div className="flex flex-wrap gap-3">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder={isAr ? 'البريد الإلكتروني' : 'Email address'}
            className="min-w-0 flex-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm outline-none placeholder:text-white/20 focus:border-white/[0.15]"
          />
          <div className="relative">
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="appearance-none rounded-lg border border-white/[0.08] bg-white/[0.04] py-2 pe-8 ps-3 text-sm outline-none"
            >
              <option value="Admin">Admin</option>
              <option value="Member">Member</option>
            </select>
            <ChevronDown className="pointer-events-none absolute end-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
          </div>
          <button
            onClick={() => {
              toast.success(isAr ? 'تم إرسال الدعوة' : 'Invitation sent')
              setInviteEmail('')
            }}
            className="rounded-lg bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-400 transition-colors hover:bg-sky-500/20"
          >
            {isAr ? 'دعوة' : 'Invite'}
          </button>
        </div>
      </div>

      {/* Members table */}
      <div className="overflow-hidden rounded-xl border border-white/[0.06]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.04]">
              <th className="text-muted-foreground px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider">
                {isAr ? 'العضو' : 'Member'}
              </th>
              <th className="text-muted-foreground px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider">
                {isAr ? 'الدور' : 'Role'}
              </th>
              <th className="text-muted-foreground hidden px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider sm:table-cell">
                {isAr ? 'انضم' : 'Joined'}
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {TEAM_MEMBERS.map((m) => (
              <tr key={m.id} className="hover:bg-white/[0.02]">
                <td className="px-4 py-3.5">
                  <div className="font-medium">{isAr ? m.nameAr : m.nameEn}</div>
                  <div className="text-muted-foreground text-xs">{m.email}</div>
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-[11px] font-medium',
                      ROLE_COLORS[m.role] ?? '',
                    )}
                  >
                    {m.role}
                  </span>
                </td>
                <td className="text-muted-foreground hidden px-4 py-3.5 text-xs sm:table-cell">
                  {isAr ? m.joinedAr : m.joinedEn}
                </td>
                <td className="px-4 py-3.5 text-end">
                  {m.role !== 'Owner' && (
                    <button
                      onClick={() => toast.error(isAr ? 'تم إلغاء الدعوة' : 'Invitation cancelled')}
                      className="rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[11px] font-medium text-red-400 transition-colors hover:bg-red-500/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function IntegrationsTab({ isAr }: { isAr: boolean }) {
  const [states, setStates] = useState<Record<string, boolean>>(
    Object.fromEntries(INTEGRATIONS.map((i) => [i.id, i.connected])),
  )

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {INTEGRATIONS.map((intg) => {
        const Icon = intg.icon
        const connected = states[intg.id] ?? false
        return (
          <div key={intg.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-start gap-3">
              <div className={cn('rounded-xl p-2.5', intg.bg)}>
                <Icon className={cn('h-5 w-5', intg.color)} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{isAr ? intg.nameAr : intg.nameEn}</span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                      connected
                        ? 'bg-emerald-400/10 text-emerald-400'
                        : 'bg-white/[0.06] text-white/40',
                    )}
                  >
                    {connected ? (isAr ? 'متصل' : 'Connected') : isAr ? 'غير متصل' : 'Disconnected'}
                  </span>
                </div>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {isAr ? intg.descAr : intg.descEn}
                </p>
                <button
                  onClick={() => {
                    setStates((s) => ({ ...s, [intg.id]: !s[intg.id] }))
                    toast.success(
                      connected
                        ? isAr
                          ? 'تم قطع الاتصال'
                          : 'Disconnected'
                        : isAr
                          ? 'تم الاتصال'
                          : 'Connected',
                    )
                  }}
                  className={cn(
                    'mt-3 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                    connected
                      ? 'border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                      : 'border border-sky-500/20 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20',
                  )}
                >
                  {connected ? (isAr ? 'قطع الاتصال' : 'Disconnect') : isAr ? 'ربط' : 'Connect'}
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function NotificationsTab({ isAr }: { isAr: boolean }) {
  const init: Record<string, Record<string, boolean>> = {}
  NOTIFICATION_TYPES.forEach((nt) => {
    init[nt.id] = { Email: true, Telegram: nt.id !== 'attendance', Browser: false }
  })
  const [toggles, setToggles] = useState(init)

  const flip = (notifId: string, channel: string) => {
    setToggles((s) => ({ ...s, [notifId]: { ...s[notifId], [channel]: !s[notifId]?.[channel] } }))
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.06]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.04]">
            <th className="text-muted-foreground px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider">
              {isAr ? 'نوع الإشعار' : 'Notification Type'}
            </th>
            {NOTIF_CHANNELS.map((ch) => (
              <th
                key={ch}
                className="text-muted-foreground px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider"
              >
                {ch}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {NOTIFICATION_TYPES.map((nt) => (
            <tr key={nt.id} className="hover:bg-white/[0.02]">
              <td className="px-4 py-3.5 font-medium">{isAr ? nt.ar : nt.en}</td>
              {NOTIF_CHANNELS.map((ch) => (
                <td key={ch} className="px-4 py-3.5 text-center">
                  <div className="flex justify-center">
                    <Toggle
                      checked={toggles[nt.id]?.[ch] ?? false}
                      onChange={() => flip(nt.id, ch)}
                    />
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SecurityTab({ isAr }: { isAr: boolean }) {
  const [show, setShow] = useState(false)
  const [twoFa, setTwoFa] = useState(false)

  const SESSIONS = [
    {
      id: 's1',
      device: 'Chrome · Windows',
      location: isAr ? 'بغداد، العراق' : 'Baghdad, Iraq',
      lastActive: isAr ? 'الآن' : 'Now',
      current: true,
    },
    {
      id: 's2',
      device: 'Safari · iPhone',
      location: isAr ? 'بغداد، العراق' : 'Baghdad, Iraq',
      lastActive: isAr ? 'منذ 2 ساعة' : '2h ago',
      current: false,
    },
    {
      id: 's3',
      device: 'Firefox · macOS',
      location: isAr ? 'دبي، الإمارات' : 'Dubai, UAE',
      lastActive: isAr ? 'منذ 3 أيام' : '3d ago',
      current: false,
    },
  ]

  return (
    <div className="space-y-5">
      {/* Change password */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
        <h3 className="mb-4 text-sm font-semibold">
          {isAr ? 'تغيير كلمة المرور' : 'Change Password'}
        </h3>
        <div className="space-y-3">
          <InputField
            label={isAr ? 'كلمة المرور الحالية' : 'Current Password'}
            placeholder="••••••••"
          />
          <div className="relative">
            <label className="mb-1.5 block text-xs font-medium text-white/60">
              {isAr ? 'كلمة المرور الجديدة' : 'New Password'}
            </label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 pe-10 text-sm outline-none placeholder:text-white/20 focus:border-white/[0.15]"
              />
              <button
                onClick={() => setShow((s) => !s)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button
            onClick={() => toast.success(isAr ? 'تم تغيير كلمة المرور' : 'Password changed')}
            className="rounded-lg bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-400 transition-colors hover:bg-sky-500/20"
          >
            {isAr ? 'تحديث كلمة المرور' : 'Update Password'}
          </button>
        </div>
      </div>

      {/* 2FA */}
      <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-400/10 p-2.5">
            <Smartphone className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <div className="font-medium">
              {isAr ? 'المصادقة الثنائية (2FA)' : 'Two-Factor Authentication'}
            </div>
            <p className="text-muted-foreground text-xs">
              {isAr ? 'حماية إضافية لحسابك' : 'Extra security for your account'}
            </p>
          </div>
        </div>
        <Toggle
          checked={twoFa}
          onChange={(v) => {
            setTwoFa(v)
            toast.success(
              v ? (isAr ? 'تم تفعيل 2FA' : '2FA enabled') : isAr ? 'تم إيقاف 2FA' : '2FA disabled',
            )
          }}
        />
      </div>

      {/* Sessions */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold">{isAr ? 'الجلسات النشطة' : 'Active Sessions'}</h3>
          <button
            onClick={() => toast.success(isAr ? 'تم إنهاء كل الجلسات' : 'All sessions terminated')}
            className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
          >
            {isAr ? 'إنهاء كل الجلسات' : 'End All Sessions'}
          </button>
        </div>
        <div className="space-y-3">
          {SESSIONS.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-white/[0.06] p-2">
                  <Monitor className="h-4 w-4 text-white/60" />
                </div>
                <div>
                  <div className="text-sm font-medium">{s.device}</div>
                  <div className="text-muted-foreground text-xs">
                    {s.location} · {s.lastActive}
                  </div>
                </div>
              </div>
              {s.current ? (
                <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                  {isAr ? 'الجهاز الحالي' : 'Current'}
                </span>
              ) : (
                <button className="rounded-lg border border-white/[0.08] px-2.5 py-1 text-[11px] font-medium text-white/50 hover:bg-white/[0.05]">
                  {isAr ? 'إنهاء' : 'End'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function LanguageTab({ isAr }: { isAr: boolean }) {
  const [lang, setLang] = useState(isAr ? 'ar' : 'en')
  const [currency, setCurrency] = useState('IQD')
  const [tz, setTz] = useState('Asia/Baghdad')

  return (
    <div className="space-y-5">
      {/* Language */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
        <h3 className="mb-4 text-sm font-semibold">{isAr ? 'اللغة' : 'Language'}</h3>
        <div className="flex gap-3">
          {[
            { v: 'ar', label: 'العربية' },
            { v: 'en', label: 'English' },
          ].map((l) => (
            <button
              key={l.v}
              onClick={() => setLang(l.v)}
              className={cn(
                'flex-1 rounded-xl border py-3 text-sm font-medium transition-all',
                lang === l.v
                  ? 'border-sky-500/40 bg-sky-500/10 text-sky-400'
                  : 'border-white/[0.06] bg-white/[0.02] text-white/60 hover:bg-white/[0.05]',
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Currency */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
        <h3 className="mb-4 text-sm font-semibold">{isAr ? 'العملة' : 'Currency'}</h3>
        <div className="flex gap-3">
          {['IQD', 'USD'].map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={cn(
                'flex-1 rounded-xl border py-3 text-sm font-medium transition-all',
                currency === c
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                  : 'border-white/[0.06] bg-white/[0.02] text-white/60 hover:bg-white/[0.05]',
              )}
            >
              {c === 'IQD' ? 'د.ع (IQD)' : '$ (USD)'}
            </button>
          ))}
        </div>
      </div>

      {/* Timezone */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
        <h3 className="mb-4 text-sm font-semibold">{isAr ? 'المنطقة الزمنية' : 'Timezone'}</h3>
        <div className="relative">
          <select
            value={tz}
            onChange={(e) => setTz(e.target.value)}
            className="w-full appearance-none rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 pe-8 text-sm outline-none focus:border-white/[0.15]"
          >
            <option value="Asia/Baghdad">Asia/Baghdad (UTC+3)</option>
            <option value="Asia/Dubai">Asia/Dubai (UTC+4)</option>
            <option value="Europe/London">Europe/London (UTC+0)</option>
            <option value="America/New_York">America/New_York (UTC-5)</option>
          </select>
          <ChevronDown className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        </div>
      </div>

      {/* Intro replay */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold">{isAr ? 'مقدمة النظام' : 'Intro Animation'}</h3>
            <p className="mt-0.5 text-xs text-white/40">
              {isAr ? 'إعادة مشاهدة مقدمة Vision OS' : 'Replay the Vision OS intro animation'}
            </p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('agencyos:intro:shown')
              window.location.reload()
            }}
            className="shrink-0 rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm text-white/70 transition hover:bg-white/[0.08] hover:text-white"
          >
            {isAr ? '▶ إعادة المشاهدة' : '▶ Replay'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function SettingsClient() {
  const locale = useLocale()
  const isAr = locale === 'ar'
  const [tab, setTab] = useState<Tab>('company')

  const handleSave = () => toast.success(isAr ? 'تم حفظ التغييرات' : 'Changes saved')

  return (
    <div className="space-y-5 p-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">{isAr ? 'الإعدادات' : 'Settings'}</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">
          {isAr ? 'إدارة إعدادات الشركة والفريق' : 'Manage company & team settings'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
        {TABS.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                tab === t.key
                  ? 'bg-white/[0.1] text-white shadow'
                  : 'text-muted-foreground hover:bg-white/[0.05] hover:text-white',
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{isAr ? t.ar : t.en}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
        {tab === 'company' && <CompanyTab isAr={isAr} />}
        {tab === 'team' && <TeamTab isAr={isAr} />}
        {tab === 'integrations' && <IntegrationsTab isAr={isAr} />}
        {tab === 'notifications' && <NotificationsTab isAr={isAr} />}
        {tab === 'security' && <SecurityTab isAr={isAr} />}
        {tab === 'language' && <LanguageTab isAr={isAr} />}

        {(tab === 'company' || tab === 'language') && (
          <div className="mt-5 flex justify-end border-t border-white/[0.06] pt-4">
            <SaveButton isAr={isAr} onClick={handleSave} />
          </div>
        )}
      </div>
    </div>
  )
}
