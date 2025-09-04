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

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    let hashedPassword: string;

    if (createUserDto.contraseña) {
      hashedPassword = createUserDto.contraseña;
      console.log('Usando contraseña ya hasheada desde backend');
    } else if (createUserDto.contraseña) {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(createUserDto.contraseña, saltRounds);
      console.log('Hasheando contraseña en microservicio');
    } else {
      throw new Error('No password provided');
    }

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
    });

    const savedUser = await this.userRepository.save(user);
    console.log('Usuario guardado en base de datos:', savedUser.id);
    return savedUser;
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

  async update(id: string, updateData: Partial<User>): Promise<User> {
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

    await this.userRepository.update(id, updateData);
    const updatedUser = await this.userRepository.findOne({ where: { id } });

    if (!updatedUser) {
      throw new InternalServerErrorException('User not found after update');
    }

    return updatedUser;
  }

  async remove(id: string): Promise<{ affected: number }> {
    const result = await this.userRepository.delete(id);

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
