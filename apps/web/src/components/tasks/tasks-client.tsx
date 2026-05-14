'use client'

import { useState, useCallback } from 'react'
import { Plus, AlertTriangle, ArrowUp, Minus, Clock } from 'lucide-react'
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
import { useDroppable, useDraggable } from '@dnd-kit/core'
import { useLocale } from 'next-intl'
import { useTasks, type Task } from '@/hooks/use-tasks'
import { cn } from '@/lib/utils'

type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE'

const STATIC_TASKS: Task[] = [
  {
    id: 't1',
    projectId: 'p1',
    parentTaskId: null,
    title: 'كتابة السكريبت الإعلاني',
    description: null,
    status: 'TODO',
    priority: 'URGENT',
    assignedTo: null,
    startDate: null,
    dueDate: '2026-05-20',
    completedAt: null,
    estimatedHours: 4,
    sortOrder: 1,
    createdAt: '2026-05-01T00:00:00Z',
    project: { id: 'p1', name: 'حملة رمضان 2026' },
    assignee: { id: 'u1', email: 'ahmed@ruyavision.iq' },
  },
  {
    id: 't2',
    projectId: 'p2',
    parentTaskId: null,
    title: 'تصميم الشعار الأولي',
    description: null,
    status: 'TODO',
    priority: 'HIGH',
    assignedTo: null,
    startDate: null,
    dueDate: '2026-05-22',
    completedAt: null,
    estimatedHours: 8,
    sortOrder: 2,
    createdAt: '2026-05-01T00:00:00Z',
    project: { id: 'p2', name: 'هوية شركة الزلال' },
    assignee: { id: 'u2', email: 'sara@ruyavision.iq' },
  },
  {
    id: 't3',
    projectId: 'p4',
    parentTaskId: null,
    title: 'تحضير معدات التصوير',
    description: null,
    status: 'TODO',
    priority: 'MEDIUM',
    assignedTo: null,
    startDate: null,
    dueDate: '2026-05-25',
    completedAt: null,
    estimatedHours: 2,
    sortOrder: 3,
    createdAt: '2026-05-01T00:00:00Z',
    project: { id: 'p4', name: 'إعلان الشمري Mall' },
    assignee: { id: 'u5', email: 'ali@ruyavision.iq' },
  },
  {
    id: 't4',
    projectId: 'p6',
    parentTaskId: null,
    title: 'تصوير الأطباق',
    description: null,
    status: 'TODO',
    priority: 'HIGH',
    assignedTo: null,
    startDate: null,
    dueDate: '2026-05-18',
    completedAt: null,
    estimatedHours: 6,
    sortOrder: 4,
    createdAt: '2026-05-01T00:00:00Z',
    project: { id: 'p6', name: 'منيو مطعم بغداد' },
    assignee: { id: 'u5', email: 'ali@ruyavision.iq' },
  },
  {
    id: 't5',
    projectId: 'p1',
    parentTaskId: null,
    title: 'اختيار المواقع التصويرية',
    description: null,
    status: 'TODO',
    priority: 'MEDIUM',
    assignedTo: null,
    startDate: null,
    dueDate: '2026-05-28',
    completedAt: null,
    estimatedHours: 3,
    sortOrder: 5,
    createdAt: '2026-05-01T00:00:00Z',
    project: { id: 'p1', name: 'حملة رمضان 2026' },
    assignee: { id: 'u6', email: 'zainab@ruyavision.iq' },
  },
  {
    id: 't6',
    projectId: 'p2',
    parentTaskId: null,
    title: 'بحث المنافسين',
    description: null,
    status: 'TODO',
    priority: 'LOW',
    assignedTo: null,
    startDate: null,
    dueDate: '2026-05-30',
    completedAt: null,
    estimatedHours: 4,
    sortOrder: 6,
    createdAt: '2026-05-01T00:00:00Z',
    project: { id: 'p2', name: 'هوية شركة الزلال' },
    assignee: { id: 'u3', email: 'mohammed@ruyavision.iq' },
  },
  {
    id: 't7',
    projectId: 'p4',
    parentTaskId: null,
    title: 'تنسيق جلسة التصوير',
    description: null,
    status: 'TODO',
    priority: 'URGENT',
    assignedTo: null,
    startDate: null,
    dueDate: '2026-05-16',
    completedAt: null,
    estimatedHours: 2,
    sortOrder: 7,
    createdAt: '2026-05-01T00:00:00Z',
    project: { id: 'p4', name: 'إعلان الشمري Mall' },
    assignee: { id: 'u6', email: 'zainab@ruyavision.iq' },
  },
  {
    id: 't8',
    projectId: 'p1',
    parentTaskId: null,
    title: 'إعداد خطة المحتوى',
    description: null,
    status: 'TODO',
    priority: 'HIGH',
    assignedTo: null,
    startDate: null,
    dueDate: '2026-05-19',
    completedAt: null,
    estimatedHours: 5,
    sortOrder: 8,
    createdAt: '2026-05-01T00:00:00Z',
    project: { id: 'p1', name: 'حملة رمضان 2026' },
    assignee: { id: 'u1', email: 'ahmed@ruyavision.iq' },
  },
  {
    id: 't9',
    projectId: 'p1',
    parentTaskId: null,
    title: 'تصوير الفيديو الرئيسي',
    description: null,
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    assignedTo: null,
    startDate: '2026-05-10',
    dueDate: '2026-05-17',
    completedAt: null,
    estimatedHours: 16,
    sortOrder: 1,
    createdAt: '2026-05-01T00:00:00Z',
    project: { id: 'p1', name: 'حملة رمضان 2026' },
    assignee: { id: 'u5', email: 'ali@ruyavision.iq' },
  },
  {
    id: 't10',
    projectId: 'p2',
    parentTaskId: null,
    title: 'تصميم نظام الألوان',
    description: null,
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    assignedTo: null,
    startDate: '2026-05-08',
    dueDate: '2026-05-18',
    completedAt: null,
    estimatedHours: 10,
    sortOrder: 2,
    createdAt: '2026-05-01T00:00:00Z',
    project: { id: 'p2', name: 'هوية شركة الزلال' },
    assignee: { id: 'u2', email: 'sara@ruyavision.iq' },
  },
  {
    id: 't11',
    projectId: 'p4',
    parentTaskId: null,
    title: 'إعداد الخلفيات والديكور',
    description: null,
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    assignedTo: null,
    startDate: '2026-05-12',
    dueDate: '2026-05-20',
    completedAt: null,
    estimatedHours: 8,
    sortOrder: 3,
    createdAt: '2026-05-01T00:00:00Z',
    project: { id: 'p4', name: 'إعلان الشمري Mall' },
    assignee: { id: 'u2', email: 'sara@ruyavision.iq' },
  },
  {
    id: 't12',
    projectId: 'p6',
    parentTaskId: null,
    title: 'تصميم تخطيط المنيو',
    description: null,
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    assignedTo: null,
    startDate: '2026-05-11',
    dueDate: '2026-05-22',
    completedAt: null,
    estimatedHours: 12,
    sortOrder: 4,
    createdAt: '2026-05-01T00:00:00Z',
    project: { id: 'p6', name: 'منيو مطعم بغداد' },
    assignee: { id: 'u2', email: 'sara@ruyavision.iq' },
  },
  {
    id: 't13',
    projectId: 'p2',
    parentTaskId: null,
    title: 'اختيار الخطوط',
    description: null,
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    assignedTo: null,
    startDate: '2026-05-09',
    dueDate: '2026-05-21',
    completedAt: null,
    estimatedHours: 6,
    sortOrder: 5,
    createdAt: '2026-05-01T00:00:00Z',
    project: { id: 'p2', name: 'هوية شركة الزلال' },
    assignee: { id: 'u2', email: 'sara@ruyavision.iq' },
  },
  {
    id: 't14',
    projectId: 'p1',
    parentTaskId: null,
    title: 'موشن جرافيك المقدمة',
    description: null,
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    assignedTo: null,
    startDate: '2026-05-13',
    dueDate: '2026-05-23',
    completedAt: null,
    estimatedHours: 20,
    sortOrder: 6,
    createdAt: '2026-05-01T00:00:00Z',
    project: { id: 'p1', name: 'حملة رمضان 2026' },
    assignee: { id: 'u7', email: 'hassan@ruyavision.iq' },
  },
  {
    id: 't15',
    projectId: 'p4',
    parentTaskId: null,
    title: 'تصوير المنتجات المميزة',
    description: null,
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    assignedTo: null,
    startDate: '2026-05-14',
    dueDate: '2026-05-15',
    completedAt: null,
    estimatedHours: 8,
    sortOrder: 7,
    createdAt: '2026-05-01T00:00:00Z',
    project: { id: 'p4', name: 'إعلان الشمري Mall' },
    assignee: { id: 'u5', email: 'ali@ruyavision.iq' },
  },
  {
    id: 't16',
    projectId: 'p3',
    parentTaskId: null,
    title: 'مراجعة صور الغرف',
    description: null,
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    assignedTo: null,
    startDate: '2026-05-10',
    dueDate: '2026-05-18',
    completedAt: null,
    estimatedHours: 6,
    sortOrder: 8,
    createdAt: '2026-05-01T00:00:00Z',
    project: { id: 'p3', name: 'تصوير فندق النعيمي' },
    assignee: { id: 'u5', email: 'ali@ruyavision.iq' },
  },
  {
    id: 't17',
    projectId: 'p2',
    parentTaskId: null,
    title: 'مراجعة العميل — الشعار',
    description: null,
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    assignedTo: null,
    startDate: '2026-05-11',
    dueDate: '2026-05-20',
    completedAt: null,
    estimatedHours: 2,
    sortOrder: 9,
    createdAt: '2026-05-01T00:00:00Z',
    project: { id: 'p2', name: 'هوية شركة الزلال' },
    assignee: { id: 'u1', email: 'ahmed@ruyavision.iq' },
  },
  {
    id: 't18',
    projectId: 'p6',
    parentTaskId: null,
    title: 'المراجعة الأولى للمنيو',
    description: null,
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    assignedTo: null,
    startDate: '2026-05-12',
    dueDate: '2026-05-19',
    completedAt: null,
    estimatedHours: 3,
    sortOrder: 10,
    createdAt: '2026-05-01T00:00:00Z',
    project: { id: 'p6', name: 'منيو مطعم بغداد' },
    assignee: { id: 'u1', email: 'ahmed@ruyavision.iq' },
  },
  {
    id: 't19',
    projectId: 'p4',
    parentTaskId: null,
    title: 'تركيب المؤثرات الصوتية',
    description: null,
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    assignedTo: null,
    startDate: '2026-05-13',
    dueDate: '2026-05-24',
    completedAt: null,
    estimatedHours: 5,
    sortOrder: 11,
    createdAt: '2026-05-01T00:00:00Z',
    project: { id: 'p4', name: 'إعلان الشمري Mall' },
    assignee: { id: 'u7', email: 'hassan@ruyavision.iq' },
  },
  {
    id: 't20',
    projectId: 'p1',
    parentTaskId: null,
    title: 'إنتاج الريلز',
    description: null,
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    assignedTo: null,
    startDate: '2026-05-14',
    dueDate: '2026-05-21',
    completedAt: null,
    estimatedHours: 10,
    sortOrder: 12,
    createdAt: '2026-05-01T00:00:00Z',
    project: { id: 'p1', name: 'حملة رمضان 2026' },
    assignee: { id: 'u5', email: 'ali@ruyavision.iq' },
  },
  {
    id: 't21',
    projectId: 'p3',
    parentTaskId: null,
    title: 'انتظار موافقة الفندق',
    description: null,
    status: 'IN_REVIEW',
    priority: 'HIGH',
    assignedTo: null,
    startDate: null,
    dueDate: '2026-05-18',
    completedAt: null,
    estimatedHours: null,
    sortOrder: 1,
    createdAt: '2026-05-01T00:00:00Z',
    project: { id: 'p3', name: 'تصوير فندق النعيمي' },
    assignee: { id: 'u1', email: 'ahmed@ruyavision.iq' },
  },
  {
    id: 't22',
    projectId: 'p2',
    parentTaskId: null,
    title: 'مراجعة ثانية للألوان',
    description: null,
    status: 'IN_REVIEW',
    priority: 'MEDIUM',
    assignedTo: null,
    startDate: null,
    dueDate: '2026-05-20',
    completedAt: null,
    estimatedHours: null,
    sortOrder: 2,
    createdAt: '2026-05-01T00:00:00Z',
    project: { id: 'p2', name: 'هوية شركة الزلال' },
    assignee: { id: 'u2', email: 'sara@ruyavision.iq' },
  },
  {
    id: 't23',
    projectId: 'p1',
    parentTaskId: null,
    title: 'موافقة العميل على المونتاج',
    description: null,
    status: 'IN_REVIEW',
    priority: 'URGENT',
    assignedTo: null,
    startDate: null,
    dueDate: '2026-05-16',
    completedAt: null,
    estimatedHours: null,
    sortOrder: 3,
    createdAt: '2026-05-01T00:00:00Z',
    project: { id: 'p1', name: 'حملة رمضان 2026' },
    assignee: { id: 'u1', email: 'ahmed@ruyavision.iq' },
  },
  {
    id: 't24',
    projectId: 'p6',
    parentTaskId: null,
    title: 'مراجعة الطباعة النهائية',
    description: null,
    status: 'IN_REVIEW',
    priority: 'HIGH',
    assignedTo: null,
    startDate: null,
    dueDate: '2026-05-19',
    completedAt: null,
    estimatedHours: null,
    sortOrder: 4,
    createdAt: '2026-05-01T00:00:00Z',
    project: { id: 'p6', name: 'منيو مطعم بغداد' },
    assignee: { id: 'u2', email: 'sara@ruyavision.iq' },
  },
  {
    id: 't25',
    projectId: 'p4',
    parentTaskId: null,
    title: 'مراجعة المقطع الإعلاني',
    description: null,
    status: 'IN_REVIEW',
    priority: 'HIGH',
    assignedTo: null,
    startDate: null,
    dueDate: '2026-05-17',
    completedAt: null,
    estimatedHours: null,
    sortOrder: 5,
    createdAt: '2026-05-01T00:00:00Z',
    project: { id: 'p4', name: 'إعلان الشمري Mall' },
    assignee: { id: 'u1', email: 'ahmed@ruyavision.iq' },
  },
  ...Array.from({ length: 24 }, (_, i) => ({
    id: `td${i + 1}`,
    projectId: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'][i % 6] ?? 'p1',
    parentTaskId: null,
    title:
      [
        'تصميم البوستر الأول',
        'تعديل الفيديو',
        'إرسال الملفات للعميل',
        'طباعة المواد الترويجية',
        'نشر المحتوى على السوشيال',
        'اجتماع تقرير الشهري',
        'تسليم مشروع الزلال',
        'أرشفة ملفات التصوير',
        'تحديث موقع العميل',
        'إعداد تقرير الأداء',
        'تجهيز عرض تقديمي',
        'متابعة الفواتير المعلقة',
        'تدريب الفريق الجديد',
        'تحديث قاعدة البيانات',
        'مراجعة عقود المشاريع',
        'إرسال تقارير رمضان',
        'تحضير ملف العروض',
        'تصوير حفل التخرج',
        'إنتاج إعلان العيد',
        'تسليم هوية الزلال',
        'نشر حملة رمضان',
        'أرشفة مشروع الرافدين',
        'تقرير الربع الأول',
        'تجديد اشتراك المعدات',
      ][i] ?? `مهمة مكتملة ${i + 1}`,
    description: null,
    status: 'DONE' as const,
    priority: (['LOW', 'MEDIUM', 'HIGH'] as const)[i % 3] ?? 'MEDIUM',
    assignedTo: null,
    startDate: null,
    dueDate: null,
    completedAt: '2026-04-30T00:00:00Z',
    estimatedHours: null,
    sortOrder: i + 1,
    createdAt: '2026-04-01T00:00:00Z',
    project: {
      id: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'][i % 6] ?? 'p1',
      name:
        ['حملة رمضان', 'هوية الزلال', 'فندق النعيمي', 'الشمري Mall', 'الرافدين', 'منيو بغداد'][
          i % 6
        ] ?? 'مشروع',
    },
    assignee: null,
  })),
]

