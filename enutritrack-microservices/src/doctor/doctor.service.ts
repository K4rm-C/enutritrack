import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './models/doctor.model';
import { Cuenta } from '../shared/models/cuenta.model';
import { TipoCuentaEnum } from '../shared/enums';
import * as bcrypt from 'bcrypt';
import { CreateDoctorDto } from './dto/create-doctor.dto';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
    @InjectRepository(Cuenta)
    private cuentaRepository: Repository<Cuenta>,
  ) {}

  // Buscar doctor por email con datos de autenticacion
  async findByEmailWithPassword(email: string): Promise<any | null> {
    try {
      const doctor = await this.doctorRepository.findOne({
        where: { cuenta: { email } },
        relations: ['cuenta', 'especialidad'],
      });

      if (!doctor || !doctor.cuenta || !doctor.cuenta.password_hash) {
        return null;
      }

      return {
        id: doctor.id,
        nombre: doctor.nombre,
        email: doctor.cuenta.email,
        passwordHash: doctor.cuenta.password_hash,
        especialidad_id: doctor.especialidad_id,
        especialidad: doctor.especialidad?.nombre || null,
        cuenta_id: doctor.cuenta_id,
      };
    } catch (error) {
      console.error(`Error fetching doctor by email with password:`, error);
      return null;
    }
  }

  async create(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    // Verificar si ya existe una cuenta con este email
    const existingCuenta = await this.cuentaRepository.findOne({
      where: { email: createDoctorDto.email },
    });

    if (existingCuenta) {
      throw new ConflictException('User with this email already exists');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createDoctorDto.password,
      saltRounds,
    );
    console.log('Password hasheado en microservicio');

    // 1. Crear cuenta primero
    const cuenta = this.cuentaRepository.create({
      email: createDoctorDto.email,
      password_hash: hashedPassword,
      tipo_cuenta: TipoCuentaEnum.DOCTOR,
      activa: true,
    });
    const savedCuenta = await this.cuentaRepository.save(cuenta);
    console.log('Cuenta creada:', savedCuenta.id);

    // 2. Crear perfil de doctor
    const doctor = this.doctorRepository.create({
      cuenta_id: savedCuenta.id,
      nombre: createDoctorDto.nombre,
      especialidad_id: createDoctorDto.especialidad_id,
      cedula_profesional: createDoctorDto.cedula,
      telefono: createDoctorDto.telefono,
    });

    const savedDoctor = await this.doctorRepository.save(doctor);
    console.log('Perfil de doctor guardado en base de datos:', savedDoctor.id);

    // Cargar relacion para devolver objeto completo
    const doctorWithRelations = await this.doctorRepository.findOne({
      where: { id: savedDoctor.id },
      relations: ['cuenta', 'especialidad'],
    });

    if (!doctorWithRelations) {
      throw new InternalServerErrorException('Doctor not found after creation');
    }

    return doctorWithRelations;
  }

  async findByEmail(email: string): Promise<Doctor | undefined> {
    const doctor = await this.doctorRepository.findOne({
      where: { cuenta: { email } },
      relations: ['cuenta', 'especialidad'],
    });
    return doctor ?? undefined;
  }

  async findById(id: string): Promise<Doctor | undefined> {
    const doctor = await this.doctorRepository.findOne({
      where: { id },
      relations: ['cuenta', 'especialidad'],
    });
    return doctor ?? undefined;
  }

  async findAll(): Promise<Doctor[]> {
    return await this.doctorRepository.find({
      relations: ['cuenta', 'especialidad'],
    });
  }

  async update(id: string, updateData: Partial<Doctor>): Promise<Doctor> {
    const existingDoctor = await this.doctorRepository.findOne({
      where: { id },
      relations: ['cuenta'],
    });
    if (!existingDoctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Actualizar email en cuenta si se proporciona (si el DTO lo soporta)
    // Nota: El UpdateDoctorDto actual no incluye email, pero dejamos esto preparado
    const email = (updateData as any).email;
    if (
      email &&
      existingDoctor.cuenta &&
      email !== existingDoctor.cuenta.email
    ) {
      const doctorWithEmail = await this.findByEmail(email);
      if (doctorWithEmail && doctorWithEmail.id !== id) {
        throw new ConflictException('Doctor with this email already exists');
      }

      // Actualizar email en tabla cuentas
      await this.cuentaRepository.update(existingDoctor.cuenta_id, {
        email: email,
      });
    }

    // Actualizar password en cuenta si se proporciona
    const password = (updateData as any).password;
    if (password && existingDoctor.cuenta) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      await this.cuentaRepository.update(existingDoctor.cuenta_id, {
        password_hash: hashedPassword,
      });
    }

    // Actualizar datos del perfil_doctor
    const updateDataForEntity: Partial<Doctor> = {};
    if ((updateData as any).nombre)
      updateDataForEntity.nombre = (updateData as any).nombre;
    if ((updateData as any).especialidad_id)
      updateDataForEntity.especialidad_id = (updateData as any).especialidad_id;
    if ((updateData as any).cedula_profesional)
      updateDataForEntity.cedula_profesional = (
        updateData as any
      ).cedula_profesional;
    if ((updateData as any).telefono)
      updateDataForEntity.telefono = (updateData as any).telefono;

    await this.doctorRepository.update(id, updateDataForEntity);
    const updatedDoctor = await this.doctorRepository.findOne({
      where: { id },
      relations: ['cuenta', 'especialidad'],
    });

    if (!updatedDoctor) {
      throw new InternalServerErrorException('Doctor not found after update');
    }

    return updatedDoctor;
  }

  async remove(id: string): Promise<{ affected: number }> {
    const result = await this.doctorRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }

    return { affected: result.affected ?? 0 };
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error comparing passwords:', error);
      return false;
    }
  }

  async healthCheck() {
    const startTime = Date.now();

    const uptime = Math.floor((Date.now() - startTime) / 1000);

    return {
      status: 'online',
      timestamp: new Date().toISOString(),
      uptime: uptime,
      service: process.env.SERVICE_NAME || 'Microservicio de doctor',
      version: process.env.APP_VERSION || '1.1.0',
    };
  }
}
