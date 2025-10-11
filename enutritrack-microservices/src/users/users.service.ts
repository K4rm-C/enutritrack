import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as cacheManager_1 from 'cache-manager';
import { Repository } from 'typeorm';
import { User } from './models/user.model';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { Doctor } from '../doctor/models/doctor.model';
import { Cuenta } from '../shared/models/cuenta.model';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
    @InjectRepository(Cuenta)
    private cuentaRepository: Repository<Cuenta>,
    @Inject(CACHE_MANAGER) private cacheManager: cacheManager_1.Cache,
  ) {}

  // src/users/users.service.ts
  async findByEmailWithPassword(email: string): Promise<any | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { cuenta: { email } },
        relations: ['cuenta', 'doctor'],
      });

      if (!user || !user.cuenta || !user.cuenta.password_hash) {
        return null;
      }

      return {
        id: user.id,
        nombre: user.nombre,
        email: user.cuenta.email,
        passwordHash: user.cuenta.password_hash,
        fechaNacimiento: user.fecha_nacimiento,
        genero: user.genero,
        altura: user.altura,
        cuenta_id: user.cuenta_id,
        doctor_id: user.doctor_id,
      };
    } catch (error) {
      console.error(`Error fetching user by email with password:`, error);
      return null;
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verificar si ya existe una cuenta con este email
    const existingCuenta = await this.cuentaRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingCuenta) {
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
      createUserDto.password,
      saltRounds,
    );
    console.log('Password hasheado en microservicio');

    // 1. Crear cuenta primero
    const cuenta = this.cuentaRepository.create({
      email: createUserDto.email,
      password_hash: hashedPassword,
      tipo_cuenta: 'usuario',
      activa: true,
    });
    const savedCuenta = await this.cuentaRepository.save(cuenta);
    console.log('Cuenta creada:', savedCuenta.id);

    // 2. Crear perfil de usuario
    const user = this.userRepository.create({
      cuenta_id: savedCuenta.id,
      nombre: createUserDto.nombre,
      fecha_nacimiento: new Date(createUserDto.fecha_nacimiento),
      genero: createUserDto.genero,
      altura: createUserDto.altura,
      telefono: undefined,
      doctor_id:
        createUserDto.doctorId && createUserDto.doctorId.trim() !== ''
          ? createUserDto.doctorId
          : undefined,
    });

    const savedUser = await this.userRepository.save(user);
    console.log('Perfil de usuario guardado en base de datos:', savedUser.id);

    try {
      const userForCache = { ...savedUser };
      await this.cacheManager.set(`user:${savedUser.id}`, userForCache, 3600);
      await this.cacheManager.set(
        `email:${createUserDto.email}`,
        savedUser.id,
        3600,
      );
      console.log('Usuario guardado en cache Redis');

      await this.cacheManager.del('users:all');

      // Si hay un doctor asignado, tambien actualizar el cache del doctor
      if (savedUser.doctor_id) {
        await this.cacheManager.del(`doctor:${savedUser.doctor_id}:patients`);
      }
    } catch (error) {
      console.warn('Error saving to cache:', error);
    }

    // Cargar relaciones para devolver objeto completo
    const userWithRelations = await this.userRepository.findOne({
      where: { id: savedUser.id },
      relations: ['cuenta', 'doctor'],
    });

    if (!userWithRelations) {
      throw new InternalServerErrorException('User not found after creation');
    }

    return userWithRelations;
  }

  // Metodo auxiliar para asignar un doctor a un usuario existente
  async assignDoctor(userId: string, doctorId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['cuenta', 'doctor'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.doctor_id = doctorId;
    const updatedUser = await this.userRepository.save(user);

    // Actualizar cache
    try {
      await this.cacheManager.del(`user:${userId}`);
      await this.cacheManager.del('users:all');
      await this.cacheManager.del(`doctor:${doctorId}:patients`);

      console.log('Doctor asignado al usuario correctamente');
    } catch (error) {
      console.warn('Error updating cache:', error);
    }

    return updatedUser;
  }

  // Método para obtener pacientes de un doctor
  async getPatientsByDoctorId(doctorId: string): Promise<User[]> {
    try {
      const cachedPatients = await this.cacheManager.get<User[]>(
        `doctor:${doctorId}:patients`,
      );
      if (cachedPatients) {
        console.log('Pacientes del doctor encontrados en cache');
        return cachedPatients;
      }
    } catch (error) {
      console.warn('Error accessing cache:', error);
    }

    const patients = await this.userRepository.find({
      where: { doctor_id: doctorId },
      relations: ['cuenta', 'doctor'],
    });

    try {
      const patientsForCache = patients.map((user) => {
        const userCopy = { ...user };
        delete (userCopy as any).passwordHash;
        return userCopy;
      });
      await this.cacheManager.set(
        `doctor:${doctorId}:patients`,
        patientsForCache,
        1800,
      );
    } catch (error) {
      console.warn('Error saving to cache:', error);
    }

    return patients;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    try {
      const cachedUserId = await this.cacheManager.get<string>(
        `email:${email}`,
      );
      if (cachedUserId) {
        const cachedUser = await this.cacheManager.get<User>(
          `user:${cachedUserId}`,
        );
        if (cachedUser) {
          console.log('Usuario encontrado en cache');
          return cachedUser;
        }
      }
    } catch (error) {
      console.warn('Error accessing cache:', error);
    }

    const user = await this.userRepository.findOne({
      where: { cuenta: { email } },
      relations: ['cuenta', 'doctor'],
    });

    if (user) {
      try {
        const userForCache = { ...user };
        await this.cacheManager.set(`user:${user.id}`, userForCache, 3600);
        await this.cacheManager.set(`email:${email}`, user.id, 3600);
      } catch (error) {
        console.warn('Error saving to cache:', error);
      }
    }

    return user ?? undefined;
  }

  async findById(id: string): Promise<User | undefined> {
    try {
      const cachedUser = await this.cacheManager.get<User>(`user:${id}`);
      if (cachedUser) {
        console.log('Usuario encontrado en cache');
        return cachedUser;
      }
    } catch (error) {
      console.warn('Error accessing cache:', error);
    }

    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['cuenta', 'doctor', 'historialPeso', 'objetivos'],
      order: {
        historialPeso: {
          fecha_registro: 'DESC',
        },
        objetivos: {
          fecha_establecido: 'DESC',
        },
      },
    });

    if (user) {
      try {
        const userForCache = { ...user };
        await this.cacheManager.set(`user:${user.id}`, userForCache, 3600);
        if (user.cuenta) {
          await this.cacheManager.set(
            `email:${user.cuenta.email}`,
            user.id,
            3600,
          );
        }
      } catch (error) {
        console.warn('Error saving to cache:', error);
      }
    }

    return user ?? undefined;
  }

  async findAll(): Promise<User[]> {
    try {
      const cachedUsers = await this.cacheManager.get<User[]>('users:all');
      if (cachedUsers) {
        console.log('Usuarios encontrados en cache');
        return cachedUsers;
      }
    } catch (error) {
      console.warn('Error accessing cache:', error);
    }

    const users = await this.userRepository.find({
      relations: ['cuenta', 'doctor'],
    });

    try {
      const usersForCache = users.map((user) => {
        const userCopy = { ...user };
        delete (userCopy as any).passwordHash;
        return userCopy;
      });
      await this.cacheManager.set('users:all', usersForCache, 1800); // 30 min
    } catch (error) {
      console.warn('Error saving to cache:', error);
    }

    return users;
  }

  async update(id: string, updateData: UpdateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { id },
      relations: ['cuenta', 'doctor'],
    });
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Actualizar email en cuenta si se proporciona
    if (
      updateData.email &&
      existingUser.cuenta &&
      updateData.email !== existingUser.cuenta.email
    ) {
      const userWithEmail = await this.findByEmail(updateData.email);
      if (userWithEmail && userWithEmail.id !== id) {
        throw new ConflictException('User with this email already exists');
      }

      // Actualizar email en tabla cuentas
      await this.cuentaRepository.update(existingUser.cuenta_id, {
        email: updateData.email,
      });
    }

    // Actualizar password en cuenta si se proporciona
    if (updateData.password && existingUser.cuenta) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(updateData.password, saltRounds);
      await this.cuentaRepository.update(existingUser.cuenta_id, {
        password_hash: hashedPassword,
      });
    }

    // Transformar los datos del DTO al formato de la entidad perfil_usuario
    const updateDataForEntity: Partial<User> = {};

    if (updateData.nombre) updateDataForEntity.nombre = updateData.nombre;
    if (updateData.fecha_nacimiento)
      updateDataForEntity.fecha_nacimiento = new Date(
        updateData.fecha_nacimiento,
      );
    if (updateData.genero) updateDataForEntity.genero = updateData.genero;
    if (updateData.altura) updateDataForEntity.altura = updateData.altura;
    if (updateData.doctorId !== undefined)
      updateDataForEntity.doctor_id =
        updateData.doctorId && updateData.doctorId.trim() !== ''
          ? updateData.doctorId
          : undefined;

    await this.userRepository.update(id, updateDataForEntity);
    const updatedUser = await this.userRepository.findOne({
      where: { id },
      relations: ['cuenta', 'doctor'],
    });

    if (!updatedUser) {
      throw new InternalServerErrorException('User not found after update');
    }

    try {
      await this.cacheManager.del(`user:${id}`);
      await this.cacheManager.del(`email:${existingUser.cuenta?.email}`);
      await this.cacheManager.del('users:all');

      if (updateData.email && updateData.email !== existingUser.cuenta?.email) {
        await this.cacheManager.del(`email:${updateData.email}`);
      }

      // Limpiar cache de pacientes si se cambió el doctor
      if (
        existingUser.doctor_id &&
        existingUser.doctor_id !== updateData.doctorId
      ) {
        await this.cacheManager.del(
          `doctor:${existingUser.doctor_id}:patients`,
        );
      }
      if (updateData.doctorId) {
        await this.cacheManager.del(`doctor:${updateData.doctorId}:patients`);
      }

      console.log('Cache limpiado después de actualizar usuario');
    } catch (error) {
      console.warn('Error updating cache:', error);
    }

    return updatedUser;
  }

  async remove(id: string): Promise<{ affected: number }> {
    const existingUser = await this.userRepository.findOne({ where: { id } });

    const result = await this.userRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }

    try {
      await this.cacheManager.del(`user:${id}`);
      if (existingUser) {
        await this.cacheManager.del(`email:${existingUser.cuenta?.email}`);
        // Limpiar cache de pacientes del doctor si el usuario tenía uno asignado
        if (existingUser.doctor_id) {
          await this.cacheManager.del(
            `doctor:${existingUser.doctor_id}:patients`,
          );
        }
      }
      await this.cacheManager.del('users:all');

      console.log('Usuario eliminado de cache');
    } catch (error) {
      console.warn('Error removing from cache:', error);
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
