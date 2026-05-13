import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator'
import { RequireRole } from '../common/decorators/require-role.decorator'
import { RequireTier } from '../common/decorators/require-tier.decorator'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import {
  CreateClientSchema,
  UpdateClientSchema,
  CreateContactSchema,
  UpdateContactSchema,
  CreatePortalUserSchema,
  type CreateClientDto,
  type UpdateClientDto,
  type CreateContactDto,
  type UpdateContactDto,
  type CreatePortalUserDto,
} from './client.dto'
import { ClientService } from './client.service'

@ApiTags('clients')
@ApiBearerAuth()
@Controller({ path: 'clients', version: '1' })
@RequireTier('TENANT')
@RequireRole('owner', 'admin', 'sales', 'account_manager')
export class ClientController {
  constructor(private readonly client: ClientService) {}

  @Get()
  @ApiOperation({ summary: 'List clients with optional filters' })
  async findAll(
    @Query('search') search: string | undefined,
    @Query('vip') vip: string | undefined,
    @Query('blacklisted') blacklisted: string | undefined,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.client.findAll(user.companyId!, {
      ...(search !== undefined ? { search } : {}),
      ...(vip !== undefined ? { vip } : {}),
      ...(blacklisted !== undefined ? { blacklisted } : {}),
    })
  }

  @Post()
  @ApiOperation({ summary: 'Create a client' })
  async create(
    @Body(new ZodValidationPipe(CreateClientSchema)) dto: CreateClientDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.client.create(user.companyId!, user.sub, dto)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a client by ID with contacts and deals' })
  async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.client.findOne(user.companyId!, id)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a client' })
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateClientSchema)) dto: UpdateClientDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.client.update(user.companyId!, id, user.sub, dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a client' })
  async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    await this.client.remove(user.companyId!, id, user.sub)
    return { status: 'deleted' }
  }

  // --- Contacts ---

  @Get(':clientId/contacts')
  @ApiOperation({ summary: 'List contacts for a client' })
  async findContacts(@Param('clientId') clientId: string, @CurrentUser() user: CurrentUserPayload) {
    return this.client.findContacts(user.companyId!, clientId)
  }

  @Post(':clientId/contacts')
  @ApiOperation({ summary: 'Create a contact for a client' })
  async createContact(
    @Param('clientId') clientId: string,
    @Body(new ZodValidationPipe(CreateContactSchema)) dto: CreateContactDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.client.createContact(user.companyId!, clientId, user.sub, dto)
  }

  @Put(':clientId/contacts/:id')
  @ApiOperation({ summary: 'Update a contact' })
  async updateContact(
    @Param('clientId') clientId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateContactSchema)) dto: UpdateContactDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.client.updateContact(user.companyId!, clientId, id, user.sub, dto)
  }

  @Delete(':clientId/contacts/:id')
  @ApiOperation({ summary: 'Delete a contact' })
  async removeContact(
    @Param('clientId') clientId: string,
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    await this.client.removeContact(user.companyId!, clientId, id, user.sub)
    return { status: 'deleted' }
  }

  // --- Portal Access ---

  @Post(':id/enable-portal')
  @ApiOperation({ summary: 'Enable client portal access' })
  async enablePortal(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    await this.client.enablePortal(user.companyId!, id, user.sub)
    return { status: 'portal_enabled' }
  }

  @Post(':id/disable-portal')
  @ApiOperation({ summary: 'Disable client portal access' })
  async disablePortal(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    await this.client.disablePortal(user.companyId!, id, user.sub)
    return { status: 'portal_disabled' }
  }

  @Post(':id/portal-users')
  @ApiOperation({ summary: 'Create a portal user for a client' })
  async createPortalUser(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(CreatePortalUserSchema)) dto: CreatePortalUserDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.client.createPortalUser(user.companyId!, id, dto, user.sub)
  }

  @Get(':id/portal-users')
  @ApiOperation({ summary: 'List portal users for a client' })
  async listPortalUsers(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.client.listPortalUsers(user.companyId!, id)
  }
}
