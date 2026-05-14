'use client'

import { useState } from 'react'
import { Plus, LayoutGrid, List, Calendar, CheckSquare } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useProjects, type Project } from '@/hooks/use-projects'
import { useBulkSelect } from '@/hooks/use-bulk-select'
import { BulkActionBar } from '@/components/bulk-action-bar'
import { cn } from '@/lib/utils'

const STATIC_PROJECTS: Project[] = [
  {
    id: 'p1',
    clientId: 'c1',
    campaignId: null,
    name: 'حملة رمضان 2026',
    nameEn: 'Ramadan Campaign 2026',
    description: 'حملة إعلانية شاملة لمطعم بغداد',
    stage: 'IN_PROGRESS',
    budget: 12_000_000,
    currency: 'IQD',
    startDate: '2026-02-01T00:00:00Z',
    deadline: '2026-05-30T00:00:00Z',
    completedAt: null,
    createdAt: '2026-02-01T00:00:00Z',
    client: { id: 'c1', name: 'مطعم بغداد', nameEn: 'Baghdad Restaurant' },
    _count: { tasks: 8, revisions: 2 },
  },
  {
    id: 'p2',
    clientId: 'c2',
    campaignId: null,
    name: 'هوية شركة الزلال',
    nameEn: 'Al-Zalal Brand Identity',
    description: 'تصميم هوية بصرية متكاملة',
    stage: 'IN_PROGRESS',
    budget: 8_500_000,
    currency: 'IQD',
    startDate: '2026-03-01T00:00:00Z',
    deadline: '2026-06-15T00:00:00Z',
    completedAt: null,
    createdAt: '2026-03-01T00:00:00Z',
    client: { id: 'c2', name: 'شركة الزلال', nameEn: 'Al-Zalal Company' },
    _count: { tasks: 12, revisions: 1 },
  },
  {
    id: 'p3',
    clientId: 'c3',
    campaignId: null,
    name: 'تصوير فندق النعيمي',
    nameEn: 'Al-Naaimi Hotel Photography',
    description: 'تصوير المرافق والغرف',
    stage: 'REVIEW',
    budget: 5_000_000,
    currency: 'IQD',
    startDate: '2026-04-01T00:00:00Z',
    deadline: '2026-05-20T00:00:00Z',
    completedAt: null,
    createdAt: '2026-04-01T00:00:00Z',
    client: { id: 'c3', name: 'فندق النعيمي', nameEn: 'Al-Naaimi Hotel' },
    _count: { tasks: 5, revisions: 3 },
  },
  {
    id: 'p4',
    clientId: 'c4',
    campaignId: null,
    name: 'إعلان الشمري Mall',
    nameEn: 'Shammari Mall Ad Campaign',
    description: 'فيديو إعلاني للمجمع التجاري',
    stage: 'IN_PROGRESS',
    budget: 11_000_000,
    currency: 'IQD',
    startDate: '2026-04-15T00:00:00Z',
    deadline: '2026-07-01T00:00:00Z',
    completedAt: null,
    createdAt: '2026-04-15T00:00:00Z',
    client: { id: 'c4', name: 'مجمع الشمري', nameEn: 'Al-Shammari Mall' },
    _count: { tasks: 10, revisions: 0 },
  },
  {
    id: 'p5',
    clientId: 'c5',
    campaignId: null,
    name: 'حملة عيادات الرافدين',
    nameEn: 'Rafidain Clinics Campaign',
    description: 'تسويق رقمي متكامل',
    stage: 'COMPLETED',
    budget: 6_000_000,
    currency: 'IQD',
    startDate: '2025-12-01T00:00:00Z',
    deadline: '2026-03-01T00:00:00Z',
    completedAt: '2026-02-28T00:00:00Z',
    createdAt: '2025-12-01T00:00:00Z',
    client: { id: 'c5', name: 'عيادات الرافدين', nameEn: 'Rafidain Clinics' },
    _count: { tasks: 15, revisions: 1 },
  },
  {
    id: 'p6',
    clientId: 'c1',
    campaignId: null,
    name: 'منيو مطعم بغداد',
    nameEn: 'Baghdad Restaurant Menu',
    description: 'تصوير وتصميم المنيو الجديد',
    stage: 'IN_PROGRESS',
    budget: 3_500_000,
    currency: 'IQD',
    startDate: '2026-05-01T00:00:00Z',
    deadline: '2026-05-31T00:00:00Z',
    completedAt: null,
    createdAt: '2026-05-01T00:00:00Z',
    client: { id: 'c1', name: 'مطعم بغداد', nameEn: 'Baghdad Restaurant' },
    _count: { tasks: 6, revisions: 0 },
  },
]

