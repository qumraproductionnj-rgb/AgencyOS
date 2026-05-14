'use client'

import { useState, useCallback } from 'react'
import {
  Plus,
  Flame,
  Thermometer,
  Snowflake,
  DollarSign,
  Square,
  CheckSquare as CheckSq,
} from 'lucide-react'
import { useBulkSelect } from '@/hooks/use-bulk-select'
import { BulkActionBar } from '@/components/bulk-action-bar'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'
import { useLocale } from 'next-intl'
import { useLeads, type Lead, type LeadStatus } from '@/hooks/use-leads'
import { cn } from '@/lib/utils'

type Temperature = 'hot' | 'warm' | 'cold'

interface EnrichedLead extends Lead {
  temperature: Temperature
  serviceType: string
  expectedValue: number
}

const STATIC_LEADS: EnrichedLead[] = [
  {
    id: 'l1',
    companyId: 'c1',
    name: 'فيصل الحيدري',
    companyName: 'شركة الفيصل للتجارة',
    email: null,
    phone: null,
    source: null,
    status: 'NEW',
    assignedTo: null,
    notes: null,
    convertedAt: null,
    convertedToClientId: null,
    convertedToDealId: null,
    createdAt: '2026-05-01T00:00:00Z',
    updatedAt: '2026-05-01T00:00:00Z',
    assignee: null,
    deals: [],
    temperature: 'hot',
    serviceType: 'تصوير تجاري',
    expectedValue: 5_500_000,
  },
  {
    id: 'l2',
    companyId: 'c1',
    name: 'ليلى الراوي',
    companyName: 'مطعم بغداد الكبير',
    email: null,
    phone: null,
    source: null,
    status: 'NEW',
    assignedTo: null,
    notes: null,
    convertedAt: null,
    convertedToClientId: null,
    convertedToDealId: null,
    createdAt: '2026-05-02T00:00:00Z',
    updatedAt: '2026-05-02T00:00:00Z',
    assignee: null,
    deals: [],
    temperature: 'warm',
    serviceType: 'هوية بصرية',
    expectedValue: 8_000_000,
  },
  {
    id: 'l3',
    companyId: 'c1',
    name: 'منار الجبوري',
    companyName: 'صيدلية الشفاء',
    email: null,
    phone: null,
    source: null,
    status: 'NEW',
    assignedTo: null,
    notes: null,
    convertedAt: null,
    convertedToClientId: null,
    convertedToDealId: null,
    createdAt: '2026-05-03T00:00:00Z',
    updatedAt: '2026-05-03T00:00:00Z',
    assignee: null,
    deals: [],
    temperature: 'cold',
    serviceType: 'سوشيال ميديا',
    expectedValue: 2_400_000,
  },
  {
    id: 'l4',
    companyId: 'c1',
    name: 'سامي العمري',
    companyName: 'مجموعة العمري',
    email: null,
    phone: null,
    source: null,
    status: 'NEW',
    assignedTo: null,
    notes: null,
    convertedAt: null,
    convertedToClientId: null,
    convertedToDealId: null,
    createdAt: '2026-05-04T00:00:00Z',
    updatedAt: '2026-05-04T00:00:00Z',
    assignee: null,
    deals: [],
    temperature: 'hot',
    serviceType: 'إنتاج فيديو',
    expectedValue: 12_000_000,
  },
  {
    id: 'l5',
    companyId: 'c1',
    name: 'نادية حسن',
    companyName: 'مدرسة النور',
    email: null,
    phone: null,
    source: null,
    status: 'NEW',
    assignedTo: null,
    notes: null,
    convertedAt: null,
    convertedToClientId: null,
    convertedToDealId: null,
    createdAt: '2026-05-05T00:00:00Z',
    updatedAt: '2026-05-05T00:00:00Z',
    assignee: null,
    deals: [],
    temperature: 'warm',
    serviceType: 'تصميم مطبوعات',
    expectedValue: 1_800_000,
  },
  {
    id: 'l6',
    companyId: 'c1',
    name: 'عمر السامرائي',
    companyName: 'أثاث السامرائي',
    email: null,
    phone: null,
    source: null,
    status: 'NEW',
    assignedTo: null,
    notes: null,
    convertedAt: null,
    convertedToClientId: null,
    convertedToDealId: null,
    createdAt: '2026-05-06T00:00:00Z',
    updatedAt: '2026-05-06T00:00:00Z',
    assignee: null,
    deals: [],
    temperature: 'cold',
    serviceType: 'تصوير منتجات',
    expectedValue: 3_200_000,
  },
  {
    id: 'l7',
    companyId: 'c1',
    name: 'رنا الزيدي',
    companyName: 'بوتيك ريم',
    email: null,
    phone: null,
    source: null,
    status: 'NEW',
    assignedTo: null,
    notes: null,
    convertedAt: null,
    convertedToClientId: null,
    convertedToDealId: null,
    createdAt: '2026-05-07T00:00:00Z',
    updatedAt: '2026-05-07T00:00:00Z',
    assignee: null,
    deals: [],
    temperature: 'hot',
    serviceType: 'حملة إعلانية',
    expectedValue: 7_500_000,
  },
  {
    id: 'l8',
    companyId: 'c1',
    name: 'طارق المدني',
    companyName: 'مكتب المدني',
    email: null,
    phone: null,
    source: null,
    status: 'NEW',
    assignedTo: null,
    notes: null,
    convertedAt: null,
    convertedToClientId: null,
    convertedToDealId: null,
    createdAt: '2026-05-08T00:00:00Z',
    updatedAt: '2026-05-08T00:00:00Z',
    assignee: null,
    deals: [],
    temperature: 'cold',
    serviceType: 'موشن جرافيك',
    expectedValue: 4_000_000,
  },
  {
    id: 'l9',
    companyId: 'c1',
    name: 'آلاء الطائي',
    companyName: 'شركة الطائي',
    email: null,
    phone: null,
    source: null,
    status: 'CONTACTED',
    assignedTo: null,
    notes: null,
    convertedAt: null,
    convertedToClientId: null,
    convertedToDealId: null,
    createdAt: '2026-04-20T00:00:00Z',
    updatedAt: '2026-04-20T00:00:00Z',
    assignee: null,
    deals: [],
    temperature: 'hot',
    serviceType: 'إنتاج فيديو',
    expectedValue: 9_000_000,
  },
  {
    id: 'l10',
    companyId: 'c1',
    name: 'باسم النعيمي',
    companyName: 'فندق النعيمي',
    email: null,
    phone: null,
    source: null,
    status: 'CONTACTED',
    assignedTo: null,
    notes: null,
    convertedAt: null,
    convertedToClientId: null,
    convertedToDealId: null,
    createdAt: '2026-04-21T00:00:00Z',
    updatedAt: '2026-04-21T00:00:00Z',
    assignee: null,
    deals: [],
    temperature: 'hot',
    serviceType: 'تصوير فندقي',
    expectedValue: 15_000_000,
  },
  {
    id: 'l11',
    companyId: 'c1',
    name: 'سحر القريشي',
    companyName: 'عيادة القريشي',
    email: null,
    phone: null,
    source: null,
    status: 'CONTACTED',
    assignedTo: null,
    notes: null,
    convertedAt: null,
    convertedToClientId: null,
    convertedToDealId: null,
    createdAt: '2026-04-22T00:00:00Z',
    updatedAt: '2026-04-22T00:00:00Z',
    assignee: null,
    deals: [],
    temperature: 'warm',
    serviceType: 'تسويق طبي',
    expectedValue: 4_500_000,
  },
  {
    id: 'l12',
    companyId: 'c1',
    name: 'مروان الدليمي',
    companyName: 'مطاعم الدليمي',
    email: null,
    phone: null,
    source: null,
    status: 'CONTACTED',
    assignedTo: null,
    notes: null,
    convertedAt: null,
    convertedToClientId: null,
    convertedToDealId: null,
    createdAt: '2026-04-23T00:00:00Z',
    updatedAt: '2026-04-23T00:00:00Z',
    assignee: null,
    deals: [],
    temperature: 'warm',
    serviceType: 'هوية بصرية',
    expectedValue: 6_000_000,
  },
  {
    id: 'l13',
    companyId: 'c1',
    name: 'إيمان الفراجي',
    companyName: 'مركز الفراجي',
    email: null,
    phone: null,
    source: null,
    status: 'CONTACTED',
    assignedTo: null,
    notes: null,
    convertedAt: null,
    convertedToClientId: null,
    convertedToDealId: null,
    createdAt: '2026-04-24T00:00:00Z',
    updatedAt: '2026-04-24T00:00:00Z',
    assignee: null,
    deals: [],
    temperature: 'cold',
    serviceType: 'سوشيال ميديا',
    expectedValue: 2_200_000,
  },
  {
    id: 'l14',
    companyId: 'c1',
    name: 'حيدر الشمري',
    companyName: 'مجمع الشمري',
    email: null,
    phone: null,
    source: null,
    status: 'CONTACTED',
    assignedTo: null,
    notes: null,
    convertedAt: null,
    convertedToClientId: null,
    convertedToDealId: null,
    createdAt: '2026-04-25T00:00:00Z',
    updatedAt: '2026-04-25T00:00:00Z',
    assignee: null,
    deals: [],
    temperature: 'hot',
    serviceType: 'حملة إعلانية',
    expectedValue: 11_000_000,
  },
  {
    id: 'l15',
    companyId: 'c1',
    name: 'زهراء الموسوي',
    companyName: 'عبايات الموسوي',
    email: null,
    phone: null,
    source: null,
    status: 'CONTACTED',
    assignedTo: null,
    notes: null,
    convertedAt: null,
    convertedToClientId: null,
    convertedToDealId: null,
    createdAt: '2026-04-26T00:00:00Z',
    updatedAt: '2026-04-26T00:00:00Z',
    assignee: null,
    deals: [],
    temperature: 'warm',
    serviceType: 'تصوير منتجات',
    expectedValue: 3_800_000,
  },
  {
    id: 'l16',
    companyId: 'c1',
    name: 'ياسر الجنابي',
    companyName: 'شركة الجنابي',
    email: null,
    phone: null,
    source: null,
    status: 'CONTACTED',
    assignedTo: null,
    notes: null,
    convertedAt: null,
    convertedToClientId: null,
    convertedToDealId: null,
    createdAt: '2026-04-27T00:00:00Z',
    updatedAt: '2026-04-27T00:00:00Z',
    assignee: null,
    deals: [],
    temperature: 'cold',
    serviceType: 'موشن جرافيك',
    expectedValue: 5_000_000,
  },
  {
    id: 'l17',
    companyId: 'c1',
    name: 'كرار الحسني',
    companyName: 'مستشفى الحسني',
    email: null,
    phone: null,
    source: null,
    status: 'CONTACTED',
    assignedTo: null,
    notes: null,
    convertedAt: null,
    convertedToClientId: null,
    convertedToDealId: null,
    createdAt: '2026-04-28T00:00:00Z',
    updatedAt: '2026-04-28T00:00:00Z',
    assignee: null,
    deals: [],
    temperature: 'hot',
    serviceType: 'تسويق طبي',
    expectedValue: 8_500_000,
  },
  {
    id: 'l18',
    companyId: 'c1',
    name: 'دلال إبراهيم',
    companyName: 'حلويات إبراهيم',
    email: null,
    phone: null,
    source: null,
    status: 'CONTACTED',
    assignedTo: null,
    notes: null,
    convertedAt: null,
    convertedToClientId: null,
    convertedToDealId: null,
    createdAt: '2026-04-29T00:00:00Z',
    updatedAt: '2026-04-29T00:00:00Z',
    assignee: null,
    deals: [],
    temperature: 'warm',
    serviceType: 'تصوير منتجات',
    expectedValue: 2_700_000,
  },
  {
    id: 'l19',
    companyId: 'c1',
    name: 'حامد العبيدي',
    companyName: 'مقاولات العبيدي',
    email: null,
    phone: null,
    source: null,
    status: 'CONTACTED',
    assignedTo: null,
    notes: null,
    convertedAt: null,
    convertedToClientId: null,
    convertedToDealId: null,
    createdAt: '2026-04-30T00:00:00Z',
    updatedAt: '2026-04-30T00:00:00Z',
    assignee: null,
    deals: [],
    temperature: 'cold',
    serviceType: 'هوية بصرية',
    expectedValue: 6_500_000,
  },
  {
    id: 'l20',
    companyId: 'c1',
    name: 'أسيل الربيعي',
    companyName: 'أكاديمية الربيعي',
    email: null,
    phone: null,
    source: null,
    status: 'PROPOSAL',
    assignedTo: null,
    notes: null,
    convertedAt: null,
    convertedToClientId: null,
    convertedToDealId: null,
    createdAt: '2026-04-10T00:00:00Z',
    updatedAt: '2026-04-10T00:00:00Z',
    assignee: null,
    deals: [],
    temperature: 'hot',
    serviceType: 'حملة تسويقية',
    expectedValue: 13_000_000,
  },
  {
    id: 'l21',
    companyId: 'c1',
    name: 'وليد الكعبي',
    companyName: 'سوبرماركت الكعبي',
    email: null,
    phone: null,
    source: null,
    status: 'PROPOSAL',
    assignedTo: null,
    notes: null,
    convertedAt: null,
    convertedToClientId: null,
    convertedToDealId: null,
    createdAt: '2026-04-11T00:00:00Z',
    updatedAt: '2026-04-11T00:00:00Z',
    assignee: null,
    deals: [],
    temperature: 'warm',
    serviceType: 'تصوير',
    expectedValue: 4_200_000,
  },
  {
    id: 'l22',
    companyId: 'c1',
    name: 'هديل محمود',
    companyName: 'مركز هديل',
    email: null,
    phone: null,
    source: null,
    status: 'PROPOSAL',
    assignedTo: null,
    notes: null,
    convertedAt: null,
    convertedToClientId: null,
    convertedToDealId: null,
    createdAt: '2026-04-12T00:00:00Z',
    updatedAt: '2026-04-12T00:00:00Z',
    assignee: null,
    deals: [],
    temperature: 'hot',
    serviceType: 'فيديو',
    expectedValue: 7_800_000,
  },
  {
    id: 'l23',
    companyId: 'c1',
    name: 'قيس البهادلي',
    companyName: 'شركة البهادلي',
    email: null,
    phone: null,
    source: null,
    status: 'PROPOSAL',
    assignedTo: null,
    notes: null,
    convertedAt: null,
    convertedToClientId: null,
    convertedToDealId: null,
    createdAt: '2026-04-13T00:00:00Z',
    updatedAt: '2026-04-13T00:00:00Z',
    assignee: null,
    deals: [],
    temperature: 'warm',
    serviceType: 'إعلان',
    expectedValue: 5_500_000,
  },
  {
    id: 'l24',
    companyId: 'c1',
    name: 'سلام التكريتي',
    companyName: 'بناء التكريتي',
    email: null,
    phone: null,
    source: null,
    status: 'PROPOSAL',
    assignedTo: null,
    notes: null,
    convertedAt: null,
    convertedToClientId: null,
    convertedToDealId: null,
    createdAt: '2026-04-14T00:00:00Z',
    updatedAt: '2026-04-14T00:00:00Z',
    assignee: null,
    deals: [],
    temperature: 'cold',
    serviceType: 'هوية',
    expectedValue: 3_000_000,
  },
  {
    id: 'l25',
    companyId: 'c1',
    name: 'ريام الصالح',
    companyName: 'معرض الصالح',
    email: null,
    phone: null,
    source: null,
    status: 'PROPOSAL',
    assignedTo: null,
    notes: null,
    convertedAt: null,
    convertedToClientId: null,
    convertedToDealId: null,
    createdAt: '2026-04-15T00:00:00Z',
    updatedAt: '2026-04-15T00:00:00Z',
    assignee: null,
    deals: [],
    temperature: 'hot',
    serviceType: 'تصوير',
    expectedValue: 9_500_000,
  },
  {
    id: 'l26',
    companyId: 'c1',
    name: 'عباس المرتضى',
    companyName: 'توزيع المرتضى',
    email: null,
    phone: null,
    source: null,
    status: 'NEGOTIATION',
    assignedTo: null,
    notes: null,
    convertedAt: null,
    convertedToClientId: null,
    convertedToDealId: null,
    createdAt: '2026-04-01T00:00:00Z',
    updatedAt: '2026-04-01T00:00:00Z',
    assignee: null,
    deals: [],
    temperature: 'hot',
    serviceType: 'حملة كاملة',
    expectedValue: 20_000_000,
  },
  {
    id: 'l27',
    companyId: 'c1',
    name: 'أمل خضير',
    companyName: 'روضة أمل',
    email: null,
    phone: null,
    source: null,
    status: 'NEGOTIATION',
    assignedTo: null,
    notes: null,
    convertedAt: null,
    convertedToClientId: null,
    convertedToDealId: null,
    createdAt: '2026-04-02T00:00:00Z',
    updatedAt: '2026-04-02T00:00:00Z',
    assignee: null,
    deals: [],
    temperature: 'hot',
    serviceType: 'تصميم',
    expectedValue: 5_000_000,
  },
  {
    id: 'l28',
    companyId: 'c1',
    name: 'ضياء الخزاعي',
    companyName: 'استيراد الخزاعي',
    email: null,
    phone: null,
    source: null,
    status: 'NEGOTIATION',
    assignedTo: null,
    notes: null,
    convertedAt: null,
    convertedToClientId: null,
    convertedToDealId: null,
    createdAt: '2026-04-03T00:00:00Z',
    updatedAt: '2026-04-03T00:00:00Z',
    assignee: null,
    deals: [],
    temperature: 'warm',
    serviceType: 'فيديو إعلاني',
    expectedValue: 8_000_000,
  },
  {
    id: 'l29',
    companyId: 'c1',
    name: 'نبيل العزاوي',
    companyName: 'شركة العزاوي',
    email: null,
    phone: null,
    source: null,
    status: 'NEGOTIATION',
    assignedTo: null,
    notes: null,
    convertedAt: null,
    convertedToClientId: null,
    convertedToDealId: null,
    createdAt: '2026-04-04T00:00:00Z',
    updatedAt: '2026-04-04T00:00:00Z',
    assignee: null,
    deals: [],
    temperature: 'warm',
    serviceType: 'تصوير معماري',
    expectedValue: 6_500_000,
  },
  {
    id: 'l30',
    companyId: 'c1',
    name: 'هيفاء النقشبندي',
    companyName: 'فاشن هيفاء',
    email: null,
    phone: null,
    source: null,
    status: 'NEGOTIATION',
    assignedTo: null,
    notes: null,
    convertedAt: null,
    convertedToClientId: null,
    convertedToDealId: null,
    createdAt: '2026-04-05T00:00:00Z',
    updatedAt: '2026-04-05T00:00:00Z',
    assignee: null,
    deals: [],
    temperature: 'hot',
    serviceType: 'تصوير أزياء',
    expectedValue: 11_500_000,
  },
]

