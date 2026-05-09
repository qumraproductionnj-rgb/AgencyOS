import { Test, type TestingModule } from '@nestjs/testing'
import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { AttendanceService } from './attendance.service'
import { PrismaService } from '../database/prisma.service'

describe('AttendanceService', () => {
  let service: AttendanceService
  const attEmp: Record<string, jest.Mock> = {}
  const attLoc: Record<string, jest.Mock> = {}
  const attRec: Record<string, jest.Mock> = {}

  const mockEmployee = { id: 'emp-1', scheduledStartTime: '09:00' }
  const mockLocation = {
    id: 'loc-1',
    name: 'Office',
    latitude: 33.3152,
    longitude: 44.3661,
    radiusMeters: 100,
  }

  beforeEach(async () => {
    attEmp['findFirst'] = jest.fn().mockResolvedValue(mockEmployee)
    attLoc['findMany'] = jest.fn().mockResolvedValue([mockLocation])
    attRec['create'] = jest.fn().mockResolvedValue({ id: 'rec-1', status: 'PRESENT' })
    attRec['findFirst'] = jest.fn()
    attRec['update'] = jest.fn()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        {
          provide: PrismaService,
          useValue: {
            tenant: { employee: attEmp, workLocation: attLoc, attendanceRecord: attRec },
          },
        },
      ],
    }).compile()

    service = module.get<AttendanceService>(AttendanceService)
  })

  it('checkIn creates record when within range', async () => {
    const result = await service.checkIn('company-1', 'user-1', {
      latitude: 33.3155,
      longitude: 44.3665,
    })
    expect(result).toBeDefined()
    expect(attRec['create']!).toHaveBeenCalled()
  })

  it('checkIn throws OUT_OF_RANGE when outside radius', async () => {
    const dto = { latitude: 33.4, longitude: 44.5 }
    await expect(service.checkIn('company-1', 'user-1', dto)).rejects.toThrow(ForbiddenException)
  })

  it('checkIn throws when no locations assigned', async () => {
    attLoc['findMany'] = jest.fn().mockResolvedValue([])
    await expect(
      service.checkIn('company-1', 'user-1', { latitude: 33.3, longitude: 44.3 }),
    ).rejects.toThrow(ForbiddenException)
  })

  it('checkIn throws when employee not found', async () => {
    attEmp['findFirst'] = jest.fn().mockResolvedValue(null)
    await expect(
      service.checkIn('company-1', 'user-1', { latitude: 33.3, longitude: 44.3 }),
    ).rejects.toThrow(NotFoundException)
  })

  it('checkOut updates record with check-out time', async () => {
    attRec['findFirst'] = jest.fn().mockResolvedValue({
      id: 'rec-1',
      checkInTime: new Date(Date.now() - 28_800_000),
    })
    attRec['update'] = jest.fn().mockResolvedValue({ id: 'rec-1', workHoursCalculated: 8 })
    const result = await service.checkOut('company-1', 'user-1', {})
    expect(result).toBeDefined()
    expect(attRec['update']!).toHaveBeenCalled()
  })

  it('getToday returns today record', async () => {
    attRec['findFirst'] = jest.fn().mockResolvedValue({ id: 'rec-1' })
    const result = await service.getToday('company-1', 'user-1')
    expect(result).toBeDefined()
  })
})
