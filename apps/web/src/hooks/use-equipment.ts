'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Equipment {
  id: string
  name: string
  category: string
  brand: string | null
  model: string | null
  serialNumber: string | null
  purchaseDate: string | null
  purchasePrice: number | null
  currency: string | null
  currentStatus: string
  condition: string
  currentHolderId: string | null
  currentProjectId: string | null
  qrCodeUrl: string | null
  holder?: { fullNameAr: string } | null
  bookings?: EquipmentBooking[]
  maintenance?: EquipmentMaintenance[]
}

export interface EquipmentBooking {
  id: string
  equipmentId: string
  projectId: string | null
  bookedBy: string
  bookingStart: string
  bookingEnd: string
  status: string
  checkoutAt: string | null
  returnAt: string | null
  returnConditionNotes: string | null
  equipment?: { name: string; category: string }
  project?: { name: string } | null
  booker?: { email: string }
}

export interface EquipmentMaintenance {
  id: string
  equipmentId: string
  maintenanceDate: string
  type: string
  description: string | null
  cost: number | null
  currency: string | null
  performedBy: string | null
  nextMaintenanceDate: string | null
  receiptUrl: string | null
  equipment?: { name: string; category: string }
}

interface PaginatedEquipment {
  items: Equipment[]
  nextCursor: string | null
}

const KEY = 'equipment'

export function useEquipment(params?: {
  category?: string
  status?: string
  search?: string
  limit?: number
  cursor?: string
}) {
  const qs = new URLSearchParams()
  if (params?.category) qs.set('category', params.category)
  if (params?.status) qs.set('status', params.status)
  if (params?.search) qs.set('search', params.search)
  if (params?.limit) qs.set('limit', String(params.limit))
  if (params?.cursor) qs.set('cursor', params.cursor)
  const query = qs.toString()

  return useQuery({
    queryKey: [KEY, 'list', query],
    queryFn: () => api.get<PaginatedEquipment>(`/equipment${query ? `?${query}` : ''}`),
  })
}

export function useEquipmentItem(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => api.get<Equipment>(`/equipment/${id}`),
    enabled: !!id,
  })
}

export function useCreateEquipment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post<Equipment>('/equipment', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useUpdateEquipment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.put<Equipment>(`/equipment/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useDeleteEquipment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.del(`/equipment/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useEquipmentBookings(equipmentId: string) {
  return useQuery({
    queryKey: [KEY, 'bookings', equipmentId],
    queryFn: () => api.get<EquipmentBooking[]>(`/equipment/${equipmentId}/bookings`),
    enabled: !!equipmentId,
  })
}

export function useAllBookings() {
  return useQuery({
    queryKey: [KEY, 'bookings', 'all'],
    queryFn: () => api.get<EquipmentBooking[]>('/equipment/bookings/all'),
  })
}

export function useCreateBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post<EquipmentBooking>('/equipment/bookings', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, 'bookings'] }),
  })
}

export function useUpdateBookingStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      status,
      returnConditionNotes,
    }: {
      id: string
      status: string
      returnConditionNotes?: string
    }) =>
      api.put<EquipmentBooking>(`/equipment/bookings/${id}/status`, {
        status,
        returnConditionNotes,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, 'bookings'] }),
  })
}

export function useDeleteBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.del(`/equipment/bookings/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, 'bookings'] }),
  })
}

export function useEquipmentMaintenance(equipmentId: string) {
  return useQuery({
    queryKey: [KEY, 'maintenance', equipmentId],
    queryFn: () => api.get<EquipmentMaintenance[]>(`/equipment/${equipmentId}/maintenance`),
    enabled: !!equipmentId,
  })
}

export function useCreateMaintenance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post<EquipmentMaintenance>('/equipment/maintenance', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, 'maintenance'] }),
  })
}

export function useDeleteMaintenance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.del(`/equipment/maintenance/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, 'maintenance'] }),
  })
}

export function useEquipmentQrCode(id: string) {
  return useQuery({
    queryKey: [KEY, 'qrcode', id],
    queryFn: () => api.get<{ qrCodeUrl: string }>(`/equipment/${id}/qrcode`),
    enabled: !!id,
  })
}

export function useRegenerateQrCode() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api.post<{ qrCodeUrl: string }>(`/equipment/${id}/regenerate-qrcode`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, 'qrcode'] }),
  })
}

export function useSuggestEquipment(contentType: string | null) {
  return useQuery({
    queryKey: [KEY, 'suggest', contentType],
    queryFn: () => api.get<Equipment[]>(`/equipment/suggest/${contentType}`),
    enabled: !!contentType,
  })
}
