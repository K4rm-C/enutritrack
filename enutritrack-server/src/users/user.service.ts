import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerfilUsuario } from './models/user.model';
import { CreatePerfilUsuarioDto } from './dto/create-user.dto';
import { CreatePatientCompleteDto } from './dto/create-patient-complete.dto';
import { UpdatePerfilUsuarioDto } from './dto/update-user.dto';
import { ObjetivoUsuarioService } from '../objetivo-usuario/objetivo-usuario.service';
import { HistorialPesoService } from '../historial-peso/historial-peso.service';
import { CuentasService } from '../cuentas/cuentas.service';
import { TipoCuentaEnum } from '../shared/enum';

@Injectable()
export class PerfilUsuarioService {
  constructor(
    @InjectRepository(PerfilUsuario)
    private readonly perfilUsuarioRepository: Repository<PerfilUsuario>,
    private readonly objetivoUsuarioService: ObjetivoUsuarioService,
    private readonly historialPesoService: HistorialPesoService,
    private readonly cuentasService: CuentasService,
  ) {}

  async create(
    createPerfilUsuarioDto: CreatePerfilUsuarioDto,
  ): Promise<PerfilUsuario> {
    const perfilUsuario = this.perfilUsuarioRepository.create(
      createPerfilUsuarioDto,
    );
    return await this.perfilUsuarioRepository.save(perfilUsuario);
  }

  async createComplete(
    createPatientCompleteDto: CreatePatientCompleteDto,
  ): Promise<PerfilUsuario> {
    const {
      nombre,
      email,
      contraseña,
      genero_id,
      genero, // Campo legacy
      fecha_nacimiento,
      altura,
      doctorId,
      doctor_id, // Campo legacy
      telefono,
      telefono_1,
      telefono_2,
    } = createPatientCompleteDto;

    // Validaciones básicas
    if (!nombre || !email || !contraseña || !fecha_nacimiento || !altura) {
      throw new BadRequestException('Faltan campos requeridos');
    }

    // Determinar el genero_id (priorizar genero_id sobre genero)
    let finalGeneroId = genero_id || genero;
    if (!finalGeneroId) {
      throw new BadRequestException('El género es requerido');
    }

    // Mapear valores legacy del frontend a UUIDs si es necesario
    if (finalGeneroId === 'M') {
      finalGeneroId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'; // Masculino
    } else if (finalGeneroId === 'F') {
      finalGeneroId = 'b2c3d4e5-f6a7-8901-bcde-f12345678901'; // Femenino
    } else if (finalGeneroId === 'O') {
      finalGeneroId = 'c3d4e5f6-a7b8-9012-cdef-123456789012'; // Otro
    }

    // Determinar el doctor_id (priorizar doctor_id sobre doctorId)
    const finalDoctorId = doctor_id || doctorId;

    // Verificar que el email no existe
    try {
      await this.cuentasService.findByEmail(email);
      throw new ConflictException('El email ya está registrado');
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      if (error instanceof NotFoundException) {
        // Si no encuentra la cuenta, continuar
      } else {
        throw error;
      }
    }

    try {
      // 1. Crear cuenta
      const cuenta = await this.cuentasService.create({
        email,
        password: contraseña, // El servicio se encarga del hash interno
        tipo_cuenta: TipoCuentaEnum.USUARIO,
        activa: true,
      });

      // 2. Crear perfil de usuario
      const perfilUsuario = this.perfilUsuarioRepository.create({
        cuenta_id: cuenta.id,
        doctor_id: finalDoctorId,
        nombre,
        fecha_nacimiento,
        genero_id: finalGeneroId,
        altura: parseFloat(altura.toString()),
        telefono,
        telefono_1,
        telefono_2,
      });

      const savedPerfilUsuario = await this.perfilUsuarioRepository.save(perfilUsuario);

      // 3. Retornar el perfil con relaciones cargadas
      return await this.findOne(savedPerfilUsuario.id);
    } catch (error) {
      console.error('Error al crear paciente completo:', error);
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al crear el paciente');
    }
  }

