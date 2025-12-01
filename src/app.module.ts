import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeesModule } from './employees/employees.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/employee_portal'),
    EmployeesModule,
    AuthModule, // <<< VERY IMPORTANT
  ],
})
export class AppModule {}
