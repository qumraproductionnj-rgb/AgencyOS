import { setRequestLocale } from 'next-intl/server'
import { EmployeesClient } from '@/components/employees/employees-client'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function EmployeesPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return <EmployeesClient />
}
