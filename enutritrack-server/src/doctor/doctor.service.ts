import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerfilDoctor } from './models/doctor.model';
import { CreatePerfilDoctorDto } from './dto/create-doctor.dto';
import { UpdatePerfilDoctorDto } from './dto/update-doctor.dto';
import { CuentasService } from '../cuentas/cuentas.service';
import { PerfilAdminService } from '../admin/admin.service';
import { TipoCuentaEnum } from '../shared/enum';

@Injectable()
export class PerfilDoctorService {
  constructor(
    @InjectRepository(PerfilDoctor)
    private readonly perfilDoctorRepository: Repository<PerfilDoctor>,
    private readonly cuentasService: CuentasService,
    private readonly perfilAdminService: PerfilAdminService,
  ) {}

  async create(
    createPerfilDoctorDto: CreatePerfilDoctorDto,
  ): Promise<PerfilDoctor> {
    const { cuenta_id, admin_id, ...perfilData } = createPerfilDoctorDto;

    // Verificar que la cuenta existe
    const cuenta = await this.cuentasService.findOne(cuenta_id);

    // Verificar que la cuenta es de tipo doctor
    if (cuenta.tipo_cuenta !== TipoCuentaEnum.DOCTOR) {
      throw new BadRequestException('La cuenta debe ser de tipo doctor');
    }

    // Verificar que no existe ya un perfil para esta cuenta
    const existingPerfil = await this.perfilDoctorRepository.findOne({
      where: { cuenta_id },
    });

    if (existingPerfil) {
      throw new ConflictException(
        'Ya existe un perfil de doctor para esta cuenta',
      );
    }

    // Si se proporciona admin_id, verificar que el admin existe
    if (admin_id) {
      await this.perfilAdminService.findOne(admin_id);
    }

    const perfilDoctor = this.perfilDoctorRepository.create({
      ...perfilData,
      cuenta_id,
      admin_id,
    });

    return await this.perfilDoctorRepository.save(perfilDoctor);
  }

