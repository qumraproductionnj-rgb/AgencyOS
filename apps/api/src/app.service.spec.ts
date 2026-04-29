import { Test, type TestingModule } from '@nestjs/testing'
import { AppService } from './app.service'

describe('AppService', () => {
  let service: AppService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile()

    service = module.get<AppService>(AppService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getRoot', () => {
    it('should return name, version, docs', () => {
      const result = service.getRoot()
      expect(result.name).toBe('AgencyOS API')
      expect(result.version).toBe('1.0.0')
      expect(result.docs).toBe('/api/docs')
    })
  })
})
