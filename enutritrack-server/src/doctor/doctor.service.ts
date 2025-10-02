import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './models/doctor.model';
import { CreateDoctorDto } from './dto/create-doctor.dto';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
  ) {}

  async create(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    try {
      const result = await this.doctorRepository.query(
        'SELECT * FROM create_doctor($1, $2, $3)',
        [createDoctorDto.nombre, createDoctorDto.email, createDoctorDto.contraseña]
      );
      
      if (result[0].error_message) {
        if (result[0].error_message.includes('already exists')) {
          throw new ConflictException(result[0].error_message);
        }
        throw new InternalServerErrorException(result[0].error_message);
      }
      
      // Obtener el doctor creado
      const doctor = await this.findById(result[0].id);
      if (!doctor) {
        throw new InternalServerErrorException('Doctor not found after creation');
      }
      
      return doctor;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async findByEmail(email: string): Promise<Doctor | undefined> {
    const result = await this.doctorRepository.query(
      'SELECT * FROM find_doctor_by_email($1)',
      [email]
    );
    return result.length > 0 ? result[0] : undefined;
  }

  async findById(id: string): Promise<Doctor | undefined> {
    const result = await this.doctorRepository.query(
      'SELECT * FROM find_doctor_by_id($1)',
      [id]
    );
    return result.length > 0 ? result[0] : undefined;
  }

  async findAll(): Promise<Doctor[]> {
    return await this.doctorRepository.query('SELECT * FROM get_all_doctors()');
  }

  async update(id: string, updateData: Partial<Doctor>): Promise<Doctor> {
    try {
      const result = await this.doctorRepository.query(
        'SELECT * FROM update_doctor($1, $2, $3)',
        [id, updateData.nombre, updateData.email]
      );
      
      if (!result[0].success) {
        if (result[0].error_message.includes('not found')) {
          throw new NotFoundException(result[0].error_message);
        }
        if (result[0].error_message.includes('already exists')) {
          throw new ConflictException(result[0].error_message);
        }
        throw new InternalServerErrorException(result[0].error_message);
      }
      
      const updatedDoctor = await this.findById(id);
      if (!updatedDoctor) {
        throw new InternalServerErrorException('User not found after update');
      }
      
      return updatedDoctor;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async remove(id: string): Promise<{ affected: number }> {
    try {
      const result = await this.doctorRepository.query(
        'SELECT * FROM delete_doctor($1)',
        [id]
      );
      
      if (result[0].affected_rows === 0) {
        throw new NotFoundException(result[0].error_message || 'User not found');
      }
      
      return { affected: result[0].affected_rows };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async validatePassword(
    email: string,
    plainPassword: string,
  ): Promise<{ isValid: boolean; doctor?: Doctor }> {
    try {
      const result = await this.doctorRepository.query(
        'SELECT * FROM validate_doctor_password($1, $2)',
        [email, plainPassword]
      );
      
      if (result.length === 0) {
        return { isValid: false };
      }
      
      if (result[0].is_valid) {
        const doctor = await this.findByEmail(email);
        return { isValid: true, doctor };
      }
      
      return { isValid: false };
    } catch (error) {
      console.error('Error validating password:', error);
      return { isValid: false };
    }
  }
}