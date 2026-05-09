import { type INestApplication } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import { ConfigModule } from '@nestjs/config'
import { LoggerModule } from 'nestjs-pino'
import { DatabaseModule } from '../src/database/database.module'
import { PrismaService } from '../src/database/prisma.service'
import { TenantContextService } from '../src/database/tenant-context.service'
import { envSchema } from '../src/config/env.validation'

describe('RLS Isolation (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let tenantContext: TenantContextService

  const slugA = `tenant-a-${Date.now()}`
  const slugB = `tenant-b-${Date.now()}`

  let companyAId: string
  let companyBId: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ['../../.env', '.env'],
          validate: (config: Record<string, unknown>) => {
            const result = envSchema.safeParse(config)
            if (!result.success) {
              const errors = result.error.flatten().fieldErrors
              throw new Error(`Invalid env:\n${JSON.stringify(errors, null, 2)}`)
            }
            return result.data
          },
        }),
        LoggerModule.forRoot({
          pinoHttp: { level: 'silent', redact: ['req.headers.authorization'] },
        }),
        DatabaseModule,
      ],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
    prisma = app.get(PrismaService)
    tenantContext = app.get(TenantContextService)
  })

  afterAll(async () => {
    for (const id of [companyAId, companyBId]) {
      if (!id) continue
      await prisma.system
        .$executeRawUnsafe(`DELETE FROM attendance_records WHERE company_id = $1`, id)
        .catch(() => void 0)
      await prisma.system
        .$executeRawUnsafe(`DELETE FROM work_location_employees WHERE company_id = $1`, id)
        .catch(() => void 0)
      await prisma.system
        .$executeRawUnsafe(`DELETE FROM work_locations WHERE company_id = $1`, id)
        .catch(() => void 0)
      await prisma.system
        .$executeRawUnsafe(`DELETE FROM employees WHERE company_id = $1`, id)
        .catch(() => void 0)
      await prisma.system
        .$executeRawUnsafe(`DELETE FROM departments WHERE company_id = $1`, id)
        .catch(() => void 0)
      await prisma.system
        .$executeRawUnsafe(`DELETE FROM audit_logs WHERE company_id = $1`, id)
        .catch(() => void 0)
      await prisma.system
        .$executeRawUnsafe(`DELETE FROM sessions WHERE company_id = $1`, id)
        .catch(() => void 0)
      await prisma.system
        .$executeRawUnsafe(`DELETE FROM user_roles WHERE company_id = $1`, id)
        .catch(() => void 0)
      await prisma.system
        .$executeRawUnsafe(`DELETE FROM role_permissions WHERE company_id = $1`, id)
        .catch(() => void 0)
      await prisma.system
        .$executeRawUnsafe(`DELETE FROM roles WHERE company_id = $1`, id)
        .catch(() => void 0)
      await prisma.system
        .$executeRawUnsafe(`DELETE FROM users WHERE company_id = $1`, id)
        .catch(() => void 0)
      await prisma.system
        .$executeRawUnsafe(`DELETE FROM companies WHERE id = $1`, id)
        .catch(() => void 0)
    }
    await app.close()
  })

  it('should create two test companies via system client (bypasses RLS)', async () => {
    const cA = await prisma.system.company.create({
      data: { name: 'Tenant A Inc', slug: slugA },
    })
    companyAId = cA.id

    const cB = await prisma.system.company.create({
      data: { name: 'Tenant B LLC', slug: slugB },
    })
    companyBId = cB.id

    expect(companyAId).not.toEqual(companyBId)
  })

  it('should return Tenant A data when tenant context is set to A', async () => {
    const company = await tenantContext.run(
      { companyId: companyAId, userId: '00000000-0000-0000-0000-000000000001', tier: 'TENANT' },
      () => prisma.tenant.company.findFirst({ where: { deletedAt: null } }),
    )
    expect(company).not.toBeNull()
    expect(company!.id).toEqual(companyAId)
    expect(company!.name).toEqual('Tenant A Inc')
  })

  it('should return Tenant B data when tenant context is set to B', async () => {
    const company = await tenantContext.run(
      { companyId: companyBId, userId: '00000000-0000-0000-0000-000000000002', tier: 'TENANT' },
      () => prisma.tenant.company.findFirst({ where: { deletedAt: null } }),
    )
    expect(company).not.toBeNull()
    expect(company!.id).toEqual(companyBId)
    expect(company!.name).toEqual('Tenant B LLC')
  })

  it('should prove RLS isolation: Tenant A cannot see Tenant B data via tenant client', async () => {
    const company = await tenantContext.run(
      { companyId: companyAId, userId: '00000000-0000-0000-0000-000000000001', tier: 'TENANT' },
      () =>
        prisma.tenant.company.findFirst({
          where: { id: companyBId, deletedAt: null },
        }),
    )
    expect(company).toBeNull()
  })

  it('should return null when no tenant context is set (fail closed)', async () => {
    const company = await prisma.tenant.company.findFirst({ where: { deletedAt: null } })
    expect(company).toBeNull()
  })

  it('should still access all data via system client (bypasses RLS)', async () => {
    const all = await prisma.system.company.findMany({
      where: { id: { in: [companyAId, companyBId] }, deletedAt: null },
    })
    expect(all).toHaveLength(2)
  })
})
