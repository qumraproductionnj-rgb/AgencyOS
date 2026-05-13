'use client'

import { useTranslations } from 'next-intl'
import { useQuery } from '@tanstack/react-query'
import { PortalLayout } from '@/components/portal-layout'
import { apiClient } from '@/lib/api'
import { cn } from '@/lib/utils'

interface ProjectWithTasks {
  id: string
  name: string
  stage: string
  deadline: string
  tasks: { id: string; title: string; status: string; dueDate: string | null }[]
}

export default function ProjectsPage() {
  const t = useTranslations('projects')
  const { data: projects, isLoading } = useQuery<ProjectWithTasks[]>({
    queryKey: ['portal-projects'],
    queryFn: () => apiClient('/portal/projects'),
  })

  return (
    <PortalLayout>
      <h1 className="mb-6 text-2xl font-bold">{t('title')}</h1>
      {isLoading && <p className="text-muted-foreground">Loading...</p>}
      {!isLoading && projects?.length === 0 && (
        <p className="text-muted-foreground">{t('noProjects')}</p>
      )}
      <div className="grid gap-4">
        {projects?.map((project) => (
          <div key={project.id} className="rounded-lg border p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">{project.name}</h3>
              <span className={cn('rounded-full px-2 py-0.5 text-xs', 'bg-blue-100 text-blue-700')}>
                {project.stage}
              </span>
            </div>
            <p className="text-muted-foreground mb-3 text-sm">
              {t('deadline')}: {new Date(project.deadline).toLocaleDateString()}
            </p>
            {project.tasks.length > 0 && (
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs font-medium">{t('tasks')}</p>
                {project.tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between text-sm">
                    <span>{task.title}</span>
                    <span
                      className={cn(
                        'rounded px-1.5 py-0.5 text-xs',
                        task.status === 'DONE'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600',
                      )}
                    >
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </PortalLayout>
  )
}
