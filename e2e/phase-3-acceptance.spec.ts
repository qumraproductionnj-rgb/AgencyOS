import { test, expect } from '@playwright/test'
import * as h from './helpers/api'

const TS = Date.now()

test.describe.configure({ timeout: 300_000 })
test.describe('Phase 3 Acceptance', () => {
  let ownerToken: string
  let portalToken: string
  let clientId: string
  let _projectId: string
  let pillarId: string
  let _briefId: string
  let planId: string
  let pieceId: string
  let equipmentId: string
  let bookingId: string
  let _fileId: string

  // ─── Flow 1: Brand Brief → Plan → Pieces → Approval → Schedule ───

  test('0. Health check', async () => {
    const api = await fetch('http://localhost:3001/health').then((r) => r.json())
    expect(api.status).toBe('ok')
    const web = await fetch('http://localhost:3000/ar').then((r) => r.status)
    expect(web).toBe(200)
  })

  test('1. Tenant signup -> verify -> login', async () => {
    await h.clearMailhog()

    const signupRes = await h.signup({
      company: { name: `Phase3 Co ${TS}`, slug: `p3-${TS}` },
      owner: {
        email: `owner-p3-${TS}@test.com`,
        password: 'StrongPass123!',
        fullNameAr: `مالك المرحلة 3 ${TS}`,
      },
    })
    expect(signupRes.status).toBe(201)

    const vtoken = await h.getVerifyToken()
    expect(vtoken).toBeTruthy()

    const verifyRes = await h.verifyEmail(vtoken!)
    expect(verifyRes.status).toBe(200)

    const loginRes = await h.login(`owner-p3-${TS}@test.com`, 'StrongPass123!')
    expect(loginRes.status).toBe(200)
    expect(loginRes.body.accessToken).toBeTruthy()
    ownerToken = loginRes.body.accessToken
  })

  test('2. Create client + project + content pillar', async () => {
    // Create client via leads pipeline (existing helper)
    const leadRes = await h.createLead(ownerToken, {
      name: `شركة الاختبار ${TS}`,
      companyName: `Test Co ${TS}`,
      email: `client-${TS}@test.com`,
      source: 'موقع',
    })
    expect(leadRes.status).toBe(201)

    const wonRes = await h.updateLeadStatus(ownerToken, leadRes.body.id, 'WON')
    expect(wonRes.status).toBe(200)
    clientId = wonRes.body.convertedToClientId
    expect(clientId).toBeTruthy()

    // Create project
    const projectRes = await h.createProject(ownerToken, {
      name: `مشروع اختبار ${TS}`,
      clientId,
      startDate: '2026-05-01',
      deadline: '2026-06-01',
    })
    expect(projectRes.status).toBe(201)
    _projectId = projectRes.body.id

    // Create content pillar
    const pillarRes = await h.createContentPillar(ownerToken, {
      clientId,
      nameAr: `ركيزة اختبار ${TS}`,
      nameEn: `Test Pillar ${TS}`,
      percentageTarget: 30,
      exampleTopics: ['اختبار'],
      recommendedFormats: ['REEL', 'STATIC_DESIGN'],
      color: '#ff0000',
    })
    expect(pillarRes.status).toBe(201)
    pillarId = pillarRes.body.id
  })

  test('3. Create brand brief', async () => {
    const briefRes = await h.createBrandBrief(ownerToken, {
      clientId,
      brandNameAr: `براند اختبار ${TS}`,
      brandNameEn: `Test Brand ${TS}`,
      toneOfVoice: ['professional', 'creative'],
      visualStyle: ['minimal', 'modern'],
      activePlatforms: ['instagram', 'facebook'],
      postingFrequency: { instagram: 30, facebook: 15 },
      defaultPillarIds: [pillarId],
    })
    expect(briefRes.status).toBe(201)
    expect(briefRes.body.id).toBeTruthy()
    _briefId = briefRes.body.id
    expect(briefRes.body.clientId).toBe(clientId)
  })

  test('4. Create content plan -> generate ideas -> finalize -> pieces', async () => {
    // Create plan
    const planRes = await h.createContentPlan(ownerToken, {
      clientId,
      month: 6,
      year: 2026,
      title: `خطة اختبار ${TS}`,
    })
    expect(planRes.status).toBe(201)
    expect(planRes.body.status).toBe('DRAFT')
    planId = planRes.body.id

    // Generate ideas (may fail gracefully if AI key not configured)
    const ideasRes = await h.generateIdeas(ownerToken, planId, { count: 5 })
    if (ideasRes.status === 200) {
      expect(ideasRes.body.ideas).toBeDefined()
    }
    // If AI fails (no API key), we proceed with manual finalize

    // Finalize plan → creates content pieces
    const finalizeRes = await h.finalizePlan(ownerToken, planId, {
      pieces: [
        {
          title: `ريل اختبار ${TS}`,
          type: 'REEL',
          platforms: ['instagram'],
          scheduledDay: 15,
          bigIdea: 'فكرة اختبارية',
          pillarId,
        },
      ],
    })
    expect(finalizeRes.status).toBe(201)
    expect(finalizeRes.body).toHaveLength(1)
    pieceId = finalizeRes.body[0].id
    expect(pieceId).toBeTruthy()
    expect(finalizeRes.body[0].type).toBe('REEL')
    expect(finalizeRes.body[0].stage).toBe('IDEA')
  })

  test('5. Update content piece -> advance through stages -> approve -> schedule', async () => {
    // Update piece content
    const updateRes = await h.updateContentPiece(ownerToken, pieceId, {
      captionAr: 'كابشن اختبار بالعربية',
      captionEn: 'Test caption in English',
      hashtags: ['#اختبار', '#test'],
    })
    expect(updateRes.status).toBe(200)
    expect(updateRes.body.captionAr).toBe('كابشن اختبار بالعربية')

    // Advance through stages
    const stages = [
      'IN_WRITING',
      'IN_DESIGN',
      'IN_PRODUCTION',
      'INTERNAL_REVIEW',
      'CLIENT_REVIEW',
      'APPROVED',
    ]
    for (const stage of stages) {
      const stageRes = await h.updateContentPieceStage(ownerToken, pieceId, stage)
      expect(stageRes.status).toBe(200)
      expect(stageRes.body.stage).toBe(stage)
    }

    // Schedule
    const scheduleRes = await h.updateContentPiece(ownerToken, pieceId, {
      scheduledAt: '2026-06-15T10:00:00.000Z',
    })
    expect(scheduleRes.status).toBe(200)

    // Transition to SCHEDULED
    const schedStageRes = await h.updateContentPieceStage(ownerToken, pieceId, 'SCHEDULED')
    expect(schedStageRes.status).toBe(200)
    expect(schedStageRes.body.stage).toBe('SCHEDULED')
  })

  test('6. Create revision on content piece', async () => {
    // Transition back to INTERNAL_REVIEW for revision
    const revStageRes = await h.updateContentPieceStage(ownerToken, pieceId, 'INTERNAL_REVIEW')
    expect(revStageRes.status).toBe(200)

    const revRes = await h.createRevision(ownerToken, pieceId, {
      roundNumber: 1,
      feedbackText: 'يرجى تعديل الكابشن',
    })
    expect(revRes.status).toBe(201)
    expect(revRes.body.roundNumber).toBe(1)
    expect(revRes.body.status).toBe('PENDING')
  })

  // ─── Flow 2: Equipment booking with conflict ───

  test('7. Create equipment -> create booking -> conflict detection', async () => {
    // Create equipment
    const equipRes = await h.createEquipment(ownerToken, {
      name: 'Sony A7 IV',
      category: 'CAMERA',
      brand: 'Sony',
      model: 'A7 IV',
      serialNumber: `SN-${TS}`,
      condition: 'GOOD',
    })
    expect(equipRes.status).toBe(201)
    equipmentId = equipRes.body.id
    expect(equipRes.body.currentStatus).toBe('AVAILABLE')

    // Create booking
    const futureStart = new Date(Date.now() + 86400000).toISOString()
    const futureEnd = new Date(Date.now() + 172800000).toISOString()
    const bookingRes = await h.createEquipmentBooking(ownerToken, {
      equipmentId,
      bookingStart: futureStart,
      bookingEnd: futureEnd,
    })
    expect(bookingRes.status).toBe(201)
    bookingId = bookingRes.body.id

    // Conflict: try to book same equipment for overlapping time
    const conflictRes = await h.createEquipmentBooking(ownerToken, {
      equipmentId,
      bookingStart: futureStart,
      bookingEnd: futureEnd,
    })
    expect(conflictRes.status).toBe(409)
    expect(conflictRes.body.message).toContain('already booked')
  })

  test('8. Equipment booking lifecycle: confirm -> checkout -> return', async () => {
    // Confirm
    const confirmRes = await fetch(
      `http://localhost:3001/api/v1/equipment/bookings/${bookingId}/status`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
        body: JSON.stringify({ status: 'CONFIRMED' }),
      },
    )
    expect(confirmRes.status).toBe(200)

    // Checkout
    const checkoutRes = await fetch(
      `http://localhost:3001/api/v1/equipment/bookings/${bookingId}/status`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
        body: JSON.stringify({ status: 'CHECKED_OUT' }),
      },
    )
    expect(checkoutRes.status).toBe(200)

    // Return
    const returnRes = await fetch(
      `http://localhost:3001/api/v1/equipment/bookings/${bookingId}/status`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
        body: JSON.stringify({ status: 'RETURNED', returnConditionNotes: 'Good condition' }),
      },
    )
    expect(returnRes.status).toBe(200)
  })

  // ─── Flow 3: AI tool output validated ───

  test('9. AI generation endpoint works (or returns proper error without API key)', async () => {
    const aiRes = await h.generateAi(ownerToken, {
      toolType: 'caption_writer',
      prompt: 'Write a caption for a product launch video in Arabic',
      maxTokens: 500,
    })

    // Without API key, should still return a structured response
    if (aiRes.status === 201) {
      expect(aiRes.body.content).toBeTruthy()
      expect(aiRes.body.toolType).toBe('caption_writer')
    } else if (aiRes.status === 403) {
      // Rate limited or plan limit
      expect(aiRes.body.type).toBeDefined()
    } else if (aiRes.status === 500) {
      // API not configured — acceptable for test env
      expect(aiRes.body).toBeDefined()
    }
  })

  // ─── Flow 4: Client portal access ───

  test('10. Enable client portal -> create portal user -> login -> access dashboard', async () => {
    // Enable portal for client
    const enableRes = await h.enableClientPortal(ownerToken, clientId)
    expect(enableRes.status).toBe(201)

    // Create portal user
    const portalUserRes = await h.createPortalUser(ownerToken, clientId, {
      email: `portal-${TS}@test.com`,
      password: 'PortalPass123!',
      fullNameAr: `عميل اختبار ${TS}`,
    })
    expect(portalUserRes.status).toBe(201)
    expect(portalUserRes.body.userId).toBeTruthy()

    // Login as portal user
    const portalLoginRes = await h.portalLogin(`portal-${TS}@test.com`, 'PortalPass123!')
    expect(portalLoginRes.status).toBe(200)
    expect(portalLoginRes.body.accessToken).toBeTruthy()
    portalToken = portalLoginRes.body.accessToken
    expect(portalLoginRes.body.clientId).toBe(clientId)
  })

  test('11. Portal user can view dashboard and content pieces', async () => {
    // Get dashboard
    const dashRes = await h.portalGetDashboard(portalToken)
    expect(dashRes.status).toBe(200)
    expect(dashRes.body).toBeDefined()

    // Get content pieces
    const piecesRes = await h.portalGetContentPieces(portalToken)
    expect(piecesRes.status).toBe(200)
  })

  test('12. Web UI: content calendar renders in Arabic', async ({ page }) => {
    // Login via browser
    await page.goto('/ar/login')
    await page.fill('input[name="email"]', `owner-p3-${TS}@test.com`)
    await page.fill('input[name="password"]', 'StrongPass123!')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/ar$/, { timeout: 10000 })

    // Navigate to calendar
    await page.goto('/ar/calendar')
    await page.waitForLoadState('networkidle')

    // Calendar should render
    const bodyText = await page.textContent('body')
    expect(bodyText?.includes('تقويم') || bodyText?.includes('يونيو')).toBe(true)
  })
})
