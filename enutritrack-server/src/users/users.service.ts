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
import { CouchbaseService } from '../couchbase/couchbase.service';
import { Doctor } from '../doctor/models/doctor.model';
import { UpdateUserDto } from './dto/update-user.dto';

interface StoredProcedureResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
    @Inject(CACHE_MANAGER) private cacheManager: cacheManager_1.Cache,
    private couchbaseService: CouchbaseService,
  ) {}

  private async executeProcedure(procedureName: string, parameters: any[]): Promise<StoredProcedureResult> {
    const manager = this.userRepository.manager;
    const paramPlaceholders = parameters.map((_, index) => `$${index + 1}`).join(', ');
    const query = `SELECT ${procedureName}(${paramPlaceholders}) as result`;
    
    try {
      const result = await manager.query(query, parameters);
      return result[0]?.result || { success: false, error: 'NO_RESULT' };
    } catch (error) {
      console.error(`Error executing ${procedureName}:`, error);
      throw new InternalServerErrorException(`Database operation failed: ${error.message}`);
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Hash de la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.contraseña, saltRounds);
    console.log('Contraseña hasheada en microservicio');

    // Ejecutar procedimiento almacenado
    const result = await this.executeProcedure('sp_create_user', [
      createUserDto.nombre,
      createUserDto.email,
      hashedPassword,
      createUserDto.fecha_nacimiento,
      createUserDto.género,
      createUserDto.altura,
      createUserDto.peso_actual,
      createUserDto.objetivo_peso,
      createUserDto.nivel_actividad,
      createUserDto.doctorId || null,
    ]);

    if (!result.success) {
      if (result.error === 'CONFLICT') {
        throw new ConflictException(result.message);
      } else if (result.error === 'NOT_FOUND') {
        throw new NotFoundException(result.message);
      } else {
        throw new InternalServerErrorException(result.message || 'Failed to create user');
      }
    }

    const savedUser = result.data;
    console.log('Usuario guardado en base de datos:', savedUser.id);

    // Crear perfil para Couchbase y cache
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
      doctorId: savedUser.doctorId,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
    };

    try {
      // Guardar en Couchbase
      await this.couchbaseService.upsertDocument(`user::${savedUser.id}`, userProfile);
      console.log('Usuario guardado en Couchbase');

      // Guardar en cache Redis
      await this.cacheManager.set(`user:${savedUser.id}`, userProfile, 3600);
      await this.cacheManager.set(`email:${savedUser.email}`, savedUser.id, 3600);
      console.log('Usuario guardado en cache Redis');

      // Limpiar cache
      await this.cacheManager.del('users:all');
      if (savedUser.doctorId) {
        await this.cacheManager.del(`doctor:${savedUser.doctorId}:patients`);
      }
    } catch (error) {
      console.warn('Error saving to cache/couchbase:', error);
    }

    // Convertir a entidad User para mantener compatibilidad
    return this.mapToUserEntity(savedUser);
  }

  async assignDoctor(userId: string, doctorId: string): Promise<User> {
    const result = await this.executeProcedure('sp_assign_doctor', [userId, doctorId]);

    if (!result.success) {
      if (result.error === 'NOT_FOUND') {
        throw new NotFoundException(result.message);
      } else {
        throw new InternalServerErrorException(result.message || 'Failed to assign doctor');
      }
    }

    const updatedUser = result.data;

    try {
      // Limpiar cache
      await this.cacheManager.del(`user:${userId}`);
      await this.cacheManager.del('users:all');
      await this.cacheManager.del(`doctor:${doctorId}:patients`);

      // Actualizar Couchbase
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
        updatedAt: updatedUser.updatedAt,
      };

      await this.couchbaseService.upsertDocument(`user::${updatedUser.id}`, userProfile);
      console.log('Doctor asignado al usuario correctamente');
    } catch (error) {
      console.warn('Error updating cache/couchbase:', error);
    }

    return this.mapToUserEntity(updatedUser);
  }

  async getPatientsByDoctorId(doctorId: string): Promise<User[]> {
    try {
      const cachedPatients = await this.cacheManager.get<User[]>(`doctor:${doctorId}:patients`);
      if (cachedPatients) {
        console.log('Pacientes del doctor encontrados en cache');
        return cachedPatients;
      }
    } catch (error) {
      console.warn('Error accessing cache:', error);
    }

    const result = await this.executeProcedure('sp_get_patients_by_doctor', [doctorId]);

    if (!result.success) {
      throw new InternalServerErrorException('Failed to get patients');
    }

    const patients = result.data.map(patient => this.mapToUserEntity(patient));

    try {
      const patientsForCache = patients.map((user) => {
        const userCopy = { ...user };
        delete (userCopy as any).contraseñaHash;
        return userCopy;
      });
      await this.cacheManager.set(`doctor:${doctorId}:patients`, patientsForCache, 1800);
    } catch (error) {
      console.warn('Error saving to cache:', error);
    }

    return patients;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    try {
      const cachedUserId = await this.cacheManager.get<string>(`email:${email}`);
      if (cachedUserId) {
        const cachedUser = await this.cacheManager.get<User>(`user:${cachedUserId}`);
        if (cachedUser) {
          console.log('Usuario encontrado en cache');
          return cachedUser as User;
        }
      }
    } catch (error) {
      console.warn('Error accessing cache:', error);
    }

    const result = await this.executeProcedure('sp_find_user_by_email', [email]);

    if (!result.success) {
      throw new InternalServerErrorException('Failed to find user by email');
    }

    if (!result.data) {
      return undefined;
    }

    const user = this.mapToUserEntity(result.data);

    try {
      const userForCache = { ...user };
      delete (userForCache as any).contraseñaHash;
      await this.cacheManager.set(`user:${user.id}`, userForCache, 3600);
      await this.cacheManager.set(`email:${user.email}`, user.id, 3600);
    } catch (error) {
      console.warn('Error saving to cache:', error);
    }

    return user;
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

    const result = await this.executeProcedure('sp_find_user_by_id', [id]);

    if (!result.success) {
      throw new InternalServerErrorException('Failed to find user by id');
    }

    if (!result.data) {
      return undefined;
    }

    const user = this.mapToUserEntity(result.data);

    try {
      const userForCache = { ...user };
      delete (userForCache as any).contraseñaHash;
      await this.cacheManager.set(`user:${user.id}`, userForCache, 3600);
      await this.cacheManager.set(`email:${user.email}`, user.id, 3600);
    } catch (error) {
      console.warn('Error saving to cache:', error);
    }

    return user;
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

    const result = await this.executeProcedure('sp_find_all_users', []);

    if (!result.success) {
      throw new InternalServerErrorException('Failed to find all users');
    }

    const users = result.data.map(userData => this.mapToUserEntity(userData));

    try {
      const usersForCache = users.map((user) => {
        const userCopy = { ...user };
        delete (userCopy as any).contraseñaHash;
        return userCopy;
      });
      await this.cacheManager.set('users:all', usersForCache, 1800);
    } catch (error) {
      console.warn('Error saving to cache:', error);
    }

    return users;
  }

  async update(id: string, updateData: UpdateUserDto): Promise<User> {
    // Obtener usuario existente para el cache
    const existingResult = await this.executeProcedure('sp_find_user_by_id', [id]);
    if (!existingResult.success || !existingResult.data) {
      throw new NotFoundException('User not found');
    }
    const existingUser = existingResult.data;

    // Hashear nueva contraseña si se proporciona
    let hashedPassword: string | null = null;
    if (updateData.contraseña) {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(updateData.contraseña, saltRounds);
    }

    // Ejecutar procedimiento de actualización
    const result = await this.executeProcedure('sp_update_user', [
      id,
      updateData.nombre || null,
      updateData.email || null,
      hashedPassword,
      updateData.fecha_nacimiento || null,
      updateData.género || null,
      updateData.altura || null,
      updateData.peso_actual || null,
      updateData.objetivo_peso || null,
      updateData.nivel_actividad || null,
      updateData.doctorId !== undefined ? (updateData.doctorId || '00000000-0000-0000-0000-000000000000') : null,
    ]);

    if (!result.success) {
      if (result.error === 'NOT_FOUND') {
        throw new NotFoundException(result.message);
      } else if (result.error === 'CONFLICT') {
        throw new ConflictException(result.message);
      } else {
        throw new InternalServerErrorException(result.message || 'Failed to update user');
      }
    }

    const updatedUser = result.data;

    try {
      // Limpiar cache
      await this.cacheManager.del(`user:${id}`);
      await this.cacheManager.del(`email:${existingUser.email}`);
      await this.cacheManager.del('users:all');

      if (updateData.email && updateData.email !== existingUser.email) {
        await this.cacheManager.del(`email:${updateData.email}`);
      }

      // Limpiar cache de pacientes si se cambió el doctor
      if (existingUser.doctorId && existingUser.doctorId !== updateData.doctorId) {
        await this.cacheManager.del(`doctor:${existingUser.doctorId}:patients`);
      }
      if (updateData.doctorId) {
        await this.cacheManager.del(`doctor:${updateData.doctorId}:patients`);
      }

      // Actualizar Couchbase
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
        updatedAt: updatedUser.updatedAt,
      };

      await this.couchbaseService.upsertDocument(`user::${updatedUser.id}`, userProfile);
      console.log('Usuario actualizado en Couchbase y cache limpiado');
    } catch (error) {
      console.warn('Error updating cache/couchbase:', error);
    }

    return this.mapToUserEntity(updatedUser);
  }

  async remove(id: string): Promise<{ affected: number }> {
    // Obtener usuario existente para limpiar cache
    const existingResult = await this.executeProcedure('sp_find_user_by_id', [id]);
    const existingUser = existingResult.success ? existingResult.data : null;

    const result = await this.executeProcedure('sp_delete_user', [id]);

    if (!result.success) {
      if (result.error === 'NOT_FOUND') {
        throw new NotFoundException(result.message);
      } else {
        throw new InternalServerErrorException(result.message || 'Failed to delete user');
      }
    }

    try {
      // Limpiar cache
      await this.cacheManager.del(`user:${id}`);
      if (existingUser) {
        await this.cacheManager.del(`email:${existingUser.email}`);
        if (existingUser.doctorId) {
          await this.cacheManager.del(`doctor:${existingUser.doctorId}:patients`);
        }
      }
      await this.cacheManager.del('users:all');

      // Eliminar de Couchbase
      await this.couchbaseService.removeDocument(`user::${id}`);
      console.log('Usuario eliminado de cache y Couchbase');
    } catch (error) {
      console.warn('Error removing from cache/couchbase:', error);
    }

    return { affected: result.data.affected };
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
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
      const retrievedDoc = await this.couchbaseService.getDocument('test::connection');

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

  /**
   * Método auxiliar para mapear los datos del procedimiento almacenado a la entidad User
   */
  private mapToUserEntity(userData: any): User {
    const user = new User();
    user.id = userData.id;
    user.nombre = userData.nombre;
    user.email = userData.email;
    user.contraseñaHash = userData.contraseñaHash;
    user.fechaNacimiento = new Date(userData.fechaNacimiento);
    user.genero = userData.genero;
    user.altura = userData.altura;
    user.pesoActual = userData.pesoActual;
    user.objetivoPeso = userData.objetivoPeso;
    user.nivelActividad = userData.nivelActividad;
    user.doctorId = userData.doctorId;
    user.createdAt = new Date(userData.createdAt);
    user.updatedAt = new Date(userData.updatedAt);
    return user;
  }
}