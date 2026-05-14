import { setRequestLocale } from 'next-intl/server'
import { PayrollClient } from '@/components/payroll/payroll-client'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function PayrollPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return <PayrollClient />
}
