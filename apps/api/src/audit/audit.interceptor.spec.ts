import { Test, type TestingModule } from '@nestjs/testing'
import { AuditInterceptor } from './audit.interceptor'
import { AuditService } from './audit.service'
import { PrismaService } from '../database/prisma.service'
import { type CallHandler, type ExecutionContext } from '@nestjs/common'
import { of, throwError } from 'rxjs'

function mockReq(method: string, url: string, overrides?: Partial<Record<string, unknown>>) {
  return {
    method,
    url,
    headers: {},
    ip: '127.0.0.1',
    ...overrides,
  }
}

function mockCtx(request: Record<string, unknown>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext
}

describe('AuditInterceptor', () => {
  let interceptor: AuditInterceptor
  let auditService: AuditService
  let prisma: { system: { auditLog: Record<string, jest.Mock> } }

  beforeEach(async () => {
    prisma = {
      system: {
        auditLog: {
          create: jest.fn().mockResolvedValue({ id: 'log-1' }),
          findMany: jest.fn().mockResolvedValue([]),
        },
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditInterceptor,
        AuditService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile()

    interceptor = module.get<AuditInterceptor>(AuditInterceptor)
    auditService = module.get<AuditService>(AuditService)
    // Spy on the service log method so we can verify calls
    jest.spyOn(auditService, 'log')
  })

  it('skips GET requests', (done) => {
    const req = mockReq('GET', '/api/v1/audit-logs', { user: { companyId: 'c1', sub: 'u1' } })
    const ctx = mockCtx(req)
    const next: CallHandler = { handle: () => of('success') }

    interceptor.intercept(ctx, next).subscribe({
      next: (val) => {
        expect(val).toBe('success')
        expect(auditService.log).not.toHaveBeenCalled()
        done()
      },
    })
  })

  it('skips HEAD requests', (done) => {
    const req = mockReq('HEAD', '/api/v1/employees', { user: { companyId: 'c1', sub: 'u1' } })
    const ctx = mockCtx(req)
    const next: CallHandler = { handle: () => of('success') }

    interceptor.intercept(ctx, next).subscribe({
      next: () => {
        expect(auditService.log).not.toHaveBeenCalled()
        done()
      },
    })
  })

  it('logs audit entry on successful POST', (done) => {
    const req = mockReq('POST', '/api/v1/attendance/check-in', {
      user: { companyId: 'c1', sub: 'u1' },
    })
    const ctx = mockCtx(req)
    const next: CallHandler = { handle: () => of({ id: 'rec-1' }) }

    interceptor.intercept(ctx, next).subscribe({
      next: () => {
        expect(auditService.log).toHaveBeenCalledWith(
          expect.objectContaining({ action: 'post attendance', entityType: 'attendance' }),
        )
        done()
      },
    })
  })

  it('logs failed action on error', (done) => {
    const req = mockReq('DELETE', '/api/v1/employees/123', { user: { companyId: 'c1', sub: 'u1' } })
    const ctx = mockCtx(req)
    const next: CallHandler = { handle: () => throwError(() => new Error('not found')) }

    interceptor.intercept(ctx, next).subscribe({
      error: () => {
        expect(auditService.log).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'delete employees_failed',
            metadata: { error: 'not found' },
          }),
        )
        done()
      },
    })
  })

  it('skips sensitive actions (login, logout, refresh)', (done) => {
    const req = mockReq('POST', '/api/v1/auth/login', { user: { companyId: 'c1', sub: 'u1' } })
    const ctx = mockCtx(req)
    const next: CallHandler = { handle: () => of('token') }

    interceptor.intercept(ctx, next).subscribe({
      next: () => {
        expect(auditService.log).not.toHaveBeenCalled()
        done()
      },
    })
  })

  it('includes ipAddress and userAgent when available', (done) => {
    const req = mockReq('POST', '/api/v1/work-locations', {
      user: { companyId: 'c1', sub: 'u1' },
      headers: { 'x-forwarded-for': '203.0.113.1, 10.0.0.1', 'user-agent': 'TestAgent/1.0' },
    })
    const ctx = mockCtx(req)
    const next: CallHandler = { handle: () => of({ id: 'wl-1' }) }

    interceptor.intercept(ctx, next).subscribe({
      next: () => {
        expect(auditService.log).toHaveBeenCalledWith(
          expect.objectContaining({ ipAddress: '203.0.113.1', userAgent: 'TestAgent/1.0' }),
        )
        done()
      },
    })
  })
})