const COLUMNS: {
  key: TaskStatus
  labelAr: string
  labelEn: string
  color: string
  dotColor: string
}[] = [
  {
    key: 'TODO',
    labelAr: 'للإنجاز',
    labelEn: 'To Do',
    color: 'border-white/[0.08] bg-white/[0.02]',
    dotColor: 'bg-white/40',
  },
  {
    key: 'IN_PROGRESS',
    labelAr: 'قيد التنفيذ',
    labelEn: 'In Progress',
    color: 'border-sky-400/20 bg-sky-400/[0.02]',
    dotColor: 'bg-sky-400',
  },
  {
    key: 'IN_REVIEW',
    labelAr: 'مراجعة',
    labelEn: 'In Review',
    color: 'border-amber-400/20 bg-amber-400/[0.02]',
    dotColor: 'bg-amber-400',
  },
  {
    key: 'DONE',
    labelAr: 'مكتمل',
    labelEn: 'Done',
    color: 'border-emerald-400/20 bg-emerald-400/[0.02]',
    dotColor: 'bg-emerald-400',
  },
]

const PRIORITY_CONFIG = {
  URGENT: { icon: AlertTriangle, style: 'text-red-400', ar: 'عاجل', en: 'Urgent' },
  HIGH: { icon: ArrowUp, style: 'text-amber-400', ar: 'مهم', en: 'High' },
  MEDIUM: { icon: Minus, style: 'text-sky-400', ar: 'عادي', en: 'Medium' },
  LOW: { icon: Minus, style: 'text-white/30', ar: 'منخفض', en: 'Low' },
} as const

