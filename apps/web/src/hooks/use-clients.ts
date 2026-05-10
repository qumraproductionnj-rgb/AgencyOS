'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Client {
  id: string
  companyId: string
  name: string
  nameEn: string | null
  email: string | null
  phone: string | null
  address: string | null
  website: string | null
  isVip: boolean
  isBlacklisted: boolean
  notes: string | null
  createdAt: string
  updatedAt: string
  contacts: Contact[]
  deals: { id: string; name: string; value: number; currency: string; stage: string }[]
  _count: {
    contacts: number
    projects: number
    invoices: number
    quotations: number
    campaigns: number
  }
  totalRevenueIqd?: number
  totalRevenueUsd?: number
}

export interface Contact {
  id: string
  companyId: string
  clientId: string
  name: string
  position: string | null
  email: string | null
  phone: string | null
  isPrimary: boolean
  createdAt: string
}

export interface CreateClientDto {
  name: string
  nameEn?: string
  email?: string
  phone?: string
  address?: string
  website?: string
  isVip?: boolean
  isBlacklisted?: boolean
  notes?: string
}

export interface UpdateClientDto {
  name?: string
  nameEn?: string
  email?: string
  phone?: string
  address?: string
  website?: string
  isVip?: boolean
  isBlacklisted?: boolean
  notes?: string
}

export interface CreateContactDto {
  name: string
  position?: string
  email?: string
  phone?: string
  isPrimary?: boolean
}

export interface ClientsQuery {
  search?: string
  vip?: string
  blacklisted?: string
}

const CLIENTS_KEY = 'clients'

export function useClients(query?: ClientsQuery) {
  const params = new URLSearchParams()
  if (query?.search) params.set('search', query.search)
  if (query?.vip) params.set('vip', query.vip)
  if (query?.blacklisted) params.set('blacklisted', query.blacklisted)
  const qs = params.toString()

  return useQuery({
    queryKey: [CLIENTS_KEY, qs],
    queryFn: () => api.get<Client[]>(`/clients${qs ? `?${qs}` : ''}`),
  })
}

export function useClient(id: string) {
  return useQuery({
    queryKey: [CLIENTS_KEY, id],
    queryFn: () => api.get<Client>(`/clients/${id}`),
    enabled: !!id,
  })
}

export function useCreateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateClientDto) => api.post<Client>('/clients', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CLIENTS_KEY] }),
  })
}

export function useUpdateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateClientDto & { id: string }) =>
      api.put<Client>(`/clients/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CLIENTS_KEY] }),
  })
}

export function useDeleteClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.del(`/clients/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CLIENTS_KEY] }),
  })
}

export function useCreateContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ clientId, ...body }: CreateContactDto & { clientId: string }) =>
      api.post<Contact>(`/clients/${clientId}/contacts`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CLIENTS_KEY] }),
  })
}

export function useUpdateContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ clientId, id, ...body }: { clientId: string; id: string } & CreateContactDto) =>
      api.put<Contact>(`/clients/${clientId}/contacts/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CLIENTS_KEY] }),
  })
}

export function useDeleteContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ clientId, id }: { clientId: string; id: string }) =>
      api.del(`/clients/${clientId}/contacts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CLIENTS_KEY] }),
  })
}
