import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { AssetController } from './asset.controller'
import { AssetService } from './asset.service'

@Module({
  imports: [DatabaseModule],
  controllers: [AssetController],
  providers: [AssetService],
  exports: [AssetService],
})
export class AssetsModule {}
