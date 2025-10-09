import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Delete,
  Res,
  Req,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { join } from 'path';

@Controller('admins')
export class AdminController {
  constructor(private readonly adminsService: AdminService) {}

  // ========== SERVIR PÁGINAS HTML ==========
  // Sin JwtAuthGuard - la autenticación se maneja en el frontend

  @Get('dashboard')
  dashboardPage(@Res() res: Response) {
    res.sendFile(join(__dirname, '../../public/admin-dashboard.html'));
  }

  @Get('profile')
  profilePage(@Res() res: Response) {
    res.sendFile(join(__dirname, '../../public/admin-profile.html'));
  }

  // ========== ENDPOINTS API ==========
  // Con JwtAuthGuard - requieren token válido

  @UseGuards(JwtAuthGuard)
  @Get('api/me')
  async getCurrentAdmin(@Req() req: Request) {
    const user = (req as any).user;
    return {
      id: user.userId,
      email: user.email,
      nombre: user.nombre,
      userType: user.userType,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('api/stats')
  async getDashboardStats(@Req() req: Request) {
    // Aquí puedes agregar lógica para obtener estadísticas reales
    return {
      totalDoctores: 24,
      totalUsuarios: 156,
      citasEsteMes: 45,
      ingresosEsteMes: 12500,
      actividadReciente: [
        {
          tipo: 'nuevo_usuario',
          fecha: '2024-01-15',
          descripcion: 'Nuevo usuario registrado',
        },
        {
          tipo: 'nueva_cita',
          fecha: '2024-01-14',
          descripcion: 'Cita programada',
        },
      ],
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('api/doctors')
  async getDoctorsList(@Req() req: Request) {
    // Endpoint para obtener lista de doctores
    return [
      {
        id: '1',
        nombre: 'Dr. Carlos López',
        especialidad: 'Cardiología',
        email: 'carlos@clinica.com',
        estado: 'Activo',
      },
      {
        id: '2',
        nombre: 'Dra. María García',
        especialidad: 'Pediatría',
        email: 'maria@clinica.com',
        estado: 'Activo',
      },
      {
        id: '3',
        nombre: 'Dr. Juan Martínez',
        especialidad: 'Dermatología',
        email: 'juan@clinica.com',
        estado: 'Inactivo',
      },
    ];
  }

  @UseGuards(JwtAuthGuard)
  @Get('api/users')
  async getUsersList(@Req() req: Request) {
    // Endpoint para obtener lista de usuarios
    return [
      {
        id: '1',
        nombre: 'Ana Rodríguez',
        email: 'ana@email.com',
        ultimaCita: '2024-01-10',
        estado: 'Activo',
      },
      {
        id: '2',
        nombre: 'Luis Hernández',
        email: 'luis@email.com',
        ultimaCita: '2024-01-12',
        estado: 'Activo',
      },
      {
        id: '3',
        nombre: 'Marta Silva',
        email: 'marta@email.com',
        ultimaCita: '2023-12-20',
        estado: 'Inactivo',
      },
    ];
  }
}