const COLUMNS: { key: LeadStatus; labelAr: string; labelEn: string; color: string }[] = [
  { key: 'NEW', labelAr: 'جديد', labelEn: 'New', color: 'border-sky-400/30 bg-sky-400/[0.03]' },
  {
    key: 'CONTACTED',
    labelAr: 'تواصل',
    labelEn: 'Contacted',
    color: 'border-purple-400/30 bg-purple-400/[0.03]',
  },
  {
    key: 'PROPOSAL',
    labelAr: 'عرض سعر',
    labelEn: 'Proposal',
    color: 'border-amber-400/30 bg-amber-400/[0.03]',
  },
  {
    key: 'NEGOTIATION',
    labelAr: 'قيد التحويل',
    labelEn: 'Negotiation',
    color: 'border-emerald-400/30 bg-emerald-400/[0.03]',
  },
]

const TEMP_CONFIG = {
  hot: { icon: Flame, style: 'bg-red-400/10 text-red-400', ar: 'ساخنة', en: 'Hot' },
  warm: { icon: Thermometer, style: 'bg-amber-400/10 text-amber-400', ar: 'دافئة', en: 'Warm' },
  cold: { icon: Snowflake, style: 'bg-sky-400/10 text-sky-400', ar: 'باردة', en: 'Cold' },
} as const

