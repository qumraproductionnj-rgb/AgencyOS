'use client'

import { useState } from 'react'
import {
  Search,
  Plus,
  X,
  Star,
  Globe,
  Mail,
  Phone,
  MapPin,
  FolderKanban,
  Receipt,
  TrendingUp,
} from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { useLocale } from 'next-intl'
import { useClients, type Client } from '@/hooks/use-clients'
import { cn } from '@/lib/utils'

const STATIC_CLIENTS: Client[] = [
  {
    id: 'c1',
    companyId: 'co1',
    name: 'مطعم بغداد',
    nameEn: 'Baghdad Restaurant',
    email: 'info@baghdadrest.iq',
    phone: '+964 770 100 1001',
    address: 'بغداد، الكرادة',
    website: 'baghdadrest.iq',
    isVip: true,
    isBlacklisted: false,
    notes: 'عميل منذ 2023، يطلب تصوير موسمي',
    createdAt: '2023-03-01T00:00:00Z',
    updatedAt: '2026-04-01T00:00:00Z',
    contacts: [
      {
        id: 'ct1',
        companyId: 'co1',
        clientId: 'c1',
        name: 'أحمد منصور',
        position: 'مدير تسويق',
        email: 'ahmed@baghdadrest.iq',
        phone: null,
        isPrimary: true,
        createdAt: '2023-03-01T00:00:00Z',
      },
    ],
    deals: [],
    _count: { contacts: 1, projects: 3, invoices: 5, quotations: 2, campaigns: 1 },
    totalRevenueIqd: 24_500_000,
  },
  {
    id: 'c2',
    companyId: 'co1',
    name: 'شركة الزلال',
    nameEn: 'Al-Zalal Company',
    email: 'contact@alzalal.iq',
    phone: '+964 770 200 2002',
    address: 'بغداد، المنصور',
    website: 'alzalal.iq',
    isVip: true,
    isBlacklisted: false,
    notes: 'مشروع رئيسي قيد التنفيذ',
    createdAt: '2023-06-15T00:00:00Z',
    updatedAt: '2026-05-01T00:00:00Z',
    contacts: [],
    deals: [],
    _count: { contacts: 2, projects: 2, invoices: 3, quotations: 1, campaigns: 0 },
    totalRevenueIqd: 38_200_000,
  },
  {
    id: 'c3',
    companyId: 'co1',
    name: 'فندق النعيمي',
    nameEn: 'Al-Naaimi Hotel',
    email: 'marketing@naaimi.iq',
    phone: '+964 770 300 3003',
    address: 'بغداد، الكرخ',
    website: null,
    isVip: false,
    isBlacklisted: false,
    notes: null,
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2026-03-15T00:00:00Z',
    contacts: [],
    deals: [],
    _count: { contacts: 1, projects: 1, invoices: 2, quotations: 1, campaigns: 0 },
    totalRevenueIqd: 15_000_000,
  },
  {
    id: 'c4',
    companyId: 'co1',
    name: 'مجمع الشمري التجاري',
    nameEn: 'Al-Shammari Mall',
    email: 'info@shammari.iq',
    phone: '+964 770 400 4004',
    address: 'بغداد، الدورة',
    website: null,
    isVip: false,
    isBlacklisted: false,
    notes: 'عميل جديد، حملة إعلانية كبيرة',
    createdAt: '2026-01-20T00:00:00Z',
    updatedAt: '2026-04-20T00:00:00Z',
    contacts: [],
    deals: [],
    _count: { contacts: 1, projects: 1, invoices: 1, quotations: 2, campaigns: 1 },
    totalRevenueIqd: 11_000_000,
  },
  {
    id: 'c5',
    companyId: 'co1',
    name: 'عيادات الرافدين',
    nameEn: 'Rafidain Clinics',
    email: 'media@rafidain.iq',
    phone: '+964 770 500 5005',
    address: 'بغداد، الأعظمية',
    website: 'rafidain.iq',
    isVip: false,
    isBlacklisted: false,
    notes: null,
    createdAt: '2024-09-05T00:00:00Z',
    updatedAt: '2026-02-10T00:00:00Z',
    contacts: [],
    deals: [],
    _count: { contacts: 2, projects: 1, invoices: 2, quotations: 1, campaigns: 0 },
    totalRevenueIqd: 8_800_000,
  },
]

