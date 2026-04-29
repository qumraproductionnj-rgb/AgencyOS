import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Seed demo company (Ru'ya — primary tenant)
  const ruya = await prisma.company.upsert({
    where: { slug: 'ruya' },
    update: {},
    create: {
      name: "Ru'ya for Artistic Production — رؤية للإنتاج الفني",
      slug: 'ruya',
    },
  })

  console.log(`✅ Company seeded: ${ruya.name} (id: ${ruya.id})`)

  // NOTE: Owner user created in Task 1.2 (auth module) with proper Argon2id hashing.
  // We don't seed passwords here to avoid plain-text storage.

  console.log('✅ Seed complete.')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
