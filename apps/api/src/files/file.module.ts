import { Module } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'
import { DatabaseModule } from '../database/database.module'
import { FileController } from './file.controller'
import { FileService } from './file.service'
import { StorageService } from './storage.service'

@Module({
  imports: [
    DatabaseModule,
    MulterModule.register({
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  ],
  controllers: [FileController],
  providers: [FileService, StorageService],
  exports: [FileService, StorageService],
})
export class FilesModule {}
