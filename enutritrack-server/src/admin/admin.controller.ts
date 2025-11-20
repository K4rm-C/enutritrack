import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  Req
} from '@nestjs/common';
import { PerfilAdminService } from './admin.service';
import { CreatePerfilAdminDto } from './dto/create-admin.dto';
import { UpdatePerfilAdminDto } from './dto/update-admin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';

@Controller('admins')
@UseInterceptors(ClassSerializerInterceptor)
export class PerfilAdminController {
  constructor(private readonly perfilAdminService: PerfilAdminService) { }

  @Post()
  create(@Body() createPerfilAdminDto: CreatePerfilAdminDto) {
    return this.perfilAdminService.create(createPerfilAdminDto);
  }

  @UseGuards(JwtAuthGuard, AdminAuthGuard) // Solo admins pueden acceder
  @Get()
  findAll() {
    return this.perfilAdminService.findAll();
  }

  @UseGuards(JwtAuthGuard, AdminAuthGuard) // Solo admins pueden acceder
  @Get('stats')
  getStats() {
    return this.perfilAdminService.getAdminStats();
  }

  @UseGuards(JwtAuthGuard, AdminAuthGuard) // Solo admins pueden acceder
  @Get('search')
  search(@Query('q') query: string) {
    if (!query) {
      return this.perfilAdminService.findAll();
    }
    return this.perfilAdminService.searchAdmins(query);
  }

  @UseGuards(JwtAuthGuard, AdminAuthGuard) // Solo admins pueden acceder
  @Get('cuenta/:cuentaId')
  findByCuentaId(@Param('cuentaId') cuentaId: string) {
    return this.perfilAdminService.findByCuentaId(cuentaId);
  }

  @UseGuards(JwtAuthGuard, AdminAuthGuard) // Solo admins pueden acceder
  @Get('email/:email')
  findByEmail(@Param('email') email: string) {
    return this.perfilAdminService.findByEmail(email);
  }

  @UseGuards(JwtAuthGuard, AdminAuthGuard) // Solo admins pueden acceder
  @Get('completo/:id')
  getAdminCompleto(@Param('id') id: string) {
    return this.perfilAdminService.getAdminCompleto(id);
  }

  @UseGuards(JwtAuthGuard, AdminAuthGuard) // Solo admins pueden acceder
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.perfilAdminService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, AdminAuthGuard) // Solo admins pueden acceder
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePerfilAdminDto: UpdatePerfilAdminDto,
  ) {
    return this.perfilAdminService.update(id, updatePerfilAdminDto);
  }

  @UseGuards(JwtAuthGuard, AdminAuthGuard) // Solo admins pueden acceder
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.perfilAdminService.remove(id);
  }

  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  @Get('profile/current')
  getCurrentAdmin(@Req() req: any) {
    console.log('🔍 Obteniendo admin actual, user:', req.user);

    // Dependiendo de cómo esté estructurado tu JWT, prueba estas opciones:
    const cuentaId = req.user?.cuentaId || req.user?.sub || req.user?.id;

    if (!cuentaId) {
      console.error('❌ No se pudo obtener cuentaId del usuario:', req.user);
      throw new Error('No se pudo identificar al usuario actual');
    }

    console.log('✅ Buscando admin con cuentaId:', cuentaId);
    return this.perfilAdminService.findByCuentaId(cuentaId);
  }
}
