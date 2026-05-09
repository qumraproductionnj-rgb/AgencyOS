import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { EmployeeController, EmployeePublicController } from './employee.controller'
import { EmployeeService } from './employee.service'

@Module({
  imports: [AuthModule],
  controllers: [EmployeeController, EmployeePublicController],
  providers: [EmployeeService],
  exports: [EmployeeService],
})
export class EmployeesModule {}
