import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as cacheManager_1 from 'cache-manager';
import { Repository } from 'typeorm';
import { User } from './models/user.model';
import { HistorialPeso } from './models/historial-peso.model';
import { ObjetivoUsuario } from './models/objetivo-usuario.model';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { Doctor } from '../doctor/models/doctor.model';
import { Cuenta } from '../shared/models/cuenta.model';
import { TipoCuentaEnum } from '../shared/enums';
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
    @InjectRepository(HistorialPeso)
    private historialPesoRepository: Repository<HistorialPeso>,
    @InjectRepository(ObjetivoUsuario)
    private objetivoUsuarioRepository: Repository<ObjetivoUsuario>,
    @Inject(CACHE_MANAGER) private cacheManager: cacheManager_1.Cache,
  ) {}

  // src/users/users.service.ts
  async findByEmailWithPassword(email: string): Promise<any | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { cuenta: { email } },
        relations: ['cuenta', 'doctor', 'doctor.especialidad', 'genero'],
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
        genero: user.genero?.nombre,
        genero_id: user.genero_id,
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

    // Determinar la contraseña (priorizar password sobre contraseña)
    const passwordToUse = createUserDto.password || createUserDto.contraseña;
    if (!passwordToUse) {
      throw new ConflictException('La contraseña es requerida');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(passwordToUse, saltRounds);
    console.log('Password hasheado en microservicio');

    // 1. Crear cuenta primero
    const cuenta = this.cuentaRepository.create({
      email: createUserDto.email,
      password_hash: hashedPassword,
      tipo_cuenta: TipoCuentaEnum.USUARIO,
      activa: true,
    });
    const savedCuenta = await this.cuentaRepository.save(cuenta);
    console.log('Cuenta creada:', savedCuenta.id);

    // Determinar el genero_id (priorizar genero_id sobre genero)
    let finalGeneroId = createUserDto.genero_id || createUserDto.genero;
    if (!finalGeneroId) {
      throw new ConflictException('El género es requerido');
    }

    // Mapear valores legacy del frontend a UUIDs si es necesario
    if (finalGeneroId === 'M') {
      finalGeneroId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'; // Masculino
    } else if (finalGeneroId === 'F') {
      finalGeneroId = 'b2c3d4e5-f6a7-8901-bcde-f12345678901'; // Femenino
    } else if (finalGeneroId === 'O') {
      finalGeneroId = 'c3d4e5f6-a7b8-9012-cdef-123456789012'; // Otro
    }

    // 2. Crear perfil de usuario
    const user = this.userRepository.create({
      cuenta_id: savedCuenta.id,
      nombre: createUserDto.nombre,
      fecha_nacimiento: new Date(createUserDto.fecha_nacimiento),
      genero_id: finalGeneroId,
      altura: createUserDto.altura,
      telefono: createUserDto.telefono,
      telefono_1: createUserDto.telefono_1,
      telefono_2: createUserDto.telefono_2,
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
      relations: ['cuenta', 'doctor', 'genero'],
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
      relations: ['cuenta', 'doctor', 'genero'],
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
  async getPatientsByDoctorId(doctorId: string): Promise<any[]> {
    try {
      const cachedPatients = await this.cacheManager.get<any[]>(
        `doctor:${doctorId}:patients`,
      );
      if (cachedPatients) {
        console.log(
          'Pacientes del doctor encontrados en cache',
          cachedPatients,
        );
        return cachedPatients;
      }
    } catch (error) {
      console.warn('Error accessing cache:', error);
    }

    const patients = await this.userRepository.find({
      where: { doctor_id: doctorId },
      relations: ['cuenta', 'doctor', 'genero', 'historialPeso', 'objetivos'],
    });

    // Ordenar el historial de peso y objetivos después de obtener los datos
    patients.forEach((patient) => {
      if (patient.historialPeso) {
        patient.historialPeso.sort(
          (a, b) =>
            new Date(b.fecha_registro).getTime() -
            new Date(a.fecha_registro).getTime(),
        );
      }
      if (patient.objetivos) {
        patient.objetivos.sort(
          (a, b) =>
            new Date(b.fecha_establecido).getTime() -
            new Date(a.fecha_establecido).getTime(),
        );
      }
    });

    // Formatear cada paciente con los datos necesarios para el frontend
    const formattedPatients = patients.map((user) =>
      this.formatUserForFrontend(user),
    );

    try {
      await this.cacheManager.set(
        `doctor:${doctorId}:patients`,
        formattedPatients,
        1800,
      );
    } catch (error) {
      console.warn('Error saving to cache:', error);
    }

    return formattedPatients;
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
      relations: ['cuenta', 'doctor', 'genero'],
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

  async findById(id: string): Promise<any | undefined> {
    try {
      const cachedUser = await this.cacheManager.get<User>(
        `user:${id}:detailed`,
      );
      if (cachedUser) {
        console.log('Usuario detallado encontrado en cache');
        return this.formatUserForFrontend(cachedUser);
      }
    } catch (error) {
      console.warn('Error accessing cache:', error);
    }

    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['cuenta', 'doctor', 'genero', 'historialPeso', 'objetivos'],
      order: {
        historialPeso: {
          fecha_registro: 'DESC',
        },
        objetivos: {
          fecha_establecido: 'DESC',
        },
      },
    });

    if (!user) {
      return undefined;
    }

    const formattedUser = this.formatUserForFrontend(user);

    try {
      await this.cacheManager.set(`user:${user.id}:detailed`, user, 1800); // 30 min cache for detailed data
    } catch (error) {
      console.warn('Error saving to cache:', error);
    }

    return formattedUser;
  }

  private formatUserForFrontend(user: User): any {
    // Obtener el peso más reciente
    const pesoActual =
      user.historialPeso && user.historialPeso.length > 0
        ? user.historialPeso[0].peso
        : null;

    // Obtener el objetivo más reciente
    const objetivoVigente =
      user.objetivos && user.objetivos.length > 0
        ? user.objetivos.find((obj) => obj.vigente) || user.objetivos[0]
        : null;

    // Calcular IMC si tenemos peso y altura
    let imc: number | null = null;
    if (pesoActual && user.altura) {
      const alturaEnMetros = parseFloat(user.altura.toString()) / 100;
      if (alturaEnMetros > 0) {
        imc = parseFloat(
          (
            parseFloat(pesoActual.toString()) /
            (alturaEnMetros * alturaEnMetros)
          ).toFixed(1),
        );
      }
    }

    return {
      ...user,
      // Campos planos que espera el frontend
      email: user.cuenta?.email || null,
      telefono: user.telefono || null,
      telefono_1: user.telefono_1 || null,
      telefono_2: user.telefono_2 || null,
      peso_actual: pesoActual,
      pesoActual: pesoActual,
      objetivo_peso: objetivoVigente?.peso_objetivo || null,
      objetivoPeso: objetivoVigente?.peso_objetivo || null,
      nivel_actividad: objetivoVigente?.nivel_actividad || null,
      nivelActividad: objetivoVigente?.nivel_actividad || null,
      imc: imc,
      // Mantener objetos originales por compatibilidad
      cuenta: user.cuenta,
      doctor: user.doctor,
      genero: user.genero,
      historialPeso: user.historialPeso,
      objetivos: user.objetivos,
    };
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
      relations: ['cuenta', 'doctor', 'genero'],
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
    // Validar que el ID no sea undefined o inválido
    if (!id || id === 'undefined' || id === 'null') {
      throw new BadRequestException('Invalid user ID provided');
    }

    const existingUser = await this.userRepository.findOne({
      where: { id },
      relations: ['cuenta', 'doctor', 'genero'],
    });
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Preparar datos de actualización para la tabla cuentas
    const cuentaUpdateData: Partial<Cuenta> = {};

    // Actualizar email principal si se proporciona
    if (
      updateData.email &&
      existingUser.cuenta &&
      updateData.email !== existingUser.cuenta.email
    ) {
      const userWithEmail = await this.findByEmail(updateData.email);
      if (userWithEmail && userWithEmail.id !== id) {
        throw new ConflictException('User with this email already exists');
      }
      cuentaUpdateData.email = updateData.email;
    }

    // Actualizar emails adicionales si se proporcionan
    if (updateData.email_1 !== undefined) {
      cuentaUpdateData.email_1 = updateData.email_1;
    }
    if (updateData.email_2 !== undefined) {
      cuentaUpdateData.email_2 = updateData.email_2;
    }

    // Actualizar cuenta si hay cambios
    if (Object.keys(cuentaUpdateData).length > 0 && existingUser.cuenta) {
      await this.cuentaRepository.update(
        existingUser.cuenta_id,
        cuentaUpdateData,
      );
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
    if (updateData.genero_id)
      updateDataForEntity.genero_id = updateData.genero_id;
    // Manejar campo legacy 'genero' que viene del frontend
    if (updateData.genero && !updateData.genero_id)
      updateDataForEntity.genero_id = updateData.genero;
    if (updateData.altura) updateDataForEntity.altura = updateData.altura;
    if (updateData.telefono !== undefined)
      updateDataForEntity.telefono = updateData.telefono;
    if (updateData.telefono_1 !== undefined)
      updateDataForEntity.telefono_1 = updateData.telefono_1;
    if (updateData.telefono_2 !== undefined)
      updateDataForEntity.telefono_2 = updateData.telefono_2;
    if (updateData.doctorId !== undefined)
      updateDataForEntity.doctor_id =
        updateData.doctorId && updateData.doctorId.trim() !== ''
          ? updateData.doctorId
          : undefined;

    // Actualizar peso actual en historial_peso si se proporciona
    if (
      updateData.peso_actual !== undefined &&
      updateData.peso_actual !== null
    ) {
      const nuevoRegistroPeso = this.historialPesoRepository.create({
        usuario_id: id,
        peso: updateData.peso_actual,
        fecha_registro: new Date(),
        notas: 'Actualizado desde formulario de edición',
      });
      await this.historialPesoRepository.save(nuevoRegistroPeso);
    }

    // Actualizar objetivo de peso y nivel de actividad si se proporcionan
    if (
      updateData.objetivo_peso !== undefined ||
      updateData.nivel_actividad !== undefined
    ) {
      // Buscar el objetivo vigente actual
      const objetivoVigente = await this.objetivoUsuarioRepository.findOne({
        where: { usuario_id: id, vigente: true },
        order: { fecha_establecido: 'DESC' },
      });

      if (objetivoVigente) {
        // Marcar el objetivo actual como no vigente
        await this.objetivoUsuarioRepository.update(objetivoVigente.id, {
          vigente: false,
        });

        // Crear nuevo objetivo con los datos actualizados
        const nuevoObjetivo = this.objetivoUsuarioRepository.create({
          usuario_id: id,
          peso_objetivo:
            updateData.objetivo_peso !== undefined
              ? updateData.objetivo_peso
              : objetivoVigente.peso_objetivo,
          nivel_actividad:
            updateData.nivel_actividad !== undefined
              ? updateData.nivel_actividad
              : objetivoVigente.nivel_actividad,
          fecha_establecido: new Date(),
          vigente: true,
        });
        await this.objetivoUsuarioRepository.save(nuevoObjetivo);
      } else {
        // Si no hay objetivo vigente, crear uno nuevo
        const nuevoObjetivo = this.objetivoUsuarioRepository.create({
          usuario_id: id,
          peso_objetivo: updateData.objetivo_peso,
          nivel_actividad: updateData.nivel_actividad,
          fecha_establecido: new Date(),
          vigente: true,
        });
        await this.objetivoUsuarioRepository.save(nuevoObjetivo);
      }
    }

    await this.userRepository.update(id, updateDataForEntity);
    const updatedUser = await this.userRepository.findOne({
      where: { id },
      relations: ['cuenta', 'doctor', 'genero'],
    });

    if (!updatedUser) {
      throw new InternalServerErrorException('User not found after update');
    }

    try {
      await this.cacheManager.del(`user:${id}`);
      await this.cacheManager.del(`user:${id}:detailed`); // Limpiar cache detallado
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

      // Limpiar cache de pacientes si se actualizaron datos relacionados (peso, actividad)
      if (
        existingUser.doctor_id &&
        (updateData.peso_actual !== undefined ||
          updateData.nivel_actividad !== undefined ||
          updateData.objetivo_peso !== undefined)
      ) {
        await this.cacheManager.del(
          `doctor:${existingUser.doctor_id}:patients`,
        );
      }

      console.log('Cache limpiado después de actualizar usuario');
    } catch (error) {
      console.warn('Error updating cache:', error);
    }

    return updatedUser;
  }

  async remove(id: string): Promise<{ affected: number }> {
    const existingUser = await this.userRepository.findOne({ where: { id } });
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['cuenta'],
    });
    await this.objetivoUsuarioRepository.delete({ usuario_id: id });
    await this.historialPesoRepository.delete({ usuario_id: id });
    await this.cuentaRepository.delete({ id: id });
    await this.objetivoUsuarioRepository.delete({ usuario_id: id });
    const result = await this.userRepository.delete(id);
    if (user?.cuenta) {
      await this.cuentaRepository.delete(user.cuenta.id);
    }
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
