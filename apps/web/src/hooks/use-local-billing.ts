'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { PlanKey, BillingInterval } from './use-billing'

export type LocalGatewayCode = 'fib' | 'zaincash' | 'fastpay' | 'manual_bank_transfer'

export interface LocalGatewayInfo {
  code: 'fib' | 'zaincash' | 'fastpay'
  isImplemented: boolean
}

export interface BankDetails {
  bankName: string
  accountNumber: string
  iban: string
  swift: string
}

export interface LocalCheckoutResponse {
  id: string
  provider: string
  qrCode: string | null
  redirectUrl: string | null
  bankDetails: BankDetails | null
  amount: string // fils IQD as string (BigInt-safe)
  expiresAt: string | null
}

export type PaymentIntentStatus =
  | 'PENDING'
  | 'AWAITING_VERIFICATION'
  | 'PAID'
  | 'FAILED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'REJECTED'

export interface PaymentIntent {
  id: string
  companyId: string
  planId: string
  provider: string
  providerRef: string | null
  amount: string
  currency: string
  interval: 'month' | 'year'
  status: PaymentIntentStatus
  qrCode: string | null
  redirectUrl: string | null
  receiptFileId: string | null
  bankReference: string | null
  rejectionReason: string | null
  expiresAt: string | null
  createdAt: string
}

export function useLocalGateways() {
  return useQuery({
    queryKey: ['local-gateways'],
    queryFn: () => api.get<LocalGatewayInfo[]>('/billing/iqd/gateways'),
  })
}

export function useCreateLocalCheckout() {
  return useMutation({
    mutationFn: (input: {
      planKey: PlanKey
      interval: BillingInterval
      provider: LocalGatewayCode
    }) => api.post<LocalCheckoutResponse>('/billing/iqd/checkout', input),
  })
}

export function usePaymentIntent(intentId: string | null) {
  return useQuery({
    queryKey: ['payment-intent', intentId],
    queryFn: () => api.get<PaymentIntent>(`/billing/iqd/intent/${intentId}`),
    enabled: !!intentId,
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data) return 3000
      const terminal: PaymentIntentStatus[] = ['PAID', 'FAILED', 'EXPIRED', 'CANCELLED', 'REJECTED']
      return terminal.includes(data.status) ? false : 3000
    },
  })
}

export function useSubmitManualReceipt(intentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { receiptFileId: string; bankReference: string }) =>
      api.post<PaymentIntent>(`/billing/iqd/manual/${intentId}/submit`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-intent', intentId] })
    },
  })
}

// Admin (PLATFORM_ADMIN)
export function usePendingPayments() {
  return useQuery({
    queryKey: ['pending-payments'],
    queryFn: () => api.get<PaymentIntent[]>('/billing/iqd/admin/pending'),
  })
}

export function useApprovePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (intentId: string) =>
      api.post<PaymentIntent>(`/billing/iqd/admin/approve/${intentId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pending-payments'] }),
  })
}

export function useRejectPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { intentId: string; reason: string }) =>
      api.post<PaymentIntent>(`/billing/iqd/admin/reject/${input.intentId}`, {
        reason: input.reason,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pending-payments'] }),
  })
}
