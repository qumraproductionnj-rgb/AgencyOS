import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'

interface CompanyProfileData {
  name?: string
  nameEn?: string
  logoUrl?: string
  address?: string
  phone?: string
  website?: string
}

interface WorkLocationData {
  name: string
  latitude: number
  longitude: number
  radiusMeters: number
}

interface DepartmentData {
  nameAr: string
  nameEn?: string
}

interface EmployeeInviteData {
  email: string
  fullNameAr: string
  fullNameEn?: string
}

export interface OnboardingData {
  companyProfile?: CompanyProfileData
  workLocation?: WorkLocationData
  departments?: DepartmentData[]
  employees?: EmployeeInviteData[]
  selectedPlan?: string
}

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name)

  constructor(private readonly prisma: PrismaService) {}

  async getProgress(companyId: string) {
    let progress = await this.prisma.tenant.onboardingProgress.findUnique({
      where: { companyId },
    })

    if (!progress) {
      progress = await this.prisma.tenant.onboardingProgress.create({
        data: { companyId, currentStep: 1, isCompleted: false, data: {} },
      })
    }

    return progress
  }

  async saveProgress(
    companyId: string,
    currentStep: number,
    data: Record<string, unknown>,
    userId: string,
  ) {
    const existing = await this.prisma.tenant.onboardingProgress.findUnique({
      where: { companyId },
    })

    if (!existing) {
      return this.prisma.tenant.onboardingProgress.create({
        data: { companyId, currentStep, data: data as never, createdBy: userId },
      })
    }

    return this.prisma.tenant.onboardingProgress.update({
      where: { companyId },
      data: { currentStep, data: data as never, updatedBy: userId },
    })
  }

  async complete(companyId: string, userId: string) {
    const progress = await this.prisma.tenant.onboardingProgress.findUnique({
      where: { companyId },
    })
    if (!progress) throw new NotFoundException('No onboarding progress found')

    const data = progress.data as unknown as OnboardingData

    if (data.companyProfile) {
      const cp = data.companyProfile
      await this.prisma.tenant.company.update({
        where: { id: companyId },
        data: {
          ...(cp.name !== undefined && { name: cp.name }),
          ...(cp.nameEn !== undefined && { nameEn: cp.nameEn }),
          ...(cp.logoUrl !== undefined && { logoUrl: cp.logoUrl }),
          ...(cp.address !== undefined && { address: cp.address }),
          ...(cp.phone !== undefined && { phone: cp.phone }),
          ...(cp.website !== undefined && { website: cp.website }),
          updatedBy: userId,
        },
      })
    }

    await this.prisma.tenant.onboardingProgress.update({
      where: { companyId },
      data: { isCompleted: true, currentStep: 6, updatedBy: userId },
    })

    this.logger.log(`Onboarding completed for company ${companyId}`)
  }

  async skip(companyId: string, userId: string) {
    await this.prisma.tenant.onboardingProgress.upsert({
      where: { companyId },
      update: { isCompleted: true, currentStep: 6, updatedBy: userId },
      create: { companyId, currentStep: 6, isCompleted: true, updatedBy: userId, data: {} },
    })

    this.logger.log(`Onboarding skipped for company ${companyId}`)
  }
}