  async findAll(): Promise<PerfilUsuario[]> {
    return await this.perfilUsuarioRepository.find({
      relations: ['cuenta', 'doctor', 'genero'],
    });
  }

  async findOne(id: string): Promise<PerfilUsuario> {
    const perfilUsuario = await this.perfilUsuarioRepository.findOne({
      where: { id },
      relations: ['cuenta', 'doctor', 'doctor.cuenta', 'doctor.especialidad', 'genero'],
    });
    if (!perfilUsuario) {
      throw new NotFoundException('Perfil de usuario no encontrado');
    }
    return perfilUsuario;
  }

  async findByCuentaId(cuentaId: string): Promise<PerfilUsuario> {
    const perfilUsuario = await this.perfilUsuarioRepository.findOne({
      where: { cuenta_id: cuentaId },
      relations: ['cuenta', 'doctor', 'doctor.cuenta', 'doctor.especialidad', 'genero'],
    });
    if (!perfilUsuario) {
      throw new NotFoundException('Perfil de usuario no encontrado');
    }
    return perfilUsuario;
  }

  async update(
    id: string,
    updatePerfilUsuarioDto: UpdatePerfilUsuarioDto,
  ): Promise<PerfilUsuario> {
    const perfilUsuario = await this.findOne(id);
    Object.assign(perfilUsuario, updatePerfilUsuarioDto);
    return await this.perfilUsuarioRepository.save(perfilUsuario);
  }

  async remove(id: string): Promise<void> {
    const perfilUsuario = await this.findOne(id);
    await this.perfilUsuarioRepository.remove(perfilUsuario);
  }

  async asignarDoctor(
    usuarioId: string,
    doctorId: string,
  ): Promise<PerfilUsuario> {
    const perfilUsuario = await this.findOne(usuarioId);
    perfilUsuario.doctor_id = doctorId;
    return await this.perfilUsuarioRepository.save(perfilUsuario);
  }

  async removerDoctor(usuarioId: string): Promise<PerfilUsuario> {
    const perfilUsuario = await this.findOne(usuarioId);
    perfilUsuario.doctor_id = '';
    return await this.perfilUsuarioRepository.save(perfilUsuario);
  }

  async findByDoctorId(doctorId: string): Promise<PerfilUsuario[]> {
    return await this.perfilUsuarioRepository.find({
      where: { doctor_id: doctorId },
      relations: ['cuenta', 'doctor', 'genero'],
    });
  }

  async findOneWithDetails(id: string): Promise<any> {
    const usuario = await this.findOne(id);
    const objetivo = await this.objetivoUsuarioService.findByUsuarioId(id);
    const ultimoPeso = await this.historialPesoService.getUltimoPeso(id);
    
    return {
      ...usuario,
      // Campos planos que espera el frontend
      ultimo_peso: ultimoPeso?.peso || null,
      objetivo_peso: objetivo?.peso_objetivo || null,
      nivel_actividad: objetivo?.nivel_actividad || null,
      // Mantener objetos originales por compatibilidad
      objetivo,
      ultimoPeso,
    };
  }

  async findAllWithDetails(): Promise<any[]> {
    const usuarios = await this.findAll();
    const usuariosConDetalles = await Promise.all(
      usuarios.map(async (usuario) => {
        const objetivo = await this.objetivoUsuarioService.findByUsuarioId(usuario.id);
        const ultimoPeso = await this.historialPesoService.getUltimoPeso(usuario.id);
        
        return {
          ...usuario,
          // Campos planos que espera el frontend
          ultimo_peso: ultimoPeso?.peso || null,
          objetivo_peso: objetivo?.peso_objetivo || null,
          nivel_actividad: objetivo?.nivel_actividad || null,
          // Mantener objetos originales por compatibilidad
          objetivo,
          ultimoPeso,
        };
      })
    );
    
    return usuariosConDetalles;
  }
}
