import { setRequestLocale } from 'next-intl/server'
import { HrReportClient } from '@/components/reports/hr-report-client'

export default async function HrReportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  return <HrReportClient />
}