const AVATAR_COLORS = [
  'from-sky-500 to-blue-600',
  'from-purple-500 to-violet-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-pink-500 to-rose-600',
]

function getEmailInitial(email: string): string {
  return email[0]?.toUpperCase() ?? '?'
}

const IN_PROGRESS_PROGRESS: Record<string, number> = {
  t9: 65,
  t10: 40,
  t11: 55,
  t12: 70,
  t13: 80,
  t14: 30,
  t15: 90,
  t16: 60,
  t17: 50,
  t18: 75,
  t19: 45,
  t20: 35,
}

function TaskCard({ task, isAr, dragging }: { task: Task; isAr: boolean; dragging?: boolean }) {
  const pri =
    PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.MEDIUM
  const PriIcon = pri.icon
  const isDone = task.status === 'DONE'
  const isReview = task.status === 'IN_REVIEW'
  const isInProgress = task.status === 'IN_PROGRESS'
  const progress = isInProgress ? (IN_PROGRESS_PROGRESS[task.id] ?? 50) : undefined
  const assigneeColor = task.assignee
    ? AVATAR_COLORS[(task.assignee.email.charCodeAt(0) ?? 0) % AVATAR_COLORS.length]
    : null

  return (
    <div
      className={cn(
        'select-none space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3.5',
        !isDone && 'cursor-grab active:cursor-grabbing',
        isDone && 'opacity-60',
        dragging && 'scale-95 opacity-50',
        'transition-all duration-150',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className={cn('text-sm font-medium leading-snug', isDone && 'text-white/40 line-through')}
        >
          {task.title}
        </p>
        <PriIcon className={cn('mt-0.5 h-3.5 w-3.5 shrink-0', pri.style)} />
      </div>

      {task.project && (
        <p className="text-muted-foreground truncate text-[11px]">{task.project.name}</p>
      )}

      {isReview && (
        <span className="inline-block rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-medium text-amber-400">
          {isAr ? 'بانتظار العميل' : 'Awaiting client'}
        </span>
      )}

      {isInProgress && progress !== undefined && (
        <div>
          <div className="h-1 rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-purple-400"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-muted-foreground mt-1 text-[10px]">{progress}%</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-0.5">
        {assigneeColor && task.assignee ? (
          <div
            className={cn(
              'flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br text-[9px] font-bold text-white',
              assigneeColor,
            )}
          >
            {getEmailInitial(task.assignee.email)}
          </div>
        ) : (
          <div />
        )}
        {task.dueDate && !isDone && (
          <span className="flex items-center gap-1 text-[10px] text-white/30">
            <Clock className="h-2.5 w-2.5" />
            {new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </span>
        )}
      </div>
    </div>
  )
}

function DraggableTaskCard({ task, isAr }: { task: Task; isAr: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id })
  if (task.status === 'DONE') {
    return <TaskCard task={task} isAr={isAr} />
  }
  return (
    <div ref={setNodeRef} {...listeners} {...attributes}>
      <TaskCard task={task} isAr={isAr} dragging={isDragging} />
    </div>
  )
}

function Column({
  col,
  tasks,
  isAr,
}: {
  col: (typeof COLUMNS)[number]
  tasks: Task[]
  isAr: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.key })
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex min-h-[500px] flex-col rounded-xl border p-3 transition-colors duration-150',
        col.color,
        isOver && 'ring-1 ring-white/20',
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className={cn('h-2 w-2 rounded-full', col.dotColor)} />
        <span className="text-sm font-semibold">{isAr ? col.labelAr : col.labelEn}</span>
        <span className="text-muted-foreground ms-auto text-xs">{tasks.length}</span>
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto">
        {tasks.map((task) => (
          <DraggableTaskCard key={task.id} task={task} isAr={isAr} />
        ))}
      </div>
    </div>
  )
}

export function TasksClient() {
  const locale = useLocale()
  const isAr = locale === 'ar'

  const { data: apiData } = useTasks()
  const [positions, setPositions] = useState<Record<string, TaskStatus>>(() => {
    const m: Record<string, TaskStatus> = {}
    STATIC_TASKS.forEach((t) => {
      m[t.id] = t.status as TaskStatus
    })
    return m
  })
  const [activeId, setActiveId] = useState<string | null>(null)

  const rawTasks = apiData ?? STATIC_TASKS
  const tasks = rawTasks.map((t) => ({
    ...t,
    status: (positions[t.id] ?? t.status) as Task['status'],
  }))

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const onDragStart = useCallback((e: DragStartEvent) => setActiveId(String(e.active.id)), [])

  const onDragEnd = useCallback((e: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = e
    if (!over) return
    const newStatus = over.id as TaskStatus
    if (COLUMNS.some((c) => c.key === newStatus)) {
      setPositions((prev) => ({ ...prev, [active.id]: newStatus }))
    }
  }, [])

  const activeTask = activeId ? (tasks.find((t) => t.id === activeId) ?? null) : null

  const totalDone = tasks.filter((t) => t.status === 'DONE').length
  const totalUrgent = tasks.filter((t) => t.priority === 'URGENT' && t.status !== 'DONE').length

  return (
    <div className="space-y-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">{isAr ? 'المهام' : 'Tasks'}</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {totalDone} {isAr ? 'مكتمل' : 'done'} ·{' '}
            {totalUrgent > 0 && (
              <span className="text-red-400">
                {totalUrgent} {isAr ? 'عاجل' : 'urgent'}
              </span>
            )}
          </p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg border border-sky-500/20 bg-sky-500/10 px-3 py-2 text-xs font-medium text-sky-400 transition-colors hover:bg-sky-500/20">
          <Plus className="h-3.5 w-3.5" />
          {isAr ? 'مهمة جديدة' : 'New Task'}
        </button>
      </div>

      <div className="text-muted-foreground flex flex-wrap gap-3 text-[11px]">
        {COLUMNS.map((col) => {
          const count = tasks.filter((t) => t.status === col.key).length
          return (
            <span key={col.key} className="flex items-center gap-1.5">
              <span className={cn('h-1.5 w-1.5 rounded-full', col.dotColor)} />
              {isAr ? col.labelAr : col.labelEn}: <strong className="text-white/60">{count}</strong>
            </span>
          )
        })}
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
              tasks={tasks.filter((t) => t.status === col.key)}
              isAr={isAr}
            />
          ))}
        </div>
        <DragOverlay>{activeTask && <TaskCard task={activeTask} isAr={isAr} />}</DragOverlay>
      </DndContext>
    </div>
  )
}
