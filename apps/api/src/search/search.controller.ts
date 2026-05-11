import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator'
import { RequireTier } from '../common/decorators/require-tier.decorator'
import { SearchService } from './search.service'

@ApiTags('search')
@Controller()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('v1/search')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Full-text search across all entities' })
  @RequireTier('TENANT')
  async searchAll(@Query('q') query: string | undefined, @CurrentUser() user: CurrentUserPayload) {
    return this.searchService.search(user.companyId!, query ?? '')
  }
}
