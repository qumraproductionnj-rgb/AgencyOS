'use client'

import { useState } from 'react'
import { Search, UserPlus, X, Mail, Phone, Building2, Calendar, BadgeCheck } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { useLocale } from 'next-intl'
import { useEmployees, type Employee } from '@/hooks/use-employees'
import { cn } from '@/lib/utils'

const STATIC_EMPLOYEES: Employee[] = [
  {
    id: '1',
    userId: 'u1',
    employeeCode: 'EMP-001',
    fullNameAr: 'أحمد العبادي',
    fullNameEn: 'Ahmed Al-Abbadi',
    email: 'ahmed@ruyavision.iq',
    phone: '+964 770 111 2233',
    position: 'مدير إبداعي',
    departmentId: 'd1',
    department: { id: 'd1', nameAr: 'الإنتاج الإبداعي', nameEn: 'Creative Production' },
    employmentType: 'FULL_TIME',
    status: 'ACTIVE',
    startDate: '2023-01-15',
    createdAt: '2023-01-15T00:00:00Z',
  },
  {
    id: '2',
    userId: 'u2',
    employeeCode: 'EMP-002',
    fullNameAr: 'سارة جاسم',
    fullNameEn: 'Sara Jasim',
    email: 'sara@ruyavision.iq',
    phone: '+964 770 222 3344',
    position: 'مصممة جرافيك',
    departmentId: 'd1',
    department: { id: 'd1', nameAr: 'الإنتاج الإبداعي', nameEn: 'Creative Production' },
    employmentType: 'FULL_TIME',
    status: 'ACTIVE',
    startDate: '2023-03-01',
    createdAt: '2023-03-01T00:00:00Z',
  },
  {
    id: '3',
    userId: 'u3',
    employeeCode: 'EMP-003',
    fullNameAr: 'محمد الحسيني',
    fullNameEn: 'Mohammed Al-Husseini',
    email: 'mohammed@ruyavision.iq',
    phone: '+964 770 333 4455',
    position: 'مدير مبيعات',
    departmentId: 'd2',
    department: { id: 'd2', nameAr: 'المبيعات والتسويق', nameEn: 'Sales & Marketing' },
    employmentType: 'FULL_TIME',
    status: 'ACTIVE',
    startDate: '2023-02-10',
    createdAt: '2023-02-10T00:00:00Z',
  },
  {
    id: '4',
    userId: 'u4',
    employeeCode: 'EMP-004',
    fullNameAr: 'نور الخفاجي',
    fullNameEn: 'Noor Al-Khafaji',
    email: 'noor@ruyavision.iq',
    phone: '+964 770 444 5566',
    position: 'محاسبة',
    departmentId: 'd3',
    department: { id: 'd3', nameAr: 'المالية', nameEn: 'Finance' },
    employmentType: 'FULL_TIME',
    status: 'ACTIVE',
    startDate: '2023-04-01',
    createdAt: '2023-04-01T00:00:00Z',
  },
  {
    id: '5',
    userId: 'u5',
    employeeCode: 'EMP-005',
    fullNameAr: 'علي الربيعي',
    fullNameEn: 'Ali Al-Rubai',
    email: 'ali@ruyavision.iq',
    phone: '+964 770 555 6677',
    position: 'مصور فيديو',
    departmentId: 'd1',
    department: { id: 'd1', nameAr: 'الإنتاج الإبداعي', nameEn: 'Creative Production' },
    employmentType: 'FULL_TIME',
    status: 'ACTIVE',
    startDate: '2023-05-15',
    createdAt: '2023-05-15T00:00:00Z',
  },
  {
    id: '6',
    userId: 'u6',
    employeeCode: 'EMP-006',
    fullNameAr: 'زينب الموسوي',
    fullNameEn: 'Zainab Al-Mosawi',
    email: 'zainab@ruyavision.iq',
    phone: '+964 770 666 7788',
    position: 'منسقة مشاريع',
    departmentId: 'd4',
    department: { id: 'd4', nameAr: 'إدارة المشاريع', nameEn: 'Project Management' },
    employmentType: 'FULL_TIME',
    status: 'ACTIVE',
    startDate: '2023-06-01',
    createdAt: '2023-06-01T00:00:00Z',
  },
  {
    id: '7',
    userId: 'u7',
    employeeCode: 'EMP-007',
    fullNameAr: 'حسن العلي',
    fullNameEn: 'Hassan Al-Ali',
    email: 'hassan@ruyavision.iq',
    phone: '+964 770 777 8899',
    position: 'مطور ويب',
    departmentId: 'd5',
    department: { id: 'd5', nameAr: 'التقنية', nameEn: 'Technology' },
    employmentType: 'FULL_TIME',
    status: 'ACTIVE',
    startDate: '2023-07-01',
    createdAt: '2023-07-01T00:00:00Z',
  },
  {
    id: '8',
    userId: 'u8',
    employeeCode: 'EMP-008',
    fullNameAr: 'فاطمة الزبيدي',
    fullNameEn: 'Fatima Al-Zubaidi',
    email: 'fatima@ruyavision.iq',
    phone: '+964 770 888 9900',
    position: 'مساعدة إدارية',
    departmentId: 'd6',
    department: { id: 'd6', nameAr: 'الإدارة', nameEn: 'Administration' },
    employmentType: 'PART_TIME',
    status: 'ON_LEAVE',
    startDate: '2023-08-01',
    createdAt: '2023-08-01T00:00:00Z',
  },
]

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-400/10 text-emerald-400',
  ON_LEAVE: 'bg-amber-400/10 text-amber-400',
  INACTIVE: 'bg-red-400/10 text-red-400',
  TERMINATED: 'bg-red-400/10 text-red-400',
}

