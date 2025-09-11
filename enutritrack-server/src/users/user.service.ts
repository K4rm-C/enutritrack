// users.service.ts - User Service Híbrido (PostgreSQL + Couchbase + Redis)
import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import * as bcrypt from 'bcrypt';
import { CouchbaseService } from '../couchbase/couchbase.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './models/user.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>, // PostgreSQL
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache, // Redis
    private readonly couchbaseService: CouchbaseService, // Couchbase
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
        historialActividad: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      try {
        await this.couchbaseService.upsertDocument(
          `user::${savedUser.id}`,
          userProfile,
        );
        console.log('User profile saved to Couchbase');
      } catch (error) {
        console.warn('Failed to save to Couchbase:', error);
      }

      // 5. Actualizar caché Redis
      await this.updateUserCache(savedUser);

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
    const cacheKey = 'users:all';

    try {
      // 1. Verificar caché Redis
      const cachedUsers = await this.cacheManager.get<User[]>(cacheKey);
      if (cachedUsers) {
        console.log('Cache hit - returning cached users');
        return cachedUsers;
      }

      // 2. Consultar PostgreSQL
      console.log('Cache miss - fetching from PostgreSQL');
      const users = await this.userRepository.find({
        select: ['id', 'nombre', 'email', 'fechaNacimiento', 'genero'], // Sin contraseña
      });

      await this.cacheManager.set(cacheKey, users, 600);

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
    const cacheKey = `user:${id}`;

    try {
      const cachedUser = await this.cacheManager.get<User>(cacheKey);
      if (cachedUser) {
        console.log(`Cache hit for user ${id}`);
        return cachedUser;
      }

      console.log(`Cache miss for user ${id} - checking Couchbase`);
      try {
        const userProfile = await this.couchbaseService.getDocument(
          `user::${id}`,
        );
        if (userProfile) {
          await this.cacheManager.set(cacheKey, userProfile, 3600);
          console.log(`User ${id} found in Couchbase and cached`);
          return userProfile;
        }
      } catch (error) {
        console.warn(
          'Couchbase lookup failed, falling back to PostgreSQL:',
          error,
        );
      }
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

      await this.updateUserCache(user);

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
      // 1. Verificar caché por email
      const userId = await this.cacheManager.get<string>(`email:${email}`);
      if (userId) {
        console.log(`Email ${email} found in cache, fetching user ${userId}`);
        return await this.findOne(userId);
      }

      // 2. Buscar en PostgreSQL
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

      // 3. Actualizar caché
      await this.updateUserCache(user);

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
      try {
        const existingProfile = await this.couchbaseService.getDocument(
          `user::${id}`,
        );
        const updatedProfile = {
          ...existingProfile,
          ...updatedUser,
          updated_at: new Date().toISOString(),
        };
        await this.couchbaseService.upsertDocument(
          `user::${id}`,
          updatedProfile,
        );
      } catch (error) {
        console.warn('Failed to update Couchbase profile:', error);
      }

      await this.updateUserCache(updatedUser);
      await this.cacheManager.del('users:all');

      console.log(`User ${id} updated successfully`);
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
      console.log(`Removing user ${id}`);

      // 1. Obtener email antes de eliminar para limpiar caché
      const user = await this.userRepository.findOne({
        where: { id },
        select: ['email'],
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // 2. Eliminar de PostgreSQL (hard delete)
      const result = await this.userRepository.delete(id);

      if (result.affected === 0) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // 3. Eliminar de Couchbase
      try {
        await this.couchbaseService.removeDocument(`user::${id}`);
      } catch (error) {
        console.warn('Failed to remove from Couchbase:', error);
      }

      // 4. Limpiar caché
      await this.clearUserCache(id, user.email);

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

  private async updateUserCache(user: User): Promise<void> {
    try {
      const sanitizedUser = this.sanitizeUser(user);
      await this.cacheManager.set(`user:${user.id}`, sanitizedUser, 3600);
      await this.cacheManager.set(`email:${user.email}`, user.id, 3600);

      console.log(`User cache updated for ${user.id}`);
    } catch (error) {
      console.warn('Failed to update user cache:', error);
    }
  }

  private async clearUserCache(
    userId: string,
    userEmail?: string,
  ): Promise<void> {
    try {
      await this.cacheManager.del(`user:${userId}`);
      if (userEmail) {
        await this.cacheManager.del(`email:${userEmail}`);
      }
      await this.cacheManager.del('users:all');

      console.log(`User cache cleared for ${userId}`);
    } catch (error) {
      console.warn('Failed to clear user cache:', error);
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
