'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Task {
  id: string
  projectId: string | null
  parentTaskId: string | null
  title: string
  description: string | null
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  assignedTo: string | null
  startDate: string | null
  dueDate: string | null
  completedAt: string | null
  estimatedHours: number | null
  sortOrder: number
  createdAt: string
  project?: { id: string; name: string } | null
  assignee?: { id: string; email: string } | null
  parentTask?: { id: string; title: string; status: string } | null
  subTasks?: {
    id: string
    title: string
    status: string
    assignee?: { id: string; email: string } | null
  }[]
  comments?: {
    id: string
    content: string
    mentions: string[]
    createdAt: string
    user: { id: string; email: string }
  }[]
  timeLogs?: {
    id: string
    startTime: string
    endTime: string | null
    duration: number | null
    notes: string | null
    user: { id: string; email: string }
  }[]
  _count?: { comments: number; timeLogs: number }
}

export interface CreateTaskDto {
  projectId?: string
  parentTaskId?: string
  title: string
  description?: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  assignedTo?: string
  startDate?: string
  dueDate?: string
  estimatedHours?: number
}

export interface UpdateTaskDto {
  title?: string
  description?: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  assignedTo?: string
  startDate?: string
  dueDate?: string
  estimatedHours?: number
  sortOrder?: number
}

export interface WorkloadEntry {
  user: { id: string; email: string }
  totalTasks: number
  estimatedHours: number
  loggedHours: number
  byProject: Record<string, { name: string; tasks: number }>
}

const TASKS_KEY = 'tasks'

export function useTasks(query?: {
  search?: string
  status?: string
  priority?: string
  projectId?: string
  assignedTo?: string
  dueBefore?: string
}) {
  const params = new URLSearchParams()
  if (query?.search) params.set('search', query.search)
  if (query?.status) params.set('status', query.status)
  if (query?.priority) params.set('priority', query.priority)
  if (query?.projectId) params.set('projectId', query.projectId)
  if (query?.assignedTo) params.set('assignedTo', query.assignedTo)
  if (query?.dueBefore) params.set('dueBefore', query.dueBefore)
  const qs = params.toString()

  return useQuery({
    queryKey: [TASKS_KEY, qs],
    queryFn: () => api.get<Task[]>(`/tasks${qs ? `?${qs}` : ''}`),
  })
}

export function useTask(id: string) {
  return useQuery({
    queryKey: [TASKS_KEY, id],
    queryFn: () => api.get<Task>(`/tasks/${id}`),
    enabled: !!id,
  })
}

export function useWorkload() {
  return useQuery({
    queryKey: ['tasks-workload'],
    queryFn: () => api.get<WorkloadEntry[]>('/tasks/workload'),
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateTaskDto) => api.post<Task>('/tasks', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TASKS_KEY] }),
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateTaskDto & { id: string }) =>
      api.put<Task>(`/tasks/${id}`, body),
    onMutate: async ({ id, ...body }) => {
      await qc.cancelQueries({ queryKey: [TASKS_KEY] })
      const previous = qc.getQueriesData<Task[]>({ queryKey: [TASKS_KEY] })
      qc.setQueriesData<Task[]>(
        { queryKey: [TASKS_KEY] },
        (old) => old?.map((t) => (t.id === id ? { ...t, ...body } : t)) ?? old,
      )
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        ctx.previous.forEach(([key, data]) => qc.setQueryData(key, data))
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: [TASKS_KEY] }),
  })
}

export function useUpdateTaskStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch<Task>(`/tasks/${id}/status`, { status }),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: [TASKS_KEY] })
      const previous = qc.getQueriesData<Task[]>({ queryKey: [TASKS_KEY] })
      qc.setQueriesData<Task[]>(
        { queryKey: [TASKS_KEY] },
        (old) =>
          old?.map((t) => (t.id === id ? { ...t, status: status as Task['status'] } : t)) ?? old,
      )
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        ctx.previous.forEach(([key, data]) => qc.setQueryData(key, data))
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: [TASKS_KEY] }),
  })
}

export function useAddComment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, content, mentions }: { id: string; content: string; mentions?: string[] }) =>
      api.post<{
        id: string
        content: string
        createdAt: string
        user: { id: string; email: string }
      }>(`/tasks/${id}/comments`, { content, ...(mentions ? { mentions } : {}) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TASKS_KEY] }),
  })
}

export function useDeleteComment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, commentId }: { taskId: string; commentId: string }) =>
      api.del(`/tasks/${taskId}/comments/${commentId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TASKS_KEY] }),
  })
}

export function useStartTimer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      api.post(`/tasks/${id}/timer/start`, { ...(notes ? { notes } : {}) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TASKS_KEY] }),
  })
}

export function useStopTimer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      api.post(`/tasks/${id}/timer/stop`, { ...(notes ? { notes } : {}) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TASKS_KEY] }),
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.del(`/tasks/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TASKS_KEY] }),
  })
}

export function useProjectTasks(projectId: string) {
  return useQuery({
    queryKey: [TASKS_KEY, 'project', projectId],
    queryFn: () => api.get<Task[]>(`/tasks?projectId=${projectId}`),
    enabled: !!projectId,
  })
}

export function useEmployeesList() {
  return useQuery({
    queryKey: ['employees-list'],
    queryFn: () =>
      api.get<{ id: string; email: string; fullNameAr?: string; fullNameEn?: string }[]>(
        '/employees',
      ),
  })
}

export function useProjectsList() {
  return useQuery({
    queryKey: ['projects-list'],
    queryFn: () => api.get<{ id: string; name: string }[]>('/projects'),
  })
}
