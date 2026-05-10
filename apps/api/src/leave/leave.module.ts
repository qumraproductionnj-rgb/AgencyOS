import { Module } from '@nestjs/common'
import { PermissionModule } from '../permissions/permission.module'
import { LeaveController } from './leave.controller'
import { LeaveService } from './leave.service'

@Module({
  imports: [PermissionModule],
  controllers: [LeaveController],
  providers: [LeaveService],
  exports: [LeaveService],
})
export class LeavesModule {}
