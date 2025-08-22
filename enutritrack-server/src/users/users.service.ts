import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './models/user.model';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verificar si el email ya existe
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.contraseña, // ← Cambié a contraseña
      saltRounds,
    );

    // Mapear manualmente los nombres de columna a propiedades
    const user = this.userRepository.create({
      nombre: createUserDto.nombre,
      email: createUserDto.email,
      contraseñaHash: hashedPassword, // ← propiedad de la entidad
      fechaNacimiento: new Date(createUserDto.fecha_nacimiento), // ← propiedad
      genero: createUserDto.género, // ← propiedad
      altura: createUserDto.altura,
      pesoActual: createUserDto.peso_actual, // ← propiedad
      objetivoPeso: createUserDto.objetivo_peso, // ← propiedad
      nivelActividad: createUserDto.nivel_actividad, // ← propiedad
    });

    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({ where: { email } });
    return user ?? undefined;
  }

  async findById(id: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({ where: { id } });
    return user ?? undefined;
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    // Verificar si el usuario existe
    const existingUser = await this.findById(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Si se está actualizando el email, verificar que no exista otro usuario con el mismo email
    if (updateData.email && updateData.email !== existingUser.email) {
      const userWithEmail = await this.findByEmail(updateData.email);
      if (userWithEmail) {
        throw new ConflictException('User with this email already exists');
      }
    }

    await this.userRepository.update(id, updateData);
    return this.findById(id) as Promise<User>; // Ya verificamos que existe
  }

  // src/user/user.service.ts
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
