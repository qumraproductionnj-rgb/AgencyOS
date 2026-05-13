'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export type PlanKey = 'starter' | 'professional' | 'agency'
export type BillingInterval = 'month' | 'year'

interface CheckoutSessionResponse {
  checkoutUrl: string
  sessionId: string
}

interface PortalSessionResponse {
  url: string
}

export function useStartCheckout() {
  return useMutation({
    mutationFn: (input: { planKey: PlanKey; interval: BillingInterval }) =>
      api.post<CheckoutSessionResponse>('/billing/checkout-session', input),
  })
}

export function useOpenBillingPortal() {
  return useMutation({
    mutationFn: () => api.post<PortalSessionResponse>('/billing/portal-session'),
  })
}

export function useChangeBillingPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { planKey: PlanKey; interval: BillingInterval }) =>
      api.post<{ ok: true }>('/billing/change-plan', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-subscription'] })
    },
  })
}

export function useCancelBilling() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (atPeriodEnd: boolean) =>
      api.post<{ ok: true }>('/billing/cancel', { atPeriodEnd }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-subscription'] })
    },
  })
}
