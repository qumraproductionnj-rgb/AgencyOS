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

  console.log('✅ Seed complete.')
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
  }
  console.log(`  ✅ ${employees.length} employees seeded`)

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