function formatM(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
  return String(n)
}

function LeadCard({
  lead,
  isAr,
  dragging,
  selected,
  onToggle,
}: {
  lead: EnrichedLead
  isAr: boolean
  dragging?: boolean
  selected?: boolean
  onToggle?: (e: React.MouseEvent) => void
}) {
  const tempCfg = TEMP_CONFIG[lead.temperature]
  const TempIcon = tempCfg.icon
  return (
    <div
      className={cn(
        'cursor-grab select-none space-y-2.5 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3.5 active:cursor-grabbing',
        'transition-all duration-150',
        dragging && 'scale-95 opacity-50',
        selected && 'ring-1 ring-purple-500/40',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          {onToggle && (
            <button
              onClick={onToggle}
              className="mt-0.5 shrink-0 text-white/30 hover:text-purple-400"
            >
              {selected ? (
                <CheckSq className="h-3.5 w-3.5 text-purple-400" />
              ) : (
                <Square className="h-3.5 w-3.5" />
              )}
            </button>
          )}
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{lead.companyName ?? lead.name}</div>
            <div className="text-muted-foreground truncate text-xs">{lead.name}</div>
          </div>
        </div>
        <span
          className={cn(
            'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
            tempCfg.style,
          )}
        >
          <TempIcon className="h-2.5 w-2.5" />
          {isAr ? tempCfg.ar : tempCfg.en}
        </span>
      </div>
      <div className="text-muted-foreground text-[11px]">{lead.serviceType}</div>
      <div className="flex items-center gap-1 text-xs font-semibold text-sky-300">
        <DollarSign className="h-3 w-3" />
        {formatM(lead.expectedValue)} {isAr ? 'د.ع' : 'IQD'}
      </div>
    </div>
  )
}

function DraggableLeadCard({
  lead,
  isAr,
  selected,
  onToggle,
}: {
  lead: EnrichedLead
  isAr: boolean
  selected: boolean
  onToggle: (e: React.MouseEvent) => void
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: lead.id })
  return (
    <div ref={setNodeRef} {...listeners} {...attributes}>
      <LeadCard
        lead={lead}
        isAr={isAr}
        dragging={isDragging}
        selected={selected}
        onToggle={onToggle}
      />
    </div>
  )
}

function Column({
  col,
  leads,
  isAr,
  isSelected,
  onToggle,
}: {
  col: (typeof COLUMNS)[number]
  leads: EnrichedLead[]
  isAr: boolean
  isSelected: (id: string) => boolean
  onToggle: (id: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.key })
  const total = leads.reduce((s, l) => s + l.expectedValue, 0)
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex min-h-[400px] flex-col rounded-xl border p-3 transition-colors duration-150',
        col.color,
        isOver && 'ring-1 ring-white/20',
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div>
          <span className="text-sm font-semibold">{isAr ? col.labelAr : col.labelEn}</span>
          <span className="text-muted-foreground ms-2 text-xs">{leads.length}</span>
        </div>
        <span className="text-muted-foreground text-[11px]">
          {formatM(total)} {isAr ? 'د.ع' : 'IQD'}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {leads.map((lead) => (
          <DraggableLeadCard
            key={lead.id}
            lead={lead}
            isAr={isAr}
            selected={isSelected(lead.id)}
            onToggle={(e) => {
              e.stopPropagation()
              onToggle(lead.id)
            }}
          />
        ))}
      </div>
    </div>
  )
}

