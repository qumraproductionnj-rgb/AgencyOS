import { PrismaClient, type Prisma } from '@prisma/client'
import argon2 from 'argon2'
import { seedPermissions, seedDefaultRoles } from '../src/seed-default-roles'
import { FRAMEWORKS } from '@agencyos/shared'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  const ruya = await prisma.company.upsert({
    where: { slug: 'ruya' },
    update: {},
    create: {
      name: "Ru'ya for Artistic Production — رؤية للإنتاج الفني",
      slug: 'ruya',
    },
  })

  console.log(`✅ Company seeded: ${ruya.name} (id: ${ruya.id})`)

  console.log('📋 Seeding platform permissions...')
  const permissionMap = await seedPermissions(prisma)
  console.log(`✅ ${permissionMap.size} permissions seeded`)

  console.log("👥 Seeding default roles for Ru'ya...")
  await seedDefaultRoles(prisma, ruya.id, permissionMap)
  console.log(`✅ ${11} default roles seeded with permission mappings`)

  // Phase 2 Demo Data
  console.log('📦 Seeding Phase 2 demo data...')

  const lead = await prisma.lead.create({
    data: {
      companyId: ruya.id,
      name: 'أحمد العلواني',
      companyName: 'مطعم بغداد للأكلات الشعبية',
      email: 'ahmed@baghdad-restaurant.iq',
      phone: '+964771234567',
      source: 'موقع التواصل',
      status: 'QUALIFIED',
      notes: 'مهتم بعمل حملة إعلانية لشهر رمضان',
    },
  })
  console.log(`  ✅ Lead created: ${lead.name}`)

  const client = await prisma.client.create({
    data: {
      companyId: ruya.id,
      name: 'شركة بغداد للتجارة والمقاولات',
      nameEn: 'Baghdad Trading & Contracting Co.',
      email: 'info@baghdad-trading.iq',
      phone: '+964780123456',
      address: 'شارع أبو نواس، بغداد',
      isVip: true,
    },
  })
  console.log(`  ✅ Client created: ${client.name}`)

  const deal = await prisma.deal.create({
    data: {
      companyId: ruya.id,
      leadId: lead.id,
      clientId: client.id,
      name: 'حملة رمضان 2026 - مطعم بغداد',
      value: 25000000,
      currency: 'IQD',
      stage: 'NEGOTIATION',
      notes: 'ميزانية تقريبية 25 مليون دينار عراقي',
    },
  })
  console.log(`  ✅ Deal created: ${deal.name}`)

  const project = await prisma.project.create({
    data: {
      companyId: ruya.id,
      clientId: client.id,
      name: 'إعلان تلفزيوني لمطعم بغداد - رمضان 2026',
      nameEn: 'Baghdad Restaurant TV Ad - Ramadan 2026',
      description: 'إعلان مدته 30 ثانية يعرض على قنوات عراقية',
      stage: 'PLANNING',
      budget: 15000000,
      currency: 'IQD',
      startDate: new Date('2026-01-15'),
      deadline: new Date('2026-02-01'),
    },
  })
  console.log(`  ✅ Project created: ${project.name}`)

  const task = await prisma.task.create({
    data: {
      companyId: ruya.id,
      projectId: project.id,
      title: 'كتابة السيناريو',
      description: 'كتابة سيناريو الإعلان بالعربية مع مراعاة رسالة رمضان',
      status: 'TODO',
      priority: 'HIGH',
      sortOrder: 1,
    },
  })
  console.log(`  ✅ Task created: ${task.title}`)

  // Phase 3: Seed Frameworks Library
  console.log('📚 Seeding Frameworks Library...')
  for (const fw of FRAMEWORKS) {
    await prisma.framework.upsert({
      where: { code: fw.key },
      update: {
        nameAr: fw.nameAr,
        nameEn: fw.nameEn,
        description: fw.descriptionEn,
        category: fw.category,
        bestForContentTypes: [...fw.bestFor],
        fieldsSchema: fw.fields as unknown as Prisma.JsonArray,
      },
      create: {
        code: fw.key,
        nameAr: fw.nameAr,
        nameEn: fw.nameEn,
        description: fw.descriptionEn,
        category: fw.category,
        bestForContentTypes: [...fw.bestFor],
        fieldsSchema: fw.fields as unknown as Prisma.JsonArray,
        isGlobal: true,
      },
    })
  }
  console.log(`✅ ${FRAMEWORKS.length} frameworks seeded`)

  // Phase 4 — Subscription Plans
  console.log('📋 Seeding subscription plans...')

  const plans = [
    {
      key: 'starter',
      nameAr: 'ستارتر',
      nameEn: 'Starter',
      description: 'للفرق الصغيرة — حتى ٥ موظفين',
      maxUsers: 5,
      maxStorageMb: 10240,
      maxAiGenerationsPerMonth: 0,
      maxClients: 10,
      maxProjects: 20,
      features: {
        projects: true,
        tasks: true,
        attendance: true,
        hrLight: true,
        crm: false,
        quotations: false,
        invoices: false,
        expenses: false,
        equipment: false,
        exhibitions: false,
        ai: false,
        assetLibrary: false,
        contentStudio: false,
        clientPortal: false,
        reports: false,
      },
      priceMonthly: 1900n,
      priceYearly: 19000n,
      currency: 'USD',
      stripeProductId: 'prod_starter_placeholder',
      stripePriceIdMonthly: 'price_starter_monthly_placeholder',
      stripePriceIdYearly: 'price_starter_yearly_placeholder',
      priceMonthlyIqd: 25000n,
      priceYearlyIqd: 250000n,
      gatewayProductRefs: { fib: 'fib_prod_starter_placeholder' },
      sortOrder: 0,
    },
    {
      key: 'professional',
      nameAr: 'احترافي',
      nameEn: 'Professional',
      description: 'للاستوديوهات المتوسطة — حتى ٢٠ موظفاً',
      maxUsers: 20,
      maxStorageMb: 102400,
      maxAiGenerationsPerMonth: 50,
      maxClients: 50,
      maxProjects: 100,
      features: {
        projects: true,
        tasks: true,
        attendance: true,
        hrLight: true,
        crm: true,
        quotations: true,
        invoices: true,
        expenses: true,
        equipment: false,
        exhibitions: false,
        ai: true,
        assetLibrary: true,
        contentStudio: true,
        clientPortal: true,
        reports: true,
      },
      priceMonthly: 4900n,
      priceYearly: 49000n,
      currency: 'USD',
      stripeProductId: 'prod_professional_placeholder',
      stripePriceIdMonthly: 'price_professional_monthly_placeholder',
      stripePriceIdYearly: 'price_professional_yearly_placeholder',
      priceMonthlyIqd: 65000n,
      priceYearlyIqd: 650000n,
      gatewayProductRefs: { fib: 'fib_prod_professional_placeholder' },
      sortOrder: 1,
    },
    {
      key: 'agency',
      nameAr: 'وكالة',
      nameEn: 'Agency',
      description: 'لوكالات الإنتاج — غير محدود',
      maxUsers: 9999,
      maxStorageMb: 1048576,
      maxAiGenerationsPerMonth: 99999,
      maxClients: 9999,
      maxProjects: 9999,
      features: {
        projects: true,
        tasks: true,
        attendance: true,
        hrLight: true,
        crm: true,
        quotations: true,
        invoices: true,
        expenses: true,
        equipment: true,
        exhibitions: true,
        ai: true,
        assetLibrary: true,
        contentStudio: true,
        clientPortal: true,
        reports: true,
        whiteLabel: true,
      },
      priceMonthly: 14900n,
      priceYearly: 149000n,
      currency: 'USD',
      stripeProductId: 'prod_agency_placeholder',
      stripePriceIdMonthly: 'price_agency_monthly_placeholder',
      stripePriceIdYearly: 'price_agency_yearly_placeholder',
      priceMonthlyIqd: 195000n,
      priceYearlyIqd: 1950000n,
      gatewayProductRefs: { fib: 'fib_prod_agency_placeholder' },
      sortOrder: 2,
    },
    {
      key: 'enterprise',
      nameAr: 'مؤسسة',
      nameEn: 'Enterprise',
      description: 'خطة مخصصة مع دعم وأولوية قصوى',
      maxUsers: 99999,
      maxStorageMb: 9999999,
      maxAiGenerationsPerMonth: 999999,
      maxClients: 99999,
      maxProjects: 99999,
      features: {
        projects: true,
        tasks: true,
        attendance: true,
        hrLight: true,
        crm: true,
        quotations: true,
        invoices: true,
        expenses: true,
        equipment: true,
        exhibitions: true,
        ai: true,
        assetLibrary: true,
        contentStudio: true,
        clientPortal: true,
        reports: true,
        whiteLabel: true,
        customIntegrations: true,
      },
      priceMonthly: 0n,
      priceYearly: 0n,
      currency: 'USD',
      stripeProductId: null,
      stripePriceIdMonthly: null,
      stripePriceIdYearly: null,
      sortOrder: 3,
    },
  ]

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { key: plan.key },
      update: plan,
      create: plan,
    })
  }
  console.log(`✅ ${plans.length} subscription plans seeded`)

  // Phase 4.5 — default platform admin (super-admin)
  console.log('👤 Seeding default platform admin...')
  const adminEmail = process.env['PLATFORM_ADMIN_EMAIL'] ?? 'admin@agencyos.app'
  const adminPassword = process.env['PLATFORM_ADMIN_PASSWORD'] ?? 'ChangeMe!Admin1'
  const adminHash = await argon2.hash(adminPassword, { type: argon2.argon2id })
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: adminHash,
      tier: 'PLATFORM_ADMIN',
      isActive: true,
      emailVerifiedAt: new Date(),
      companyId: null,
    },
  })
  console.log(`✅ Platform admin: ${adminEmail}`)

  await seedRuyaDemoData(prisma, ruya.id)

  // Round 4A — three demo tenants (flat / hierarchical / hybrid)
  await seedRound4ADemoTenants(prisma, permissionMap)

  console.log('✅ Seed complete.')
}

