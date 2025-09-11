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
import { HttpService } from '@nestjs/axios';
import { CouchbaseService } from '../couchbase/couchbase.service';
import { Doctor } from '../doctor/models/doctor.model';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Doctor) // Inyectar el repositorio del Doctor
    private doctorRepository: Repository<Doctor>,
    @Inject(CACHE_MANAGER) private cacheManager: cacheManager_1.Cache,
    private couchbaseService: CouchbaseService,
  ) {}

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
    console.log('Contraseña hasheada en microservicio');

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
      doctorId: createUserDto.doctorId, // Asignar el doctor al usuario
    });

    const savedUser = await this.userRepository.save(user);
    console.log('Usuario guardado en base de datos:', savedUser.id);

    const userProfile = {
      id: savedUser.id,
      nombre: savedUser.nombre,
      email: savedUser.email,
      fechaNacimiento: savedUser.fechaNacimiento,
      genero: savedUser.genero,
      altura: savedUser.altura,
      pesoActual: savedUser.pesoActual,
      objetivoPeso: savedUser.objetivoPeso,
      nivelActividad: savedUser.nivelActividad,
      doctorId: savedUser.doctorId, // Incluir doctorId en el perfil
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await this.couchbaseService.upsertDocument(
        `user::${savedUser.id}`,
        userProfile,
      );
      console.log('Usuario guardado en Couchbase');

      const userForCache = { ...userProfile };
      await this.cacheManager.set(`user:${savedUser.id}`, userForCache, 3600);
      await this.cacheManager.set(
        `email:${savedUser.email}`,
        savedUser.id,
        3600,
      );
      console.log('Usuario guardado en cache Redis');

      await this.cacheManager.del('users:all');

      // Si hay un doctor asignado, también actualizar el cache del doctor
      if (savedUser.doctorId) {
        await this.cacheManager.del(`doctor:${savedUser.doctorId}:patients`);
      }
    } catch (error) {
      console.warn('Error saving to cache/couchbase:', error);
    }

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

    // Actualizar cache y Couchbase
    try {
      await this.cacheManager.del(`user:${userId}`);
      await this.cacheManager.del('users:all');
      await this.cacheManager.del(`doctor:${doctorId}:patients`);

      const userProfile = {
        id: updatedUser.id,
        nombre: updatedUser.nombre,
        email: updatedUser.email,
        fechaNacimiento: updatedUser.fechaNacimiento,
        genero: updatedUser.genero,
        altura: updatedUser.altura,
        pesoActual: updatedUser.pesoActual,
        objetivoPeso: updatedUser.objetivoPeso,
        nivelActividad: updatedUser.nivelActividad,
        doctorId: updatedUser.doctorId,
        updatedAt: new Date(),
      };

      await this.couchbaseService.upsertDocument(
        `user::${updatedUser.id}`,
        userProfile,
      );

      console.log('Doctor asignado al usuario correctamente');
    } catch (error) {
      console.warn('Error updating cache/couchbase:', error);
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
      where: { doctorId },
      relations: ['doctor'], // Incluir la relación con el doctor si es necesario
    });

    try {
      const patientsForCache = patients.map((user) => {
        const userCopy = { ...user };
        delete (userCopy as any).contraseñaHash;
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
          return cachedUser as User;
        }
      }
    } catch (error) {
      console.warn('Error accessing cache:', error);
    }

    const user = await this.userRepository.findOne({ where: { email } });

    if (user) {
      try {
        const userForCache = { ...user };
        delete (userForCache as any).contraseñaHash;
        await this.cacheManager.set(`user:${user.id}`, userForCache, 3600);
        await this.cacheManager.set(`email:${user.email}`, user.id, 3600);
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
        return cachedUser as User;
      }
    } catch (error) {
      console.warn('Error accessing cache:', error);
    }

    const user = await this.userRepository.findOne({ where: { id } });
    if (user) {
      try {
        const userForCache = { ...user };
        delete (userForCache as any).contraseñaHash;
        await this.cacheManager.set(`user:${user.id}`, userForCache, 3600);
        await this.cacheManager.set(`email:${user.email}`, user.id, 3600);
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

    const users = await this.userRepository.find();

    try {
      const usersForCache = users.map((user) => {
        const userCopy = { ...user };
        delete (userCopy as any).contraseñaHash;
        return userCopy;
      });
      await this.cacheManager.set('users:all', usersForCache, 1800); // 30 min
    } catch (error) {
      console.warn('Error saving to cache:', error);
    }

    return users;
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

    try {
      await this.cacheManager.del(`user:${id}`);
      await this.cacheManager.del(`email:${existingUser.email}`);
      await this.cacheManager.del('users:all');

      if (updateData.email && updateData.email !== existingUser.email) {
        await this.cacheManager.del(`email:${updateData.email}`);
      }

      // Limpiar cache de pacientes si se cambió el doctor
      if (
        existingUser.doctorId &&
        existingUser.doctorId !== updateData.doctorId
      ) {
        await this.cacheManager.del(`doctor:${existingUser.doctorId}:patients`);
      }
      if (updateData.doctorId) {
        await this.cacheManager.del(`doctor:${updateData.doctorId}:patients`);
      }

      const userProfile = {
        id: updatedUser.id,
        nombre: updatedUser.nombre,
        email: updatedUser.email,
        fechaNacimiento: updatedUser.fechaNacimiento,
        genero: updatedUser.genero,
        altura: updatedUser.altura,
        pesoActual: updatedUser.pesoActual,
        objetivoPeso: updatedUser.objetivoPeso,
        nivelActividad: updatedUser.nivelActividad,
        doctorId: updatedUser.doctorId,
        updatedAt: new Date(),
      };

      await this.couchbaseService.upsertDocument(
        `user::${updatedUser.id}`,
        userProfile,
      );

      console.log('Usuario actualizado en Couchbase y cache limpiado');
    } catch (error) {
      console.warn('Error updating cache/couchbase:', error);
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
        await this.cacheManager.del(`email:${existingUser.email}`);
        // Limpiar cache de pacientes del doctor si el usuario tenía uno asignado
        if (existingUser.doctorId) {
          await this.cacheManager.del(
            `doctor:${existingUser.doctorId}:patients`,
          );
        }
      }
      await this.cacheManager.del('users:all');

      await this.couchbaseService.removeDocument(`user::${id}`);

      console.log('Usuario eliminado de cache y Couchbase');
    } catch (error) {
      console.warn('Error removing from cache/couchbase:', error);
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

  async testCouchbaseConnection(): Promise<boolean> {
    try {
      const testDoc = {
        test: 'connection',
        timestamp: new Date().toISOString(),
      };

      await this.couchbaseService.upsertDocument('test::connection', testDoc);
      const retrievedDoc =
        await this.couchbaseService.getDocument('test::connection');

      return retrievedDoc && retrievedDoc.test === 'connection';
    } catch (error) {
      console.error('Couchbase connection test failed:', error);
      return false;
    }
  }

  async testRedisConnection(): Promise<boolean> {
    try {
      const testKey = 'test:connection';
      const testValue = 'redis_works';

      await this.cacheManager.set(testKey, testValue, 10);
      const retrievedValue = await this.cacheManager.get(testKey);

      return retrievedValue === testValue;
    } catch (error) {
      console.error('Redis connection test failed:', error);
      return false;
    }
  }
}
