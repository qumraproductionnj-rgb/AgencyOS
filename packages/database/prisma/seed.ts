import { PrismaClient } from '@prisma/client'
import { seedPermissions, seedDefaultRoles } from '../src/seed-default-roles'

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

  console.log('✅ Seed complete.')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
