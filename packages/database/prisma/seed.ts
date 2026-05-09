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

  console.log('✅ Seed complete.')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
