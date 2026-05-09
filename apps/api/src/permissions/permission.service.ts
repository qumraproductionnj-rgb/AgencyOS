import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import { seedDefaultRoles } from '@agencyos/database'

@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name)

  constructor(private readonly prisma: PrismaService) {}

  async seedCompanyDefaultRoles(companyId: string, createdByUserId?: string): Promise<void> {
    const keyToId = await this.getPermissionKeyToIdMap()
    await seedDefaultRoles(this.prisma.system, companyId, keyToId, createdByUserId)
  }

  private async getPermissionKeyToIdMap(): Promise<Map<string, string>> {
    const all = await this.prisma.system.permission.findMany()
    const map = new Map<string, string>()
    for (const p of all) {
      const key = p.scope ? `${p.resource}.${p.action}.${p.scope}` : `${p.resource}.${p.action}`
      map.set(key, p.id)
    }
    return map
  }

  async userCan(
    userId: string,
    companyId: string,
    resource: string,
    action: string,
  ): Promise<boolean> {
    try {
      const rows = await this.prisma.system.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*) as count FROM user_roles ur
        JOIN role_permissions rp ON rp.role_id = ur.role_id
        JOIN permissions p ON p.id = rp.permission_id
        WHERE ur.user_id = ${userId}::uuid
          AND rp.company_id = ${companyId}::uuid
          AND p.resource = ${resource}
          AND (p.action = ${action} OR p.action = 'manage')
      `
      const row = rows[0]
      return row !== undefined && Number(row.count) > 0
    } catch (err) {
      this.logger.error(
        `Permission check failed: userId=${userId} resource=${resource} action=${action}`,
        (err as Error).message,
      )
      return false
    }
  }

  async getUserPermissions(userId: string, companyId: string): Promise<string[]> {
    try {
      const rows = await this.prisma.system.$queryRaw<{ resource: string; action: string }[]>`
        SELECT DISTINCT p.resource, p.action FROM user_roles ur
        JOIN role_permissions rp ON rp.role_id = ur.role_id
        JOIN permissions p ON p.id = rp.permission_id
        WHERE ur.user_id = ${userId}::uuid
          AND rp.company_id = ${companyId}::uuid
      `
      return rows.map((r) => `${r.resource}.${r.action}`)
    } catch (err) {
      this.logger.error(`Failed to get permissions for user ${userId}`, (err as Error).message)
      return []
    }
  }

  async getUserRoles(userId: string, companyId: string): Promise<string[]> {
    try {
      const rows = await this.prisma.system.$queryRaw<{ name: string }[]>`
        SELECT r.name FROM user_roles ur
        JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = ${userId}::uuid
          AND r.company_id = ${companyId}::uuid
          AND r.deleted_at IS NULL
      `
      return rows.map((r) => r.name)
    } catch (err) {
      this.logger.error(`Failed to get roles for user ${userId}`, (err as Error).message)
      return []
    }
  }

  async userHasRole(userId: string, companyId: string, roles: string[]): Promise<boolean> {
    try {
      const rows = await this.prisma.system.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*) as count FROM user_roles ur
        JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = ${userId}::uuid
          AND r.company_id = ${companyId}::uuid
          AND r.deleted_at IS NULL
          AND r.name = ANY(${roles})
      `
      const row = rows[0]
      return row !== undefined && Number(row.count) > 0
    } catch (err) {
      this.logger.error(
        `Role check failed: userId=${userId} roles=${JSON.stringify(roles)}`,
        (err as Error).message,
      )
      return false
    }
  }
}
