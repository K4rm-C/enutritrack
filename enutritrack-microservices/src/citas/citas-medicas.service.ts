// src/citas-medicas/citas-medicas.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, FindOptionsWhere, In } from 'typeorm';
import { CitaMedica } from './models/cita-medica.model';
import { EstadoCita } from './models/estado-cita.model';
import { TipoConsulta } from './models/tipo-consulta.model';
import { User } from '../users/models/user.model';
import { Doctor } from '../doctor/models/doctor.model';
import { CreateCitaMedicaDto } from './dto/create-cita-medica.dto';
import { UpdateCitaMedicaDto } from './dto/update-cita-medica.dto';
import { CitasQueryDto } from './dto/citas-query.dto';

@Injectable()
export class CitasMedicasService {
  constructor(
    @InjectRepository(CitaMedica)
    private readonly citaMedicaRepository: Repository<CitaMedica>,
    @InjectRepository(EstadoCita)
    private readonly estadoCitaRepository: Repository<EstadoCita>,
    @InjectRepository(TipoConsulta)
    private readonly tipoConsultaRepository: Repository<TipoConsulta>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createCitaMedicaDto: CreateCitaMedicaDto, doctorId: string) {
    const {
      usuarioId,
      tipoConsultaId,
      estadoCitaId,
      fechaHoraProgramada,
      ...citaData
    } = createCitaMedicaDto;

    // Verificar que el doctor existe
    const doctor = await this.doctorRepository.findOne({
      where: { id: doctorId },
      relations: ['cuenta', 'especialidad'],
    });

    if (!doctor) {
      throw new NotFoundException('Doctor no encontrado');
    }

    // Verificar que el usuario/paciente existe
    const usuario = await this.userRepository.findOne({
      where: { id: usuarioId },
      relations: ['cuenta', 'genero', 'doctor'],
    });

    if (!usuario) {
      throw new NotFoundException('Paciente no encontrado');
    }

    // Verificar que el paciente pertenece al doctor
    if (usuario.doctor_id !== doctorId) {
      throw new BadRequestException(
        'El paciente no está asignado a este doctor',
        usuario.doctor_id,
      );
    }

    // Verificar que el tipo de consulta existe
    const tipoConsulta = await this.tipoConsultaRepository.findOne({
      where: { id: tipoConsultaId },
    });

    if (!tipoConsulta) {
      throw new NotFoundException('Tipo de consulta no encontrado');
    }

    // Verificar que el estado de cita existe
    const estadoCita = await this.estadoCitaRepository.findOne({
      where: { id: estadoCitaId },
    });

    if (!estadoCita) {
      throw new NotFoundException('Estado de cita no encontrado');
    }

    // Convertir fecha a objeto Date
    const fechaProgramada = new Date(fechaHoraProgramada);
    const fechaFin = new Date(
      fechaProgramada.getTime() + tipoConsulta.duracionMinutos * 60000,
    );

    // Verificar conflictos de horario para el doctor
    const estadosNoFinales = await this.getEstadosNoFinalesIds();
    const conflictoDoctor = await this.citaMedicaRepository.findOne({
      where: {
        doctor: { id: doctorId },
        fechaHoraProgramada: Between(fechaProgramada, fechaFin),
        estadoCita: { id: In(estadosNoFinales) },
      },
      relations: ['estadoCita'],
    });

    if (conflictoDoctor) {
      throw new ConflictException(
        'El doctor ya tiene una cita programada en ese horario',
      );
    }

    // Verificar conflictos de horario para el paciente
    const conflictoPaciente = await this.citaMedicaRepository.findOne({
      where: {
        usuario: { id: usuarioId },
        fechaHoraProgramada: Between(fechaProgramada, fechaFin),
        estadoCita: { id: In(estadosNoFinales) },
      },
      relations: ['estadoCita'],
    });

    if (conflictoPaciente) {
      throw new ConflictException(
        'El paciente ya tiene una cita programada en ese horario',
      );
    }

    // Crear la cita médica
    const cita = this.citaMedicaRepository.create({
      ...citaData,
      fechaHoraProgramada: fechaProgramada,
      doctor: { id: doctorId },
      usuario: { id: usuarioId },
      tipoConsulta: { id: tipoConsultaId },
      estadoCita: { id: estadoCitaId },
    });

    const citaGuardada = await this.citaMedicaRepository.save(cita);

    // Cargar relaciones para la respuesta
    return await this.citaMedicaRepository.findOne({
      where: { id: citaGuardada.id },
      relations: [
        'usuario',
        'usuario.cuenta',
        'usuario.genero',
        'doctor',
        'doctor.cuenta',
        'doctor.especialidad',
        'tipoConsulta',
        'estadoCita',
      ],
    });
  }

