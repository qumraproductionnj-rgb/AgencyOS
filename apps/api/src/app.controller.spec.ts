import { Test, type TestingModule } from '@nestjs/testing'
import { AppController } from './app.controller'
import { AppService } from './app.service'

describe('AppController', () => {
  let appController: AppController

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile()

    appController = app.get<AppController>(AppController)
  })

  describe('getRoot', () => {
    it('should return API metadata', () => {
      const result = appController.getRoot()
      expect(result).toEqual({
        name: 'AgencyOS API',
        version: '1.0.0',
        docs: '/api/docs',
      })
    })
  })
})
