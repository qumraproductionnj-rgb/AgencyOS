'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface SubscriptionPlan {
  id: string
  key: string
  nameAr: string
  nameEn: string
  description: string | null
  maxUsers: number
  maxStorageMb: number
  maxAiGenerationsPerMonth: number
  maxClients: number
  maxProjects: number
  features: Record<string, boolean>
  priceMonthly: number
  priceYearly: number
  currency: string
  sortOrder: number
  isActive: boolean
}

export interface Subscription {
  id: string
  companyId: string
  planId: string
  status:
    | 'TRIAL'
    | 'ACTIVE'
    | 'PAST_DUE'
    | 'CANCELLED'
    | 'EXPIRED'
    | 'READ_ONLY'
    | 'SUSPENDED'
    | 'ANONYMIZED'
  trialEndsAt: string | null
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  stripePriceId: string | null
  billingInterval: 'month' | 'year' | null
  cancelAtPeriodEnd: boolean
  cancelledAt: string | null
  plan: SubscriptionPlan
}

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => api.get<SubscriptionPlan[]>('/subscriptions/plans'),
  })
}

export function useCurrentSubscription() {
  return useQuery({
    queryKey: ['current-subscription'],
    queryFn: () =>
      api.get<Subscription | { plan: SubscriptionPlan; subscription: null; status: string }>(
        '/subscriptions/current',
      ),
  })
}

export function useCheckFeatureAccess(feature: string) {
  return useQuery({
    queryKey: ['feature-access', feature],
    queryFn: () =>
      api.get<{ feature: string; accessible: boolean }>(`/subscriptions/feature/${feature}`),
    enabled: !!feature,
  })
}

export function useChangePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (planId: string) =>
      api.patch<Subscription>('/subscriptions/change-plan', { planId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-subscription'] })
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] })
    },
  })
}

export function useUpdateSubscriptionStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (
      status:
        | 'TRIAL'
        | 'ACTIVE'
        | 'PAST_DUE'
        | 'CANCELLED'
        | 'EXPIRED'
        | 'READ_ONLY'
        | 'SUSPENDED'
        | 'ANONYMIZED',
    ) => api.patch<Subscription>('/subscriptions/status', { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-subscription'] })
    },
  })
}
