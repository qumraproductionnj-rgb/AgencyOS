import { type INestApplication, ValidationPipe, VersioningType } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'

describe('App (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix('api')
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    )
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /api/v1/health', () => {
    it('should return 200 with status ok when DB and Redis are up', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/health').expect(200)

      expect(response.body).toMatchObject({
        status: 'ok',
        info: {
          database: { status: 'up' },
          redis: { status: 'up' },
        },
      })
    })
  })

  describe('GET /api/v1', () => {
    it('should return API metadata', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1').expect(200)

      expect(response.body).toMatchObject({
        name: 'AgencyOS API',
        version: '1.0.0',
        docs: '/api/docs',
      })
    })
  })
})
