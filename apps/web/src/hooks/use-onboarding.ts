'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useRouter } from '@/i18n/navigation'

interface OnboardingProgress {
  id: string
  companyId: string
  currentStep: number
  isCompleted: boolean
  data: Record<string, unknown>
}

const ONBOARDING_KEY = 'onboarding-progress'

export function useOnboardingProgress() {
  return useQuery({
    queryKey: [ONBOARDING_KEY],
    queryFn: () => api.get<OnboardingProgress>('/onboarding/progress'),
  })
}

export function useSaveProgress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { currentStep: number; data: Record<string, unknown> }) =>
      api.put<OnboardingProgress>('/onboarding/progress', body),
    onSuccess: (data) => {
      qc.setQueryData([ONBOARDING_KEY], data)
    },
  })
}

export function useCompleteOnboarding() {
  const qc = useQueryClient()
  const router = useRouter()
  return useMutation({
    mutationFn: () => api.post<{ status: string }>('/onboarding/complete'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ONBOARDING_KEY] })
      setTimeout(() => router.push('/dashboard'), 1500)
    },
  })
}

export function useSkipOnboarding() {
  const qc = useQueryClient()
  const router = useRouter()
  return useMutation({
    mutationFn: () => api.post<{ status: string }>('/onboarding/skip'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ONBOARDING_KEY] })
      router.push('/dashboard')
    },
  })
}
