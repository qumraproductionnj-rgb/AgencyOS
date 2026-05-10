import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator'
import { RequireRole } from '../common/decorators/require-role.decorator'
import { RequireTier } from '../common/decorators/require-tier.decorator'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import {
  InitUploadSchema,
  UpdateFileSchema,
  type InitUploadDto,
  type UpdateFileDto,
} from './file.dto'
import { FileService } from './file.service'

const MAX_SMALL_FILE_SIZE = 5 * 1024 * 1024 // 5MB

@ApiTags('files')
@Controller()
@RequireRole(
  'owner',
  'admin',
  'project_manager',
  'creative_director',
  'account_manager',
  'designer',
  'video_editor',
)
export class FileController {
  constructor(private readonly file: FileService) {}

  @Get('v1/files')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List files' })
  @RequireTier('TENANT')
  async findAll(
    @Query('entityType') entityType: string | undefined,
    @Query('entityId') entityId: string | undefined,
    @Query('search') search: string | undefined,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.file.findAll(user.companyId!, {
      ...(entityType !== undefined ? { entityType } : {}),
      ...(entityId !== undefined ? { entityId } : {}),
      ...(search !== undefined ? { search } : {}),
    })
  }

  @Get('v1/files/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get file details' })
  @RequireTier('TENANT')
  async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.file.findOne(user.companyId!, id)
  }

  @Post('v1/files/upload')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload a small file (<5MB)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        entityType: { type: 'string' },
        entityId: { type: 'string', format: 'uuid' },
        isVisibleToClient: { type: 'boolean' },
      },
    },
  })
  @RequireTier('TENANT')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body('entityType') entityType: string,
    @Body('entityId') entityId: string,
    @Body('isVisibleToClient') isVisibleToClient: string | undefined,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (!file) throw new Error('No file provided')
    if (file.size > MAX_SMALL_FILE_SIZE) {
      throw new Error(`File too large. Use TUS upload for files > 5MB. Size: ${file.size}`)
    }
    return this.file.uploadSmallFile(
      user.companyId!,
      user.sub,
      file.buffer,
      file.originalname,
      file.mimetype,
      entityType,
      entityId,
      isVisibleToClient === 'true',
    )
  }

  @Post('v1/files/tus-complete')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Complete a TUS upload (called by TUS hook)' })
  @RequireTier('TENANT')
  async completeTus(
    @Body(new ZodValidationPipe(InitUploadSchema)) dto: InitUploadDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const storageKey = `${user.companyId!}/${Date.now()}_${dto.originalName}`
    return this.file.completeTusUpload(
      user.companyId!,
      user.sub,
      dto.originalName,
      dto.mimeType,
      dto.sizeBytes,
      storageKey,
      dto.entityType,
      dto.entityId,
      dto.isVisibleToClient,
    )
  }

  @Get('v1/files/:id/download')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get download URL (signed)' })
  @RequireTier('TENANT')
  async download(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.file.getDownloadUrl(user.companyId!, id)
  }

  @Patch('v1/files/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update file metadata' })
  @RequireTier('TENANT')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateFileSchema)) dto: UpdateFileDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.file.update(user.companyId!, id, {
      ...(dto.isVisibleToClient !== undefined ? { isVisibleToClient: dto.isVisibleToClient } : {}),
    })
  }

  @Delete('v1/files/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a file' })
  @RequireTier('TENANT')
  async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    await this.file.remove(user.companyId!, id, user.sub)
    return { status: 'deleted' }
  }
}
