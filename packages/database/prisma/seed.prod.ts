import { PrismaClient } from '@prisma/client'
import * as argon2 from 'argon2'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env['ADMIN_EMAIL']
  const adminPassword = process.env['ADMIN_PASSWORD']
  const adminName = process.env['ADMIN_NAME'] ?? 'Super Admin'

  if (!adminEmail || !adminPassword) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD env vars are required for production seed')
  }

  const hashedPassword = await argon2.hash(adminPassword, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  })

  const existing = await prisma.platformAdmin.findUnique({ where: { email: adminEmail } })
  if (existing) {
    console.log(`Platform admin ${adminEmail} already exists — skipping`)
    return
  }

  await prisma.platformAdmin.create({
    data: {
      email: adminEmail,
      name: adminName,
      passwordHash: hashedPassword,
    },
  })

  console.log(`✅ Platform admin created: ${adminEmail}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
