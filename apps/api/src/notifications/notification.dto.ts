import { z } from 'zod'

export const NotificationQuerySchema = z.object({
  unreadOnly: z.string().optional(),
  limit: z.string().optional(),
  cursor: z.string().uuid().optional(),
})

export const MarkReadSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
})

export const CreateNotificationSchema = z.object({
  userId: z.string().uuid(),
  type: z.enum([
    'TASK_ASSIGNED',
    'TASK_COMMENT',
    'LEAVE_APPROVED',
    'LEAVE_REJECTED',
    'PAYROLL_READY',
    'INVOICE_SENT',
    'PAYMENT_RECEIVED',
    'PROJECT_COMPLETED',
    'REVISION_REQUESTED',
    'EXPENSE_APPROVED',
    'EXPENSE_REJECTED',
    'GENERAL',
  ]),
  title: z.string().min(1).max(300),
  body: z.string().max(2000).optional(),
  data: z.record(z.unknown()).optional(),
})

export type NotificationQueryDto = z.infer<typeof NotificationQuerySchema>
export type MarkReadDto = z.infer<typeof MarkReadSchema>
export type CreateNotificationDto = z.infer<typeof CreateNotificationSchema>