const STAGE_CONFIG: Record<string, { ar: string; en: string; style: string; progress: number }> = {
  BRIEF: { ar: 'موجز', en: 'Brief', style: 'bg-white/[0.06] text-white/50', progress: 10 },
  PLANNING: { ar: 'تخطيط', en: 'Planning', style: 'bg-sky-400/10 text-sky-400', progress: 25 },
  IN_PROGRESS: { ar: 'نشط', en: 'Active', style: 'bg-purple-400/10 text-purple-400', progress: 60 },
  REVIEW: { ar: 'مراجعة', en: 'Review', style: 'bg-amber-400/10 text-amber-400', progress: 85 },
  COMPLETED: {
    ar: 'مكتمل',
    en: 'Completed',
    style: 'bg-emerald-400/10 text-emerald-400',
    progress: 100,
  },
  DELIVERED: {
    ar: 'مُسلَّم',
    en: 'Delivered',
    style: 'bg-emerald-400/10 text-emerald-400',
    progress: 100,
  },
  CANCELLED: { ar: 'ملغي', en: 'Cancelled', style: 'bg-red-400/10 text-red-400', progress: 0 },
}

const TEAM_COLORS = [
  'from-sky-500 to-blue-600',
  'from-purple-500 to-violet-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
]

function formatDeadline(iso: string, isAr: boolean): string {
  return new Date(iso).toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB', {
    day: 'numeric',
    month: 'short',
  })
}

function TeamAvatars({ count }: { count: number }) {
  const n = Math.min(count, 4)
  return (
    <div className="flex -space-x-1.5 rtl:space-x-reverse">
      {Array.from({ length: n }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[9px] font-bold text-white ring-2 ring-[#0d0d0d]',
            TEAM_COLORS[i % TEAM_COLORS.length],
          )}
        >
          {String.fromCharCode(65 + i)}
        </div>
      ))}
    </div>
  )
}

function ProjectGridCard({ project, isAr }: { project: Project; isAr: boolean }) {
  const stage = STAGE_CONFIG[project.stage] ?? STAGE_CONFIG['BRIEF']!
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 transition-all hover:border-white/[0.1] hover:bg-white/[0.05]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate font-semibold">
            {isAr ? project.name : (project.nameEn ?? project.name)}
          </div>
          <div className="text-muted-foreground mt-0.5 truncate text-xs">
            {isAr ? project.client.name : (project.client.nameEn ?? project.client.name)}
          </div>
        </div>
        <span
          className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium', stage.style)}
        >
          {isAr ? stage.ar : stage.en}
        </span>
      </div>

      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{isAr ? 'التقدم' : 'Progress'}</span>
        <span className="font-medium">{stage.progress}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-400 to-purple-400 transition-all"
          style={{ width: `${stage.progress}%` }}
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <TeamAvatars count={3} />
        <div className="text-muted-foreground flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1">
            <CheckSquare className="h-3 w-3" />
            {project._count?.tasks ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDeadline(project.deadline, isAr)}
          </span>
        </div>
      </div>
    </div>
  )
}

