'use client'

import { useState, useCallback } from 'react'
import { useLocale } from 'next-intl'
import { Sparkles, CheckCircle, X, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Task {
  id: string
  title: string
  titleEn: string
  deadline: string
  priority: 'high' | 'medium' | 'low'
}

interface TeamMember {
  id: string
  nameAr: string
  nameEn: string
  role: string
  roleEn: string
  tasks: Task[]
  capacity: number
}

const INITIAL_MEMBERS: TeamMember[] = [
  {
    id: 'm1',
    nameAr: 'أحمد العبادي',
    nameEn: 'Ahmed Al-Abbadi',
    role: 'مدير إبداعي',
    roleEn: 'Creative Director',
    capacity: 92,
    tasks: [
      {
        id: 't1',
        title: 'حملة رمضان — التصميم النهائي',
        titleEn: 'Ramadan Campaign Final Design',
        deadline: '2026-05-20',
        priority: 'high',
      },
      {
        id: 't2',
        title: 'هوية الزلال — المراجعة',
        titleEn: 'Al-Zalal Identity Review',
        deadline: '2026-05-22',
        priority: 'high',
      },
      {
        id: 't3',
        title: 'موشن جرافيك الشمري',
        titleEn: 'Shammari Motion Graphics',
        deadline: '2026-05-28',
        priority: 'medium',
      },
    ],
  },
  {
    id: 'm2',
    nameAr: 'سارة جاسم',
    nameEn: 'Sara Jasim',
    role: 'مصممة جرافيك',
    roleEn: 'Graphic Designer',
    capacity: 74,
    tasks: [
      {
        id: 't4',
        title: 'منيو مطعم بغداد',
        titleEn: 'Baghdad Restaurant Menu',
        deadline: '2026-05-25',
        priority: 'medium',
      },
      {
        id: 't5',
        title: 'بنر الشمري Mall',
        titleEn: 'Shammari Mall Banner',
        deadline: '2026-05-30',
        priority: 'low',
      },
    ],
  },
  {
    id: 'm3',
    nameAr: 'محمد الحسيني',
    nameEn: 'Mohammed Al-Husseini',
    role: 'مدير مبيعات',
    roleEn: 'Sales Manager',
    capacity: 45,
    tasks: [
      {
        id: 't6',
        title: 'اجتماع العميل الجديد',
        titleEn: 'New Client Meeting',
        deadline: '2026-05-18',
        priority: 'high',
      },
    ],
  },
  {
    id: 'm4',
    nameAr: 'علي الربيعي',
    nameEn: 'Ali Al-Rubai',
    role: 'مصور فيديو',
    roleEn: 'Video Cinematographer',
    capacity: 88,
    tasks: [
      {
        id: 't7',
        title: 'تصوير فندق النعيمي',
        titleEn: 'Al-Naaimi Hotel Shoot',
        deadline: '2026-05-19',
        priority: 'high',
      },
      {
        id: 't8',
        title: 'مونتاج إعلان الشمري',
        titleEn: 'Shammari Ad Edit',
        deadline: '2026-05-24',
        priority: 'medium',
      },
      {
        id: 't9',
        title: 'فيديو الرافدين',
        titleEn: 'Rafidain Video',
        deadline: '2026-06-01',
        priority: 'low',
      },
    ],
  },
  {
    id: 'm5',
    nameAr: 'زينب الموسوي',
    nameEn: 'Zainab Al-Mosawi',
    role: 'منسقة مشاريع',
    roleEn: 'Project Coordinator',
    capacity: 58,
    tasks: [
      {
        id: 't10',
        title: 'تحديث تقارير المشاريع',
        titleEn: 'Update Project Reports',
        deadline: '2026-05-20',
        priority: 'medium',
      },
      {
        id: 't11',
        title: 'جدول التسليمات',
        titleEn: 'Deliverables Schedule',
        deadline: '2026-05-26',
        priority: 'low',
      },
    ],
  },
]

const PRIORITY_COLORS = {
  high: 'text-red-400 bg-red-400/10',
  medium: 'text-amber-400 bg-amber-400/10',
  low: 'text-sky-400 bg-sky-400/10',
}

const PRIORITY_AR = { high: 'عالية', medium: 'متوسطة', low: 'منخفضة' }
const PRIORITY_EN = { high: 'High', medium: 'Medium', low: 'Low' }

function capacityColor(pct: number) {
  if (pct > 85)
    return { bar: 'bg-red-400', text: 'text-red-400', label: 'مرهق', labelEn: 'Overloaded' }
  if (pct > 60)
    return { bar: 'bg-amber-400', text: 'text-amber-400', label: 'مشغول', labelEn: 'Busy' }
  return { bar: 'bg-emerald-400', text: 'text-emerald-400', label: 'متاح', labelEn: 'Available' }
}

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

const AVATAR_COLORS = [
  'from-sky-500 to-blue-600',
  'from-purple-500 to-violet-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-pink-500 to-rose-600',
]

export function WorkloadClient() {
  const locale = useLocale()
  const isAr = locale === 'ar'
  const [members, setMembers] = useState<TeamMember[]>(INITIAL_MEMBERS)
  const [period, setPeriod] = useState<'week' | 'month'>('week')
  const [aiDismissed, setAiDismissed] = useState(false)
  const [draggedTask, setDraggedTask] = useState<{ task: Task; fromId: string } | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const overloaded = members.filter((m) => m.capacity > 85)
  const available = members.filter((m) => m.capacity < 60)

  const applyAiSuggestion = useCallback(() => {
    if (overloaded.length === 0 || available.length === 0) return
    const from = overloaded[0]!
    const to = available[available.length - 1]!
    const tasksToMove = from.tasks.filter((t) => t.priority !== 'high').slice(0, 2)

    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === from.id) {
          return {
            ...m,
            tasks: m.tasks.filter((t) => !tasksToMove.some((tt) => tt.id === t.id)),
            capacity: Math.max(m.capacity - tasksToMove.length * 12, 40),
          }
        }
        if (m.id === to.id) {
          return {
            ...m,
            tasks: [...m.tasks, ...tasksToMove],
            capacity: Math.min(m.capacity + tasksToMove.length * 12, 95),
          }
        }
        return m
      }),
    )
    setAiDismissed(true)
    toast.success(
      isAr
        ? `تم نقل ${tasksToMove.length} مهام من ${from.nameAr} إلى ${to.nameAr}`
        : `Moved ${tasksToMove.length} tasks from ${from.nameEn} to ${to.nameEn}`,
    )
  }, [overloaded, available, isAr])

  const handleDrop = useCallback(
    (toMemberId: string) => {
      if (!draggedTask || draggedTask.fromId === toMemberId) {
        setDraggedTask(null)
        setDragOverId(null)
        return
      }
      const { task, fromId } = draggedTask
      setMembers((prev) =>
        prev.map((m) => {
          if (m.id === fromId) {
            return {
              ...m,
              tasks: m.tasks.filter((t) => t.id !== task.id),
              capacity: Math.max(m.capacity - 10, 20),
            }
          }
          if (m.id === toMemberId) {
            return {
              ...m,
              tasks: [...m.tasks, task],
              capacity: Math.min(m.capacity + 10, 100),
            }
          }
          return m
        }),
      )
      const toMember = members.find((m) => m.id === toMemberId)
      toast.success(
        isAr ? `تم نقل المهمة إلى ${toMember?.nameAr}` : `Task assigned to ${toMember?.nameEn}`,
      )
      setDraggedTask(null)
      setDragOverId(null)
    },
    [draggedTask, members, isAr],
  )

  const showAiSuggestion = !aiDismissed && overloaded.length > 0 && available.length > 0

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">
            {isAr ? 'توزيع العمل · الفريق' : 'Workload Balancer'}
          </h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {new Date().toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex gap-1 overflow-hidden rounded-lg border border-white/[0.06]">
          {(['week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'px-3 py-1.5 text-xs transition-colors',
                period === p
                  ? 'bg-white/[0.08] font-medium text-white'
                  : 'text-muted-foreground hover:bg-white/[0.04]',
              )}
            >
              {isAr
                ? p === 'week'
                  ? 'هذا الأسبوع'
                  : 'هذا الشهر'
                : p === 'week'
                  ? 'This Week'
                  : 'This Month'}
            </button>
          ))}
        </div>
      </div>

      {/* AI Suggestion */}
      {showAiSuggestion && (
        <div className="flex items-center justify-between rounded-xl border border-purple-400/20 bg-purple-400/[0.05] px-4 py-3">
          <div className="flex items-center gap-3">
            <Sparkles className="h-4 w-4 shrink-0 text-purple-400" />
            <p className="text-sm text-purple-300">
              {isAr
                ? `💡 اقتراح: انقل ${Math.min(2, overloaded[0]!.tasks.filter((t) => t.priority !== 'high').length)} مهام من ${overloaded[0]!.nameAr} إلى ${available[available.length - 1]!.nameAr}`
                : `💡 Suggestion: Move ${Math.min(2, overloaded[0]!.tasks.filter((t) => t.priority !== 'high').length)} tasks from ${overloaded[0]!.nameEn} to ${available[available.length - 1]!.nameEn}`}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={applyAiSuggestion}
              className="flex items-center gap-1.5 rounded-lg bg-purple-500/20 px-3 py-1.5 text-xs font-medium text-purple-300 transition-colors hover:bg-purple-500/30"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              {isAr ? 'تطبيق' : 'Apply'}
            </button>
            <button
              onClick={() => setAiDismissed(true)}
              className="rounded-lg p-1.5 text-white/30 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Workload Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {members.map((member, idx) => {
          const cfg = capacityColor(member.capacity)
          const color = AVATAR_COLORS[idx % AVATAR_COLORS.length]!
          const isDragOver = dragOverId === member.id

          return (
            <div
              key={member.id}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOverId(member.id)
              }}
              onDragLeave={() => setDragOverId(null)}
              onDrop={() => handleDrop(member.id)}
              className={cn(
                'rounded-xl border bg-white/[0.02] p-4 transition-all',
                isDragOver ? 'border-purple-400/40 bg-purple-400/[0.04]' : 'border-white/[0.06]',
              )}
            >
              {/* Member header */}
              <div className="mb-4 flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[11px] font-bold text-white',
                    color,
                  )}
                >
                  {initials(isAr ? member.nameAr : member.nameEn)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">
                    {isAr ? member.nameAr : member.nameEn}
                  </div>
                  <div className="text-muted-foreground truncate text-xs">
                    {isAr ? member.role : member.roleEn}
                  </div>
                </div>
                <span className={cn('shrink-0 text-xs font-semibold', cfg.text)}>
                  {isAr ? cfg.label : cfg.labelEn}
                </span>
              </div>

              {/* Capacity bar */}
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{isAr ? 'الحمل' : 'Load'}</span>
                <span className={cn('font-semibold', cfg.text)}>{member.capacity}%</span>
              </div>
              <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className={cn('h-full rounded-full transition-all', cfg.bar)}
                  style={{ width: `${member.capacity}%` }}
                />
              </div>

              {/* Tasks */}
              <div className="space-y-2">
                {member.tasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => setDraggedTask({ task, fromId: member.id })}
                    onDragEnd={() => {
                      setDraggedTask(null)
                      setDragOverId(null)
                    }}
                    className="flex cursor-grab items-center gap-2 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2 active:cursor-grabbing"
                  >
                    <div
                      className={cn(
                        'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium',
                        PRIORITY_COLORS[task.priority],
                      )}
                    >
                      {isAr ? PRIORITY_AR[task.priority] : PRIORITY_EN[task.priority]}
                    </div>
                    <span className="min-w-0 flex-1 truncate text-[11px] text-white/70">
                      {isAr ? task.title : task.titleEn}
                    </span>
                  </div>
                ))}
                {member.tasks.length > 3 && (
                  <p className="text-muted-foreground text-center text-[11px]">
                    +{member.tasks.length - 3} {isAr ? 'مهام' : 'more'}
                  </p>
                )}
              </div>

              {/* Assign button */}
              <button
                onClick={() => toast.success(isAr ? 'فتح نموذج الإسناد' : 'Opening assign form')}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/[0.06] py-2 text-xs text-white/40 transition-colors hover:border-white/[0.1] hover:text-white/70"
              >
                <UserPlus className="h-3.5 w-3.5" />
                {isAr ? 'إسناد مهمة' : 'Assign Task'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
