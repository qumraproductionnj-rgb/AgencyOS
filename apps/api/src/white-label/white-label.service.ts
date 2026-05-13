import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import { SubscriptionService } from '../subscriptions/subscription.service'

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/
const SUBDOMAIN = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/
const DOMAIN = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/

@Injectable()
export class WhiteLabelService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptions: SubscriptionService,
  ) {}

  async getBranding(companyId: string) {
    const c = await this.prisma.system.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        nameEn: true,
        logoUrl: true,
        customSubdomain: true,
        customDomain: true,
        brandPrimaryColor: true,
        brandSecondaryColor: true,
        hidePoweredBy: true,
      },
    })
    return c
  }

  /** Public lookup by host header — used by middleware to render tenant theme on first paint. */
  async resolveByHost(host: string) {
    const cleaned = host.toLowerCase().split(':')[0]!
    const sub = cleaned.split('.')[0] ?? cleaned
    return this.prisma.system.company.findFirst({
      where: {
        OR: [{ customDomain: cleaned }, { customSubdomain: sub }],
      },
      select: {
        id: true,
        name: true,
        nameEn: true,
        logoUrl: true,
        brandPrimaryColor: true,
        brandSecondaryColor: true,
        hidePoweredBy: true,
      },
    })
  }

  async update(input: {
    companyId: string
    userId: string
    customSubdomain?: string | null
    customDomain?: string | null
    brandPrimaryColor?: string | null
    brandSecondaryColor?: string | null
    hidePoweredBy?: boolean
  }) {
    // White-label is gated on plan feature flag.
    await this.subscriptions.requireFeatureAccess(
      input.companyId,
      'whiteLabel',
      'White-label branding',
    )

    if (input.brandPrimaryColor && !HEX_COLOR.test(input.brandPrimaryColor))
      throw new BadRequestException('brandPrimaryColor must be a hex color like #1A2B3C')
    if (input.brandSecondaryColor && !HEX_COLOR.test(input.brandSecondaryColor))
      throw new BadRequestException('brandSecondaryColor must be a hex color')
    if (input.customSubdomain && !SUBDOMAIN.test(input.customSubdomain))
      throw new BadRequestException(
        'Invalid subdomain — use lowercase letters, digits, and hyphens',
      )
    if (input.customDomain && !DOMAIN.test(input.customDomain))
      throw new BadRequestException('Invalid custom domain')

    if (input.customSubdomain) {
      const sub = input.customSubdomain
      const taken = await this.prisma.system.company.findFirst({
        where: { customSubdomain: sub, NOT: { id: input.companyId } },
        select: { id: true },
      })
      if (taken) throw new ForbiddenException('Subdomain is already taken')
    }
    if (input.customDomain) {
      const dom = input.customDomain
      const taken = await this.prisma.system.company.findFirst({
        where: { customDomain: dom, NOT: { id: input.companyId } },
        select: { id: true },
      })
      if (taken) throw new ForbiddenException('Domain is already claimed by another tenant')
    }

    return this.prisma.system.company.update({
      where: { id: input.companyId },
      data: {
        ...(input.customSubdomain !== undefined ? { customSubdomain: input.customSubdomain } : {}),
        ...(input.customDomain !== undefined ? { customDomain: input.customDomain } : {}),
        ...(input.brandPrimaryColor !== undefined
          ? { brandPrimaryColor: input.brandPrimaryColor }
          : {}),
        ...(input.brandSecondaryColor !== undefined
          ? { brandSecondaryColor: input.brandSecondaryColor }
          : {}),
        ...(input.hidePoweredBy !== undefined ? { hidePoweredBy: input.hidePoweredBy } : {}),
        updatedBy: input.userId,
      },
    })
  }
}