async function seedRound4ADemoTenants(
  prisma: PrismaClient,
  permissionMap: Awaited<ReturnType<typeof seedPermissions>>,
) {
  console.log('🏗️ Seeding Round 4A demo tenants (flat/hierarchical/hybrid)...')
  const passwordHash = await argon2.hash('Demo1234!', { type: argon2.argon2id })

  // --- Tenant 1: FLAT — Spark Studio (4 employees, no managers) ---
  const spark = await prisma.company.upsert({
    where: { slug: 'spark-studio' },
    update: { orgStructureType: 'FLAT' },
    create: {
      name: 'Spark Studio — استوديو شرارة',
      slug: 'spark-studio',
      orgStructureType: 'FLAT',
    },
  })
  await seedDefaultRoles(prisma, spark.id, permissionMap)
  await seedTenantUsers(prisma, spark.id, passwordHash, [
    { email: 'owner@spark.iq', fullNameAr: 'مالك سبارك', role: 'owner', isManager: false },
    { email: 'dina@spark.iq', fullNameAr: 'دينا حسن', role: 'designer', isManager: false },
    { email: 'omar@spark.iq', fullNameAr: 'عمر السعيد', role: 'video_editor', isManager: false },
    {
      email: 'lara@spark.iq',
      fullNameAr: 'لارا الجبوري',
      role: 'account_manager',
      isManager: false,
    },
  ])
  console.log(`  ✅ FLAT tenant: ${spark.name} (4 employees, no departments)`)

  // --- Tenant 2: HIERARCHICAL — Pixel House (10 employees, 3 depts with managers) ---
  const pixel = await prisma.company.upsert({
    where: { slug: 'pixel-house' },
    update: { orgStructureType: 'HIERARCHICAL' },
    create: {
      name: 'Pixel House — بيت البكسل',
      slug: 'pixel-house',
      orgStructureType: 'HIERARCHICAL',
    },
  })
  await seedDefaultRoles(prisma, pixel.id, permissionMap)
  const pixelUsers = await seedTenantUsers(prisma, pixel.id, passwordHash, [
    { email: 'owner@pixel.iq', fullNameAr: 'مالك بكسل', role: 'owner', isManager: false },
    {
      email: 'design.mgr@pixel.iq',
      fullNameAr: 'مدير التصميم',
      role: 'creative_director',
      isManager: true,
    },
    {
      email: 'video.mgr@pixel.iq',
      fullNameAr: 'مدير الفيديو',
      role: 'creative_director',
      isManager: true,
    },
    {
      email: 'sales.mgr@pixel.iq',
      fullNameAr: 'مدير المبيعات',
      role: 'account_manager',
      isManager: true,
    },
    { email: 'd1@pixel.iq', fullNameAr: 'مصممة 1', role: 'designer', isManager: false },
    { email: 'd2@pixel.iq', fullNameAr: 'مصمم 2', role: 'designer', isManager: false },
    { email: 'v1@pixel.iq', fullNameAr: 'مونتير 1', role: 'video_editor', isManager: false },
    { email: 'v2@pixel.iq', fullNameAr: 'مونتير 2', role: 'video_editor', isManager: false },
    { email: 's1@pixel.iq', fullNameAr: 'مبيعات 1', role: 'sales', isManager: false },
    { email: 's2@pixel.iq', fullNameAr: 'مبيعات 2', role: 'sales', isManager: false },
  ])
  const designMgr = pixelUsers.get('design.mgr@pixel.iq')!
  const videoMgr = pixelUsers.get('video.mgr@pixel.iq')!
  const salesMgr = pixelUsers.get('sales.mgr@pixel.iq')!
  const pixelDesign = await prisma.department.create({
    data: {
      companyId: pixel.id,
      nameAr: 'قسم التصميم',
      nameEn: 'Design',
      icon: '🎨',
      color: '#ddd6fe',
      managerUserId: designMgr,
    },
  })
  const pixelVideo = await prisma.department.create({
    data: {
      companyId: pixel.id,
      nameAr: 'قسم الفيديو',
      nameEn: 'Video',
      icon: '🎬',
      color: '#fed7aa',
      managerUserId: videoMgr,
    },
  })
  const pixelSales = await prisma.department.create({
    data: {
      companyId: pixel.id,
      nameAr: 'قسم المبيعات',
      nameEn: 'Sales',
      icon: '🤝',
      color: '#bbf7d0',
      managerUserId: salesMgr,
    },
  })
  await assignEmployeesToDept(prisma, pixel.id, pixelDesign.id, [
    'design.mgr@pixel.iq',
    'd1@pixel.iq',
    'd2@pixel.iq',
  ])
  await assignEmployeesToDept(prisma, pixel.id, pixelVideo.id, [
    'video.mgr@pixel.iq',
    'v1@pixel.iq',
    'v2@pixel.iq',
  ])
  await assignEmployeesToDept(prisma, pixel.id, pixelSales.id, [
    'sales.mgr@pixel.iq',
    's1@pixel.iq',
    's2@pixel.iq',
  ])
  console.log(`  ✅ HIERARCHICAL tenant: ${pixel.name} (10 employees, 3 departments w/ managers)`)

  // --- Tenant 3: HYBRID — Crescent Agency (15 employees, sub-depts, some without managers) ---
  const crescent = await prisma.company.upsert({
    where: { slug: 'crescent-agency' },
    update: { orgStructureType: 'HYBRID' },
    create: {
      name: 'Crescent Agency — وكالة الهلال',
      slug: 'crescent-agency',
      orgStructureType: 'HYBRID',
    },
  })
  await seedDefaultRoles(prisma, crescent.id, permissionMap)
  const cUsers = await seedTenantUsers(prisma, crescent.id, passwordHash, [
    { email: 'owner@crescent.iq', fullNameAr: 'مالك الهلال', role: 'owner', isManager: false },
    {
      email: 'creative.head@crescent.iq',
      fullNameAr: 'رئيس الإبداع',
      role: 'creative_director',
      isManager: true,
    },
    {
      email: 'design.lead@crescent.iq',
      fullNameAr: 'قائد التصميم',
      role: 'creative_director',
      isManager: true,
    },
    {
      email: 'motion.lead@crescent.iq',
      fullNameAr: 'قائد الموشن',
      role: 'creative_director',
      isManager: true,
    },
    { email: 'photo1@crescent.iq', fullNameAr: 'مصور 1', role: 'designer', isManager: false },
    { email: 'photo2@crescent.iq', fullNameAr: 'مصور 2', role: 'designer', isManager: false },
    { email: 'design1@crescent.iq', fullNameAr: 'مصمم 1', role: 'designer', isManager: false },
    { email: 'design2@crescent.iq', fullNameAr: 'مصمم 2', role: 'designer', isManager: false },
    { email: 'design3@crescent.iq', fullNameAr: 'مصمم 3', role: 'designer', isManager: false },
    { email: 'motion1@crescent.iq', fullNameAr: 'موشن 1', role: 'video_editor', isManager: false },
    { email: 'motion2@crescent.iq', fullNameAr: 'موشن 2', role: 'video_editor', isManager: false },
    { email: 'editor1@crescent.iq', fullNameAr: 'محرر 1', role: 'video_editor', isManager: false },
    { email: 'writer1@crescent.iq', fullNameAr: 'كاتب 1', role: 'designer', isManager: false },
    { email: 'writer2@crescent.iq', fullNameAr: 'كاتب 2', role: 'designer', isManager: false },
    {
      email: 'pm1@crescent.iq',
      fullNameAr: 'مدير مشروع',
      role: 'project_manager',
      isManager: false,
    },
  ])
  const creativeHead = cUsers.get('creative.head@crescent.iq')!
  const designLead = cUsers.get('design.lead@crescent.iq')!
  const motionLead = cUsers.get('motion.lead@crescent.iq')!
  // Parent department: Creative (with manager)
  const creative = await prisma.department.create({
    data: {
      companyId: crescent.id,
      nameAr: 'القسم الإبداعي',
      nameEn: 'Creative',
      icon: '💡',
      color: '#fef08a',
      managerUserId: creativeHead,
    },
  })
  // Sub-departments
  const photoSub = await prisma.department.create({
    data: {
      companyId: crescent.id,
      nameAr: 'التصوير',
      nameEn: 'Photography',
      icon: '📸',
      color: '#bae6fd',
      parentId: creative.id,
      // no manager — intentional (hybrid)
    },
  })
  const designSub = await prisma.department.create({
    data: {
      companyId: crescent.id,
      nameAr: 'التصميم',
      nameEn: 'Design',
      icon: '🎨',
      color: '#ddd6fe',
      parentId: creative.id,
      managerUserId: designLead,
    },
  })
  const motionSub = await prisma.department.create({
    data: {
      companyId: crescent.id,
      nameAr: 'الموشن',
      nameEn: 'Motion',
      icon: '🎬',
      color: '#fed7aa',
      parentId: creative.id,
      managerUserId: motionLead,
    },
  })
  // Top-level Writing department, no manager
  const writing = await prisma.department.create({
    data: {
      companyId: crescent.id,
      nameAr: 'الكتابة',
      nameEn: 'Writing',
      icon: '📝',
      color: '#fbcfe8',
    },
  })
  await assignEmployeesToDept(prisma, crescent.id, photoSub.id, [
    'photo1@crescent.iq',
    'photo2@crescent.iq',
  ])
  await assignEmployeesToDept(prisma, crescent.id, designSub.id, [
    'design.lead@crescent.iq',
    'design1@crescent.iq',
    'design2@crescent.iq',
    'design3@crescent.iq',
  ])
  await assignEmployeesToDept(prisma, crescent.id, motionSub.id, [
    'motion.lead@crescent.iq',
    'motion1@crescent.iq',
    'motion2@crescent.iq',
    'editor1@crescent.iq',
  ])
  await assignEmployeesToDept(prisma, crescent.id, writing.id, [
    'writer1@crescent.iq',
    'writer2@crescent.iq',
  ])
  // pm1 deliberately unassigned (General Pool)
  console.log(
    `  ✅ HYBRID tenant: ${crescent.name} (15 employees, 4 departments incl. 1 unmanaged sub, 1 unassigned employee)`,
  )
}

