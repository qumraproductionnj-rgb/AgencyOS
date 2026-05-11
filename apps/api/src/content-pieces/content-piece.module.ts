import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { ContentPieceController } from './content-piece.controller'
import { ContentPieceService } from './content-piece.service'

@Module({
  imports: [DatabaseModule],
  controllers: [ContentPieceController],
  providers: [ContentPieceService],
})
export class ContentPiecesModule {}