const STATUS_LABELS_AR: Record<string, string> = {
  ACTIVE: 'نشط',
  ON_LEAVE: 'إجازة',
  INACTIVE: 'غير نشط',
  TERMINATED: 'منتهي',
}

const STATUS_LABELS_EN: Record<string, string> = {
  ACTIVE: 'Active',
  ON_LEAVE: 'On Leave',
  INACTIVE: 'Inactive',
  TERMINATED: 'Terminated',
}

function getInitials(nameAr: string, nameEn: string | null): string {
  const name = nameEn || nameAr
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

const AVATAR_COLORS = [
  'from-sky-500 to-blue-600',
  'from-purple-500 to-violet-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-pink-500 to-rose-600',
  'from-cyan-500 to-sky-600',
]

interface EmployeeDrawerProps {
  employee: Employee
  open: boolean
  onClose: () => void
  isAr: boolean
}

function EmployeeDrawer({ employee, open, onClose, isAr }: EmployeeDrawerProps) {
  const colorIdx = employee.userId.charCodeAt(0) % AVATAR_COLORS.length
  const gradClass = AVATAR_COLORS[colorIdx] ?? 'from-sky-500 to-blue-600'

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            'fixed inset-y-0 z-50 flex w-[360px] flex-col',
            'border-white/[0.08] bg-[#0d0d0d]',
            'shadow-2xl',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:duration-200 data-[state=open]:duration-300',
            isAr
              ? 'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left start-0 border-e'
              : 'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right end-0 border-s',
          )}
        >
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
            <Dialog.Title className="text-sm font-semibold">
              {isAr ? 'بيانات الموظف' : 'Employee Details'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="rounded-md p-1.5 text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto p-5">
            {/* Avatar + name */}
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-base font-bold text-white',
                  gradClass,
                )}
              >
                {getInitials(employee.fullNameAr, employee.fullNameEn)}
              </div>
              <div>
                <div className="font-semibold">
                  {isAr ? employee.fullNameAr : (employee.fullNameEn ?? employee.fullNameAr)}
                </div>
                <div className="text-muted-foreground text-sm">{employee.position || '—'}</div>
                <span
                  className={cn(
                    'mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium',
                    STATUS_STYLES[employee.status] ?? 'bg-white/[0.06] text-white/50',
                  )}
                >
                  {isAr
                    ? (STATUS_LABELS_AR[employee.status] ?? employee.status)
                    : (STATUS_LABELS_EN[employee.status] ?? employee.status)}
                </span>
              </div>
            </div>

            {/* Info rows */}
            <div className="divide-y divide-white/[0.04] rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <InfoRow
                icon={<Mail className="h-3.5 w-3.5" />}
                label={isAr ? 'البريد' : 'Email'}
                value={employee.email}
              />
              <InfoRow
                icon={<Phone className="h-3.5 w-3.5" />}
                label={isAr ? 'الهاتف' : 'Phone'}
                value={employee.phone ?? '—'}
              />
              <InfoRow
                icon={<Building2 className="h-3.5 w-3.5" />}
                label={isAr ? 'القسم' : 'Dept'}
                value={
                  isAr
                    ? (employee.department?.nameAr ?? '—')
                    : (employee.department?.nameEn ?? employee.department?.nameAr ?? '—')
                }
              />
              <InfoRow
                icon={<BadgeCheck className="h-3.5 w-3.5" />}
                label={isAr ? 'الرمز' : 'Code'}
                value={employee.employeeCode}
                mono
              />
              <InfoRow
                icon={<Calendar className="h-3.5 w-3.5" />}
                label={isAr ? 'تاريخ الانضمام' : 'Joined'}
                value={new Date(employee.startDate).toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB')}
              />
            </div>

            {/* Employment type */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="text-muted-foreground mb-2 text-xs uppercase tracking-wider">
                {isAr ? 'نوع التوظيف' : 'Employment Type'}
              </div>
              <div className="text-sm font-medium">
                {employee.employmentType === 'FULL_TIME'
                  ? isAr
                    ? 'دوام كامل'
                    : 'Full Time'
                  : employee.employmentType === 'PART_TIME'
                    ? isAr
                      ? 'دوام جزئي'
                      : 'Part Time'
                    : employee.employmentType}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function InfoRow({
  icon,
  label,
  value,
  mono,
}: {
  icon: React.ReactNode
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <span className="text-muted-foreground w-20 shrink-0 text-xs">{label}</span>
      <span className={cn('min-w-0 truncate text-sm', mono && 'font-mono text-xs')}>{value}</span>
    </div>
  )
}

export function EmployeesClient() {
  const locale = useLocale()
  const isAr = locale === 'ar'
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState<Employee | null>(null)

  const { data: apiData } = useEmployees({
    search: search || undefined,
    status: statusFilter || undefined,
  })

  const employees = apiData ?? STATIC_EMPLOYEES

  const filtered = employees.filter((e) => {
    const matchSearch =
      !search ||
      e.fullNameAr.includes(search) ||
      (e.fullNameEn?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      e.employeeCode.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || e.status === statusFilter
    return matchSearch && matchStatus
  })

  const activeCount = employees.filter((e) => e.status === 'ACTIVE').length
  const onLeaveCount = employees.filter((e) => e.status === 'ON_LEAVE').length

  return (
    <div className="space-y-5 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">{isAr ? 'الموظفون' : 'Employees'}</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {isAr
              ? `${activeCount} نشط · ${onLeaveCount} في إجازة`
              : `${activeCount} active · ${onLeaveCount} on leave`}
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-sky-500/20 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-400 transition-colors hover:bg-sky-500/20">
          <UserPlus className="h-4 w-4" />
          {isAr ? 'دعوة موظف' : 'Invite Employee'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex min-w-[200px] max-w-xs flex-1 items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2">
          <Search className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? 'بحث...' : 'Search...'}
            className="placeholder:text-muted-foreground w-full bg-transparent text-sm outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-sm text-white/80 outline-none"
        >
          <option value="">{isAr ? 'كل الحالات' : 'All Statuses'}</option>
          <option value="ACTIVE">{isAr ? 'نشط' : 'Active'}</option>
          <option value="ON_LEAVE">{isAr ? 'إجازة' : 'On Leave'}</option>
          <option value="INACTIVE">{isAr ? 'غير نشط' : 'Inactive'}</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-muted-foreground px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider">
                {isAr ? 'الموظف' : 'Employee'}
              </th>
              <th className="text-muted-foreground hidden px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider sm:table-cell">
                {isAr ? 'القسم' : 'Department'}
              </th>
              <th className="text-muted-foreground hidden px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider md:table-cell">
                {isAr ? 'المنصب' : 'Position'}
              </th>
              <th className="text-muted-foreground px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider">
                {isAr ? 'الحالة' : 'Status'}
              </th>
              <th className="text-muted-foreground hidden px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider lg:table-cell">
                {isAr ? 'تاريخ الانضمام' : 'Joined'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filtered.map((emp, idx) => {
              const colorIdx = (emp.userId.charCodeAt(0) ?? idx) % AVATAR_COLORS.length
              const gradClass = AVATAR_COLORS[colorIdx] ?? 'from-sky-500 to-blue-600'
              return (
                <tr
                  key={emp.id}
                  onClick={() => setSelected(emp)}
                  className="cursor-pointer transition-colors hover:bg-white/[0.03]"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[11px] font-bold text-white',
                          gradClass,
                        )}
                      >
                        {getInitials(emp.fullNameAr, emp.fullNameEn)}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-medium">
                          {isAr ? emp.fullNameAr : (emp.fullNameEn ?? emp.fullNameAr)}
                        </div>
                        <div className="text-muted-foreground font-mono text-[11px]">
                          {emp.employeeCode}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="text-muted-foreground hidden px-4 py-3.5 sm:table-cell">
                    {isAr
                      ? (emp.department?.nameAr ?? '—')
                      : (emp.department?.nameEn ?? emp.department?.nameAr ?? '—')}
                  </td>
                  <td className="text-muted-foreground hidden px-4 py-3.5 md:table-cell">
                    {emp.position ?? '—'}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-[11px] font-medium',
                        STATUS_STYLES[emp.status] ?? 'bg-white/[0.06] text-white/50',
                      )}
                    >
                      {isAr
                        ? (STATUS_LABELS_AR[emp.status] ?? emp.status)
                        : (STATUS_LABELS_EN[emp.status] ?? emp.status)}
                    </span>
                  </td>
                  <td className="text-muted-foreground hidden px-4 py-3.5 text-sm lg:table-cell">
                    {new Date(emp.startDate).toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB')}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-muted-foreground text-sm">
              {isAr ? 'لا يوجد موظفون' : 'No employees found'}
            </p>
          </div>
        )}
      </div>

      {selected && (
        <EmployeeDrawer
          employee={selected}
          open={!!selected}
          onClose={() => setSelected(null)}
          isAr={isAr}
        />
      )}
    </div>
  )
}
