import { z } from 'zod'

export const CreateEquipmentSchema = z.object({
  name: z.string().min(1).max(200),
  category: z.enum(['CAMERA', 'LENS', 'LIGHTING', 'AUDIO', 'GRIP', 'COMPUTER', 'OTHER']),
  brand: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  serialNumber: z.string().max(100).optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.number().int().optional(),
  currency: z.string().max(3).optional().default('IQD'),
  condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR']).optional().default('GOOD'),
})

export const UpdateEquipmentSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  category: z.enum(['CAMERA', 'LENS', 'LIGHTING', 'AUDIO', 'GRIP', 'COMPUTER', 'OTHER']).optional(),
  brand: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  serialNumber: z.string().max(100).optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.number().int().optional(),
  currency: z.string().max(3).optional(),
  condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR']).optional(),
  currentStatus: z.enum(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RETIRED', 'LOST']).optional(),
  currentHolderId: z.string().uuid().optional().nullable(),
  currentProjectId: z.string().uuid().optional().nullable(),
})

export const CreateBookingSchema = z.object({
  equipmentId: z.string().uuid(),
  projectId: z.string().uuid().optional().nullable(),
  bookingStart: z.string(),
  bookingEnd: z.string(),
})

export const UpdateBookingStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'CHECKED_OUT', 'RETURNED', 'CANCELLED']),
  returnConditionNotes: z.string().optional(),
})

export const CreateMaintenanceSchema = z.object({
  equipmentId: z.string().uuid(),
  maintenanceDate: z.string(),
  type: z.enum(['ROUTINE', 'REPAIR', 'CALIBRATION']),
  description: z.string().max(2000).optional(),
  cost: z.number().int().optional(),
  currency: z.string().max(3).optional().default('IQD'),
  performedBy: z.string().max(200).optional(),
  nextMaintenanceDate: z.string().optional(),
  receiptUrl: z.string().max(500).optional(),
})

export const EquipmentQuerySchema = z.object({
  category: z.enum(['CAMERA', 'LENS', 'LIGHTING', 'AUDIO', 'GRIP', 'COMPUTER', 'OTHER']).optional(),
  status: z.enum(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RETIRED', 'LOST']).optional(),
  search: z.string().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  cursor: z.string().uuid().optional(),
})