  async findAll(query: CitasQueryDto) {
    const {
      doctorId,
      usuarioId,
      fechaInicio,
      fechaFin,
      estadoCitaId,
      search,
      page = '1',
      limit = '10',
    } = query;

    const where: FindOptionsWhere<CitaMedica> = {};

    if (doctorId) {
      where.doctor = { id: doctorId };
    }

    if (usuarioId) {
      where.usuario = { id: usuarioId };
    }

    if (estadoCitaId) {
      where.estadoCita = { id: estadoCitaId };
    }

    if (fechaInicio && fechaFin) {
      where.fechaHoraProgramada = Between(
        new Date(fechaInicio),
        new Date(fechaFin),
      );
    } else if (fechaInicio) {
      where.fechaHoraProgramada = Between(
        new Date(fechaInicio),
        new Date(
          new Date(fechaInicio).setDate(new Date(fechaInicio).getDate() + 1),
        ),
      );
    }

    // Construir query builder para búsqueda avanzada
    const queryBuilder = this.citaMedicaRepository
      .createQueryBuilder('cita')
      .leftJoinAndSelect('cita.usuario', 'usuario')
      .leftJoinAndSelect('usuario.cuenta', 'cuentaUsuario')
      .leftJoinAndSelect('usuario.genero', 'genero')
      .leftJoinAndSelect('cita.doctor', 'doctor')
      .leftJoinAndSelect('doctor.cuenta', 'cuentaDoctor')
      .leftJoinAndSelect('doctor.especialidad', 'especialidad')
      .leftJoinAndSelect('cita.tipoConsulta', 'tipoConsulta')
      .leftJoinAndSelect('cita.estadoCita', 'estadoCita')
      .where(where);

    // Aplicar búsqueda por texto si existe
    if (search) {
      queryBuilder.andWhere(
        '(usuario.nombre ILIKE :search OR cuentaUsuario.email ILIKE :search OR cita.motivo ILIKE :search OR tipoConsulta.nombre ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Aplicar paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [citas, total] = await queryBuilder
      .orderBy('cita.fechaHoraProgramada', 'DESC')
      .skip(skip)
      .take(parseInt(limit))
      .getManyAndCount();

    return {
      citas,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    };
  }

  async findOne(id: string) {
    const cita = await this.citaMedicaRepository.findOne({
      where: { id },
      relations: [
        'usuario',
        'usuario.cuenta',
        'usuario.genero',
        'doctor',
        'doctor.cuenta',
        'doctor.especialidad',
        'tipoConsulta',
        'estadoCita',
      ],
    });

    if (!cita) {
      throw new NotFoundException(`Cita médica con ID ${id} no encontrada`);
    }

    return cita;
  }

  // En src/citas-medicas/citas-medicas.service.ts, reemplaza el método update:

  async update(id: string, updateCitaMedicaDto: UpdateCitaMedicaDto) {
    try {
      const cita = await this.findOne(id);

      // Cargar la entidad completa para actualizar
      const citaToUpdate = await this.citaMedicaRepository.findOne({
        where: { id },
        relations: ['tipoConsulta', 'estadoCita', 'doctor', 'usuario'],
      });

      if (!citaToUpdate) {
        throw new NotFoundException(`Cita médica con ID ${id} no encontrada`);
      }

      // Manejar tipoConsulta - usar la relación completa, no solo el ID
      if (updateCitaMedicaDto.tipoConsultaId) {
        const tipoConsulta = await this.tipoConsultaRepository
          .createQueryBuilder('tipo')
          .where('tipo.id = :id AND tipo.nombre IS NOT NULL', {
            id: updateCitaMedicaDto.tipoConsultaId,
          })
          .getOne();

        if (!tipoConsulta) {
          throw new NotFoundException(
            'Tipo de consulta no encontrado o inválido',
          );
        }
        citaToUpdate.tipoConsulta = tipoConsulta;
      }

      // Manejar estadoCita - usar la relación completa
      if (updateCitaMedicaDto.estadoCitaId) {
        const estadoCita = await this.estadoCitaRepository
          .createQueryBuilder('estado')
          .where('estado.id = :id AND estado.nombre IS NOT NULL', {
            id: updateCitaMedicaDto.estadoCitaId,
          })
          .getOne();

        if (!estadoCita) {
          throw new NotFoundException(
            'Estado de cita no encontrado o inválido',
          );
        }
        citaToUpdate.estadoCita = estadoCita;
      }

      // Manejar otros campos
      if (updateCitaMedicaDto.fechaHoraProgramada !== undefined) {
        citaToUpdate.fechaHoraProgramada = new Date(
          updateCitaMedicaDto.fechaHoraProgramada,
        );
      }
      if (updateCitaMedicaDto.motivo !== undefined) {
        citaToUpdate.motivo = updateCitaMedicaDto.motivo;
      }
      if (updateCitaMedicaDto.observaciones !== undefined) {
        citaToUpdate.observaciones = updateCitaMedicaDto.observaciones;
      }
      if (updateCitaMedicaDto.diagnostico !== undefined) {
        citaToUpdate.diagnostico = updateCitaMedicaDto.diagnostico;
      }
      if (updateCitaMedicaDto.tratamientoRecomendado !== undefined) {
        citaToUpdate.tratamientoRecomendado =
          updateCitaMedicaDto.tratamientoRecomendado;
      }
      if (updateCitaMedicaDto.proximaCitaSugerida !== undefined) {
        citaToUpdate.proximaCitaSugerida =
          updateCitaMedicaDto.proximaCitaSugerida;
      }

      // Si se cambia la fecha/hora, verificar conflictos
      if (updateCitaMedicaDto.fechaHoraProgramada) {
        const nuevaFecha = new Date(updateCitaMedicaDto.fechaHoraProgramada);

        // Determinar el tipo de consulta a usar
        let tipoConsulta: TipoConsulta;
        if (updateCitaMedicaDto.tipoConsultaId) {
          const foundTipoConsulta = await this.tipoConsultaRepository
            .createQueryBuilder('tipo')
            .where('tipo.id = :id AND tipo.nombre IS NOT NULL', {
              id: updateCitaMedicaDto.tipoConsultaId,
            })
            .getOne();

          if (!foundTipoConsulta) {
            throw new NotFoundException('Tipo de consulta no encontrado');
          }

          tipoConsulta = foundTipoConsulta;
        } else {
          // Usar el tipo de consulta existente de la cita
          if (!citaToUpdate.tipoConsulta || !citaToUpdate.tipoConsulta.nombre) {
            throw new BadRequestException(
              'La cita no tiene un tipo de consulta válido',
            );
          }
          tipoConsulta = citaToUpdate.tipoConsulta;
        }

        const fechaFin = new Date(
          nuevaFecha.getTime() + tipoConsulta.duracionMinutos * 60000,
        );
        const estadosNoFinales = await this.getEstadosNoFinalesIds();

        // Verificar conflictos excluyendo la cita actual
        const conflicto = await this.citaMedicaRepository
          .createQueryBuilder('cita')
          .innerJoinAndSelect('cita.estadoCita', 'estadoCita')
          .where('cita.id != :id', { id })
          .andWhere('cita.doctor_id = :doctorId', {
            doctorId: citaToUpdate.doctor.id,
          })
          .andWhere('cita.fecha_hora_programada BETWEEN :start AND :end', {
            start: nuevaFecha,
            end: fechaFin,
          })
          .andWhere('estadoCita.id IN (:...estados)', {
            estados: estadosNoFinales,
          })
          .getOne();

        if (conflicto) {
          throw new ConflictException(
            'Ya existe una cita programada en ese horario',
          );
        }
      }

      // Guardar la entidad completa usando save()
      await this.citaMedicaRepository.save(citaToUpdate);

      // Devolver la cita actualizada con relaciones
      return await this.findOne(id);
    } catch (error) {
      Logger.error(`Error en update: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: string) {
    const cita = await this.findOne(id);

    // Verificar que la cita no esté en proceso o completada
    if (!cita.estadoCita) {
      throw new BadRequestException(
        'No se puede determinar el estado de la cita',
      );
    }

    if (cita.estadoCita.nombre === 'En Proceso' || cita.estadoCita.esFinal) {
      throw new BadRequestException(
        'No se puede eliminar una cita en proceso o finalizada',
      );
    }

    await this.citaMedicaRepository.remove(cita);
    return { message: 'Cita médica eliminada correctamente' };
  }

  async getEstadosCita() {
    return await this.estadoCitaRepository.find({
      order: { nombre: 'ASC' },
    });
  }

  async getTiposConsulta() {
    return await this.tipoConsultaRepository.find({
      order: { nombre: 'ASC' },
    });
  }

  async getCitasPorDoctor(doctorId: string, query: CitasQueryDto) {
    // Verificar que el doctor existe
    const doctor = await this.doctorRepository.findOne({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor no encontrado');
    }

    return await this.findAll({ ...query, doctorId });
  }

  async cambiarEstadoCita(id: string, estadoCitaId: string) {
    try {
      const cita = await this.citaMedicaRepository.findOne({
        where: { id },
        relations: ['estadoCita'],
      });

      if (!cita) {
        throw new NotFoundException(`Cita médica con ID ${id} no encontrada`);
      }

      const estadoCita = await this.estadoCitaRepository
        .createQueryBuilder('estado')
        .where('estado.id = :id AND estado.nombre IS NOT NULL', {
          id: estadoCitaId,
        })
        .getOne();

      if (!estadoCita) {
        throw new NotFoundException('Estado de cita no encontrado o inválido');
      }

      // Actualizar la relación completa
      cita.estadoCita = estadoCita;

      // Lógica adicional según el estado
      if (estadoCita.nombre === 'En Proceso' && !cita.fechaHoraInicio) {
        cita.fechaHoraInicio = new Date();
      } else if (estadoCita.nombre === 'Completada' && !cita.fechaHoraFin) {
        cita.fechaHoraFin = new Date();
      }

      await this.citaMedicaRepository.save(cita);
      return await this.findOne(id);
    } catch (error) {
      Logger.error(`Error en cambiarEstadoCita: ${error.message}`, error.stack);
      throw error;
    }
  }

  async iniciarCita(id: string) {
    const cita = await this.findOne(id);

    if (!cita.estadoCita) {
      throw new BadRequestException(
        'No se puede determinar el estado actual de la cita',
      );
    }

    if (cita.estadoCita.nombre !== 'Programada') {
      throw new BadRequestException('Solo se pueden iniciar citas programadas');
    }

    const estadoEnProceso = await this.estadoCitaRepository.findOne({
      where: { nombre: 'En Proceso' },
    });

    if (!estadoEnProceso) {
      throw new InternalServerErrorException(
        'No se pudo encontrar el estado "En Proceso"',
      );
    }

    return await this.cambiarEstadoCita(id, estadoEnProceso.id);
  }

  async completarCita(
    id: string,
    datosConsulta?: {
      diagnostico?: string;
      tratamientoRecomendado?: string;
      observaciones?: string;
    },
  ) {
    try {
      const cita = await this.citaMedicaRepository.findOne({
        where: { id },
        relations: ['estadoCita'],
      });

      if (!cita || !cita.estadoCita) {
        throw new BadRequestException(
          'No se puede determinar el estado actual de la cita',
        );
      }

      if (cita.estadoCita.nombre !== 'En Proceso') {
        throw new BadRequestException(
          'Solo se pueden completar citas en proceso',
        );
      }

      const estadoCompletada = await this.estadoCitaRepository
        .createQueryBuilder('estado')
        .where('estado.nombre = :nombre AND estado.nombre IS NOT NULL', {
          nombre: 'Completada',
        })
        .getOne();

      if (!estadoCompletada) {
        throw new InternalServerErrorException(
          'No se pudo encontrar el estado "Completada"',
        );
      }

      // Actualizar la entidad completa
      cita.estadoCita = estadoCompletada;
      cita.fechaHoraFin = new Date();

      if (datosConsulta) {
        if (datosConsulta.diagnostico)
          cita.diagnostico = datosConsulta.diagnostico;
        if (datosConsulta.tratamientoRecomendado)
          cita.tratamientoRecomendado = datosConsulta.tratamientoRecomendado;
        if (datosConsulta.observaciones)
          cita.observaciones = datosConsulta.observaciones;
      }

      await this.citaMedicaRepository.save(cita);
      return await this.findOne(id);
    } catch (error) {
      Logger.error(`Error en completarCita: ${error.message}`, error.stack);
      throw error;
    }
  }

  async cancelarCita(id: string, motivo?: string) {
    try {
      const cita = await this.citaMedicaRepository.findOne({
        where: { id },
        relations: ['estadoCita'],
      });

      if (!cita || !cita.estadoCita) {
        throw new BadRequestException(
          'No se puede determinar el estado actual de la cita',
        );
      }

      if (cita.estadoCita.esFinal) {
        throw new BadRequestException(
          'No se puede cancelar una cita finalizada',
        );
      }

      const estadoCancelada = await this.estadoCitaRepository
        .createQueryBuilder('estado')
        .where('estado.nombre = :nombre AND estado.nombre IS NOT NULL', {
          nombre: 'Cancelada',
        })
        .getOne();

      if (!estadoCancelada) {
        throw new InternalServerErrorException(
          'No se pudo encontrar el estado "Cancelada"',
        );
      }

      // Actualizar la entidad completa
      cita.estadoCita = estadoCancelada;

      if (motivo) {
        cita.observaciones = motivo;
      }

      await this.citaMedicaRepository.save(cita);
      return await this.findOne(id);
    } catch (error) {
      Logger.error(`Error en cancelarCita: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getCitasHoy(doctorId: string) {
    const hoy = new Date();
    const inicioDia = new Date(hoy.setHours(0, 0, 0, 0));
    const finDia = new Date(hoy.setHours(23, 59, 59, 999));

    const estadosNoFinales = await this.getEstadosNoFinalesIds();

    return await this.citaMedicaRepository.find({
      where: {
        doctor: { id: doctorId },
        fechaHoraProgramada: Between(inicioDia, finDia),
        estadoCita: { id: In(estadosNoFinales) },
      },
      relations: ['usuario', 'usuario.cuenta', 'tipoConsulta', 'estadoCita'],
      order: { fechaHoraProgramada: 'ASC' },
    });
  }

  async getEstadisticasCitas(
    doctorId: string,
    periodo: 'semana' | 'mes' | 'año' = 'mes',
  ) {
    const fechaInicio = new Date();
    const fechaFin = new Date();

    switch (periodo) {
      case 'semana':
        fechaInicio.setDate(fechaInicio.getDate() - 7);
        break;
      case 'mes':
        fechaInicio.setMonth(fechaInicio.getMonth() - 1);
        break;
      case 'año':
        fechaInicio.setFullYear(fechaInicio.getFullYear() - 1);
        break;
    }

    const citas = await this.citaMedicaRepository
      .createQueryBuilder('cita')
      .leftJoinAndSelect('cita.estadoCita', 'estadoCita')
      .where('cita.doctor_id = :doctorId', { doctorId })
      .andWhere('cita.fecha_hora_programada BETWEEN :start AND :end', {
        start: fechaInicio,
        end: fechaFin,
      })
      .getMany();

    const total = citas.length;
    const porEstado = citas.reduce(
      (acc, cita) => {
        if (cita.estadoCita) {
          const estado = cita.estadoCita.nombre;
          acc[estado] = (acc[estado] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      total,
      porEstado,
      periodo,
    };
  }

  // Método auxiliar para obtener IDs de estados no finales
  private async getEstadosNoFinalesIds(): Promise<string[]> {
    const estados = await this.estadoCitaRepository.find({
      where: { esFinal: false },
    });
    return estados.map((estado) => estado.id);
  }

  // Método auxiliar para obtener estado por nombre con validación
  private async getEstadoCitaPorNombre(nombre: string): Promise<EstadoCita> {
    const estado = await this.estadoCitaRepository.findOne({
      where: { nombre },
    });

    if (!estado) {
      throw new InternalServerErrorException(
        `No se pudo encontrar el estado de cita: ${nombre}`,
      );
    }

    return estado;
  }

  // Método auxiliar para obtener tipo de consulta con validación
  private async getTipoConsultaPorId(id: string): Promise<TipoConsulta> {
    const tipoConsulta = await this.tipoConsultaRepository.findOne({
      where: { id },
    });

    if (!tipoConsulta) {
      throw new NotFoundException(
        `Tipo de consulta con ID ${id} no encontrado`,
      );
    }

    return tipoConsulta;
  }
}
