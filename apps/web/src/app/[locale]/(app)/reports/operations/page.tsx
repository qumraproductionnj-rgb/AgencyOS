import { setRequestLocale } from 'next-intl/server'
import { OperationsReportClient } from '@/components/reports/operations-report-client'

export default async function OperationsReportPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  return <OperationsReportClient />
}
