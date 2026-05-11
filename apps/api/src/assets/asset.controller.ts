import type { ZodSchema } from 'zod'
import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator'
import { RequireRole } from '../common/decorators/require-role.decorator'
import { RequireTier } from '../common/decorators/require-tier.decorator'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import {
  CreateFolderSchema,
  UpdateFolderSchema,
  AssetQuerySchema,
  CreateAssetSchema,
  UpdateAssetSchema,
  MoveAssetSchema,
  CreateVersionSchema,
  UpdateVersionSchema,
  type CreateFolderDto,
  type UpdateFolderDto,
  type AssetQueryDto,
  type CreateAssetDto,
  type UpdateAssetDto,
  type MoveAssetDto,
  type CreateVersionDto,
  type UpdateVersionDto,
} from './asset.dto'
import { AssetService } from './asset.service'

@ApiTags('assets')
@Controller()
export class AssetController {
  constructor(private readonly asset: AssetService) {}

  // ─── Folders ─────────────────────────────────────────

  @Get('v1/assets/folders')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all folders' })
  @RequireTier('TENANT')
  @RequireRole(
    'owner',
    'admin',
    'creative_director',
    'designer',
    'video_editor',
    'account_manager',
    'content_writer',
  )
  async findAllFolders(@CurrentUser() user: CurrentUserPayload) {
    return this.asset.findAllFolders(user.companyId!)
  }

  @Get('v1/assets/folders/tree')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get folder tree' })
  @RequireTier('TENANT')
  @RequireRole(
    'owner',
    'admin',
    'creative_director',
    'designer',
    'video_editor',
    'account_manager',
    'content_writer',
  )
  async getFolderTree(@CurrentUser() user: CurrentUserPayload) {
    return this.asset.getFolderTree(user.companyId!)
  }

  @Post('v1/assets/folders')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a folder' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'creative_director', 'designer', 'video_editor')
  async createFolder(
    @Body(new ZodValidationPipe(CreateFolderSchema)) dto: CreateFolderDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.asset.createFolder(user.companyId!, user.sub, dto)
  }

  @Put('v1/assets/folders/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a folder' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'creative_director', 'designer', 'video_editor')
  async updateFolder(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateFolderSchema)) dto: UpdateFolderDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.asset.updateFolder(user.companyId!, id, user.sub, dto)
  }

  @Delete('v1/assets/folders/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a folder (soft, must be empty)' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'creative_director', 'designer', 'video_editor')
  async removeFolder(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    await this.asset.removeFolder(user.companyId!, id, user.sub)
    return { status: 'deleted' }
  }

  // ─── Assets ──────────────────────────────────────────

  @Get('v1/assets')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List assets with cursor pagination' })
  @RequireTier('TENANT')
  @RequireRole(
    'owner',
    'admin',
    'creative_director',
    'designer',
    'video_editor',
    'account_manager',
    'content_writer',
  )
  async findAllAssets(
    @Query(new ZodValidationPipe(AssetQuerySchema as unknown as ZodSchema<AssetQueryDto>))
    query: AssetQueryDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.asset.findAllAssets(user.companyId!, query)
  }

  @Get('v1/assets/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get an asset by ID with versions' })
  @RequireTier('TENANT')
  @RequireRole(
    'owner',
    'admin',
    'creative_director',
    'designer',
    'video_editor',
    'account_manager',
    'content_writer',
  )
  async findOneAsset(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.asset.findOneAsset(user.companyId!, id)
  }

  @Post('v1/assets')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an asset' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'creative_director', 'designer', 'video_editor')
  async createAsset(
    @Body(new ZodValidationPipe(CreateAssetSchema)) dto: CreateAssetDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.asset.createAsset(user.companyId!, user.sub, dto)
  }

  @Put('v1/assets/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an asset' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'creative_director', 'designer', 'video_editor')
  async updateAsset(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateAssetSchema)) dto: UpdateAssetDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.asset.updateAsset(user.companyId!, id, user.sub, dto)
  }

  @Patch('v1/assets/:id/move')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Move asset to another folder' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'creative_director', 'designer', 'video_editor')
  async moveAsset(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(MoveAssetSchema)) dto: MoveAssetDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.asset.moveAsset(user.companyId!, id, dto)
  }

  @Delete('v1/assets/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an asset (soft delete)' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'creative_director', 'designer', 'video_editor')
  async removeAsset(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    await this.asset.removeAsset(user.companyId!, id, user.sub)
    return { status: 'deleted' }
  }

  // ─── Versions ────────────────────────────────────────

  @Get('v1/assets/:assetId/versions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List versions of an asset' })
  @RequireTier('TENANT')
  @RequireRole(
    'owner',
    'admin',
    'creative_director',
    'designer',
    'video_editor',
    'account_manager',
    'content_writer',
  )
  async findVersions(@Param('assetId') assetId: string, @CurrentUser() user: CurrentUserPayload) {
    return this.asset.findVersions(user.companyId!, assetId)
  }

  @Post('v1/assets/:assetId/versions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new version of an asset' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'creative_director', 'designer', 'video_editor')
  async createVersion(
    @Param('assetId') assetId: string,
    @Body(new ZodValidationPipe(CreateVersionSchema)) dto: CreateVersionDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.asset.createVersion(user.companyId!, assetId, user.sub, dto)
  }

  @Get('v1/assets/:assetId/versions/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a specific version' })
  @RequireTier('TENANT')
  @RequireRole(
    'owner',
    'admin',
    'creative_director',
    'designer',
    'video_editor',
    'account_manager',
    'content_writer',
  )
  async findOneVersion(
    @Param('assetId') assetId: string,
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.asset.findOneVersion(user.companyId!, assetId, id)
  }

  @Patch('v1/assets/:assetId/versions/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update version change notes' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'creative_director', 'designer', 'video_editor')
  async updateVersion(
    @Param('assetId') assetId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateVersionSchema)) dto: UpdateVersionDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.asset.updateVersion(user.companyId!, assetId, id, dto)
  }

  @Delete('v1/assets/:assetId/versions/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a version (soft delete)' })
  @RequireTier('TENANT')
  @RequireRole('owner', 'admin', 'creative_director', 'designer', 'video_editor')
  async removeVersion(
    @Param('assetId') assetId: string,
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    await this.asset.removeVersion(user.companyId!, assetId, id)
    return { status: 'deleted' }
  }
}