export function LeadsClient() {
  const locale = useLocale()
  const isAr = locale === 'ar'
  const [tempFilter, setTempFilter] = useState<Temperature | 'all'>('all')
  const { toggleOne, clearAll, isSelected, count: bulkCount } = useBulkSelect()

  const { data: apiData } = useLeads()

  const [positions, setPositions] = useState<Record<string, LeadStatus>>(() => {
    const map: Record<string, LeadStatus> = {}
    STATIC_LEADS.forEach((l) => {
      map[l.id] = l.status
    })
    return map
  })
  const [activeId, setActiveId] = useState<string | null>(null)

  const rawLeads: EnrichedLead[] = apiData
    ? apiData.map((l, i) => ({
        ...l,
        temperature: (['hot', 'warm', 'cold'] as const)[i % 3] as Temperature,
        serviceType: 'خدمة',
        expectedValue: 5_000_000,
      }))
    : STATIC_LEADS

  const leads = rawLeads.map((l) => ({ ...l, status: positions[l.id] ?? l.status }))
  const filtered = tempFilter === 'all' ? leads : leads.filter((l) => l.temperature === tempFilter)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const onDragStart = useCallback((e: DragStartEvent) => {
    setActiveId(String(e.active.id))
  }, [])

  const onDragEnd = useCallback((e: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = e
    if (!over) return
    const newStatus = over.id as LeadStatus
    if (COLUMNS.some((c) => c.key === newStatus)) {
      setPositions((prev) => ({ ...prev, [active.id]: newStatus }))
    }
  }, [])

  const activeLead = activeId ? (leads.find((l) => l.id === activeId) ?? null) : null

  return (
    <div className="space-y-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">{isAr ? 'العملاء المحتملون' : 'Leads'}</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {leads.length} {isAr ? 'lead' : 'leads'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex overflow-hidden rounded-lg border border-white/[0.06]">
            {[
              { v: 'all' as const, ar: 'الكل', en: 'All' },
              { v: 'hot' as const, ar: 'ساخنة', en: 'Hot' },
              { v: 'warm' as const, ar: 'دافئة', en: 'Warm' },
            ].map((opt) => (
              <button
                key={opt.v}
                onClick={() => setTempFilter(opt.v)}
                className={cn(
                  'px-3 py-1.5 text-xs transition-colors',
                  tempFilter === opt.v
                    ? 'bg-white/[0.08] font-medium text-white'
                    : 'text-muted-foreground hover:bg-white/[0.04]',
                )}
              >
                {isAr ? opt.ar : opt.en}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 rounded-lg border border-sky-500/20 bg-sky-500/10 px-3 py-2 text-xs font-medium text-sky-400 transition-colors hover:bg-sky-500/20">
            <Plus className="h-3.5 w-3.5" />
            {isAr ? 'Lead جديد' : 'New Lead'}
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((col) => (
            <Column
              key={col.key}
              col={col}
              leads={filtered.filter((l) => l.status === col.key)}
              isAr={isAr}
              isSelected={isSelected}
              onToggle={toggleOne}
            />
          ))}
        </div>
        <DragOverlay>{activeLead && <LeadCard lead={activeLead} isAr={isAr} />}</DragOverlay>
      </DndContext>

      <BulkActionBar count={bulkCount} context="leads" onClear={clearAll} />
    </div>
  )
}
