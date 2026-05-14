import { setRequestLocale } from 'next-intl/server'
import { FinancialReportClient } from '@/components/reports/financial-report-client'

export default async function FinancialReportPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  return <FinancialReportClient />
}
