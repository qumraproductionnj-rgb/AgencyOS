'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import {
  useUnreadCount,
  useMarkAllRead,
  useNotifications,
  useMarkRead,
  useDeleteNotification,
} from '@/hooks/use-notifications'

export function NotificationBell() {
  const t = useTranslations('notifications')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { data: unreadData } = useUnreadCount()
  const { data: notifData } = useNotifications({ limit: 10 })
  const markAllRead = useMarkAllRead()
  const markRead = useMarkRead()
  const deleteNotif = useDeleteNotification()

  const unreadCount = unreadData?.count ?? 0

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleMarkRead = (id: string) => {
    markRead.mutate([id])
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-md border bg-white shadow-lg">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-semibold">{t('title')}</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                {t('markAllRead')}
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {!notifData?.items || notifData.items.length === 0 ? (
              <p className="p-6 text-center text-sm text-gray-400">{t('empty')}</p>
            ) : (
              notifData.items.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 border-b px-4 py-3 text-sm transition-colors hover:bg-gray-50 ${!notif.isRead ? 'bg-blue-50' : ''}`}
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className={`font-medium ${!notif.isRead ? 'text-blue-900' : 'text-gray-900'}`}
                    >
                      {notif.title}
                    </p>
                    {notif.body && <p className="mt-0.5 text-xs text-gray-500">{notif.body}</p>}
                    <p className="mt-1 text-[10px] text-gray-400">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    {!notif.isRead && (
                      <button
                        onClick={() => handleMarkRead(notif.id)}
                        className="rounded px-1.5 py-0.5 text-[10px] text-blue-600 hover:bg-blue-100"
                      >
                        {t('markRead')}
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotif.mutate(notif.id)}
                      className="rounded px-1.5 py-0.5 text-[10px] text-red-500 hover:bg-red-100"
                    >
                      {t('delete')}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
