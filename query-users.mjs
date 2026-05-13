import { PrismaClient } from '@prisma/client'
const p = new PrismaClient({
  datasources: { db: { url: 'postgresql://agencyos:dev_password_change_me@localhost:5433/agencyos_dev?schema=public' } }
})
const users = await p.user.findMany({ select: { email: true, tier: true, isVerified: true }, take: 20 })
for (const u of users) console.log(u.email, u.tier, u.isVerified)
await p.$disconnect()
