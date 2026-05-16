import { setRequestLocale } from 'next-intl/server'
import { WorkloadClient } from '@/components/workload/workload-client'

export default async function WorkloadPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  return <WorkloadClient />
}
