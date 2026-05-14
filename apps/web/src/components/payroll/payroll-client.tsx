'use client'

import { useState } from 'react'
import { Banknote, Users, TrendingUp, CheckCircle, Clock, XCircle, ChevronDown } from 'lucide-react'
import { useLocale } from 'next-intl'
import { usePayrollRuns, type PayrollRun } from '@/hooks/use-payroll'
import { useLeaves, type Leave } from '@/hooks/use-leaves'
import { useApproveLeave, useRejectLeave } from '@/hooks/use-leaves'
import { cn } from '@/lib/utils'

const STATIC_RUN: PayrollRun = {
  id: 'run-apr-2026',
  month: 4,
  year: 2026,
  status: 'FINALIZED',
  totalAmount: 31_500_000,
  currency: 'IQD',
  finalizedAt: '2026-04-30T12:00:00Z',
  processedAt: '2026-04-30T12:00:00Z',
  createdAt: '2026-04-01T00:00:00Z',
  entries: [
    {
      id: 'e1',
      employeeId: '1',
      baseSalary: 5_000_000,
      additions: 500_000,
      deductions: 0,
      netAmount: 5_500_000,
      attendanceDays: 22,
      lateDays: 0,
      absentDays: 0,
      notes: null,
      employee: {
        id: '1',
        fullNameAr: 'أحمد العبادي',
        fullNameEn: 'Ahmed Al-Abbadi',
        employeeCode: 'EMP-001',
      },
    },
    {
      id: 'e2',
      employeeId: '2',
      baseSalary: 4_000_000,
      additions: 0,
      deductions: 0,
      netAmount: 4_000_000,
      attendanceDays: 22,
      lateDays: 1,
      absentDays: 0,
      notes: null,
      employee: {
        id: '2',
        fullNameAr: 'سارة جاسم',
        fullNameEn: 'Sara Jasim',
        employeeCode: 'EMP-002',
      },
    },
    {
      id: 'e3',
      employeeId: '3',
      baseSalary: 4_500_000,
      additions: 200_000,
      deductions: 300_000,
      netAmount: 4_400_000,
      attendanceDays: 20,
      lateDays: 3,
      absentDays: 2,
      notes: null,
      employee: {
        id: '3',
        fullNameAr: 'محمد الحسيني',
        fullNameEn: 'Mohammed Al-Husseini',
        employeeCode: 'EMP-003',
      },
    },
    {
      id: 'e4',
      employeeId: '4',
      baseSalary: 3_500_000,
      additions: 0,
      deductions: 0,
      netAmount: 3_500_000,
      attendanceDays: 22,
      lateDays: 0,
      absentDays: 0,
      notes: null,
      employee: {
        id: '4',
        fullNameAr: 'نور الخفاجي',
        fullNameEn: 'Noor Al-Khafaji',
        employeeCode: 'EMP-004',
      },
    },
    {
      id: 'e5',
      employeeId: '5',
      baseSalary: 3_800_000,
      additions: 0,
      deductions: 0,
      netAmount: 3_800_000,
      attendanceDays: 22,
      lateDays: 0,
      absentDays: 0,
      notes: null,
      employee: {
        id: '5',
        fullNameAr: 'علي الربيعي',
        fullNameEn: 'Ali Al-Rubai',
        employeeCode: 'EMP-005',
      },
    },
    {
      id: 'e6',
      employeeId: '6',
      baseSalary: 4_200_000,
      additions: 300_000,
      deductions: 0,
      netAmount: 4_500_000,
      attendanceDays: 22,
      lateDays: 0,
      absentDays: 0,
      notes: null,
      employee: {
        id: '6',
        fullNameAr: 'زينب الموسوي',
        fullNameEn: 'Zainab Al-Mosawi',
        employeeCode: 'EMP-006',
      },
    },
    {
      id: 'e7',
      employeeId: '7',
      baseSalary: 4_000_000,
      additions: 0,
      deductions: 200_000,
      netAmount: 3_800_000,
      attendanceDays: 21,
      lateDays: 1,
      absentDays: 1,
      notes: null,
      employee: {
        id: '7',
        fullNameAr: 'حسن العلي',
        fullNameEn: 'Hassan Al-Ali',
        employeeCode: 'EMP-007',
      },
    },
    {
      id: 'e8',
      employeeId: '8',
      baseSalary: 2_000_000,
      additions: 0,
      deductions: 0,
      netAmount: 2_000_000,
      attendanceDays: 11,
      lateDays: 0,
      absentDays: 0,
      notes: null,
      employee: {
        id: '8',
        fullNameAr: 'فاطمة الزبيدي',
        fullNameEn: 'Fatima Al-Zubaidi',
        employeeCode: 'EMP-008',
      },
    },
  ],
}

