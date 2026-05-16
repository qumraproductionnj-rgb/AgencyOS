'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { useEmployees, useDeleteEmployee } from '@/hooks/use-employees'
import { useDepartments, type Department } from '@/hooks/use-departments'
import { EmployeeCreateModal } from './employee-create-modal'
import { EmptyState } from '@/components/EmptyState'
import { SkeletonTable } from '@/components/SkeletonTable'
import { ConfirmDialog } from '@/components/ConfirmDialog'

export function EmployeeTable() {
  const t = useTranslations('employees')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const { data: departments } = useDepartments()
  const [deptFilter, setDeptFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const { data: employees, isLoading } = useEmployees({
    departmentId: deptFilter || undefined,
    status: statusFilter || undefined,
    search: search || undefined,
  })
  const deleteEmp = useDeleteEmployee()
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  if (isLoading) return <SkeletonTable rows={8} cols={6} />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + {tCommon('create')}
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">{t('allDepartments')}</option>
          {departments?.map((d: Department) => (
            <option key={d.id} value={d.id}>
              {d.nameAr}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">{t('allStatuses')}</option>
          <option value="ACTIVE">Active</option>
          <option value="ON_LEAVE">On Leave</option>
          <option value="TERMINATED">Terminated</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('search')}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {!employees?.length ? (
        <EmptyState
          icon="👥"
          title={t('noEmployees')}
          description={t('noEmployeesDesc')}
          actions={[{ label: `+ ${t('invite')}`, onClick: () => setModalOpen(true) }]}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">{t('employeeCode')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('fullNameAr')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('email')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('department')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('position')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('status')}</th>
                <th className="px-4 py-3 text-right font-medium">{tCommon('edit')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {employees.map((emp) => (
                <tr
                  key={emp.id}
                  className="hover:bg-muted/30 cursor-pointer"
                  onClick={() => router.push(`/employees/${emp.id}`)}
                >
                  <td className="px-4 py-3 font-mono text-xs">{emp.employeeCode}</td>
                  <td className="px-4 py-3">{emp.fullNameAr}</td>
                  <td className="text-muted-foreground px-4 py-3">{emp.email}</td>
                  <td className="px-4 py-3">{emp.department?.nameAr || '—'}</td>
                  <td className="text-muted-foreground px-4 py-3">{emp.position || '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${emp.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : emp.status === 'ON_LEAVE' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setModalOpen(true)
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      {tCommon('edit')}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteId(emp.id)
                      }}
                      className="ml-3 text-red-500 hover:underline"
                      disabled={deleteEmp.isPending}
                    >
                      {tCommon('delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && <EmployeeCreateModal onClose={() => setModalOpen(false)} />}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteEmp.mutateAsync(deleteId!)}
        title={t('deleteConfirm')}
        description="This will permanently remove the employee and all their data."
        confirmLabel={tCommon('delete')}
        variant="danger"
        requireTyping="delete"
      />
    </div>
  )
}
