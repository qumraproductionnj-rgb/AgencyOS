import { useTranslations } from 'next-intl'
import { CurrentPlanCard } from '@/components/subscription/current-plan-card'
import { UsageMeters } from '@/components/subscription/usage-meters'
import { PlanComparison } from '@/components/subscription/plan-comparison'
import { BillingActions } from '@/components/subscription/billing-actions'
import { InvoiceHistory } from '@/components/subscription/invoice-history'

export default function BillingSettingsPage() {
  const t = useTranslations('billing')
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('title')}</h1>
      <CurrentPlanCard />
      <UsageMeters />
      <BillingActions />
      <InvoiceHistory />
      <PlanComparison />
    </div>
  )
}
