import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeesModule } from './employees/employees.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // ENV ALWAYS FIRST
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // DB CONFIG – use env variables also
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/employee_portal',
    ),

    EmployeesModule,
    AuthModule,
  ],
})
export class AppModule {}
