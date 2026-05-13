import { Body, Controller, Get, Param, Post, Query, UnauthorizedException } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator'
import { RequireTier } from '../common/decorators/require-tier.decorator'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { PrismaService } from '../database/prisma.service'
import { ClientPortalService } from './client-portal.service'
import {
  CreateAnnotationSchema,
  RequestRevisionSchema,
  type CreateAnnotationDto,
  type RequestRevisionDto,
} from './client-portal.dto'

@ApiTags('client-portal')
@ApiBearerAuth()
@Controller({ path: 'portal', version: '1' })
@RequireTier('EXTERNAL')
export class ClientPortalController {
  constructor(
    private readonly portal: ClientPortalService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get client portal dashboard summary' })
  async getDashboard(@CurrentUser() user: CurrentUserPayload) {
    const clientId = await this.resolveClientId(user)
    return this.portal.getDashboard(clientId, user.companyId!)
  }

  @Get('projects')
  @ApiOperation({ summary: 'List client projects' })
  async getProjects(@CurrentUser() user: CurrentUserPayload) {
    const clientId = await this.resolveClientId(user)
    return this.portal.getProjects(clientId, user.companyId!)
  }

  @Get('content-pieces')
  @ApiOperation({ summary: 'List client content pieces' })
  async getContentPieces(@CurrentUser() user: CurrentUserPayload) {
    const clientId = await this.resolveClientId(user)
    return this.portal.getContentPieces(clientId, user.companyId!)
  }

  @Get('files')
  @ApiOperation({ summary: 'List files visible to client with optional status filter' })
  async getFiles(
    @Query('status') status: string | undefined,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const clientId = await this.resolveClientId(user)
    return this.portal.getFiles(clientId, user.companyId!, status)
  }

  @Get('files/:id/annotations')
  @ApiOperation({ summary: 'Get annotations for a file' })
  async getFileAnnotations(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.portal.getFileAnnotations(id, user.companyId!)
  }

  @Post('files/:id/annotations')
  @ApiOperation({ summary: 'Add annotation to a file' })
  async createAnnotation(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(CreateAnnotationSchema)) dto: CreateAnnotationDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.portal.createAnnotation(id, user.companyId!, user.sub, dto)
  }

  @Post('files/:id/approve')
  @ApiOperation({ summary: 'Approve a file' })
  async approveFile(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.portal.approveFile(id, user.companyId!, user.sub)
  }

  @Post('files/:id/request-revision')
  @ApiOperation({ summary: 'Request revision on a file with feedback' })
  async requestRevision(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(RequestRevisionSchema)) dto: RequestRevisionDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.portal.requestRevision(id, user.companyId!, user.sub, dto.feedback)
  }

  @Get('invoices')
  @ApiOperation({ summary: 'List client invoices' })
  async getInvoices(@CurrentUser() user: CurrentUserPayload) {
    const clientId = await this.resolveClientId(user)
    return this.portal.getInvoices(clientId, user.companyId!)
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get client profile' })
  async getProfile(@CurrentUser() user: CurrentUserPayload) {
    const clientId = await this.resolveClientId(user)
    return this.portal.getClientProfile(clientId, user.companyId!)
  }

  private async resolveClientId(user: CurrentUserPayload): Promise<string> {
    const portalUser = await this.prisma.system.clientPortalUser.findUnique({
      where: { userId: user.sub },
    })
    if (!portalUser) throw new UnauthorizedException('Portal user not linked to a client')
    return portalUser.clientId
  }
}
