import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './models/user.model';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { Doctor } from '../doctor/models/doctor.model';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
  ) {}

  async findByEmailWithPassword(email: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
        select: [
          'id',
          'nombre',
          'email',
          'contraseñaHash',
          'fechaNacimiento',
          'genero',
        ],
      });

      if (!user || !user.contraseñaHash) {
        return null;
      }

      return user;
    } catch (error) {
      console.error(`Error fetching user by email with password:`, error);
      return null;
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Verificar si el doctor existe (si se proporciona doctorId)
    if (createUserDto.doctorId) {
      const existingDoctor = await this.doctorRepository.findOne({
        where: { id: createUserDto.doctorId },
      });
      if (!existingDoctor) {
        throw new NotFoundException('Doctor not found');
      }
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.contraseña,
      saltRounds,
    );

    const user = this.userRepository.create({
      nombre: createUserDto.nombre,
      email: createUserDto.email,
      contraseñaHash: hashedPassword,
      fechaNacimiento: new Date(createUserDto.fecha_nacimiento),
      genero: createUserDto.género,
      altura: createUserDto.altura,
      pesoActual: createUserDto.peso_actual,
      objetivoPeso: createUserDto.objetivo_peso,
      nivelActividad: createUserDto.nivel_actividad,
      doctorId: createUserDto.doctorId,
    });

    const savedUser = await this.userRepository.save(user);
    console.log('Usuario guardado en base de datos:', savedUser.id);

    return savedUser;
  }

  // Método auxiliar para asignar un doctor a un usuario existente
  async assignDoctor(userId: string, doctorId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.doctorId = doctorId;
    const updatedUser = await this.userRepository.save(user);

    console.log('Doctor asignado al usuario correctamente');
    return updatedUser;
  }

  // Método para obtener pacientes de un doctor
  async getPatientsByDoctorId(doctorId: string): Promise<User[]> {
    const patients = await this.userRepository.find({
      where: { doctorId },
      relations: ['doctor'],
    });

    return patients;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({ where: { email } });
    return user ?? undefined;
  }

  async findById(id: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({ where: { id } });
    return user ?? undefined;
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async update(id: string, updateData: UpdateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({ where: { id } });
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (updateData.email && updateData.email !== existingUser.email) {
      const userWithEmail = await this.findByEmail(updateData.email);
      if (userWithEmail && userWithEmail.id !== id) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // Transformar los datos del DTO al formato de la entidad
    const updateDataForEntity: Partial<User> = {};

    if (updateData.nombre) updateDataForEntity.nombre = updateData.nombre;
    if (updateData.email) updateDataForEntity.email = updateData.email;
    if (updateData.fecha_nacimiento)
      updateDataForEntity.fechaNacimiento = new Date(
        updateData.fecha_nacimiento,
      );
    if (updateData.género) updateDataForEntity.genero = updateData.género;
    if (updateData.altura) updateDataForEntity.altura = updateData.altura;
    if (updateData.peso_actual)
      updateDataForEntity.pesoActual = updateData.peso_actual;
    if (updateData.objetivo_peso)
      updateDataForEntity.objetivoPeso = updateData.objetivo_peso;
    if (updateData.nivel_actividad)
      updateDataForEntity.nivelActividad = updateData.nivel_actividad;
    if (updateData.doctorId !== undefined)
      updateDataForEntity.doctorId = updateData.doctorId;

    // Si se proporciona una nueva contraseña, hashearla
    if (updateData.contraseña) {
      const saltRounds = 10;
      updateDataForEntity.contraseñaHash = await bcrypt.hash(
        updateData.contraseña,
        saltRounds,
      );
    }

    await this.userRepository.update(id, updateDataForEntity);
    const updatedUser = await this.userRepository.findOne({ where: { id } });

    if (!updatedUser) {
      throw new InternalServerErrorException('User not found after update');
    }

    console.log('Usuario actualizado correctamente');
    return updatedUser;
  }

  async remove(id: string): Promise<{ affected: number }> {
    const result = await this.userRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }

    console.log('Usuario eliminado correctamente');
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
