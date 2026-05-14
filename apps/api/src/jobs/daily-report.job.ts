import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../database/prisma.service'
import type { Env } from '../config/env.validation'

@Injectable()
export class DailyReportJob {
  private readonly logger = new Logger(DailyReportJob.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<Env>,
  ) {}

  @Cron('0 9 * * *', { timeZone: 'Asia/Baghdad' })
  async sendDailyReport() {
    const token = this.config.get('TELEGRAM_BOT_TOKEN', { infer: true })
    const chatId = this.config.get('TELEGRAM_ADMIN_CHAT_ID', { infer: true })

    if (!token || !chatId) {
      this.logger.warn(
        'TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_CHAT_ID not set — skipping daily report',
      )
      return
    }

    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const [companies, users, attendanceToday] = await Promise.all([
        this.prisma.system.company.count(),
        this.prisma.system.user.count(),
        this.prisma.system.attendanceRecord.count({
          where: { createdAt: { gte: today } },
        }),
      ])

      const message = [
        `📊 *التقرير اليومي — Vision OS*`,
        `📅 ${new Date().toLocaleDateString('ar-IQ', { timeZone: 'Asia/Baghdad', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
        ``,
        `🏢 الشركات المسجلة: *${companies}*`,
        `👥 إجمالي المستخدمين: *${users}*`,
        `✅ حضور اليوم: *${attendanceToday}*`,
        ``,
        `🤖 Vision OS — فريق رؤية للإنتاج الفني`,
      ].join('\n')

      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' }),
      })

      this.logger.log('Daily report sent to Telegram')
    } catch (err) {
      this.logger.error('Failed to send daily report', err)
    }
  }
}
