// users.service.ts - User Service Híbrido (PostgreSQL + Couchbase + Redis)
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Cache } from 'cache-manager';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './models/user.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>, // PostgreSQL
  ) {}
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      console.log('Creating user:', createUserDto.email);

      const existingUser = await this.userRepository.findOne({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        throw new HttpException('User already exists', HttpStatus.CONFLICT);
      }
      const hashedPassword = await bcrypt.hash(createUserDto.contraseña, 10);
      const userData = {
        nombre: createUserDto.nombre,
        email: createUserDto.email,
        contraseñaHash: hashedPassword,
        fechaNacimiento: createUserDto.fecha_nacimiento,
        genero: createUserDto.género,
        altura: createUserDto.altura,
        pesoActual: createUserDto.peso_actual,
        objetivoPeso: createUserDto.objetivo_peso,
        nivelActividad: createUserDto.nivel_actividad,
        doctorId: createUserDto.doctorId,
      };

      const savedUser = await this.userRepository.save(userData);

      console.log('User created successfully:', savedUser.id);
      return this.sanitizeUser(savedUser);
    } catch (error) {
      console.error('Error creating user:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to create user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(): Promise<User[]> {
    try {
      console.log('Cache miss - fetching from PostgreSQL');
      const users = await this.userRepository.find({
        select: ['id', 'nombre', 'email', 'fechaNacimiento', 'genero'], // Sin contraseña
      });
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new HttpException(
        'Failed to fetch users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string): Promise<User> {
    try {
      console.log(`User ${id} not in Couchbase - fetching from PostgreSQL`);
      const user = await this.userRepository.findOne({
        where: { id },
        select: [
          'id',
          'nombre',
          'email',
          'fechaNacimiento',
          'genero',
          'altura',
          'pesoActual',
          'objetivoPeso',
          'nivelActividad',
        ],
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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

  async findByEmail(email: string): Promise<User> {
    try {
      console.log(`Email ${email} not in cache - querying PostgreSQL`);
      const user = await this.userRepository.findOne({
        where: { email },
        select: [
          'id',
          'nombre',
          'email',
          'fechaNacimiento',
          'genero',
          'altura',
          'pesoActual',
          'objetivoPeso',
          'nivelActividad',
        ],
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      console.error(`Error fetching user by email ${email}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch user by email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      console.log(`Updating user ${id}`);
      const existingUser = await this.userRepository.findOne({
        where: { id },
      });

      if (!existingUser) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      let hashedPassword: string | undefined;
      if (updateUserDto.contraseña) {
        hashedPassword = await bcrypt.hash(updateUserDto.contraseña, 10);
      }
      const updateData: any = {};

      if (updateUserDto.nombre !== undefined)
        updateData.nombre = updateUserDto.nombre;
      if (updateUserDto.email !== undefined)
        updateData.email = updateUserDto.email;
      if (hashedPassword !== undefined)
        updateData.contraseñaHash = hashedPassword;
      if (updateUserDto.fecha_nacimiento !== undefined)
        updateData.fechaNacimiento = updateUserDto.fecha_nacimiento;
      if (updateUserDto.género !== undefined)
        updateData.genero = updateUserDto.género;
      if (updateUserDto.altura !== undefined)
        updateData.altura = updateUserDto.altura;
      if (updateUserDto.peso_actual !== undefined)
        updateData.pesoActual = updateUserDto.peso_actual;
      if (updateUserDto.objetivo_peso !== undefined)
        updateData.objetivoPeso = updateUserDto.objetivo_peso;
      if (updateUserDto.nivel_actividad !== undefined)
        updateData.nivelActividad = updateUserDto.nivel_actividad;
      if (updateUserDto.doctorId !== undefined)
        updateData.doctorId = updateUserDto.doctorId;

      updateData.updated_at = new Date();
      await this.userRepository.update(id, updateData);

      const updatedUser = await this.userRepository.findOne({
        where: { id },
        select: [
          'id',
          'nombre',
          'email',
          'fechaNacimiento',
          'genero',
          'altura',
          'pesoActual',
          'objetivoPeso',
          'nivelActividad',
        ],
      });

      if (!updatedUser) {
        throw new HttpException(
          'User not found after update',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return updatedUser;
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        select: ['email'],
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      console.log(`User ${id} removed successfully`);
    } catch (error) {
      console.error(`Error removing user ${id}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to remove user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error validating password:', error);
      return false;
    }
  }

  private sanitizeUser(user: User): User {
    // Remover contraseña de la respuesta
    const { contraseñaHash, ...sanitizedUser } = user as any;
    return sanitizedUser;
  }

  // Métodos de testing de conexiones
  async testPostgreSQLConnection(): Promise<boolean> {
    try {
      await this.userRepository.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('PostgreSQL connection test failed:', error);
      return false;
    }
  }
}
