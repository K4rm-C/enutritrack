import { Injectable, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CouchbaseService } from '../couchbase/couchbase.service';

@Injectable()
export class UsersService {
  private readonly USER_SERVICE_URL = 'http://localhost:4000';

  constructor(
    private httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private couchbaseService: CouchbaseService,
  ) {}

  async create(createUserDto: any) {
    // Crear usuario en el microservicio
    const response = await firstValueFrom(
      this.httpService.post(`${this.USER_SERVICE_URL}/users`, createUserDto),
    );

    const savedUser = response.data;

    // Guardar perfil completo en Couchbase (documento JSON)
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
      nutritional_profile: await this.calculateNutritionalProfile(savedUser),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      await this.couchbaseService.upsertDocument(
        `user::${savedUser.id}`,
        userProfile,
      );

      // Guardar en cache Redis por 1 hora
      await this.cacheManager.set(`user:${savedUser.id}`, userProfile, 3600);

      // Guardar índice de email en cache
      await this.cacheManager.set(
        `email:${savedUser.email}`,
        savedUser.id,
        3600,
      );
    } catch (error) {
      console.warn('Error saving to cache/couchbase:', error);
    }

    // Invalidar cache de lista de usuarios
    await this.cacheManager.del('users:all');

    return savedUser;
  }

  async findAll() {
    const cacheKey = 'users:all';

    // Intentar obtener del cache
    let users = await this.cacheManager.get(cacheKey);

    if (!users) {
      console.log('Cache miss - consultando microservicio para users:all');

      const response = await firstValueFrom(
        this.httpService.get(`${this.USER_SERVICE_URL}/users`),
      );

      users = response.data;

      // Guardar en cache por 10 minutos
      await this.cacheManager.set(cacheKey, users, 600);
    } else {
      console.log('Cache hit - users:all obtenido del cache');
    }

    return users;
  }

  async findOne(id: string) {
    const cacheKey = `user:${id}`;

    // Primero intentar obtener de Redis (caché)
    let user = await this.cacheManager.get(cacheKey);

    if (user) {
      console.log(`Cache hit para user ${id}`);
      return user;
    }

    console.log(`Cache miss para user ${id} - buscando en Couchbase`);

    // Si no está en Redis, intentar obtener de Couchbase
    try {
      const userDoc = await this.couchbaseService.getDocument(`user::${id}`);
      if (userDoc) {
        // Guardar en cache Redis para próximas consultas
        await this.cacheManager.set(cacheKey, userDoc, 3600);
        console.log(
          `Usuario ${id} encontrado en Couchbase y guardado en cache`,
        );
        return userDoc;
      }
    } catch (error) {
      console.warn('Couchbase get failed, falling back to microservice', error);
    }

    console.log(
      `Usuario ${id} no encontrado en cache ni Couchbase - consultando microservicio`,
    );

    // Si no está en caché ni en Couchbase, consultar microservicio
    const response = await firstValueFrom(
      this.httpService.get(`${this.USER_SERVICE_URL}/users/${id}`),
    );

    user = response.data;

    // Si se encuentra, crear perfil completo y guardar en Couchbase y Redis
    if (user) {
      const userProfile = {
        // Changed from [] to {}
        id: response.data.id,
        nombre: response.data.nombre, // Fixed typo: oombre → nombre
        email: response.data.email,
        fechaNacimiento: response.data.fechaNacimiento, // Fixed typo: fechaMacimiento → fechaNacimiento
        genero: response.data.genero,
        altura: response.data.altura,
        pesoActual: response.data.pesoActual,
        objetivoPeso: response.data.objetivoPeso,
        nivelActividad: response.data.nivelActividad,
        nutritional_profile: await this.calculateNutritionalProfile(user),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      try {
        await this.couchbaseService.upsertDocument(`user::${id}`, userProfile); // Fixed template string
        await this.cacheManager.set(cacheKey, userProfile, 3600);
      } catch (error) {
        console.warn('Error saving to cache/couchbase:', error);
      }
    }

    return user;
  }

  async findByEmail(email: string) {
    // Intentar obtener ID del usuario desde cache
    const userId = await this.cacheManager.get(`email:${email}`);

    if (userId) {
      console.log(
        `Email ${email} encontrado en cache, buscando usuario ${userId}`,
      );
      return this.findOne(userId as string);
    }

    console.log(
      `Email ${email} no encontrado en cache, consultando microservicio`,
    );

    // Consultar microservicio
    const response = await firstValueFrom(
      this.httpService.get(`${this.USER_SERVICE_URL}/users/email/${email}`),
    );

    const user = response.data;

    if (user) {
      // Guardar índice de email en cache
      await this.cacheManager.set(`email:${email}`, user.id, 3600);

      // También asegurar que el usuario esté en cache
      await this.findOne(user.id);
    }

    return user;
  }

  async update(id: string, updateUserDto: any) {
    const response = await firstValueFrom(
      this.httpService.patch(
        `${this.USER_SERVICE_URL}/users/${id}`,
        updateUserDto,
      ),
    );

    const updatedUser = response.data;

    // Actualizar perfil en Couchbase
    try {
      const existingProfile = await this.couchbaseService.getDocument(
        `user::${id}`,
      );

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
        nutritional_profile:
          await this.calculateNutritionalProfile(updatedUser),
        created_at: existingProfile?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await this.couchbaseService.upsertDocument(`user::${id}`, userProfile);

      // Actualizar cache Redis
      await this.cacheManager.set(`user:${id}`, userProfile, 3600);

      // Si cambió el email, actualizar índice
      if (updateUserDto.email) {
        await this.cacheManager.set(`email:${updateUserDto.email}`, id, 3600);
      }
    } catch (error) {
      console.warn('Error updating cache/couchbase:', error);
    }

    // Invalidar cache de lista de usuarios
    await this.cacheManager.del('users:all');

    return updatedUser;
  }

  async remove(id: string) {
    // Obtener datos del usuario antes de eliminar para limpiar cache
    let userEmail = null;
    try {
      const user = await this.findOne(id);
      userEmail = user?.email;
    } catch (error) {
      console.warn('Could not get user email before deletion');
    }

    const response = await firstValueFrom(
      this.httpService.delete(`${this.USER_SERVICE_URL}/users/${id}`),
    );

    // Limpiar de Couchbase
    try {
      await this.couchbaseService.removeDocument(`user::${id}`);
    } catch (error) {
      console.warn('Error removing from couchbase:', error);
    }

    // Limpiar cache Redis
    await this.cacheManager.del(`user:${id}`);
    if (userEmail) {
      await this.cacheManager.del(`email:${userEmail}`);
    }
    await this.cacheManager.del('users:all');

    return response.data;
  }

  private async calculateNutritionalProfile(user: any): Promise<any> {
    // Lógica simplificada para calcular perfil nutricional
    const bmr = this.calculateBMR(user);
    const tdee = this.calculateTDEE(bmr, (user as any).nivelActividad);

    return {
      daily_calories: Math.round(tdee),
      protein_percentage: 30,
      carb_percentage: 40,
      fat_percentage: 30,
      dietary_restrictions: [],
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
    };
  }

  private calculateBMR(user: any): number {
    // Fórmula Mifflin-St Jeor
    if ((user as any).genero === 'masculino') {
      return (
        10 * (user as any).pesoActual +
        6.25 * (user as any).altura -
        5 * this.calculateAge((user as any).fechaNacimiento) +
        5
      );
    } else {
      return (
        10 * (user as any).pesoActual +
        6.25 * (user as any).altura -
        5 * this.calculateAge((user as any).fechaNacimiento) -
        161
      );
    }
  }

  private calculateTDEE(bmr: number, activityLevel: string): number {
    const activityMultipliers = {
      sedentario: 1.2,
      ligera: 1.375,
      moderada: 1.55,
      intensa: 1.725,
      muy_intensa: 1.9,
    };

    return bmr * (activityMultipliers[activityLevel] || 1.2);
  }

  private calculateAge(birthDate: string | Date): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  }

  // Métodos para probar conexiones
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
