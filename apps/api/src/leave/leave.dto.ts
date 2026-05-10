import { z } from 'zod'

export const CreateLeaveSchema = z.object({
  leaveType: z.enum(['ANNUAL', 'SICK', 'PERSONAL', 'MATERNITY', 'PATERNITY', 'UNPAID', 'OTHER']),
  startDate: z.string().refine((s) => !isNaN(Date.parse(s)), 'Invalid date'),
  endDate: z.string().refine((s) => !isNaN(Date.parse(s)), 'Invalid date'),
  reason: z.string().max(500).optional(),
})

export const ApproveLeaveSchema = z.object({})

export const RejectLeaveSchema = z.object({
  rejectionReason: z.string().min(1).max(500),
})

export const LeaveQuerySchema = z.object({
  employeeId: z.string().uuid().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']).optional(),
  leaveType: z
    .enum(['ANNUAL', 'SICK', 'PERSONAL', 'MATERNITY', 'PATERNITY', 'UNPAID', 'OTHER'])
    .optional(),
  year: z.coerce.number().int().optional(),
})

export type CreateLeaveDto = z.infer<typeof CreateLeaveSchema>
export type ApproveLeaveDto = z.infer<typeof ApproveLeaveSchema>
export type RejectLeaveDto = z.infer<typeof RejectLeaveSchema>
export type LeaveQueryDto = z.infer<typeof LeaveQuerySchema>
