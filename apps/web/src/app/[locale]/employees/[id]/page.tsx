'use client'

import { useState, use } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import type { EmployeeDetail } from '@/hooks/use-employees'
import { useEmployee } from '@/hooks/use-employees'

interface DetailPageProps {
  params: Promise<{ locale: string; id: string }>
}

export default function EmployeeDetailPage({ params }: DetailPageProps) {
  const { id } = use(params)
  const t = useTranslations('employees')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const { data: emp, isLoading } = useEmployee(id)
  const [activeTab, setActiveTab] = useState<'profile' | 'attendance' | 'leaves' | 'performance'>(
    'profile',
  )

  if (isLoading) return <p className="text-muted-foreground p-8">{tCommon('loading')}</p>
  if (!emp) return <p className="text-muted-foreground p-8">{tCommon('error')}</p>

  const statusColor =
    emp.status === 'ACTIVE'
      ? 'bg-green-100 text-green-800'
      : emp.status === 'ON_LEAVE'
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-red-100 text-red-800'

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            &larr; {tCommon('back')}
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{emp.fullNameAr}</h1>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}>
                {emp.status}
              </span>
            </div>
            <p className="text-muted-foreground text-sm">{emp.employeeCode}</p>
          </div>
        </div>
        <button
          onClick={() => router.push(`/employees/${emp.id}/edit`)}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
        >
          {tCommon('edit')}
        </button>
      </div>

      <div className="mb-6 flex gap-1 border-b">
        {(['profile', 'attendance', 'leaves', 'performance'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t(tab)}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="grid grid-cols-2 gap-4">
          <Field label={t('fullNameAr')} value={emp.fullNameAr} />
          <Field label={t('fullNameEn')} value={emp.fullNameEn} />
          <Field label={t('email')} value={emp.email} />
          <Field label={t('phone')} value={emp.phone} />
          <Field label={t('position')} value={emp.position} />
          <Field label={t('department')} value={emp.department?.nameAr} />
          <Field label={t('employeeCode')} value={emp.employeeCode} />
          <Field label={t('employmentType')} value={emp.employmentType} />
          <Field
            label={t('startDate')}
            value={emp.startDate ? new Date(emp.startDate).toLocaleDateString() : '—'}
          />
          {(emp as unknown as EmployeeDetail).endDate && (
            <Field
              label={t('endDate')}
              value={new Date((emp as unknown as EmployeeDetail).endDate!).toLocaleDateString()}
            />
          )}
        </div>
      )}

      {activeTab === 'attendance' && (
        <p className="text-muted-foreground py-12 text-center">{t('attendancePlaceholder')}</p>
      )}

      {activeTab === 'leaves' && (
        <p className="text-muted-foreground py-12 text-center">{t('leavesPlaceholder')}</p>
      )}

      {activeTab === 'performance' && (
        <p className="text-muted-foreground py-12 text-center">{t('performancePlaceholder')}</p>
      )}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-muted-foreground text-xs uppercase tracking-wide">{label}</p>
      <p className="mt-1 font-medium">{value || '—'}</p>
    </div>
  )
}
