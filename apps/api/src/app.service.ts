import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  getRoot(): { name: string; version: string; docs: string } {
    return {
      name: 'AgencyOS API',
      version: '1.0.0',
      docs: '/api/docs',
    }
  }
}
