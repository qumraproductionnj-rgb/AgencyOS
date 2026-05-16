import { setRequestLocale } from 'next-intl/server'
import { AttendanceClient } from '@/components/attendance/attendance-client'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function AttendancePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return <AttendanceClient />
}
