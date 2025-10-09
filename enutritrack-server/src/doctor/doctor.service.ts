import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './models/doctor.model';
import * as bcrypt from 'bcrypt';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { AdminService } from '../admin/admin.service';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
    private adminService: AdminService,
  ) {}

  async create(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    const existingUser = await this.findByEmail(createDoctorDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Verificar que el admin existe
    if (createDoctorDto.adminId) {
      const existingAdmin = await this.adminService.findById(
        createDoctorDto.adminId,
      );
      if (!existingAdmin) {
        throw new NotFoundException('Admin not found');
      }
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createDoctorDto.contraseña,
      saltRounds,
    );

    const doctor = this.doctorRepository.create({
      nombre: createDoctorDto.nombre,
      email: createDoctorDto.email,
      contraseñaHash: hashedPassword,
      admin: { id: createDoctorDto.adminId }, // Esto crea una referencia al Admin
    });

    const savedDoctor = await this.doctorRepository.save(doctor);

    // Asegurarnos de que savedDoctor es un objeto Doctor, no un array
    if (Array.isArray(savedDoctor)) {
      throw new InternalServerErrorException(
        'Unexpected array response from save operation',
      );
    }

    console.log('Doctor guardado en base de datos:', savedDoctor.id);
    return savedDoctor;
  }

  async findByEmailWithPassword(email: string): Promise<Doctor | null> {
    try {
      const doctor = await this.doctorRepository.findOne({
        where: { email },
        select: ['id', 'nombre', 'email', 'contraseñaHash', 'admin'],
      });

      if (!doctor || !doctor.contraseñaHash) {
        return null;
      }

      return doctor;
    } catch (error) {
      console.error(`Error fetching doctor by email with password:`, error);
      return null;
    }
  }

  async findByEmail(email: string): Promise<Doctor | undefined> {
    const doctor = await this.doctorRepository.findOne({
      where: { email },
    });
    return doctor ?? undefined;
  }

  async findById(id: string): Promise<Doctor | undefined> {
    const doctor = await this.doctorRepository.findOne({
      where: { id },
    });
    return doctor ?? undefined;
  }

  async findAll(): Promise<Doctor[]> {
    return await this.doctorRepository.find();
  }

  async update(id: string, updateData: Partial<Doctor>): Promise<Doctor> {
    const existingDoctor = await this.doctorRepository.findOne({
      where: { id },
    });
    if (!existingDoctor) {
      throw new NotFoundException('Doctor not found');
    }

    if (updateData.email && updateData.email !== existingDoctor.email) {
      const doctorWithEmail = await this.findByEmail(updateData.email);
      if (doctorWithEmail && doctorWithEmail.id !== id) {
        throw new ConflictException('Doctor with this email already exists');
      }
    }

    await this.doctorRepository.update(id, updateData);
    const updatedDoctor = await this.doctorRepository.findOne({
      where: { id },
    });

    if (!updatedDoctor) {
      throw new InternalServerErrorException('Doctor not found after update');
    }

    return updatedDoctor;
  }

  async remove(id: string): Promise<{ affected: number }> {
    const result = await this.doctorRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Doctor not found');
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

  // Método para obtener doctores por adminId
  async findByAdminId(adminId: string): Promise<Doctor[]> {
    return await this.doctorRepository.find({
      where: { admin: { id: adminId } },
    });
  }
}
