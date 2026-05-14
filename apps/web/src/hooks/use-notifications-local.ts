import { useState, useCallback } from 'react'

export type NotifType = 'urgent' | 'important' | 'info'

export interface Notification {
  id: string
  type: NotifType
  titleAr: string
  titleEn: string
  bodyAr: string
  bodyEn: string
  time: number
  read: boolean
  href?: string
}

const INITIAL: Notification[] = [
  {
    id: 'n1',
    type: 'urgent',
    titleAr: 'فاتورة متأخرة',
    titleEn: 'Overdue Invoice',
    bodyAr: 'فندق النعيمي — INV-2026-141 متأخر 14 يوم',
    bodyEn: 'Al-Naaimi Hotel — INV-2026-141 is 14 days overdue',
    time: Date.now() - 5 * 60_000,
    read: false,
    href: '/invoices',
  },
  {
    id: 'n2',
    type: 'urgent',
    titleAr: 'AI قارب الانتهاء',
    titleEn: 'AI Limit Warning',
    bodyAr: '428/1000 توليد مستخدم — 57% متبقي',
    bodyEn: '428/1000 generations used — 57% remaining',
    time: Date.now() - 12 * 60_000,
    read: false,
    href: '/billing',
  },
  {
    id: 'n3',
    type: 'important',
    titleAr: 'طلب موافقة جديد',
    titleEn: 'New Approval Request',
    bodyAr: 'شركة الزلال — طلبت مراجعة ملف التصميم',
    bodyEn: 'Al-Zalal Company requested design file review',
    time: Date.now() - 30 * 60_000,
    read: false,
    href: '/portal',
  },
  {
    id: 'n4',
    type: 'important',
    titleAr: 'فاتورة مدفوعة ✓',
    titleEn: 'Invoice Paid ✓',
    bodyAr: 'مطعم بغداد دفع INV-2026-145 (8.5M)',
    bodyEn: 'Baghdad Restaurant paid INV-2026-145 (8.5M)',
    time: Date.now() - 2 * 3600_000,
    read: false,
    href: '/invoices',
  },
  {
    id: 'n5',
    type: 'important',
    titleAr: 'mention@',
    titleEn: '@mention',
    bodyAr: 'سارة محمد ذكرتك في مشروع الزلال',
    bodyEn: 'Sara Mohammed mentioned you in Al-Zalal project',
    time: Date.now() - 4 * 3600_000,
    read: true,
    href: '/projects',
  },
  {
    id: 'n6',
    type: 'info',
    titleAr: 'مشروع مكتمل',
    titleEn: 'Project Completed',
    bodyAr: 'حملة عيادات الرافدين اكتملت بنجاح',
    bodyEn: 'Rafidain Clinics Campaign completed successfully',
    time: Date.now() - 6 * 3600_000,
    read: true,
    href: '/projects',
  },
  {
    id: 'n7',
    type: 'info',
    titleAr: 'تسجيل حضور',
    titleEn: 'Attendance Logged',
    bodyAr: 'علي حسن سجّل حضوره — 08:45 ص',
    bodyEn: 'Ali Hassan clocked in — 08:45 AM',
    time: Date.now() - 8 * 3600_000,
    read: true,
    href: '/attendance',
  },
]

export function useNotificationsLocal() {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  return { notifications, unreadCount, markAsRead, markAllAsRead }
}
