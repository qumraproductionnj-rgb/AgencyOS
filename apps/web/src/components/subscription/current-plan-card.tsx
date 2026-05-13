'use client'

import { useTranslations } from 'next-intl'
import { CreditCard, Users, Database, Zap, Briefcase, FolderOpen } from 'lucide-react'
import { useCurrentSubscription, type Subscription } from '@/hooks/use-subscription'
import { UpgradePrompt } from './upgrade-prompt'

const STATUS_COLORS: Record<string, string> = {
  TRIAL: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950',
  ACTIVE: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950',
  PAST_DUE: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950',
  CANCELLED: 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950',
  EXPIRED: 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950',
}

function formatStorage(mb: number): string {
  if (mb >= 1048576) return `${(mb / 1048576).toFixed(1)} TB`
  if (mb >= 1024) return `${(mb / 1024).toFixed(0)} GB`
  return `${mb} MB`
}

export function CurrentPlanCard() {
  const t = useTranslations('subscription')
  const { data, isLoading } = useCurrentSubscription()

  if (isLoading) {
    return <div className="h-48 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
  }

  const response = data as {
    plan: {
      nameEn: string
      description: string | null
      maxUsers: number
      maxStorageMb: number
      maxAiGenerationsPerMonth: number
      maxClients: number
      maxProjects: number
    }
    subscription: Subscription | null
  }
  if (!response?.plan) {
    return (
      <UpgradePrompt feature="" requiredPlan="professional" current={0} max={0} type="feature" />
    )
  }

  const plan = response.plan
  const subscription = response.subscription
  const status = subscription?.status ?? 'TRIAL'

  const planFeatures = [
    {
      label: t('users'),
      value: plan.maxUsers >= 9999 ? 'Unlimited' : String(plan.maxUsers),
      icon: Users,
    },
    { label: t('storage'), value: formatStorage(plan.maxStorageMb), icon: Database },
    {
      label: t('aiGenerations'),
      value:
        plan.maxAiGenerationsPerMonth >= 99999
          ? 'Unlimited'
          : `${plan.maxAiGenerationsPerMonth}/mo`,
      icon: Zap,
    },
    {
      label: t('clients'),
      value: plan.maxClients >= 9999 ? 'Unlimited' : String(plan.maxClients),
      icon: Briefcase,
    },
    {
      label: t('projects'),
      value: plan.maxProjects >= 9999 ? 'Unlimited' : String(plan.maxProjects),
      icon: FolderOpen,
    },
  ]

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CreditCard className="h-6 w-6 text-gray-400" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {plan.nameEn}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{plan.description}</p>
          </div>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[status] ?? STATUS_COLORS['TRIAL']}`}
        >
          {t(status.toLowerCase())}
        </span>
      </div>

      {subscription?.trialEndsAt && status === 'TRIAL' && (
        <div className="mt-3 rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          {t('trialEnds')}: {new Date(subscription.trialEndsAt).toLocaleDateString()} (
          {Math.ceil((new Date(subscription.trialEndsAt).getTime() - Date.now()) / 86400000)}{' '}
          {t('daysLeft')})
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {planFeatures.map((feature) => (
          <div key={feature.label} className="rounded-md bg-gray-50 p-3 dark:bg-gray-700/50">
            <div className="flex items-center gap-1.5">
              <feature.icon className="h-4 w-4 text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">{feature.label}</span>
            </div>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
              {feature.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
