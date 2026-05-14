'use client'

import { useLocale } from 'next-intl'
import { Users, Wifi, WifiOff } from 'lucide-react'
import { usePresence } from '@/hooks/use-presence'
import { useActivityFeed } from '@/hooks/use-activity-feed'
import { ActivityFeed } from './activity-feed'
import { cn } from '@/lib/utils'

const DEMO_USERS = [
  { id: 'u1', name: 'أحمد العبادي', nameEn: 'Ahmed Al-Abbadi', dept: 'الإنتاج' },
  { id: 'u2', name: 'سارة جاسم', nameEn: 'Sara Jasim', dept: 'التصميم' },
  { id: 'u3', name: 'محمد الحسيني', nameEn: 'Mohammed Al-Husseini', dept: 'المبيعات' },
  { id: 'u4', name: 'نور الخفاجي', nameEn: 'Noor Al-Khafaji', dept: 'المالية' },
  { id: 'u5', name: 'علي الربيعي', nameEn: 'Ali Al-Rubai', dept: 'الإنتاج' },
]

const AVATAR_COLORS = [
  'from-sky-500 to-blue-600',
  'from-purple-500 to-violet-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-pink-500 to-rose-600',
]

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0] ?? '')
    .join('')
    .toUpperCase()
}

export function TeamPresenceClient() {
  const locale = useLocale()
  const isAr = locale === 'ar'

  const { onlineUsers, connected } = usePresence({
    userId: 'current-user',
    companyId: 'co1',
    name: 'أنت',
  })

  const { activities } = useActivityFeed('co1')

  const onlineList = Array.from(onlineUsers.values())

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{isAr ? 'الفريق' : 'Team'}</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {isAr ? `${onlineList.length} متصل الآن` : `${onlineList.length} online now`}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          {connected ? (
            <>
              <Wifi className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">{isAr ? 'متصل' : 'Connected'}</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-amber-400">{isAr ? 'غير متصل' : 'Offline'}</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Team list */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <div className="border-b border-white/[0.06] px-4 py-3">
            <h2 className="text-sm font-semibold">{isAr ? 'أعضاء الفريق' : 'Team Members'}</h2>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {DEMO_USERS.map((user, i) => {
              const online = onlineList.find((u) => u.userId === user.id)
              const color = AVATAR_COLORS[i % AVATAR_COLORS.length]!
              return (
                <div key={user.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="relative">
                    <div
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[11px] font-bold text-white',
                        color,
                      )}
                    >
                      {initials(isAr ? user.name : user.nameEn)}
                    </div>
                    <span
                      className={cn(
                        'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-[#0d0d0d]',
                        online
                          ? online.status === 'away'
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                          : 'bg-white/20',
                      )}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{isAr ? user.name : user.nameEn}</div>
                    <div className="text-muted-foreground text-xs">{user.dept}</div>
                  </div>
                  {online && (
                    <div className="text-right">
                      <span className="text-[11px] text-white/40">
                        {online.page.split('/').pop() ?? 'dashboard'}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Activity feed */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
            <h2 className="text-sm font-semibold">{isAr ? 'النشاط الأخير' : 'Recent Activity'}</h2>
            <Users className="text-muted-foreground h-3.5 w-3.5" />
          </div>
          <ActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  )
}
