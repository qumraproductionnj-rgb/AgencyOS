'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import {
  useDepartments,
  useDepartmentTree,
  useOrgStructure,
  useSetOrgStructure,
  type OrgStructureType,
  type DepartmentTreeNode,
} from '@/hooks/use-departments'
import { useEmployees, useUpdateEmployee } from '@/hooks/use-employees'
import { DepartmentEditor } from './department-editor'

const STRUCTURE_OPTIONS: {
  type: OrgStructureType
  ar: { title: string; desc: string }
  en: { title: string; desc: string }
  icon: string
}[] = [
  {
    type: 'FLAT',
    icon: '👥',
    ar: { title: 'شركة صغيرة', desc: 'بدون أقسام — المالك يدير الكل' },
    en: { title: 'Small / Flat', desc: 'No departments — owner manages everyone' },
  },
  {
    type: 'HIERARCHICAL',
    icon: '🏢',
    ar: { title: 'شركة متوسطة', desc: 'أقسام بمدراء — كل قسم له مدير' },
    en: { title: 'Medium / Hierarchical', desc: 'Departments with managers' },
  },
  {
    type: 'HYBRID',
    icon: '🏛️',
    ar: { title: 'شركة كبيرة', desc: 'أقسام فرعية — بعضها بمدراء، البعض الآخر بدون' },
    en: { title: 'Large / Hybrid', desc: 'Sub-departments — some with managers, some without' },
  },
]

