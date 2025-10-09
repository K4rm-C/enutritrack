// src/users/users.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { join } from 'path';
import type { Response } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UserService) {}

  @Get('management')
  getUsersManagement(@Res() res: Response) {
    // Servir el archivo HTML de gestión de usuarios
    return res.sendFile(join(process.cwd(), 'public', 'users-management.html'));
  }

  @Get('detail')
  getUserDetailPage(@Res() res: Response, @Query('id') userId: string) {
    return res.sendFile(
      join(process.cwd(), 'public', 'admin-user-detail.html'),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createUserDto: any) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/user/email/:email')
  findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/user/id/:id')
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: any) {
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
