import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CuentasService } from './cuentas.service';
import { CreateCuentaDto } from './dto/create-cuenta.dto';
import { UpdateCuentaDto } from './dto/update-cuenta.dto';
import { LoginCuentaDto } from './dto/login-cuenta.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cuentas')
export class CuentasController {
  constructor(private readonly cuentasService: CuentasService) {}

  @Post()
  create(@Body() createCuentaDto: CreateCuentaDto) {
    return this.cuentasService.create(createCuentaDto);
  }

  @Post('login')
  login(@Body() loginCuentaDto: LoginCuentaDto) {
    return this.cuentasService.validateUser(loginCuentaDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.cuentasService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.cuentasService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateCuentaDto: UpdateCuentaDto) {
    return this.cuentasService.update(id, updateCuentaDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.cuentasService.remove(id);
  }
}