  async findAll(): Promise<PerfilDoctor[]> {
    return await this.perfilDoctorRepository.find({
      relations: ['cuenta', 'admin', 'pacientes'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<PerfilDoctor> {
    const perfilDoctor = await this.perfilDoctorRepository.findOne({
      where: { id },
      relations: ['cuenta', 'admin', 'pacientes'],
    });

    if (!perfilDoctor) {
      throw new NotFoundException('Perfil de doctor no encontrado');
    }

    return perfilDoctor;
  }

  async findByCuentaId(cuentaId: string): Promise<PerfilDoctor> {
    const perfilDoctor = await this.perfilDoctorRepository.findOne({
      where: { cuenta_id: cuentaId },
      relations: ['cuenta', 'admin', 'pacientes'],
    });

    if (!perfilDoctor) {
      throw new NotFoundException(
        'Perfil de doctor no encontrado para esta cuenta',
      );
    }

    return perfilDoctor;
  }

  async findByEmail(email: string): Promise<PerfilDoctor> {
    const perfilDoctor = await this.perfilDoctorRepository
      .createQueryBuilder('perfilDoctor')
      .leftJoinAndSelect('perfilDoctor.cuenta', 'cuenta')
      .leftJoinAndSelect('perfilDoctor.admin', 'admin')
      .leftJoinAndSelect('perfilDoctor.pacientes', 'pacientes')
      .where('cuenta.email = :email', { email })
      .getOne();

    if (!perfilDoctor) {
      throw new NotFoundException(
        'Perfil de doctor no encontrado para este email',
      );
    }

    return perfilDoctor;
  }

  async findByCedula(cedula: string): Promise<PerfilDoctor> {
    const perfilDoctor = await this.perfilDoctorRepository.findOne({
      where: { cedula_profesional: cedula },
      relations: ['cuenta', 'admin', 'pacientes'],
    });

    if (!perfilDoctor) {
      throw new NotFoundException(
        'Perfil de doctor no encontrado para esta cédula',
      );
    }

    return perfilDoctor;
  }

  async update(
    id: string,
    updatePerfilDoctorDto: UpdatePerfilDoctorDto,
  ): Promise<PerfilDoctor> {
    const perfilDoctor = await this.findOne(id);

    // Si se está actualizando la cédula, verificar que no esté duplicada
    if (
      updatePerfilDoctorDto.cedula_profesional &&
      updatePerfilDoctorDto.cedula_profesional !==
        perfilDoctor.cedula_profesional
    ) {
      const existingWithCedula = await this.perfilDoctorRepository.findOne({
        where: { cedula_profesional: updatePerfilDoctorDto.cedula_profesional },
      });
      if (existingWithCedula) {
        throw new ConflictException(
          'Ya existe un doctor con esta cédula profesional',
        );
      }
    }

    Object.assign(perfilDoctor, updatePerfilDoctorDto);

    return await this.perfilDoctorRepository.save(perfilDoctor);
  }

  async remove(id: string): Promise<void> {
    const perfilDoctor = await this.findOne(id);
    await this.perfilDoctorRepository.remove(perfilDoctor);
  }

  async getDoctorStats(): Promise<{
    totalDoctores: number;
    doctoresActivos: number;
    especialidades: string[];
    totalPacientes: number;
  }> {
    const totalDoctores = await this.perfilDoctorRepository.count();

    const doctoresActivos = await this.perfilDoctorRepository
      .createQueryBuilder('perfilDoctor')
      .leftJoin('perfilDoctor.cuenta', 'cuenta')
      .where('cuenta.activa = :activa', { activa: true })
      .getCount();

    const especialidades = await this.perfilDoctorRepository
      .createQueryBuilder('perfilDoctor')
      .select('DISTINCT perfilDoctor.especialidad', 'especialidad')
      .where('perfilDoctor.especialidad IS NOT NULL')
      .getRawMany();

    // Contar el total de pacientes asignados a doctores
    const totalPacientes = await this.perfilDoctorRepository
      .createQueryBuilder('perfilDoctor')
      .leftJoin('perfilDoctor.pacientes', 'pacientes')
      .select('COUNT(DISTINCT pacientes.id)', 'count')
      .getRawOne();

    return {
      totalDoctores,
      doctoresActivos,
      especialidades: especialidades.map((e) => e.especialidad).filter(Boolean),
      totalPacientes: parseInt(totalPacientes.count) || 0,
    };
  }

  async searchDoctores(query: string): Promise<PerfilDoctor[]> {
    return await this.perfilDoctorRepository
      .createQueryBuilder('perfilDoctor')
      .leftJoinAndSelect('perfilDoctor.cuenta', 'cuenta')
      .leftJoinAndSelect('perfilDoctor.admin', 'admin')
      .leftJoinAndSelect('perfilDoctor.pacientes', 'pacientes')
      .where('perfilDoctor.nombre ILIKE :query', { query: `%${query}%` })
      .orWhere('perfilDoctor.especialidad ILIKE :query', {
        query: `%${query}%`,
      })
      .orWhere('perfilDoctor.cedula_profesional ILIKE :query', {
        query: `%${query}%`,
      })
      .orWhere('cuenta.email ILIKE :query', { query: `%${query}%` })
      .getMany();
  }

  async getDoctoresPorEspecialidad(
    especialidad: string,
  ): Promise<PerfilDoctor[]> {
    return await this.perfilDoctorRepository.find({
      where: { especialidad },
      relations: ['cuenta', 'admin', 'pacientes'],
    });
  }

  async asignarPaciente(
    doctorId: string,
    usuarioId: string,
  ): Promise<PerfilDoctor> {
    // Esta función asumiría que tenemos una relación entre Doctor y Usuario (Paciente)
    // En nuestro modelo, el PerfilUsuario tiene un doctor_id, por lo que para asignar un paciente
    // deberíamos actualizar el doctor_id en el PerfilUsuario.
    // Pero para mantener la consistencia, haremos que esta función actualice el PerfilUsuario.
    // Sin embargo, en el servicio de PerfilDoctor, no tenemos acceso directo a PerfilUsuario.
    // Por lo tanto, podríamos hacerlo en el controlador de PerfilUsuario o crear un método aquí que llame al servicio de PerfilUsuario.

    // Por ahora, dejaremos este método como un placeholder y manejaremos la asignación en el controlador de PerfilUsuario.
    // O podríamos inyectar el PerfilUsuarioService aquí, pero para no crear una dependencia circular, lo haremos en el controlador.

    throw new Error(
      'Método no implementado. La asignación de pacientes se maneja en el controlador de PerfilUsuario.',
    );
  }

  async getPacientes(doctorId: string): Promise<PerfilDoctor> {
    const doctor = await this.perfilDoctorRepository.findOne({
      where: { id: doctorId },
      relations: ['pacientes', 'pacientes.cuenta'],
    });

    if (!doctor) {
      throw new NotFoundException('Doctor no encontrado');
    }

    return doctor;
  }
}