const STATIC_LEAVES: Leave[] = [
  {
    id: 'l1',
    companyId: 'c1',
    employeeId: '7',
    leaveType: 'ANNUAL',
    status: 'PENDING',
    startDate: '2026-05-20',
    endDate: '2026-05-24',
    durationDays: 5,
    reason: 'سفر عائلي',
    rejectionReason: null,
    approvedBy: null,
    approvedAt: null,
    createdAt: '2026-05-14T00:00:00Z',
    employee: {
      id: '7',
      fullNameAr: 'حسن العلي',
      fullNameEn: 'Hassan Al-Ali',
      employeeCode: 'EMP-007',
    },
  },
  {
    id: 'l2',
    companyId: 'c1',
    employeeId: '3',
    leaveType: 'SICK',
    status: 'PENDING',
    startDate: '2026-05-15',
    endDate: '2026-05-16',
    durationDays: 2,
    reason: 'مراجعة طبية',
    rejectionReason: null,
    approvedBy: null,
    approvedAt: null,
    createdAt: '2026-05-14T00:00:00Z',
    employee: {
      id: '3',
      fullNameAr: 'محمد الحسيني',
      fullNameEn: 'Mohammed Al-Husseini',
      employeeCode: 'EMP-003',
    },
  },
  {
    id: 'l3',
    companyId: 'c1',
    employeeId: '5',
    leaveType: 'PERSONAL',
    status: 'APPROVED',
    startDate: '2026-05-10',
    endDate: '2026-05-10',
    durationDays: 1,
    reason: 'أمر شخصي',
    rejectionReason: null,
    approvedBy: 'owner',
    approvedAt: '2026-05-09T10:00:00Z',
    createdAt: '2026-05-09T00:00:00Z',
    employee: {
      id: '5',
      fullNameAr: 'علي الربيعي',
      fullNameEn: 'Ali Al-Rubai',
      employeeCode: 'EMP-005',
    },
  },
]

const LEAVE_TYPE_AR: Record<string, string> = {
  ANNUAL: 'سنوية',
  SICK: 'مرضية',
  PERSONAL: 'شخصية',
  MATERNITY: 'أمومة',
  PATERNITY: 'أبوة',
  UNPAID: 'بدون راتب',
  OTHER: 'أخرى',
}
const LEAVE_TYPE_EN: Record<string, string> = {
  ANNUAL: 'Annual',
  SICK: 'Sick',
  PERSONAL: 'Personal',
  MATERNITY: 'Maternity',
  PATERNITY: 'Paternity',
  UNPAID: 'Unpaid',
  OTHER: 'Other',
}

const LEAVE_STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-400/10 text-amber-400',
  APPROVED: 'bg-emerald-400/10 text-emerald-400',
  REJECTED: 'bg-red-400/10 text-red-400',
  CANCELLED: 'bg-white/[0.06] text-white/40',
}

function formatMoney(n: number): string {
  return new Intl.NumberFormat('en-IQ').format(n)
}

interface RunStatusBadgeProps {
  status: string
  isAr: boolean
}
function RunStatusBadge({ status, isAr }: RunStatusBadgeProps) {
  const map = {
    DRAFT: { ar: 'مسودة', en: 'Draft', style: 'bg-white/[0.06] text-white/50' },
    FINALIZED: { ar: 'مُعتمد', en: 'Finalized', style: 'bg-sky-400/10 text-sky-400' },
    PAID: { ar: 'مدفوع', en: 'Paid', style: 'bg-emerald-400/10 text-emerald-400' },
  }
  const cfg = map[status as keyof typeof map] ?? map.DRAFT
  return (
    <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-medium', cfg.style)}>
      {isAr ? cfg.ar : cfg.en}
    </span>
  )
}

