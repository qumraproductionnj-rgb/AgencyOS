import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'

export interface PlanLimitResult {
  allowed: boolean
  limit: number
  current: number
}

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name)

  constructor(private readonly prisma: PrismaService) {}

  async findAllPlans() {
    return this.prisma.system.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })
  }

  async findPlanById(planId: string) {
    const plan = await this.prisma.system.subscriptionPlan.findUnique({
      where: { id: planId },
    })
    if (!plan) throw new NotFoundException('Subscription plan not found')
    return plan
  }

  async findPlanByKey(key: string) {
    const plan = await this.prisma.system.subscriptionPlan.findUnique({
      where: { key },
    })
    if (!plan) throw new NotFoundException('Subscription plan not found')
    return plan
  }

  async getCurrentSubscription(companyId: string) {
    const subscription = await this.prisma.tenant.subscription.findUnique({
      where: { companyId },
      include: { plan: true },
    })
    return subscription
  }

  async getCurrentPlan(companyId: string) {
    const subscription = await this.getCurrentSubscription(companyId)
    if (!subscription) {
      const defaultPlan = await this.findPlanByKey('professional')
      return defaultPlan
    }
    return subscription.plan
  }

  async createTrialSubscription(
    companyId: string,
    userId: string,
    planKey = 'professional',
    trialDays = 14,
  ) {
    const plan = await this.findPlanByKey(planKey)
    const now = new Date()
    const trialEndsAt = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000)

    const existing = await this.prisma.tenant.subscription.findUnique({
      where: { companyId },
    })
    if (existing) {
      throw new BadRequestException('Company already has a subscription')
    }

    return this.prisma.tenant.subscription.create({
      data: {
        companyId,
        planId: plan.id,
        status: 'TRIAL',
        trialEndsAt,
        currentPeriodStart: now,
        currentPeriodEnd: trialEndsAt,
        createdBy: userId,
        updatedBy: userId,
      },
      include: { plan: true },
    })
  }

  async changePlan(companyId: string, planId: string, userId: string) {
    const plan = await this.findPlanById(planId)
    const subscription = await this.getCurrentSubscription(companyId)
    if (!subscription) {
      throw new NotFoundException('No active subscription found for this company')
    }

    return this.prisma.tenant.subscription.update({
      where: { companyId },
      data: {
        planId: plan.id,
        updatedBy: userId,
      },
      include: { plan: true },
    })
  }

  async updateStatus(
    companyId: string,
    status: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED',
    userId: string,
  ) {
    const subscription = await this.getCurrentSubscription(companyId)
    if (!subscription) {
      throw new NotFoundException('No active subscription found for this company')
    }

    return this.prisma.tenant.subscription.update({
      where: { companyId },
      data: {
        status,
        ...(status === 'CANCELLED' ? { cancelledAt: new Date() } : {}),
        updatedBy: userId,
      },
      include: { plan: true },
    })
  }

  async checkFeatureAccess(companyId: string, feature: string): Promise<boolean> {
    const plan = await this.getCurrentPlan(companyId)
    const features = plan.features as Record<string, boolean>
    return features[feature] === true
  }

  async requireFeatureAccess(
    companyId: string,
    feature: string,
    featureLabel: string,
  ): Promise<void> {
    const plan = await this.getCurrentPlan(companyId)
    const features = plan.features as Record<string, boolean>
    if (!features[feature]) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'PLAN_LIMIT_EXCEEDED',
        message: `"${featureLabel}" requires ${plan.nameEn} plan or higher. Upgrade to continue.`,
        requiredPlan: plan.key === 'starter' ? 'professional' : 'agency',
      })
    }
  }

  async checkNumericLimit(
    companyId: string,
    currentCount: number,
    limitKey: keyof typeof NumericLimitKeys,
  ): Promise<PlanLimitResult> {
    const plan = await this.getCurrentPlan(companyId)
    const limitKeyMap: Record<string, number> = {
      maxUsers: plan.maxUsers,
      maxClients: plan.maxClients,
      maxProjects: plan.maxProjects,
      maxStorageMb: plan.maxStorageMb,
      maxAiGenerationsPerMonth: plan.maxAiGenerationsPerMonth,
    }

    const limit = limitKeyMap[limitKey as string] ?? Infinity
    return {
      allowed: currentCount < limit,
      limit,
      current: currentCount,
    }
  }

  async requireNumericLimit(
    companyId: string,
    currentCount: number,
    limitKey: keyof typeof NumericLimitKeys,
    label: string,
  ): Promise<void> {
    const result = await this.checkNumericLimit(companyId, currentCount, limitKey)
    if (!result.allowed) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'PLAN_LIMIT_EXCEEDED',
        message: `${label} limit (${result.limit}) reached. Upgrade your plan for more.`,
        current: result.current,
        limit: result.limit,
      })
    }
  }
}

export const NumericLimitKeys = {
  maxUsers: 'maxUsers',
  maxClients: 'maxClients',
  maxProjects: 'maxProjects',
  maxStorageMb: 'maxStorageMb',
  maxAiGenerationsPerMonth: 'maxAiGenerationsPerMonth',
} as const
