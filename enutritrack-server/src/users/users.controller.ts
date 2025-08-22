import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './users.service'; // ← Corregido: singular
import { User } from './models/user.model';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CookieAuthGuard } from '../auth/guards/cookie-auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    // Remover la validación duplicada - el service ya la maneja
    return await this.userService.create(createUserDto);
  }

  @Get('email/:email')
  async findByEmail(@Param('email') email: string): Promise<User> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<User> {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @UseGuards(CookieAuthGuard)
  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    // Si necesitas validación de email único en update, hazlo en el service
    return await this.userService.update(id, updateUserDto);
  }
}
