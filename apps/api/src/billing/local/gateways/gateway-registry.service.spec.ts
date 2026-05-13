import { Test } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { GatewayRegistryService } from './gateway-registry.service'
import { FibService } from './fib.service'
import { ZainCashService } from './zaincash.service'
import { FastPayService } from './fastpay.service'

const mockConfig = {
  get: jest.fn((key: string) => {
    if (key === 'LOCAL_GATEWAY_MOCK_MODE') return true
    if (key === 'FIB_BASE_URL') return 'https://stage.fib.iq'
    return undefined
  }),
}

describe('GatewayRegistryService', () => {
  let registry: GatewayRegistryService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GatewayRegistryService,
        FibService,
        ZainCashService,
        FastPayService,
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile()
    registry = module.get(GatewayRegistryService)
  })

  it('resolves the FIB gateway by code', () => {
    expect(registry.get('fib').code).toBe('fib')
  })

  it('resolves ZainCash and FastPay (stubs) by code', () => {
    expect(registry.get('zaincash').code).toBe('zaincash')
    expect(registry.get('fastpay').code).toBe('fastpay')
  })

  it('throws NotFoundException for unknown codes', () => {
    // @ts-expect-error — testing runtime guard
    expect(() => registry.get('paypal')).toThrow(NotFoundException)
  })

  it('listAvailable reports implementation status per gateway', () => {
    const list = registry.listAvailable()
    expect(list).toEqual(
      expect.arrayContaining([
        { code: 'fib', isImplemented: true },
        { code: 'zaincash', isImplemented: false },
        { code: 'fastpay', isImplemented: false },
      ]),
    )
  })
})
