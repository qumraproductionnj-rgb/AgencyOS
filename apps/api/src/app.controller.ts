import { Controller, Get } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { Public } from './common/decorators/public.decorator'
import { AppService } from './app.service'

@ApiTags('root')
@Public()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'API root' })
  getRoot(): { name: string; version: string; docs: string } {
    return this.appService.getRoot()
  }
}
