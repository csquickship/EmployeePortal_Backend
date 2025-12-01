import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Query,
  Param,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtCookieGuard } from 'src/auth/guards/jwt-cookie.guard';

@Controller('employees')
@UseGuards(JwtCookieGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post('create')
  create(@Body() body: any, @Req() req) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User not found in token');
    }

    const payload = {
      ...body,
      userId: req.user.id, // = string (Mongo ID)
    };

    return this.employeesService.create(payload);
  }

  @Get()
  findAll(@Req() req) {
    return this.employeesService.findAll(req.user.id);
  }

  @Get('findById')
  findById(@Query('id') id: string) {
    return this.employeesService.FindById(id);
  }

  @Delete('DeleteEmployee')
  Delete(@Query('id') id: string, @Req() req) {
    return this.employeesService.Delete(id, req.user.id);
  }

  @Post('Edit')
  Edit(@Body() body: any) {
    return this.employeesService.Edit(body);
  }
}
