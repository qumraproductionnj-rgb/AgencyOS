'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import {
  useOnboardingProgress,
  useSaveProgress,
  useCompleteOnboarding,
  useSkipOnboarding,
} from '@/hooks/use-onboarding'

interface CompanyProfile {
  name: string
  nameEn?: string
  address?: string
  phone?: string
  website?: string
  logoUrl?: string
}

interface WorkLocation {
  name: string
  latitude: string
  longitude: string
  radiusMeters: string
}

interface Department {
  nameAr: string
  nameEn?: string
}

interface EmployeeInvite {
  email: string
  fullNameAr: string
  fullNameEn?: string
}

interface WizardData {
  companyProfile?: CompanyProfile
  workLocation?: WorkLocation
  departments?: Department[]
  employees?: EmployeeInvite[]
  selectedPlan?: string
}

export default function WizardPage() {
  const t = useTranslations('onboarding')
  const { data: progress, isLoading: progressLoading } = useOnboardingProgress()
  const saveProgress = useSaveProgress()
  const completeOnboarding = useCompleteOnboarding()
  const skipOnboarding = useSkipOnboarding()

  const [step, setStep] = useState(1)
  const [data, setData] = useState<WizardData>({})
  const [saving, setSaving] = useState(false)

  const updateData = useCallback(<K extends keyof WizardData>(key: K, value: WizardData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleNext = useCallback(async () => {
    setSaving(true)
    try {
      await saveProgress.mutateAsync({ currentStep: step, data: data as Record<string, unknown> })
      if (step < 5) {
        setStep((s) => s + 1)
      } else {
        await completeOnboarding.mutateAsync()
      }
    } finally {
      setSaving(false)
    }
  }, [step, data, saveProgress, completeOnboarding])

  const handleSkip = useCallback(() => {
    if (window.confirm(t('skipConfirm'))) skipOnboarding.mutate()
  }, [skipOnboarding, t])

  const busy = saving || saveProgress.isPending || completeOnboarding.isPending

  if (progressLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    )
  }

  if (progress?.isCompleted || completeOnboarding.isSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="rounded-full bg-green-100 p-4 text-4xl dark:bg-green-900">🎉</div>
        <h1 className="text-2xl font-bold">{t('welcomeMessage')}</h1>
        <p className="text-muted-foreground">{t('redirecting')}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
        <p className="mt-4 text-sm text-gray-500">{t('step', { n: step })}</p>
        {/* Step dots */}
        <div className="mt-3 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-2 w-2 rounded-full ${s <= step ? 'bg-blue-600' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="border-border bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
        {step === 1 && (
          <StepCompanyProfile
            data={data.companyProfile}
            onChange={(d) => updateData('companyProfile', d)}
            t={t}
          />
        )}
        {step === 2 && (
          <StepWorkLocation
            data={data.workLocation}
            onChange={(d) => updateData('workLocation', d)}
            t={t}
          />
        )}
        {step === 3 && (
          <StepDepartments
            data={data.departments}
            onChange={(d) => updateData('departments', d)}
            t={t}
          />
        )}
        {step === 4 && (
          <StepEmployees data={data.employees} onChange={(d) => updateData('employees', d)} t={t} />
        )}
        {step === 5 && (
          <StepPlan
            data={data.selectedPlan}
            onChange={(d) => updateData('selectedPlan', d)}
            t={t}
          />
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={handleSkip}
          disabled={busy}
          className="text-sm text-gray-500 underline hover:text-gray-700 disabled:opacity-50"
        >
          {t('skip')}
        </button>
        <div className="flex gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              disabled={busy}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              {t('back')}
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={busy}
            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {busy ? t('loading') : step < 5 ? t('next') : t('startFreeTrial')}
          </button>
        </div>
      </div>
    </div>
  )
}

function StepCompanyProfile({
  data,
  onChange,
  t,
}: {
  data: CompanyProfile | undefined
  onChange: (d: CompanyProfile) => void
  t: (key: string) => string
}) {
  const d = data ?? { name: '' }
  const set = (key: keyof CompanyProfile, value: string) => onChange({ ...d, [key]: value })

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{t('step1')}</h2>
      <p className="text-muted-foreground text-sm">{t('step1Desc')}</p>
      <Field label={t('companyName')}>
        <input
          value={d.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder={t('companyNamePlaceholder')}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </Field>
      <Field label={t('companyNameEn')}>
        <input
          value={d.nameEn ?? ''}
          onChange={(e) => set('nameEn', e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </Field>
      <Field label={t('address')}>
        <input
          value={d.address ?? ''}
          onChange={(e) => set('address', e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label={t('phone')}>
          <input
            value={d.phone ?? ''}
            onChange={(e) => set('phone', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </Field>
        <Field label={t('website')}>
          <input
            value={d.website ?? ''}
            onChange={(e) => set('website', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </Field>
      </div>
    </div>
  )
}

function StepWorkLocation({
  data,
  onChange,
  t,
}: {
  data: WorkLocation | undefined
  onChange: (d: WorkLocation) => void
  t: (key: string) => string
}) {
  const d = data ?? { name: '', latitude: '', longitude: '', radiusMeters: '100' }
  const set = (key: keyof WorkLocation, value: string) => onChange({ ...d, [key]: value })

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{t('step2')}</h2>
      <p className="text-muted-foreground text-sm">{t('step2Desc')}</p>
      <Field label={t('locationName')}>
        <input
          value={d.name}
          onChange={(e) => set('name', e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label={t('latitude')}>
          <input
            value={d.latitude}
            onChange={(e) => set('latitude', e.target.value)}
            type="number"
            step="any"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </Field>
        <Field label={t('longitude')}>
          <input
            value={d.longitude}
            onChange={(e) => set('longitude', e.target.value)}
            type="number"
            step="any"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </Field>
      </div>
      <Field label={t('radius')}>
        <input
          value={d.radiusMeters}
          onChange={(e) => set('radiusMeters', e.target.value)}
          type="number"
          min="10"
          max="1000"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </Field>
    </div>
  )
}

function StepDepartments({
  data,
  onChange,
  t,
}: {
  data: Department[] | undefined
  onChange: (d: Department[]) => void
  t: (key: string) => string
}) {
  const items = data ?? []
  const add = () => onChange([...items, { nameAr: '' }])
  const update = (i: number, key: keyof Department, value: string) => {
    const next = [...items]
    next[i] = { ...next[i], [key]: value } as Department
    onChange(next)
  }
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{t('step3')}</h2>
      <p className="text-muted-foreground text-sm">{t('step3Desc')}</p>
      {items.map((dept, i) => (
        <div key={i} className="flex items-start gap-3 rounded-md border border-gray-200 p-3">
          <div className="flex-1 space-y-2">
            <input
              value={dept.nameAr}
              onChange={(e) => update(i, 'nameAr', e.target.value)}
              placeholder={t('deptNameAr')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              value={dept.nameEn ?? ''}
              onChange={(e) => update(i, 'nameEn', e.target.value)}
              placeholder={t('deptNameEn')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => remove(i)}
            className="mt-1 text-sm text-red-500 hover:text-red-700"
          >
            {t('remove')}
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="rounded-md border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
      >
        + {t('addDepartment')}
      </button>
    </div>
  )
}

function StepEmployees({
  data,
  onChange,
  t,
}: {
  data: EmployeeInvite[] | undefined
  onChange: (d: EmployeeInvite[]) => void
  t: (key: string) => string
}) {
  const items = data ?? []
  const add = () => onChange([...items, { email: '', fullNameAr: '' }])
  const update = (i: number, key: keyof EmployeeInvite, value: string) => {
    const next = [...items]
    next[i] = { ...next[i], [key]: value } as EmployeeInvite
    onChange(next)
  }
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{t('step4')}</h2>
      <p className="text-muted-foreground text-sm">{t('step4Desc')}</p>
      {items.map((emp, i) => (
        <div key={i} className="flex items-start gap-3 rounded-md border border-gray-200 p-3">
          <div className="flex-1 space-y-2">
            <input
              value={emp.email}
              onChange={(e) => update(i, 'email', e.target.value)}
              placeholder={t('employeeEmail')}
              type="email"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              value={emp.fullNameAr}
              onChange={(e) => update(i, 'fullNameAr', e.target.value)}
              placeholder={t('employeeName')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              value={emp.fullNameEn ?? ''}
              onChange={(e) => update(i, 'fullNameEn', e.target.value)}
              placeholder={t('employeeNameEn')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => remove(i)}
            className="mt-1 text-sm text-red-500 hover:text-red-700"
          >
            {t('remove')}
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="rounded-md border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
      >
        + {t('addEmployee')}
      </button>
    </div>
  )
}

function StepPlan({
  data,
  onChange,
  t,
}: {
  data: string | undefined
  onChange: (d: string) => void
  t: (key: string) => string
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{t('step5')}</h2>
      <p className="text-muted-foreground text-sm">{t('step5Desc')}</p>
      <div
        className={`cursor-pointer rounded-lg border-2 p-4 ${data === 'professional' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}
        onClick={() => onChange('professional')}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{t('planProfessional')}</h3>
            <p className="text-muted-foreground mt-1 text-sm">{t('planProfessionalDesc')}</p>
          </div>
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
            {t('planFreeTrial')}
          </span>
        </div>
      </div>
      <p className="text-muted-foreground text-xs">{t('planLater')}</p>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  )
}
