'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { CheckCircle, Circle, X, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'agencyos:onboarding:checklist'

interface Step {
  id: string
  titleAr: string
  titleEn: string
  href: string
}

const STEPS: Step[] = [
  { id: 'employee', titleAr: 'أضف أول موظف', titleEn: 'Add first employee', href: '/employees' },
  { id: 'client', titleAr: 'أضف أول عميل', titleEn: 'Add first client', href: '/clients' },
  { id: 'project', titleAr: 'أنشئ أول مشروع', titleEn: 'Create first project', href: '/projects' },
  { id: 'ai', titleAr: 'جرّب Content Studio', titleEn: 'Try Content Studio', href: '/ai-tools' },
  {
    id: 'telegram',
    titleAr: 'فعّل إشعارات Telegram',
    titleEn: 'Enable Telegram alerts',
    href: '/settings/notifications',
  },
]

function loadDone(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set()
  } catch {
    return new Set()
  }
}

function saveDone(done: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(done)))
  } catch {
    // quota
  }
}

export function ChecklistWidget() {
  const locale = useLocale()
  const isAr = locale === 'ar'
  const [done, setDone] = useState<Set<string>>(new Set())
  const [collapsed, setCollapsed] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setDone(loadDone())
    const dis = localStorage.getItem('agencyos:onboarding:dismissed')
    if (dis === '1') setDismissed(true)
  }, [])

  const toggle = (id: string) => {
    setDone((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      saveDone(next)
      return next
    })
  }

  const dismiss = () => {
    localStorage.setItem('agencyos:onboarding:dismissed', '1')
    setDismissed(true)
  }

  const progress = done.size
  const total = STEPS.length
  const pct = Math.round((progress / total) * 100)

  if (dismissed || progress === total) return null

  return (
    <div className="overflow-hidden rounded-xl border border-sky-400/20 bg-sky-400/[0.04]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-sky-300">
            {isAr ? '🎯 ابدأ مع Vision OS' : '🎯 Get Started'}
          </span>
          <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-medium text-sky-400">
            {progress}/{total}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="rounded-md p-1 text-white/30 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            {collapsed ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronUp className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            onClick={dismiss}
            className="rounded-md p-1 text-white/30 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mx-4 mb-1 h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-sky-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Steps */}
      {!collapsed && (
        <div className="space-y-1 px-4 pb-4 pt-2">
          {STEPS.map((step) => {
            const isDone = done.has(step.id)
            return (
              <div key={step.id} className="flex items-center gap-3">
                <button
                  onClick={() => toggle(step.id)}
                  className="shrink-0 transition-colors"
                  aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
                >
                  {isDone ? (
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Circle className="h-4 w-4 text-white/20" />
                  )}
                </button>
                <Link
                  href={step.href}
                  className={cn(
                    'flex-1 text-sm transition-colors hover:text-white',
                    isDone ? 'text-white/30 line-through' : 'text-white/70',
                  )}
                >
                  {isAr ? step.titleAr : step.titleEn}
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