export function OrgWizard() {
  const locale = useLocale()
  const isAr = locale === 'ar'
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const { data: orgStructure, isLoading: loadingStructure } = useOrgStructure()
  const setStructure = useSetOrgStructure()

  const handleStructureSelect = async (type: OrgStructureType) => {
    await setStructure.mutateAsync(type)
    setStep(type === 'FLAT' ? 3 : 2)
  }

  const T = {
    title: isAr ? 'إعداد الهيكل الإداري' : 'Org Structure Setup',
    subtitle: isAr
      ? 'حدد كيف تريد تنظيم شركتك — ثم أضف الأقسام والموظفين'
      : 'Choose how to organize your company — then add departments and employees',
    step1: isAr ? 'نوع الهيكل' : 'Structure Type',
    step2: isAr ? 'الأقسام' : 'Departments',
    step3: isAr ? 'الموظفون' : 'Employees',
    next: isAr ? 'التالي' : 'Next',
    back: isAr ? 'السابق' : 'Back',
    done: isAr ? 'إنهاء' : 'Done',
    skipDepts: isAr ? '(تخطّى للموظفين)' : '(skip to employees)',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{T.title}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{T.subtitle}</p>
      </div>

      <StepIndicator
        current={step}
        labels={[T.step1, T.step2, T.step3]}
        canNavigate={!!orgStructure}
        onJump={(s) => setStep(s)}
        flatMode={orgStructure?.orgStructureType === 'FLAT'}
      />

      {step === 1 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {STRUCTURE_OPTIONS.map((opt) => {
            const selected = orgStructure?.orgStructureType === opt.type
            return (
              <button
                key={opt.type}
                disabled={setStructure.isPending || loadingStructure}
                onClick={() => handleStructureSelect(opt.type)}
                className={`rounded-xl border-2 p-5 text-start transition-all hover:shadow-md disabled:opacity-50 ${
                  selected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                    : 'border-gray-200 hover:border-blue-300 dark:border-gray-700'
                }`}
              >
                <div className="mb-2 text-3xl">{opt.icon}</div>
                <div className="font-semibold">{isAr ? opt.ar.title : opt.en.title}</div>
                <div className="text-muted-foreground mt-1 text-xs">
                  {isAr ? opt.ar.desc : opt.en.desc}
                </div>
                {selected && (
                  <div className="mt-2 text-xs font-medium text-blue-600">
                    {isAr ? '✓ المختار' : '✓ Selected'}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}

      {step === 2 && orgStructure && (
        <Step2Departments
          allowHierarchy={orgStructure.orgStructureType === 'HYBRID'}
          requireManagers={orgStructure.orgStructureType === 'HIERARCHICAL'}
        />
      )}

      {step === 3 && <Step3AssignEmployees />}

      <div className="flex justify-between border-t pt-4">
        <button
          onClick={() => setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s))}
          disabled={step === 1}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-40"
        >
          ← {T.back}
        </button>
        {step < 3 && orgStructure && (
          <button
            onClick={() => {
              if (step === 1 && orgStructure.orgStructureType === 'FLAT') setStep(3)
              else setStep((s) => Math.min(3, s + 1) as 1 | 2 | 3)
            }}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {T.next} →
            {step === 1 && orgStructure.orgStructureType === 'FLAT' && (
              <span className="ms-2 text-xs opacity-80">{T.skipDepts}</span>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

function StepIndicator({
  current,
  labels,
  flatMode,
  onJump,
  canNavigate,
}: {
  current: 1 | 2 | 3
  labels: [string, string, string]
  flatMode: boolean
  onJump: (s: 1 | 2 | 3) => void
  canNavigate: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      {labels.map((label, i) => {
        const stepNum = (i + 1) as 1 | 2 | 3
        const isActive = current === stepNum
        const isDone = current > stepNum
        const isDisabled = stepNum === 2 && flatMode
        return (
          <button
            key={i}
            disabled={!canNavigate || isDisabled}
            onClick={() => onJump(stepNum)}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
              isActive
                ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/30'
                : isDone
                  ? 'border-green-300 bg-green-50 text-green-700 dark:bg-green-950/30'
                  : 'border-gray-200 text-gray-500'
            }`}
          >
            <span className="me-2">{stepNum}.</span>
            {label}
            {isDisabled && <span className="ms-2 text-[10px]">—</span>}
          </button>
        )
      })}
    </div>
  )
}

function Step2Departments({
  allowHierarchy,
  requireManagers,
}: {
  allowHierarchy: boolean
  requireManagers: boolean
}) {
  const locale = useLocale()
  const isAr = locale === 'ar'
  const { data: tree, isLoading } = useDepartmentTree()
  const { data: list } = useDepartments()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  if (isLoading) return <div className="text-muted-foreground text-sm">Loading…</div>

  const empty = !tree?.length

  return (
    <div className="space-y-4">
      {requireManagers && !empty && tree?.some((d) => !d.managerUserId) && (
        <div className="rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-xs text-yellow-800 dark:bg-yellow-950/30">
          {isAr
            ? '⚠ بعض الأقسام بدون مدير — هذا الهيكل يتطلّب مدير لكل قسم.'
            : '⚠ Some departments have no manager — this structure expects a manager per department.'}
        </div>
      )}

      {empty && !creating ? (
        <div className="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
          <div className="mb-2 text-3xl">🏢</div>
          <div className="font-medium">{isAr ? 'لا توجد أقسام بعد' : 'No departments yet'}</div>
          <p className="text-muted-foreground mt-1 text-sm">
            {isAr ? 'أضف قسمك الأول لتبدأ' : 'Add your first department to get started'}
          </p>
          <button
            onClick={() => setCreating(true)}
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + {isAr ? 'قسم جديد' : 'New Department'}
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-end">
            <button
              onClick={() => setCreating(true)}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              + {isAr ? 'قسم جديد' : 'New Department'}
            </button>
          </div>
          <DepartmentTree nodes={tree ?? []} onEdit={(id) => setEditingId(id)} depth={0} />
        </>
      )}

      {(creating || editingId) && (
        <DepartmentEditor
          departmentId={editingId}
          allowHierarchy={allowHierarchy}
          allDepartments={list ?? []}
          onClose={() => {
            setCreating(false)
            setEditingId(null)
          }}
        />
      )}
    </div>
  )
}

function DepartmentTree({
  nodes,
  onEdit,
  depth,
}: {
  nodes: DepartmentTreeNode[]
  onEdit: (id: string) => void
  depth: number
}) {
  const locale = useLocale()
  const isAr = locale === 'ar'
  return (
    <ul
      className={
        depth > 0 ? 'ms-6 space-y-2 border-s-2 border-dashed border-gray-200 ps-4' : 'space-y-2'
      }
    >
      {nodes.map((node) => (
        <li key={node.id}>
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-lg text-lg"
                style={{ backgroundColor: node.color ?? '#f3f4f6' }}
              >
                {node.icon ?? '🏷️'}
              </span>
              <div>
                <div className="font-medium">
                  {isAr ? node.nameAr : (node.nameEn ?? node.nameAr)}
                </div>
                <div className="text-muted-foreground text-xs">
                  {node.manager?.email ? (
                    <>
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-purple-700">
                        {isAr ? 'مدير' : 'Manager'}
                      </span>{' '}
                      {node.manager.email}
                    </>
                  ) : (
                    <span className="italic">{isAr ? 'بدون مدير' : 'no manager'}</span>
                  )}
                  {node._count && (
                    <span className="ms-2">
                      · {node._count.employees} {isAr ? 'موظف' : 'employees'}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => onEdit(node.id)}
              className="text-sm text-blue-600 hover:underline"
            >
              {isAr ? 'تعديل' : 'Edit'}
            </button>
          </div>
          {node.children.length > 0 && (
            <DepartmentTree nodes={node.children} onEdit={onEdit} depth={depth + 1} />
          )}
        </li>
      ))}
    </ul>
  )
}

function Step3AssignEmployees() {
  const locale = useLocale()
  const isAr = locale === 'ar'
  const { data: employees, isLoading: loadingEmps } = useEmployees()
  const { data: departments } = useDepartments()
  const updateEmployee = useUpdateEmployee()

  if (loadingEmps) return <div className="text-muted-foreground text-sm">Loading…</div>

  const handleAssign = async (employeeId: string, departmentId: string) => {
    await updateEmployee.mutateAsync({
      id: employeeId,
      departmentId: departmentId === '' ? null : departmentId,
    })
  }

  if (!employees?.length) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
        <div className="mb-2 text-3xl">👤</div>
        <div className="font-medium">{isAr ? 'لا يوجد موظفون بعد' : 'No employees yet'}</div>
        <p className="text-muted-foreground mt-1 text-sm">
          {isAr
            ? 'أضف موظفين من صفحة الموظفين أولاً'
            : 'Add employees from the Employees page first'}
        </p>
      </div>
    )
  }

  const unassignedCount = employees.filter((e) => !e.departmentId).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <div>
          {isAr ? 'إجمالي الموظفين:' : 'Total employees:'} <strong>{employees.length}</strong>
        </div>
        {unassignedCount > 0 && (
          <div className="rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-800">
            {isAr ? `بدون قسم: ${unassignedCount}` : `Unassigned: ${unassignedCount}`}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-start font-medium">{isAr ? 'الموظف' : 'Employee'}</th>
              <th className="px-4 py-2 text-start font-medium">{isAr ? 'القسم' : 'Department'}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-3">
                  <div className="font-medium">
                    {isAr ? emp.fullNameAr : (emp.fullNameEn ?? emp.fullNameAr)}
                  </div>
                  <div className="text-muted-foreground text-xs">{emp.email}</div>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={emp.departmentId ?? ''}
                    onChange={(e) => handleAssign(emp.id, e.target.value)}
                    disabled={updateEmployee.isPending}
                    className="rounded-md border border-gray-300 px-2 py-1 text-sm"
                  >
                    <option value="">— {isAr ? 'بدون قسم' : 'Unassigned'} —</option>
                    {departments?.map((d) => (
                      <option key={d.id} value={d.id}>
                        {isAr ? d.nameAr : (d.nameEn ?? d.nameAr)}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