export function PayrollClient() {
  const locale = useLocale()
  const isAr = locale === 'ar'
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)

  const { data: runsData } = usePayrollRuns()
  const { data: leavesData } = useLeaves({ status: 'PENDING' })
  const approveLeave = useApproveLeave()
  const rejectLeave = useRejectLeave()

  const runs = runsData ?? [STATIC_RUN]
  const leaves = leavesData ?? STATIC_LEAVES

  const currentRun = runs.find((r) => r.id === selectedRunId) ?? runs[0] ?? STATIC_RUN

  const totalNet = currentRun.entries.reduce((s, e) => s + e.netAmount, 0)
  const avgSalary =
    currentRun.entries.length > 0 ? Math.round(totalNet / currentRun.entries.length) : 0
  const pendingLeaves = leaves.filter((l) => l.status === 'PENDING').length

  const MONTHS_AR = [
    '',
    'يناير',
    'فبراير',
    'مارس',
    'أبريل',
    'مايو',
    'يونيو',
    'يوليو',
    'أغسطس',
    'سبتمبر',
    'أكتوبر',
    'نوفمبر',
    'ديسمبر',
  ]
  const MONTHS_EN = [
    '',
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  const runLabel = (r: PayrollRun) => `${isAr ? MONTHS_AR[r.month] : MONTHS_EN[r.month]} ${r.year}`

  return (
    <div className="space-y-5 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">{isAr ? 'الرواتب' : 'Payroll'}</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {isAr ? runLabel(currentRun) : runLabel(currentRun)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedRunId ?? currentRun.id}
              onChange={(e) => setSelectedRunId(e.target.value)}
              className="appearance-none rounded-lg border border-white/[0.06] bg-white/[0.03] py-2 pe-8 ps-3 text-sm text-white/80 outline-none"
            >
              {runs.map((r) => (
                <option key={r.id} value={r.id}>
                  {runLabel(r)}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute end-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
          </div>
          <RunStatusBadge status={currentRun.status} isAr={isAr} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              {isAr ? 'إجمالي الرواتب' : 'Total Payroll'}
            </p>
            <div className="rounded-lg bg-white/[0.06] p-2">
              <Banknote className="h-4 w-4 text-sky-400" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold">{formatMoney(totalNet)}</p>
          <p className="text-muted-foreground mt-1 text-xs">
            {isAr ? 'دينار عراقي' : 'Iraqi Dinar'}
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              {isAr ? 'متوسط الراتب' : 'Avg Salary'}
            </p>
            <div className="rounded-lg bg-white/[0.06] p-2">
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold">{formatMoney(avgSalary)}</p>
          <p className="text-muted-foreground mt-1 text-xs">{isAr ? 'لكل موظف' : 'Per employee'}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              {isAr ? 'طلبات إجازة' : 'Leave Requests'}
            </p>
            <div className="rounded-lg bg-white/[0.06] p-2">
              <Users className="h-4 w-4 text-amber-400" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold">{pendingLeaves}</p>
          <p className="text-muted-foreground mt-1 text-xs">
            {isAr ? 'بانتظار الموافقة' : 'Pending approval'}
          </p>
        </div>
      </div>

      {/* Leave Requests */}
      {leaves.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <div className="border-b border-white/[0.06] px-5 py-3.5">
            <h3 className="text-sm font-semibold">{isAr ? 'طلبات الإجازة' : 'Leave Requests'}</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.04]">
                <th className="text-muted-foreground px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider">
                  {isAr ? 'الموظف' : 'Employee'}
                </th>
                <th className="text-muted-foreground hidden px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider sm:table-cell">
                  {isAr ? 'النوع' : 'Type'}
                </th>
                <th className="text-muted-foreground hidden px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider md:table-cell">
                  {isAr ? 'الفترة' : 'Period'}
                </th>
                <th className="text-muted-foreground px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider">
                  {isAr ? 'الحالة' : 'Status'}
                </th>
                <th className="text-muted-foreground px-4 py-3 text-end text-[11px] font-semibold uppercase tracking-wider">
                  {isAr ? 'إجراء' : 'Action'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {leaves.map((leave) => (
                <tr key={leave.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-4 py-3.5">
                    <div className="font-medium">
                      {isAr ? leave.employee.fullNameAr : leave.employee.fullNameEn}
                    </div>
                    <div className="text-muted-foreground font-mono text-[11px]">
                      {leave.employee.employeeCode}
                    </div>
                  </td>
                  <td className="text-muted-foreground hidden px-4 py-3.5 text-sm sm:table-cell">
                    {isAr
                      ? (LEAVE_TYPE_AR[leave.leaveType] ?? leave.leaveType)
                      : (LEAVE_TYPE_EN[leave.leaveType] ?? leave.leaveType)}{' '}
                    · {leave.durationDays}d
                  </td>
                  <td className="text-muted-foreground hidden px-4 py-3.5 text-sm md:table-cell">
                    {new Date(leave.startDate).toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB')}
                    {' → '}
                    {new Date(leave.endDate).toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB')}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-[11px] font-medium',
                        LEAVE_STATUS_STYLES[leave.status] ?? 'bg-white/[0.06] text-white/40',
                      )}
                    >
                      {leave.status === 'PENDING'
                        ? isAr
                          ? 'معلّق'
                          : 'Pending'
                        : leave.status === 'APPROVED'
                          ? isAr
                            ? 'موافق'
                            : 'Approved'
                          : leave.status === 'REJECTED'
                            ? isAr
                              ? 'مرفوض'
                              : 'Rejected'
                            : leave.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {leave.status === 'PENDING' && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => approveLeave.mutate(leave.id)}
                          disabled={approveLeave.isPending}
                          className="flex items-center gap-1 rounded-md bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400 transition-colors hover:bg-emerald-400/20 disabled:opacity-50"
                        >
                          <CheckCircle className="h-3 w-3" />
                          {isAr ? 'قبول' : 'Approve'}
                        </button>
                        <button
                          onClick={() =>
                            rejectLeave.mutate({ id: leave.id, rejectionReason: 'rejected' })
                          }
                          disabled={rejectLeave.isPending}
                          className="flex items-center gap-1 rounded-md bg-red-400/10 px-2.5 py-1 text-[11px] font-medium text-red-400 transition-colors hover:bg-red-400/20 disabled:opacity-50"
                        >
                          <XCircle className="h-3 w-3" />
                          {isAr ? 'رفض' : 'Reject'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payroll Table */}
      <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3.5">
          <h3 className="text-sm font-semibold">
            {isAr ? 'كشف الرواتب' : 'Payroll Sheet'} — {runLabel(currentRun)}
          </h3>
          <div className="text-muted-foreground flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-xs">
              {currentRun.entries.length} {isAr ? 'موظف' : 'employees'}
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.04]">
                <th className="text-muted-foreground px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider">
                  {isAr ? 'الموظف' : 'Employee'}
                </th>
                <th className="text-muted-foreground hidden px-4 py-3 text-end text-[11px] font-semibold uppercase tracking-wider sm:table-cell">
                  {isAr ? 'الراتب الأساسي' : 'Base Salary'}
                </th>
                <th className="text-muted-foreground hidden px-4 py-3 text-end text-[11px] font-semibold uppercase tracking-wider md:table-cell">
                  {isAr ? 'إضافات' : 'Additions'}
                </th>
                <th className="text-muted-foreground hidden px-4 py-3 text-end text-[11px] font-semibold uppercase tracking-wider md:table-cell">
                  {isAr ? 'خصومات' : 'Deductions'}
                </th>
                <th className="text-muted-foreground px-4 py-3 text-end text-[11px] font-semibold uppercase tracking-wider">
                  {isAr ? 'الصافي' : 'Net'}
                </th>
                <th className="text-muted-foreground hidden px-4 py-3 text-end text-[11px] font-semibold uppercase tracking-wider lg:table-cell">
                  {isAr ? 'أيام الحضور' : 'Days'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {currentRun.entries.map((entry) => (
                <tr key={entry.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-4 py-3.5">
                    <div className="font-medium">
                      {isAr ? entry.employee.fullNameAr : entry.employee.fullNameEn}
                    </div>
                    <div className="text-muted-foreground font-mono text-[11px]">
                      {entry.employee.employeeCode}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3.5 text-end font-mono text-sm sm:table-cell">
                    {formatMoney(entry.baseSalary)}
                  </td>
                  <td className="hidden px-4 py-3.5 text-end font-mono text-sm text-emerald-400 md:table-cell">
                    {entry.additions > 0 ? `+${formatMoney(entry.additions)}` : '—'}
                  </td>
                  <td className="hidden px-4 py-3.5 text-end font-mono text-sm text-red-400 md:table-cell">
                    {entry.deductions > 0 ? `-${formatMoney(entry.deductions)}` : '—'}
                  </td>
                  <td className="px-4 py-3.5 text-end font-mono text-sm font-semibold text-sky-300">
                    {formatMoney(entry.netAmount)}
                  </td>
                  <td className="hidden px-4 py-3.5 text-end text-sm text-white/60 lg:table-cell">
                    <span className="text-emerald-400">{entry.attendanceDays}</span>
                    {entry.absentDays > 0 && (
                      <span className="ms-1 text-red-400">
                        /{entry.absentDays} {isAr ? 'غياب' : 'abs'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/[0.06] bg-white/[0.02]">
                <td className="px-4 py-3 text-sm font-semibold" colSpan={4}>
                  {isAr ? 'الإجمالي' : 'Total'}
                </td>
                <td className="px-4 py-3 text-end font-mono text-sm font-bold text-sky-300">
                  {formatMoney(totalNet)}
                </td>
                <td className="hidden lg:table-cell" />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
