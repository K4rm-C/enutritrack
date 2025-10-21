import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, AdminAuthGuard)
export class DashboardController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  // ========================================
  // ENDPOINTS PARA ESTADISTICAS GENERALES
  // ========================================

  @Get('stats')
  async getStats() {
    const result = await this.connection.query(
      'SELECT * FROM sp_get_dashboard_stats()',
    );

    if (!result || result.length === 0) {
      return {
        resumen: {
          totalAdmins: 0,
          totalDoctores: 0,
          totalUsuarios: 0,
          usuariosActivos: 0,
        },
        crecimiento: {
          nuevosUsuarios: 0,
          nuevosDoctores: 0,
        },
      };
    }

    const stats = result[0];
    return {
      resumen: {
        totalAdmins: parseInt(stats.total_admins) || 0,
        totalDoctores: parseInt(stats.total_doctores) || 0,
        totalUsuarios: parseInt(stats.total_pacientes) || 0,
        usuariosActivos: parseInt(stats.pacientes_activos) || 0,
      },
      crecimiento: {
        nuevosUsuarios: parseInt(stats.nuevos_pacientes_semana) || 0,
        nuevosDoctores: parseInt(stats.nuevos_doctores_semana) || 0,
      },
    };
  }

  @Get('registros-recientes')
  async getRegistrosRecientes() {
    const result = await this.connection.query(
      'SELECT * FROM sp_get_recent_registrations()',
    );

    const ultimosUsuarios = result
      .filter((r) => r.tipo === 'paciente')
      .map((r) => ({
        nombre: r.nombre,
        email: r.email,
        created_at: r.created_at,
      }));

    const ultimosDoctores = result
      .filter((r) => r.tipo === 'doctor')
      .map((r) => ({
        nombre: r.nombre,
        email: r.email,
        created_at: r.created_at,
      }));

    return {
      ultimosUsuarios,
      ultimosDoctores,
    };
  }

  @Get('generos')
  async getGeneros() {
    const result = await this.connection.query(
      'SELECT * FROM sp_get_patients_by_gender()',
    );

    if (!result || result.length === 0) {
      return { masculino: 0, femenino: 0, otro: 0 };
    }

    return {
      masculino: parseInt(result[0].masculino) || 0,
      femenino: parseInt(result[0].femenino) || 0,
      otro: parseInt(result[0].otro) || 0,
    };
  }

  // ========================================
  // ENDPOINTS PARA PACIENTES
  // ========================================

  @Get('patients')
  async getAllPatients() {
    const patients = await this.connection.query(
      'SELECT * FROM sp_get_all_patients()',
    );
    return patients;
  }

  @Get('patients/:id')
  async getPatientDetails(@Param('id') id: string) {
    const result = await this.connection.query(
      'SELECT * FROM sp_get_patient_details($1)',
      [id],
    );

    if (!result || result.length === 0) {
      throw new BadRequestException('Paciente no encontrado');
    }

    return result[0];
  }

  @Patch('patients/:id/doctor')
  async updatePatientDoctor(
    @Param('id') id: string,
    @Body('doctorId') doctorId: string,
  ) {
    const result = await this.connection.query(
      'SELECT sp_update_patient_doctor($1, $2) as success',
      [id, doctorId || null],
    );

    if (!result[0].success) {
      throw new BadRequestException('Error al actualizar el doctor del paciente');
    }

    return { message: 'Doctor actualizado exitosamente' };
  }

  @Patch('patients/:id/toggle-status')
  async togglePatientStatus(@Param('id') id: string) {
    const result = await this.connection.query(
      'SELECT sp_toggle_patient_status($1) as success',
      [id],
    );

    if (!result[0].success) {
      throw new BadRequestException('Error al cambiar estado del paciente');
    }

    return { message: 'Estado del paciente actualizado exitosamente' };
  }

  // ========================================
  // ENDPOINTS PARA DOCTORES
  // ========================================

  @Get('doctors')
  async getAllDoctors() {
    const doctors = await this.connection.query(
      'SELECT * FROM sp_get_all_doctors()',
    );
    return doctors;
  }

  @Get('doctors/:id/patients')
  async getDoctorPatients(@Param('id') id: string) {
    const patients = await this.connection.query(
      'SELECT * FROM sp_get_doctor_patients($1)',
      [id],
    );
    return patients;
  }

  @Post('doctors')
  async createDoctor(
    @Body()
    createDoctorDto: {
      nombre: string;
      email: string;
      password: string;
      especialidad_id: string;
      cedula_profesional: string;
      telefono: string;
      telefono_1?: string;
      telefono_2?: string;
      admin_id: string;
    },
  ) {
    const {
      nombre,
      email,
      password,
      especialidad_id,
      cedula_profesional,
      telefono,
      telefono_1,
      telefono_2,
      admin_id,
    } = createDoctorDto;

    // Validaciones basicas
    if (!nombre || !email || !password || !admin_id) {
      throw new BadRequestException('Faltan campos requeridos');
    }

    // Hashear password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
      const result = await this.connection.query(
        'SELECT sp_create_doctor($1, $2, $3, $4, $5, $6, $7, $8, $9) as doctor_id',
        [
          nombre,
          email,
          hashedPassword,
          especialidad_id || null,
          cedula_profesional || null,
          telefono || null,
          telefono_1 || null,
          telefono_2 || null,
          admin_id,
        ],
      );

      return {
        message: 'Doctor creado exitosamente',
        doctorId: result[0].doctor_id,
      };
    } catch (error) {
      console.error('Error al crear doctor:', error);
      if (error.code === '23505') {
        // Unique violation
        throw new BadRequestException('El email ya esta registrado');
      }
      if (error.message) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException('Error al crear el doctor');
    }
  }

  @Patch('doctors/:id')
  async updateDoctor(
    @Param('id') id: string,
    @Body()
    updateDoctorDto: {
      nombre?: string;
      cedula_profesional?: string;
      especialidad_id?: string;
      telefono?: string;
    },
  ) {
    const { nombre, cedula_profesional, especialidad_id, telefono } = updateDoctorDto;

    // Primero obtener los valores actuales del doctor
    const currentDoctorResult = await this.connection.query(
      'SELECT nombre, cedula_profesional, especialidad_id, telefono FROM perfil_doctor WHERE id = $1',
      [id],
    );

    if (!currentDoctorResult || currentDoctorResult.length === 0) {
      throw new BadRequestException('Doctor no encontrado');
    }

    const currentDoctor = currentDoctorResult[0];

    // Usar los valores proporcionados o mantener los valores actuales
    const finalNombre = nombre !== undefined ? nombre : currentDoctor.nombre;
    const finalCedula = cedula_profesional !== undefined ? cedula_profesional : currentDoctor.cedula_profesional;
    const finalEspecialidadId = especialidad_id !== undefined ? especialidad_id : currentDoctor.especialidad_id;
    const finalTelefono = telefono !== undefined ? telefono : currentDoctor.telefono;

    const result = await this.connection.query(
      'SELECT sp_update_doctor($1, $2, $3, $4, $5) as success',
      [id, finalNombre, finalCedula, finalEspecialidadId, finalTelefono],
    );

    if (!result[0].success) {
      throw new BadRequestException('Error al actualizar el doctor');
    }

    return { message: 'Doctor actualizado exitosamente' };
  }

  // ========================================
  // ENDPOINTS PARA ADMINISTRADORES
  // ========================================

  @Get('admins')
  async getAllAdmins() {
    const admins = await this.connection.query(
      'SELECT * FROM sp_get_all_admins()',
    );
    return admins;
  }

  @Get('admins/me/:email')
  async getAdminDetails(@Param('email') email: string) {
    const result = await this.connection.query(
      'SELECT * FROM sp_get_admin_details($1)',
      [email],
    );

    if (!result || result.length === 0) {
      throw new BadRequestException('Administrador no encontrado');
    }

    return result[0];
  }
}

