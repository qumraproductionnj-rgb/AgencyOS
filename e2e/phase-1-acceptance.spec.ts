import { test, expect } from '@playwright/test'
import * as h from './helpers/api'

const TS = Date.now()

test.describe.configure({ timeout: 300_000 })
test.describe('Phase 1 Acceptance', () => {
  let ownerToken: string
  let employeeToken: string
  let employeeId: string

  test('0. Health check', async () => {
    const api = await fetch('http://localhost:3001/health').then((r) => r.json())
    expect(api.status).toBe('ok')
    const web = await fetch('http://localhost:3000/ar').then((r) => r.status)
    expect(web).toBe(200)
  })

  test('1. Tenant signup → verify → login', async () => {
    await h.clearMailhog()

    const signupRes = await h.signup({
      company: { name: `Test Co ${TS}`, slug: `test-${TS}` },
      owner: {
        email: `owner-${TS}@test.com`,
        password: 'StrongPass123!',
        fullNameAr: `مالك اختبار ${TS}`,
      },
    })
    expect(signupRes.status).toBe(201)

    const vtoken = await h.getVerifyToken()
    expect(vtoken).toBeTruthy()

    const verifyRes = await h.verifyEmail(vtoken!)
    expect(verifyRes.status).toBe(200)

    const loginRes = await h.login(`owner-${TS}@test.com`, 'StrongPass123!')
    expect(loginRes.status).toBe(200)
    expect(loginRes.body.accessToken).toBeTruthy()
    ownerToken = loginRes.body.accessToken
  })

  test('2. Owner creates employee → employee accepts invite', async () => {
    await h.clearMailhog()

    const empRes = await h.createEmployee(ownerToken, {
      fullNameAr: `موظف اختبار ${TS}`,
      email: `emp-${TS}@test.com`,
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

    const empLogin = await h.login(`emp-${TS}@test.com`, 'empPass123')
    expect(empLogin.status).toBe(200)
    employeeToken = empLogin.body.accessToken
  })

  test('3. Employee check-in within radius (success)', async () => {
    await h.clearMailhog()

    const locRes = await h.createWorkLocation(ownerToken, {
      name: 'Baghdad Office',
      nameEn: 'Baghdad Office',
      latitude: 33.3152,
      longitude: 44.3661,
      radiusMeters: 200,
      address: 'Baghdad, Iraq',
    })
    expect(locRes.status).toBe(201)
    const locId = locRes.body.id

    const assignRes = await h.assignEmployeeToLocation(ownerToken, locId, [employeeId])
    expect(assignRes.status).toBe(201)

    const checkInRes = await h.checkIn(employeeToken, { latitude: 33.3155, longitude: 44.3664 })
    expect(checkInRes.status).toBe(201)
    expect(checkInRes.body.status).toMatch(/^(PRESENT|LATE)$/)
  })

  test('4. Employee check-in outside radius (rejected)', async () => {
    const failRes = await h.checkIn(employeeToken, { latitude: 33.35, longitude: 44.4 })
    expect(failRes.status).toBe(403)
    expect(failRes.body.detail).toContain('OUT_OF_RANGE')
  })

  test('5. HR dashboard shows employee attendance', async () => {
    const todayRes = await h.getTodayAll(ownerToken)
    expect(todayRes.status).toBe(200)
    expect(Array.isArray(todayRes.body)).toBe(true)
    const emp = todayRes.body.find((e: Record<string, unknown>) => e.id === employeeId)
    expect(emp).toBeTruthy()
    expect((emp as Record<string, unknown>).attendanceRecords).toBeDefined()
  })

  test('6. Browser: home page renders in Arabic', async ({ page }) => {
    await page.goto('/ar')
    await expect(page.locator('h1')).toBeVisible()
    await expect(page).toHaveURL(/\/ar/)
  })

  test('7. Browser: employees page loads with auth', async ({ page }) => {
    await page.goto('/ar')
    await page.evaluate((token) => {
      localStorage.setItem('accessToken', token)
    }, ownerToken)
    await page.goto('/ar/employees')
    await expect(page).toHaveURL(/\/ar\/employees/)
  })
})
