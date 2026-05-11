'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface DashboardWidgets {
  revenueThisMonth: { iqd: number; usd: number }
  activeProjects: number
  overdueTasks: number
  pendingInvoices: number
  pipelineValue: { iqd: number; usd: number }
  todayAttendance: { present: number; late: number; absent: number; remote: number }
  topPerformers: { userId: string; email: string; completedTasks: number }[]
}

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get<DashboardWidgets>('/dashboard'),
    refetchInterval: 60_000,
  })
}
