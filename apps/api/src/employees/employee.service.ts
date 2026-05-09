import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { randomBytes } from 'node:crypto'
import { PrismaService } from '../database/prisma.service'
import { PasswordService } from '../auth/services/password.service'
import { EmailService } from '../auth/services/email.service'
import { RedisService } from '../redis/redis.service'
import { inviteEmployeeAr, inviteEmployeeEn } from '../auth/templates/auth-emails'
import type { CreateEmployeeDto, UpdateEmployeeDto } from './employee.dto'

const INVITE_PREFIX = 'invite:'
const INVITE_TTL = 60 * 60 * 72 // 72h

@Injectable()
export class EmployeeService {
  private readonly logger = new Logger(EmployeeService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly password: PasswordService,
    private readonly email: EmailService,
    private readonly redis: RedisService,
  ) {}

  async findAll(companyId: string, filters?: Record<string, string>) {
    const where: Record<string, unknown> = { companyId, deletedAt: null }
    if (filters?.['departmentId']) where['departmentId'] = filters['departmentId']
    if (filters?.['status']) where['status'] = filters['status']
    if (filters?.['search']) {
      where['OR'] = [
        { fullNameAr: { contains: filters['search'], mode: 'insensitive' } },
        { fullNameEn: { contains: filters['search'], mode: 'insensitive' } },
        { email: { contains: filters['search'], mode: 'insensitive' } },
      ]
    }
    return this.prisma.tenant.employee.findMany({
      where: where as never,
      include: { department: { select: { id: true, nameAr: true, nameEn: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(companyId: string, id: string) {
    const emp = await this.prisma.tenant.employee.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        department: { select: { id: true, nameAr: true, nameEn: true } },
        user: { select: { emailVerifiedAt: true, isActive: true } },
      },
    })
    if (!emp) throw new NotFoundException('Employee not found')
    return emp
  }

  async create(companyId: string, dto: CreateEmployeeDto, userId: string) {
    const existing = await this.prisma.tenant.employee.findFirst({
      where: { companyId, email: dto.email },
    })
    if (existing) throw new ConflictException('An employee with this email already exists')

    const count = await this.prisma.tenant.employee.count({ where: { companyId } })
    const employeeCode = `EMP-${String(count + 1).padStart(5, '0')}`

    const placeholderHash = await this.password.hash(randomBytes(16).toString('hex'))
    const appUser = await this.prisma.system.user.create({
      data: {
        companyId,
        email: dto.email,
        passwordHash: placeholderHash,
        preferredLanguage: 'ar',
        timezone: 'Asia/Baghdad',
      },
    })

    const emp = await this.prisma.tenant.employee.create({
      data: {
        companyId,
        userId: appUser.id,
        employeeCode,
        fullNameAr: dto.fullNameAr,
        fullNameEn: dto.fullNameEn ?? null,
        email: dto.email,
        phone: dto.phone ?? null,
        nationalId: dto.nationalId ?? null,
        position: dto.position ?? null,
        departmentId: dto.departmentId ?? null,
        employmentType: dto.employmentType,
        salaryAmount: BigInt(dto.salaryAmount),
        salaryCurrency: dto.salaryCurrency,
        salaryType: dto.salaryType,
        startDate: new Date(dto.startDate),
        scheduledStartTime: dto.scheduledStartTime,
        scheduledEndTime: dto.scheduledEndTime,
        weeklyOffDays: dto.weeklyOffDays,
        notesInternal: dto.notesInternal ?? null,
        createdBy: userId,
      },
    })

    await this.sendInvite(appUser.id, appUser.email, companyId, dto.fullNameAr)
    this.logger.log(`Employee created: ${emp.id} (${dto.email}) in company ${companyId}`)
    return emp
  }

  async update(companyId: string, id: string, dto: UpdateEmployeeDto, userId: string) {
    await this.findOne(companyId, id)
    const data: Record<string, unknown> = { updatedBy: userId }
    const fields: (keyof UpdateEmployeeDto)[] = [
      'fullNameAr',
      'fullNameEn',
      'phone',
      'nationalId',
      'position',
      'departmentId',
      'employmentType',
      'salaryCurrency',
      'salaryType',
      'scheduledStartTime',
      'scheduledEndTime',
      'weeklyOffDays',
      'status',
      'notesInternal',
    ]
    for (const key of fields) {
      if (dto[key] !== undefined) data[key] = dto[key]
    }
    if (dto.salaryAmount !== undefined) data['salaryAmount'] = BigInt(dto.salaryAmount)
    if (dto.startDate !== undefined) data['startDate'] = new Date(dto.startDate)
    if (dto.endDate !== undefined) data['endDate'] = dto.endDate ? new Date(dto.endDate) : null
    if (dto.notesInternal !== undefined) data['notesInternal'] = dto.notesInternal ?? null
    if (dto.departmentId !== undefined) data['departmentId'] = dto.departmentId ?? null

    const emp = await this.prisma.tenant.employee.update({
      where: { id },
      data: data as never,
    })
    this.logger.log(`Employee updated: ${id}`)
    return emp
  }

  async remove(companyId: string, id: string, userId: string) {
    await this.findOne(companyId, id)
    const emp = await this.prisma.tenant.employee.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: userId },
    })
    this.logger.log(`Employee soft-deleted: ${id}`)
    return emp
  }

  async acceptInvite(token: string, password: string) {
    const key = `${INVITE_PREFIX}${token}`
    const userId = await this.redis.get(key)
    if (!userId) throw new NotFoundException('Invalid or expired invitation token')
    await this.redis.del(key)

    const hash = await this.password.hash(password)
    await this.prisma.system.user.update({
      where: { id: userId },
      data: { passwordHash: hash, emailVerifiedAt: new Date(), updatedBy: userId },
    })
    this.logger.log(`Employee accepted invite: ${userId}`)
  }

  private async sendInvite(userId: string, email: string, companyId: string, name: string) {
    const token = randomBytes(32).toString('base64url')
    await this.redis.set(`${INVITE_PREFIX}${token}`, userId, INVITE_TTL)

    const company = await this.prisma.system.company.findUnique({ where: { id: companyId } })
    const companyName = company?.name ?? 'Your Company'
    const baseUrl = process.env['APP_URL'] ?? 'http://localhost:3000'
    const inviteUrl = `${baseUrl}/ar/accept-invite?token=${token}`

    const ar = inviteEmployeeAr({ appName: 'AgencyOS', inviteUrl, companyName })
    const en = inviteEmployeeEn({ appName: 'AgencyOS', inviteUrl, companyName })
    const lang = name.match(/[\u0600-\u06FF]/) ? 'ar' : 'en'
    const { subject, html } = lang === 'ar' ? ar : en

    await this.email.send({ to: email, subject, html }).catch((err) => {
      this.logger.error(`Failed to send invite email to ${email}: ${err.message}`)
    })
  }
}
