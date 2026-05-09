import { ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { RolesGuard } from './role.guard'
import { PermissionService } from '../../permissions/permission.service'
import type { ExecutionContext } from '@nestjs/common'

function mockCtx(user: { sub: string; companyId: string } | null): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        headers: {},
        user,
      }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext
}

describe('RolesGuard', () => {
  let guard: RolesGuard
  let reflector: jest.Mocked<Reflector>
  let permissionService: jest.Mocked<PermissionService>

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>

    permissionService = {
      userHasRole: jest.fn(),
    } as unknown as jest.Mocked<PermissionService>

    guard = new RolesGuard(reflector, permissionService)
  })

  it('should pass when no role metadata is set', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined)

    const result = await guard.canActivate(mockCtx({ sub: 'u1', companyId: 'c1' }))

    expect(result).toBe(true)
  })

  it('should pass when user has the required role', async () => {
    reflector.getAllAndOverride.mockReturnValue(['admin'])
    permissionService.userHasRole.mockResolvedValue(true)

    const result = await guard.canActivate(mockCtx({ sub: 'u1', companyId: 'c1' }))

    expect(result).toBe(true)
    expect(permissionService.userHasRole).toHaveBeenCalledWith('u1', 'c1', ['admin'])
  })

  it('should pass when user has one of multiple required roles', async () => {
    reflector.getAllAndOverride.mockReturnValue(['hr_manager', 'admin'])
    permissionService.userHasRole.mockResolvedValue(true)

    const result = await guard.canActivate(mockCtx({ sub: 'u1', companyId: 'c1' }))

    expect(result).toBe(true)
    expect(permissionService.userHasRole).toHaveBeenCalledWith('u1', 'c1', ['hr_manager', 'admin'])
  })

  it('should throw ForbiddenException when user lacks all roles', async () => {
    reflector.getAllAndOverride.mockReturnValue(['owner'])
    permissionService.userHasRole.mockResolvedValue(false)

    await expect(guard.canActivate(mockCtx({ sub: 'u1', companyId: 'c1' }))).rejects.toThrow(
      ForbiddenException,
    )
  })

  it('should throw ForbiddenException when user is not authenticated', async () => {
    reflector.getAllAndOverride.mockReturnValue(['admin'])

    await expect(guard.canActivate(mockCtx(null))).rejects.toThrow(ForbiddenException)
  })
})
