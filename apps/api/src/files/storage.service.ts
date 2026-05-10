import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export interface StorageConfig {
  endpoint: string
  region: string
  bucket: string
  publicUrl: string
}

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name)
  private client!: S3Client
  private config!: StorageConfig
  private initialized = false

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const accountId = this.configService.get<string>('R2_ACCOUNT_ID')
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID')
    const secretAccessKey = this.configService.get<string>('R2_SECRET_ACCESS_KEY')
    const bucket = this.configService.get<string>('R2_BUCKET')
    const publicUrl = this.configService.get<string>('R2_PUBLIC_URL')

    if (!accessKeyId || !secretAccessKey || !bucket) {
      this.logger.warn('R2 credentials not configured — storage service will use local fallback')
      return
    }

    const endpoint = accountId
      ? `https://${accountId}.r2.cloudflarestorage.com`
      : (this.configService.get<string>('R2_ENDPOINT') ?? 'http://localhost:9000')

    this.config = {
      endpoint,
      region: 'auto',
      bucket,
      publicUrl: publicUrl ?? '',
    }

    this.client = new S3Client({
      region: this.config.region,
      endpoint: this.config.endpoint,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true,
    })

    this.initialized = true
    this.logger.log(`Storage service initialized (bucket: ${bucket})`)
  }

  get isReady(): boolean {
    return this.initialized
  }

  getBucket(): string {
    return this.config?.bucket ?? 'agencyos-dev'
  }

  buildKey(companyId: string, fileId: string, originalName: string): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_')
    return `${companyId}/${year}/${month}/${fileId}_${safeName}`
  }

  async upload(buffer: Buffer, key: string, mimeType: string): Promise<void> {
    if (!this.initialized) {
      this.logger.warn(`Storage not initialized — skipping upload for ${key}`)
      return
    }
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }),
    )
    this.logger.debug(`Uploaded: ${key} (${buffer.length} bytes)`)
  }

  async delete(key: string): Promise<void> {
    if (!this.initialized) return
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      }),
    )
    this.logger.debug(`Deleted: ${key}`)
  }

  async getSignedUrl(key: string, expiresInSeconds = 3600): Promise<string | null> {
    if (!this.initialized) return null
    const command = new GetObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
    })
    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds })
  }

  getPublicUrl(key: string): string {
    if (this.config?.publicUrl) {
      return `${this.config.publicUrl}/${key}`
    }
    return `${this.config?.endpoint ?? ''}/${this.config?.bucket ?? ''}/${key}`
  }

  getS3Client(): S3Client | null {
    return this.initialized ? this.client : null
  }
}