const AVATAR_COLORS = [
  'from-sky-500 to-blue-600',
  'from-purple-500 to-violet-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-pink-500 to-rose-600',
]

function formatM(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  return `${(n / 1000).toFixed(0)}K`
}

function ClientDrawer({
  client,
  isAr,
  onClose,
}: {
  client: Client
  isAr: boolean
  onClose: () => void
}) {
  const idx = client.id.charCodeAt(1) % AVATAR_COLORS.length
  const grad = AVATAR_COLORS[idx] ?? 'from-sky-500 to-blue-600'
  const initial = (isAr ? client.name : (client.nameEn ?? client.name))[0]?.toUpperCase() ?? '?'

  return (
    <Dialog.Root open onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right fixed inset-y-0 end-0 z-50 flex w-[380px] flex-col border-s border-white/[0.08] bg-[#0d0d0d] shadow-2xl data-[state=closed]:duration-200 data-[state=open]:duration-300">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
            <Dialog.Title className="text-sm font-semibold">
              {isAr ? 'بيانات العميل' : 'Client Details'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="rounded-md p-1.5 text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto p-5">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xl font-bold text-white',
                  grad,
                )}
              >
                {initial}
              </div>
              <div>
                <div className="font-semibold">
                  {isAr ? client.name : (client.nameEn ?? client.name)}
                </div>
                {client.address && (
                  <div className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                    <MapPin className="h-3 w-3" />
                    {client.address}
                  </div>
                )}
                <div className="mt-1.5 flex gap-1.5">
                  {client.isVip && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                      <Star className="h-2.5 w-2.5" />
                      VIP
                    </span>
                  )}
                  <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                    {isAr ? 'نشط' : 'Active'}
                  </span>
                </div>
              </div>
            </div>

            <div className="divide-y divide-white/[0.04] rounded-xl border border-white/[0.06] bg-white/[0.02]">
              {client.email && (
                <div className="flex items-center gap-3 px-4 py-3">
                  <Mail className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                  <span className="text-muted-foreground w-20 shrink-0 text-xs">
                    {isAr ? 'البريد' : 'Email'}
                  </span>
                  <span className="truncate text-sm">{client.email}</span>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-3 px-4 py-3">
                  <Phone className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                  <span className="text-muted-foreground w-20 shrink-0 text-xs">
                    {isAr ? 'الهاتف' : 'Phone'}
                  </span>
                  <span className="text-sm">{client.phone}</span>
                </div>
              )}
              {client.website && (
                <div className="flex items-center gap-3 px-4 py-3">
                  <Globe className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                  <span className="text-muted-foreground w-20 shrink-0 text-xs">
                    {isAr ? 'الموقع' : 'Website'}
                  </span>
                  <span className="text-sm">{client.website}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                <FolderKanban className="mx-auto mb-1 h-4 w-4 text-sky-400" />
                <div className="text-lg font-bold">{client._count.projects}</div>
                <div className="text-muted-foreground text-[10px]">
                  {isAr ? 'مشاريع' : 'Projects'}
                </div>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                <Receipt className="mx-auto mb-1 h-4 w-4 text-purple-400" />
                <div className="text-lg font-bold">{client._count.invoices}</div>
                <div className="text-muted-foreground text-[10px]">
                  {isAr ? 'فواتير' : 'Invoices'}
                </div>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                <TrendingUp className="mx-auto mb-1 h-4 w-4 text-emerald-400" />
                <div className="text-sm font-bold">
                  {client.totalRevenueIqd ? formatM(client.totalRevenueIqd) : '—'}
                </div>
                <div className="text-muted-foreground text-[10px]">
                  {isAr ? 'الإيرادات' : 'Revenue'}
                </div>
              </div>
            </div>

            {client.notes && (
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="text-muted-foreground mb-2 text-xs uppercase tracking-wider">
                  {isAr ? 'ملاحظات' : 'Notes'}
                </div>
                <p className="text-sm text-white/70">{client.notes}</p>
              </div>
            )}

            {client.contacts.length > 0 && (
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="text-muted-foreground mb-3 text-xs uppercase tracking-wider">
                  {isAr ? 'جهات الاتصال' : 'Contacts'}
                </div>
                <div className="space-y-2">
                  {client.contacts.map((c) => (
                    <div key={c.id} className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[11px] font-semibold">
                        {c.name[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{c.name}</div>
                        {c.position && (
                          <div className="text-muted-foreground text-[11px]">{c.position}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function ClientCard({
  client,
  isAr,
  onClick,
  idx,
}: {
  client: Client
  isAr: boolean
  onClick: () => void
  idx: number
}) {
  const grad = AVATAR_COLORS[idx % AVATAR_COLORS.length] ?? 'from-sky-500 to-blue-600'
  const initial = (isAr ? client.name : (client.nameEn ?? client.name))[0]?.toUpperCase() ?? '?'
  const lastContact = new Date(client.updatedAt).toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB')

  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 text-start transition-all hover:border-white/[0.1] hover:bg-white/[0.05] hover:shadow-lg"
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-lg font-bold text-white',
            grad,
          )}
        >
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-semibold">
              {isAr ? client.name : (client.nameEn ?? client.name)}
            </span>
            {client.isVip && (
              <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
                <Star className="h-2.5 w-2.5" />
                VIP
              </span>
            )}
          </div>
          {client.address && (
            <div className="text-muted-foreground mt-0.5 flex items-center gap-1 truncate text-xs">
              <MapPin className="h-3 w-3 shrink-0" />
              {client.address}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 border-t border-white/[0.04] pt-4">
        <div className="text-center">
          <div className="text-base font-bold">{client._count.projects}</div>
          <div className="text-muted-foreground text-[10px]">{isAr ? 'مشاريع' : 'Projects'}</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-sky-300">
            {client.totalRevenueIqd ? formatM(client.totalRevenueIqd) : '—'}
          </div>
          <div className="text-muted-foreground text-[10px]">{isAr ? 'الإيرادات' : 'Revenue'}</div>
        </div>
        <div className="text-center">
          <div className="text-[11px] font-medium text-white/60">{lastContact}</div>
          <div className="text-muted-foreground text-[10px]">
            {isAr ? 'آخر تفاعل' : 'Last contact'}
          </div>
        </div>
      </div>
    </button>
  )
}

export function ClientsClient() {
  const locale = useLocale()
  const isAr = locale === 'ar'
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Client | null>(null)

  const searchParam = search || undefined
  const { data: apiData } = useClients(searchParam ? { search: searchParam } : undefined)
  const clients = apiData ?? STATIC_CLIENTS

  const filtered = clients.filter(
    (c) =>
      !search ||
      c.name.includes(search) ||
      (c.nameEn?.toLowerCase().includes(search.toLowerCase()) ?? false),
  )

  return (
    <div className="space-y-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">{isAr ? 'العملاء' : 'Clients'}</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {clients.length} {isAr ? 'عميل' : 'clients'}
          </p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg border border-sky-500/20 bg-sky-500/10 px-3 py-2 text-xs font-medium text-sky-400 transition-colors hover:bg-sky-500/20">
          <Plus className="h-3.5 w-3.5" />
          {isAr ? 'عميل جديد' : 'New Client'}
        </button>
      </div>

      <div className="flex max-w-xs items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2">
        <Search className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={isAr ? 'بحث...' : 'Search...'}
          className="placeholder:text-muted-foreground w-full bg-transparent text-sm outline-none"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {filtered.map((client, i) => (
          <ClientCard
            key={client.id}
            client={client}
            isAr={isAr}
            onClick={() => setSelected(client)}
            idx={i}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-muted-foreground text-sm">
            {isAr ? 'لا يوجد عملاء' : 'No clients found'}
          </p>
        </div>
      )}

      {selected && <ClientDrawer client={selected} isAr={isAr} onClose={() => setSelected(null)} />}
    </div>
  )
}
