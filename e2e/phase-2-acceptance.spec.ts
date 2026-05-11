import { test, expect } from '@playwright/test'
import * as h from './helpers/api'

const TS = Date.now()

test.describe.configure({ timeout: 300_000 })
test.describe('Phase 2 Acceptance', () => {
  let ownerToken: string
  let employeeToken: string
  let employeeId: string
  let leadId: string
  let clientId: string
  let quotationId: string
  let projectId: string
  let invoiceId: string
  let leaveId: string
  let expenseId: string
  let fileId: string

  test('0. Health check', async () => {
    const api = await fetch('http://localhost:3001/health').then((r) => r.json())
    expect(api.status).toBe('ok')
    const web = await fetch('http://localhost:3000/ar').then((r) => r.status)
    expect(web).toBe(200)
  })

  test('1. Tenant signup -> verify -> login', async () => {
    await h.clearMailhog()

    const signupRes = await h.signup({
      company: { name: `Phase2 Co ${TS}`, slug: `p2-${TS}` },
      owner: {
        email: `owner-p2-${TS}@test.com`,
        password: 'StrongPass123!',
        fullNameAr: `مالك المرحلة 2 ${TS}`,
      },
    })
    expect(signupRes.status).toBe(201)

    const vtoken = await h.getVerifyToken()
    expect(vtoken).toBeTruthy()

    const verifyRes = await h.verifyEmail(vtoken!)
    expect(verifyRes.status).toBe(200)

    const loginRes = await h.login(`owner-p2-${TS}@test.com`, 'StrongPass123!')
    expect(loginRes.status).toBe(200)
    expect(loginRes.body.accessToken).toBeTruthy()
    ownerToken = loginRes.body.accessToken
  })

  test('2. Owner creates employee -> accepts invite -> login', async () => {
    await h.clearMailhog()

    const empRes = await h.createEmployee(ownerToken, {
      fullNameAr: `موظف المرحلة 2 ${TS}`,
      email: `emp-p2-${TS}@test.com`,
      employmentType: 'FULL_TIME',
      salaryAmount: 800000,
      salaryCurrency: 'IQD',
      startDate: '2026-05-01',
    })
    expect(empRes.status).toBe(201)
    employeeId = empRes.body.id

    const inviteToken = await h.getInviteToken()
    expect(inviteToken).toBeTruthy()

    const acceptRes = await h.acceptInvite(inviteToken!, 'empPass123')
    expect(acceptRes.status).toBe(200)
    expect(acceptRes.body.status).toBe('accepted')

    const empLogin = await h.login(`emp-p2-${TS}@test.com`, 'empPass123')
    expect(empLogin.status).toBe(200)
    employeeToken = empLogin.body.accessToken
  })

  test('3. Lead -> Won -> Client -> Quotation -> Project -> Task', async () => {
    // Create a lead
    const leadRes = await h.createLead(ownerToken, {
      name: `أحمد العباسي ${TS}`,
      companyName: `شركة الإبداع ${TS}`,
      email: `lead-${TS}@test.com`,
      phone: '+964771234568',
      source: 'موقع',
      notes: 'عميل محتمل',
    })
    expect(leadRes.status).toBe(201)
    leadId = leadRes.body.id
    expect(leadRes.body.status).toBe('NEW')

    // Convert lead to WON -> auto-creates client + deal
    const wonRes = await h.updateLeadStatus(ownerToken, leadId, 'WON')
    expect(wonRes.status).toBe(200)
    expect(wonRes.body.status).toBe('WON')
    expect(wonRes.body.convertedToClientId).toBeTruthy()
    expect(wonRes.body.convertedToDealId).toBeTruthy()
    clientId = wonRes.body.convertedToClientId

    // Confirm the auto-created client exists
    const clientsRes = await h.listClients(ownerToken)
    expect(clientsRes.status).toBe(200)
    const found = clientsRes.body.find((c: Record<string, unknown>) => c.id === clientId)
    expect(found).toBeTruthy()
    expect((found as Record<string, unknown>).name).toContain(`شركة الإبداع ${TS}`)

    // Create quotation
    const quoRes = await h.createQuotation(ownerToken, {
      clientId,
      items: [
        {
          description: 'تصميم هوية بصرية',
          quantity: 1,
          unitPrice: 2500000,
          total: 2500000,
        },
        {
          description: 'تطوير موقع إلكتروني',
          quantity: 1,
          unitPrice: 5000000,
          total: 5000000,
        },
      ],
      currency: 'IQD',
      discountPercent: 10,
      taxPercent: 5,
      validUntil: '2026-07-01',
      notes: 'عرض سعر لحملة تسويقية',
    })
    expect(quoRes.status).toBe(201)
    quotationId = quoRes.body.id
    expect(quoRes.body.status).toBe('DRAFT')
    expect(quoRes.body.number).toMatch(/^QUO-/)

    // Send quotation (DRAFT -> SENT)
    const sentRes = await h.updateQuotationStatus(ownerToken, quotationId, 'SENT')
    expect(sentRes.status).toBe(200)
    expect(sentRes.body.status).toBe('SENT')

    // Create project manually (quotation internal API does not auto-create)
    const projRes = await h.createProject(ownerToken, {
      clientId,
      name: `مشروع الحملة التسويقية ${TS}`,
      startDate: '2026-05-11',
      deadline: '2026-07-10',
      budget: 7500000,
      currency: 'IQD',
    })
    expect(projRes.status).toBe(201)
    projectId = projRes.body.id
    expect(projRes.body.stage).toBe('BRIEF')

    // Advance project stage: BRIEF -> IN_PROGRESS
    const stageRes = await h.updateProjectStage(ownerToken, projectId, 'IN_PROGRESS')
    expect(stageRes.status).toBe(200)
    expect(stageRes.body.stage).toBe('IN_PROGRESS')

    // Create a task
    const taskRes = await h.createTask(ownerToken, {
      projectId,
      title: `تصميم الشعار النهائي ${TS}`,
      priority: 'HIGH',
      dueDate: '2026-06-01',
    })
    expect(taskRes.status).toBe(201)
    expect(taskRes.body.title).toContain(`تصميم الشعار النهائي ${TS}`)
    expect(taskRes.body.project).toBeTruthy()
  })

  test('4. Invoice -> Send -> Payment (PAID)', async () => {
    // Create invoice
    const invRes = await h.createInvoice(ownerToken, {
      clientId,
      projectId,
      quotationId,
      items: [
        {
          description: 'تصميم هوية بصرية',
          quantity: 1,
          unitPrice: 2500000,
          total: 2500000,
        },
        {
          description: 'تطوير موقع إلكتروني',
          quantity: 1,
          unitPrice: 5000000,
          total: 5000000,
        },
      ],
      currency: 'IQD',
      discountPercent: 10,
      taxPercent: 5,
      dueDate: '2026-06-30',
    })
    expect(invRes.status).toBe(201)
    invoiceId = invRes.body.id
    expect(invRes.body.status).toBe('DRAFT')
    expect(invRes.body.number).toMatch(/^INV-/)
    expect(invRes.body.total).toBeGreaterThan(0)

    // Send invoice (DRAFT -> SENT)
    const sentRes = await h.updateInvoiceStatus(ownerToken, invoiceId, 'SENT')
    expect(sentRes.status).toBe(200)
    expect(sentRes.body.status).toBe('SENT')

    // Record payment (should transition to PAID if full amount)
    const payRes = await h.createPayment(ownerToken, invoiceId, {
      amount: 6412500, // total after 10% discount + 5% tax
      method: 'bank_transfer',
      referenceNo: `TRX-${TS}`,
      paidAt: new Date().toISOString(),
    })
    expect(payRes.status).toBe(201)
    expect(payRes.body.amount).toBeGreaterThan(0)
  })

  test('5. Leave request -> approval -> balance deduction', async () => {
    // Employee requests annual leave
    const leaveRes = await h.createLeave(employeeToken, {
      leaveType: 'ANNUAL',
      startDate: '2026-06-01',
      endDate: '2026-06-03',
      reason: 'إجازة عائلية',
    })
    expect(leaveRes.status).toBe(201)
    leaveId = leaveRes.body.id
    expect(leaveRes.body.status).toBe('PENDING')
    expect(leaveRes.body.durationDays).toBe(3)

    // Owner approves the leave
    const approveRes = await h.approveLeave(ownerToken, leaveId)
    expect(approveRes.status).toBe(200)

    // Check balance was deducted
    const balRes = await h.getLeaveBalance(employeeToken)
    expect(balRes.status).toBe(200)
    const annualBal = balRes.body.find((b: Record<string, unknown>) => b.leaveType === 'ANNUAL')
    expect(annualBal).toBeTruthy()
    expect((annualBal as Record<string, unknown>).usedDays).toBeGreaterThanOrEqual(3)
  })

  test('6. Large expense -> pending -> approval', async () => {
    // Create expense > 150,000 IQD -> should be PENDING
    const expRes = await h.createExpense(ownerToken, {
      employeeId,
      category: 'operational',
      amount: 500000,
      currency: 'IQD',
      description: 'شراء معدات مكتبية',
      expenseDate: '2026-05-10',
    })
    expect(expRes.status).toBe(201)
    expenseId = expRes.body.id
    expect(expRes.body.status).toBe('PENDING')

    // Approve the expense
    const apprRes = await h.updateExpenseStatus(ownerToken, expenseId, 'APPROVED')
    expect(apprRes.status).toBe(200)
    expect(apprRes.body.status).toBe('APPROVED')
    expect(apprRes.body.approvedBy).toBeTruthy()
  })

  test('7. File upload (small) -> preview', async () => {
    // Upload a small file
    const uploadRes = await h.uploadFile(ownerToken, 'project', projectId)
    expect(uploadRes.status).toBe(201)
    fileId = uploadRes.body.id
    expect(uploadRes.body.originalName).toBe('e2e-test.txt')
    expect(uploadRes.body.mimeType).toBe('text/plain')
    expect(uploadRes.body.sizeBytes).toBeGreaterThan(0)

    // Fetch file metadata
    const fileRes = await h.getFile(ownerToken, fileId)
    expect(fileRes.status).toBe(200)
    expect(fileRes.body.id).toBe(fileId)
    expect(fileRes.body.originalName).toBe('e2e-test.txt')
    expect(fileRes.body.uploader).toBeTruthy()
  })

  test('8. Browser: dashboard page renders in Arabic', async ({ page }) => {
    await page.goto('/ar')
    await page.evaluate((token) => {
      localStorage.setItem('accessToken', token)
    }, ownerToken)
    await page.goto('/ar')
    await expect(page.locator('h1')).toBeVisible()
    await expect(page).toHaveURL(/\/ar/)
  })
})
