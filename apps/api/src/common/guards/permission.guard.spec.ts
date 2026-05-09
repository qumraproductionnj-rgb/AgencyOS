import { ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PermissionsGuard } from './permission.guard'
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

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard
  let reflector: jest.Mocked<Reflector>
  let permissionService: jest.Mocked<PermissionService>

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>

    permissionService = {
      userCan: jest.fn(),
    } as unknown as jest.Mocked<PermissionService>

    guard = new PermissionsGuard(reflector, permissionService)
  })

  it('should pass when no permission metadata is set', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined)

    const result = await guard.canActivate(mockCtx({ sub: 'u1', companyId: 'c1' }))

    expect(result).toBe(true)
  })

  it('should pass when user has the required permission', async () => {
    reflector.getAllAndOverride.mockReturnValue({ resource: 'employees', action: 'read' })
    permissionService.userCan.mockResolvedValue(true)

    const result = await guard.canActivate(mockCtx({ sub: 'u1', companyId: 'c1' }))

    expect(result).toBe(true)
    expect(permissionService.userCan).toHaveBeenCalledWith('u1', 'c1', 'employees', 'read')
  })

  it('should throw ForbiddenException when user lacks permission', async () => {
    reflector.getAllAndOverride.mockReturnValue({ resource: 'employees', action: 'read' })
    permissionService.userCan.mockResolvedValue(false)

    await expect(guard.canActivate(mockCtx({ sub: 'u1', companyId: 'c1' }))).rejects.toThrow(
      ForbiddenException,
    )
  })

  it('should throw ForbiddenException when user is not authenticated', async () => {
    reflector.getAllAndOverride.mockReturnValue({ resource: 'employees', action: 'read' })

    await expect(guard.canActivate(mockCtx(null))).rejects.toThrow(ForbiddenException)
  })

  it('should throw ForbiddenException when user has no companyId', async () => {
    reflector.getAllAndOverride.mockReturnValue({ resource: 'employees', action: 'read' })

    await expect(guard.canActivate(mockCtx({ sub: 'u1', companyId: '' }))).rejects.toThrow(
      ForbiddenException,
    )
  })
})
