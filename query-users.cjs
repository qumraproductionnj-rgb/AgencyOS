const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient({
  datasources: { db: { url: 'postgresql://agencyos:dev_password_change_me@localhost:5433/agencyos_dev?schema=public' } }
})
p.user.findMany({ select: { email: true, tier: true, isVerified: true }, take: 20 }).then(r => {
  r.forEach(u => console.log(u.email, u.tier, u.isVerified))
  p.$disconnect()
})