interface SeedUserSpec {
  email: string
  fullNameAr: string
  role: string
  isManager: boolean
}

async function seedTenantUsers(
  prisma: PrismaClient,
  companyId: string,
  passwordHash: string,
  specs: SeedUserSpec[],
): Promise<Map<string, string>> {
  const result = new Map<string, string>()
  for (const spec of specs) {
    const user = await prisma.user.upsert({
      where: { email: spec.email },
      update: { isManager: spec.isManager },
      create: {
        email: spec.email,
        passwordHash,
        companyId,
        tier: 'TENANT',
        emailVerifiedAt: new Date(),
        isManager: spec.isManager,
      },
    })
    result.set(spec.email, user.id)

    // Attach role
    const role = await prisma.role.findFirst({
      where: { companyId, name: spec.role, deletedAt: null },
    })
    if (role) {
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId: role.id } },
        update: {},
        create: { userId: user.id, roleId: role.id, companyId },
      })
    }

    // Create employee profile
    const existingEmp = await prisma.employee.findFirst({ where: { userId: user.id } })
    if (!existingEmp) {
      const code = `EMP-${spec.email.split('@')[0]!.toUpperCase()}`
      await prisma.employee.create({
        data: {
          companyId,
          userId: user.id,
          employeeCode: code,
          fullNameAr: spec.fullNameAr,
          email: spec.email,
          employmentType: 'FULL_TIME',
          status: 'ACTIVE',
          startDate: new Date(),
          salaryAmount: 1000000n,
          salaryCurrency: 'IQD',
          salaryType: 'MONTHLY',
          scheduledStartTime: '09:00',
          scheduledEndTime: '17:00',
          weeklyOffDays: ['Friday', 'Saturday'],
        },
      })
    }
  }
  return result
}

