import { type PrismaClient } from '@prisma/client'
import { PERMISSIONS, ROLES, permissionKey } from './permissions'

export async function seedPermissions(client: PrismaClient): Promise<Map<string, string>> {
  const keyToId = new Map<string, string>()

  for (const p of PERMISSIONS) {
    const key = permissionKey(p)
    const record = await client.permission.upsert({
      where: { resource_action_scope: { resource: p.resource, action: p.action, scope: p.scope } },
      update: { description: p.description },
      create: {
        resource: p.resource,
        action: p.action,
        scope: p.scope || null,
        description: p.description,
      },
    })
    keyToId.set(key, record.id)
  }

  return keyToId
}

export async function seedDefaultRoles(
  client: PrismaClient,
  companyId: string,
  permissionKeyToId: Map<string, string>,
  createdByUserId?: string,
): Promise<void> {
  for (const roleDef of ROLES) {
    const role = await client.role.upsert({
      where: { companyId_name: { companyId, name: roleDef.key } },
      update: {},
      create: {
        companyId,
        name: roleDef.key,
        displayNameAr: roleDef.displayNameAr,
        displayNameEn: roleDef.displayNameEn,
        isSystem: true,
        description: roleDef.description,
        createdBy: createdByUserId ?? null,
      },
    })

    for (const key of roleDef.permissionKeys) {
      const permissionId = permissionKeyToId.get(key)
      if (!permissionId) {
        throw new Error(`Permission key "${key}" not found for role "${roleDef.key}"`)
      }

      await client.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId } },
        update: {},
        create: {
          companyId,
          roleId: role.id,
          permissionId,
          createdBy: createdByUserId ?? null,
        },
      })
    }
  }
}
