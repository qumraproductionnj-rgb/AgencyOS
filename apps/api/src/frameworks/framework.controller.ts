import { Controller, Get, Param, Query } from '@nestjs/common'
import { FrameworkService } from './framework.service'
import { FrameworkQuerySchema } from './framework.dto'

@Controller('v1/frameworks')
export class FrameworkController {
  constructor(private readonly service: FrameworkService) {}

  @Get()
  async findAll(@Query() query: unknown) {
    const parsed = FrameworkQuerySchema.parse(query)
    return this.service.findAll(parsed)
  }

  @Get('recommend')
  async recommend(
    @Query('contentType') contentType?: string,
    @Query('objective') objective?: string,
  ) {
    return this.service.recommend(contentType, objective)
  }

  @Get(':code')
  async findOne(@Param('code') code: string) {
    return this.service.findOne(code)
  }
}
