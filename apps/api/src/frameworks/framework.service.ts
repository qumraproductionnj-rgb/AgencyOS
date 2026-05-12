import { Injectable } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import type { FrameworkQueryDto } from './framework.dto'

@Injectable()
export class FrameworkService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: FrameworkQueryDto) {
    const where: Record<string, unknown> = { isGlobal: true }

    if (query.category) {
      where['category'] = query.category
    }
    if (query.contentType) {
      where['bestForContentTypes'] = { has: query.contentType }
    }
    if (query.search) {
      where['OR'] = [
        { nameAr: { contains: query.search, mode: 'insensitive' } },
        { nameEn: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    return this.prisma.tenant.framework.findMany({
      where: where as never,
      orderBy: { id: 'asc' },
    })
  }

  async findOne(code: string) {
    return this.prisma.tenant.framework.findUniqueOrThrow({ where: { code } })
  }

  async recommend(contentType?: string, _objective?: string) {
    const where: Record<string, unknown> = { isGlobal: true }

    if (contentType) {
      where['bestForContentTypes'] = { has: contentType }
    }

    const frameworks = await this.prisma.tenant.framework.findMany({
      where: where as never,
      orderBy: { id: 'asc' },
    })

    return frameworks
  }
}