async function assignEmployeesToDept(
  prisma: PrismaClient,
  companyId: string,
  departmentId: string,
  emails: string[],
) {
  for (const email of emails) {
    const user = await prisma.user.findFirst({ where: { email, companyId } })
    if (!user) continue
    await prisma.employee.updateMany({
      where: { userId: user.id, companyId },
      data: { departmentId },
    })
  }
}

async function seedRuyaDemoData(prisma: PrismaClient, companyId: string) {
  console.log("🎨 Seeding Ru'ya demo data...")

  // Departments
  const dept = await prisma.department.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      companyId,
      nameAr: 'الإنتاج الإبداعي',
      nameEn: 'Creative Production',
    },
  })

  // Users + Employees
  const employees = [
    {
      email: 'ahmed@ruya.iq',
      nameAr: 'أحمد العبادي',
      nameEn: 'Ahmed Al-Abbadi',
      position: 'Creative Director',
      code: 'EMP-001',
    },
    {
      email: 'sara@ruya.iq',
      nameAr: 'سارة جاسم',
      nameEn: 'Sara Jasim',
      position: 'Project Manager',
      code: 'EMP-002',
    },
    {
      email: 'mohammed@ruya.iq',
      nameAr: 'محمد الحسناوي',
      nameEn: 'Mohammed Al-Hasnawi',
      position: 'Senior Designer',
      code: 'EMP-003',
    },
    {
      email: 'zainab@ruya.iq',
      nameAr: 'زينب الموسوي',
      nameEn: 'Zainab Al-Musawi',
      position: 'Content Strategist',
      code: 'EMP-004',
    },
    {
      email: 'hassan@ruya.iq',
      nameAr: 'حسن الكاظمي',
      nameEn: 'Hassan Al-Kadhimi',
      position: 'Videographer',
      code: 'EMP-005',
    },
    {
      email: 'ali@ruya.iq',
      nameAr: 'علي الربيعي',
      nameEn: 'Ali Al-Rubaie',
      position: 'Motion Designer',
      code: 'EMP-006',
    },
    {
      email: 'nour@ruya.iq',
      nameAr: 'نور الهاشمي',
      nameEn: 'Nour Al-Hashimi',
      position: 'Social Media',
      code: 'EMP-007',
    },
    {
      email: 'karim@ruya.iq',
      nameAr: 'كريم الجبوري',
      nameEn: 'Karim Al-Jubouri',
      position: 'Photographer',
      code: 'EMP-008',
    },
  ]

  // Role assignments: ahmed=owner, sara=admin, rest=employee
  const roleAssignments: Record<string, string> = {
    'ahmed@ruya.iq': 'owner',
    'sara@ruya.iq': 'admin',
    'mohammed@ruya.iq': 'employee',
    'zainab@ruya.iq': 'employee',
    'hassan@ruya.iq': 'employee',
    'ali@ruya.iq': 'employee',
    'nour@ruya.iq': 'employee',
    'karim@ruya.iq': 'employee',
  }

  const hash = await argon2.hash('Demo1234!', { type: argon2.argon2id })
  for (const emp of employees) {
    const user = await prisma.user.upsert({
      where: { email: emp.email },
      update: {},
      create: {
        email: emp.email,
        passwordHash: hash,
        tier: 'TENANT',
        isActive: true,
        emailVerifiedAt: new Date(),
        companyId,
      },
    })
    await prisma.employee.upsert({
      where: { companyId_employeeCode: { companyId, employeeCode: emp.code } },
      update: {},
      create: {
        companyId,
        userId: user.id,
        employeeCode: emp.code,
        fullNameAr: emp.nameAr,
        fullNameEn: emp.nameEn,
        email: emp.email,
        position: emp.position,
        departmentId: dept.id,
        startDate: new Date('2025-01-01'),
        salaryAmount: 1200000n,
        salaryCurrency: 'IQD',
      },
    })

    // Assign role
    const roleName = roleAssignments[emp.email] ?? 'employee'
    const role = await prisma.role.findFirst({
      where: { companyId, name: roleName, deletedAt: null },
    })
    if (role) {
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId: role.id } },
        update: {},
        create: { userId: user.id, roleId: role.id, companyId },
      })
    }
  }
  console.log(`  ✅ ${employees.length} employees seeded with roles`)

  // Clients
  const clientsExist = await prisma.client.count({ where: { companyId } })
  let clients: { id: string }[] = []
  if (clientsExist < 5) {
    const clientData = [
      {
        name: 'مطعم الزلال',
        nameEn: 'Al-Zalal Restaurant',
        email: 'info@zalal.iq',
        address: 'شارع فلسطين، بغداد',
      },
      {
        name: 'معسل أحمد',
        nameEn: 'Ahmad Moassel',
        email: 'info@ahmad-moassel.iq',
        address: 'النجف الأشرف',
      },
      {
        name: 'معسل العطاء',
        nameEn: 'Al-Ataa Moassel',
        email: 'info@ataa-moassel.iq',
        address: 'النجف الأشرف',
      },
      {
        name: 'محلات السلامي',
        nameEn: 'Al-Salami Stores',
        email: 'info@salami-stores.iq',
        address: 'النجف الأشرف',
      },
      {
        name: 'مجمع الإمام علي التجاري',
        nameEn: 'Imam Ali Commercial Complex',
        email: 'info@imamali-complex.iq',
        address: 'النجف الأشرف',
      },
    ]
    clients = await Promise.all(
      clientData.map((c) =>
        prisma.client.create({ data: { companyId, ...c }, select: { id: true } }),
      ),
    )
    console.log(`  ✅ ${clients.length} clients seeded`)
  } else {
    clients = await prisma.client.findMany({ where: { companyId }, select: { id: true }, take: 5 })
    console.log(`  ℹ️  Clients already exist, skipping`)
  }

  const [zalal, ahmadMoassel, , salami, imamAli] = clients as [
    { id: string },
    { id: string },
    { id: string },
    { id: string },
    { id: string },
  ]

  // Projects
  const projectsExist = await prisma.project.count({ where: { companyId } })
  if (projectsExist < 4) {
    const projectData = [
      {
        clientId: ahmadMoassel.id,
        name: 'حملة معسل أحمد رمضان 2026',
        stage: 'IN_PROGRESS' as const,
        budget: 18000000n,
        start: '2026-02-01',
        deadline: '2026-03-30',
      },
      {
        clientId: zalal.id,
        name: 'إعلان مطعم الزلال - قابلي',
        stage: 'REVIEW' as const,
        budget: 8500000n,
        start: '2026-01-15',
        deadline: '2026-02-15',
      },
      {
        clientId: imamAli.id,
        name: 'معرض النجف للصناعات',
        stage: 'IN_PROGRESS' as const,
        budget: 25000000n,
        start: '2026-03-01',
        deadline: '2026-04-30',
      },
      {
        clientId: zalal.id,
        name: 'هوية مطعم بغداد',
        stage: 'PLANNING' as const,
        budget: 5000000n,
        start: '2026-04-01',
        deadline: '2026-05-31',
      },
      {
        clientId: salami.id,
        name: 'سوشيال ميديا السلامي',
        stage: 'IN_PROGRESS' as const,
        budget: 12000000n,
        start: '2026-01-01',
        deadline: '2026-06-30',
      },
      {
        clientId: imamAli.id,
        name: 'فيديو مجمع الإمام علي',
        stage: 'BRIEF' as const,
        budget: 15000000n,
        start: '2026-04-15',
        deadline: '2026-06-15',
      },
    ]
    await Promise.all(
      projectData.map((p) =>
        prisma.project.create({
          data: {
            companyId,
            clientId: p.clientId,
            name: p.name,
            stage: p.stage,
            budget: p.budget,
            currency: 'IQD',
            startDate: new Date(p.start),
            deadline: new Date(p.deadline),
          },
        }),
      ),
    )
    console.log(`  ✅ 6 projects seeded`)
  } else {
    console.log(`  ℹ️  Projects already exist, skipping`)
  }

  // Invoices
  const invNumbers = ['INV-2026-145', 'INV-2026-144', 'INV-2026-141']
  for (const num of invNumbers) {
    const existing = await prisma.invoice.findUnique({ where: { number: num } })
    if (existing) continue
  }
  const inv145 = await prisma.invoice.findUnique({ where: { number: 'INV-2026-145' } })
  if (!inv145) {
    const items = JSON.stringify([
      { description: 'إنتاج إعلان تلفزيوني', quantity: 1, unitPrice: 8500000, total: 8500000 },
    ])
    await prisma.invoice.create({
      data: {
        companyId,
        clientId: zalal.id,
        number: 'INV-2026-145',
        status: 'PAID',
        items,
        subtotal: 8500000n,
        total: 8500000n,
        paidAmount: 8500000n,
        balanceDue: 0n,
        currency: 'IQD',
        issuedDate: new Date('2026-04-01'),
        dueDate: new Date('2026-04-30'),
      },
    })
    await prisma.invoice.create({
      data: {
        companyId,
        clientId: ahmadMoassel.id,
        number: 'INV-2026-144',
        status: 'SENT',
        items: JSON.stringify([
          {
            description: 'حملة رمضان الإبداعية',
            quantity: 1,
            unitPrice: 12200000,
            total: 12200000,
          },
        ]),
        subtotal: 12200000n,
        total: 12200000n,
        paidAmount: 0n,
        balanceDue: 12200000n,
        currency: 'IQD',
        issuedDate: new Date('2026-03-15'),
        dueDate: new Date('2026-04-15'),
      },
    })
    await prisma.invoice.create({
      data: {
        companyId,
        clientId: salami.id,
        number: 'INV-2026-141',
        status: 'OVERDUE',
        items: JSON.stringify([
          {
            description: 'محتوى سوشيال ميديا - فبراير',
            quantity: 1,
            unitPrice: 3800000,
            total: 3800000,
          },
        ]),
        subtotal: 3800000n,
        total: 3800000n,
        paidAmount: 0n,
        balanceDue: 3800000n,
        currency: 'IQD',
        issuedDate: new Date('2026-02-01'),
        dueDate: new Date('2026-02-28'),
      },
    })
    console.log('  ✅ 3 invoices seeded')
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
