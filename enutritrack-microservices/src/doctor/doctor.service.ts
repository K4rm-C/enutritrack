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

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
  ) {}

  // src/doctor/doctor.service.ts
  async findByEmailWithPassword(email: string): Promise<Doctor | null> {
    try {
      const doctor = await this.doctorRepository.findOne({
        where: { email },
        select: [
          'id',
          'nombre',
          'email',
          'contraseñaHash',
          'createdAt',
          'updatedAt',
        ],
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

  async create(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    const existingUser = await this.findByEmail(createDoctorDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createDoctorDto.contraseña,
      saltRounds,
    );
    console.log('Contraseña hasheada en microservicio');

    const user = this.doctorRepository.create({
      nombre: createDoctorDto.nombre,
      email: createDoctorDto.email,
      contraseñaHash: hashedPassword,
    });

    const savedUser = await this.doctorRepository.save(user);
    console.log('Usuario guardado en base de datos:', savedUser.id);
    return savedUser;
  }

  async findByEmail(email: string): Promise<Doctor | undefined> {
    const user = await this.doctorRepository.findOne({ where: { email } });
    return user ?? undefined;
  }

  async findById(id: string): Promise<Doctor | undefined> {
    const user = await this.doctorRepository.findOne({ where: { id } });
    return user ?? undefined;
  }

  async findAll(): Promise<Doctor[]> {
    return await this.doctorRepository.find();
  }

  async update(id: string, updateData: Partial<Doctor>): Promise<Doctor> {
    const existingUser = await this.doctorRepository.findOne({ where: { id } });
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (updateData.email && updateData.email !== existingUser.email) {
      const userWithEmail = await this.findByEmail(updateData.email);
      if (userWithEmail && userWithEmail.id !== id) {
        throw new ConflictException('User with this email already exists');
      }
    }

    await this.doctorRepository.update(id, updateData);
    const updatedUser = await this.doctorRepository.findOne({ where: { id } });

    if (!updatedUser) {
      throw new InternalServerErrorException('User not found after update');
    }

    return updatedUser;
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
}
