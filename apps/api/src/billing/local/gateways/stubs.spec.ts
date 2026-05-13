import { NotImplementedException } from '@nestjs/common'
import { ZainCashService } from './zaincash.service'
import { FastPayService } from './fastpay.service'

describe('ZainCashService (stub)', () => {
  const svc = new ZainCashService()

  it('reports code=zaincash and isImplemented=false', () => {
    expect(svc.code).toBe('zaincash')
    expect(svc.isImplemented).toBe(false)
  })

  it('throws NotImplementedException on createPaymentIntent', async () => {
    await expect(
      svc.createPaymentIntent({
        intentId: 'i1',
        amountFils: 1000n,
        description: 'x',
        callbackUrl: 'u',
      }),
    ).rejects.toThrow(NotImplementedException)
  })

  it('returns false signatures and null events without throwing', () => {
    expect(svc.verifyWebhookSignature('p', 's')).toBe(false)
    expect(svc.parseWebhookEvent('p')).toBeNull()
  })
})

describe('FastPayService (stub)', () => {
  const svc = new FastPayService()

  it('reports code=fastpay and isImplemented=false', () => {
    expect(svc.code).toBe('fastpay')
    expect(svc.isImplemented).toBe(false)
  })

  it('throws NotImplementedException on getPaymentStatus', async () => {
    await expect(svc.getPaymentStatus('p')).rejects.toThrow(NotImplementedException)
  })
})
