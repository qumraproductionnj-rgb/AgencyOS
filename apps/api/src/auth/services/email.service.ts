import { Injectable, Logger, type OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import nodemailer, { type Transporter } from 'nodemailer'
import { Resend } from 'resend'
import type { Env } from '../../config/env.validation'

export type EmailLocale = 'ar' | 'en'

export interface SendEmailParams {
  to: string
  subject: string
  html: string
  text?: string
}

interface EmailDriver {
  send(params: SendEmailParams): Promise<void>
}

class ResendDriver implements EmailDriver {
  constructor(
    private readonly client: Resend,
    private readonly from: string,
  ) {}

  async send(params: SendEmailParams): Promise<void> {
    const { error } = await this.client.emails.send({
      from: this.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      ...(params.text !== undefined && { text: params.text }),
    })
    if (error) {
      throw new Error(`Resend error: ${error.message}`)
    }
  }
}

class SmtpDriver implements EmailDriver {
  constructor(
    private readonly transporter: Transporter,
    private readonly from: string,
  ) {}

  async send(params: SendEmailParams): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      ...(params.text !== undefined && { text: params.text }),
    })
  }
}

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name)
  private driver!: EmailDriver
  private fromAddress!: string

  constructor(private readonly config: ConfigService<Env>) {}

  onModuleInit(): void {
    const fromName = this.config.get('EMAIL_FROM_NAME', { infer: true }) ?? 'AgencyOS'
    const fromEmail = this.config.get('EMAIL_FROM', { infer: true }) ?? 'noreply@agencyos.app'
    this.fromAddress = `${fromName} <${fromEmail}>`

    const resendKey = this.config.get('RESEND_API_KEY', { infer: true })
    if (resendKey) {
      this.driver = new ResendDriver(new Resend(resendKey), this.fromAddress)
      this.logger.log('Email driver: Resend')
    } else {
      const host = this.config.get('SMTP_HOST', { infer: true }) ?? 'localhost'
      const port = this.config.get('SMTP_PORT', { infer: true }) ?? 1025
      const user = this.config.get('SMTP_USER', { infer: true })
      const pass = this.config.get('SMTP_PASSWORD', { infer: true })
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: false,
        ...(user && pass ? { auth: { user, pass } } : {}),
      })
      this.driver = new SmtpDriver(transporter, this.fromAddress)
      this.logger.log(`Email driver: SMTP (${host}:${String(port)})`)
    }
  }

  send(params: SendEmailParams): Promise<void> {
    return this.driver.send(params)
  }
}