export function ProjectsClient() {
  const locale = useLocale()
  const isAr = locale === 'ar'
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const { data: apiData } = useProjects()
  const projects = apiData ?? STATIC_PROJECTS
  const {
    toggleOne,
    toggleAll,
    clearAll,
    isSelected,
    isAllSelected,
    count: bulkCount,
  } = useBulkSelect()

  return (
    <div className="space-y-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">{isAr ? 'المشاريع' : 'Projects'}</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {projects.length} {isAr ? 'مشروع' : 'projects'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex overflow-hidden rounded-lg border border-white/[0.06]">
            <button
              onClick={() => setView('grid')}
              className={cn(
                'p-2 transition-colors',
                view === 'grid'
                  ? 'bg-white/[0.08] text-white'
                  : 'text-muted-foreground hover:bg-white/[0.04]',
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn(
                'p-2 transition-colors',
                view === 'list'
                  ? 'bg-white/[0.08] text-white'
                  : 'text-muted-foreground hover:bg-white/[0.04]',
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <button className="flex items-center gap-1.5 rounded-lg border border-sky-500/20 bg-sky-500/10 px-3 py-2 text-xs font-medium text-sky-400 transition-colors hover:bg-sky-500/20">
            <Plus className="h-3.5 w-3.5" />
            {isAr ? 'مشروع جديد' : 'New Project'}
          </button>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {projects.map((p) => (
            <div
              key={p.id}
              className={cn('relative', isSelected(p.id) && 'rounded-xl ring-1 ring-purple-500/40')}
            >
              <input
                type="checkbox"
                checked={isSelected(p.id)}
                onChange={() => toggleOne(p.id)}
                className="absolute end-3 top-3 z-10 h-3.5 w-3.5 rounded accent-purple-500"
              />
              <ProjectGridCard project={p} isAr={isAr} />
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={isAllSelected(projects.map((p) => p.id))}
                    onChange={() => toggleAll(projects.map((p) => p.id))}
                    className="h-3.5 w-3.5 rounded accent-purple-500"
                  />
                </th>
                <th className="text-muted-foreground px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider">
                  {isAr ? 'المشروع' : 'Project'}
                </th>
                <th className="text-muted-foreground px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider">
                  {isAr ? 'الحالة' : 'Status'}
                </th>
                <th className="text-muted-foreground hidden px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider md:table-cell">
                  {isAr ? 'التقدم' : 'Progress'}
                </th>
                <th className="text-muted-foreground hidden px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider lg:table-cell">
                  {isAr ? 'الفريق' : 'Team'}
                </th>
                <th className="text-muted-foreground hidden px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider sm:table-cell">
                  {isAr ? 'الموعد' : 'Deadline'}
                </th>
                <th className="text-muted-foreground hidden px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider md:table-cell">
                  {isAr ? 'المهام' : 'Tasks'}
                </th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr
                  key={p.id}
                  className={cn(
                    'border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]',
                    isSelected(p.id) && 'bg-purple-500/[0.06]',
                  )}
                >
                  <td className="px-4 py-3.5">
                    <input
                      type="checkbox"
                      checked={isSelected(p.id)}
                      onChange={() => toggleOne(p.id)}
                      className="h-3.5 w-3.5 rounded accent-purple-500"
                    />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-medium">{isAr ? p.name : (p.nameEn ?? p.name)}</div>
                    <div className="text-muted-foreground text-xs">
                      {isAr ? p.client.name : (p.client.nameEn ?? p.client.name)}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    {(() => {
                      const stage = STAGE_CONFIG[p.stage] ?? STAGE_CONFIG['BRIEF']!
                      return (
                        <span
                          className={cn(
                            'rounded-full px-2.5 py-0.5 text-[11px] font-medium',
                            stage.style,
                          )}
                        >
                          {isAr ? stage.ar : stage.en}
                        </span>
                      )
                    })()}
                  </td>
                  <td className="hidden px-4 py-3.5 md:table-cell">
                    {(() => {
                      const stage = STAGE_CONFIG[p.stage] ?? STAGE_CONFIG['BRIEF']!
                      return (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 rounded-full bg-white/[0.06]">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-purple-400"
                              style={{ width: `${stage.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">{stage.progress}%</span>
                        </div>
                      )
                    })()}
                  </td>
                  <td className="hidden px-4 py-3.5 lg:table-cell">
                    <TeamAvatars count={3} />
                  </td>
                  <td className="hidden px-4 py-3.5 sm:table-cell">
                    <span className="text-muted-foreground flex items-center gap-1 text-xs">
                      <Calendar className="h-3 w-3" />
                      {formatDeadline(p.deadline, isAr)}
                    </span>
                  </td>
                  <td className="text-muted-foreground hidden px-4 py-3.5 text-xs md:table-cell">
                    {p._count?.tasks ?? 0} {isAr ? 'مهمة' : 'tasks'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <BulkActionBar count={bulkCount} context="projects" onClear={clearAll} />
    </div>
  )
}
