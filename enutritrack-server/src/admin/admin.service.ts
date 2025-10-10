import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerfilAdmin } from './models/admin.model';
import { CreatePerfilAdminDto } from './dto/create-admin.dto';
import { UpdatePerfilAdminDto } from './dto/update-admin.dto';
import { CuentasService } from '../cuentas/cuentas.service';
import { TipoCuentaEnum } from '../shared/enum';

@Injectable()
export class PerfilAdminService {
  constructor(
    @InjectRepository(PerfilAdmin)
    private readonly perfilAdminRepository: Repository<PerfilAdmin>,
    private readonly cuentasService: CuentasService,
  ) {}

  async create(
    createPerfilAdminDto: CreatePerfilAdminDto,
  ): Promise<PerfilAdmin> {
    const { cuenta_id, ...perfilData } = createPerfilAdminDto;

    // Verificar que la cuenta existe
    const cuenta = await this.cuentasService.findOne(cuenta_id);

    // Verificar que la cuenta es de tipo admin
    if (cuenta.tipo_cuenta !== TipoCuentaEnum.ADMIN) {
      throw new BadRequestException('La cuenta debe ser de tipo administrador');
    }

    // Verificar que no existe ya un perfil para esta cuenta
    const existingPerfil = await this.perfilAdminRepository.findOne({
      where: { cuenta_id },
    });

    if (existingPerfil) {
      throw new ConflictException(
        'Ya existe un perfil de administrador para esta cuenta',
      );
    }

    const perfilAdmin = this.perfilAdminRepository.create({
      ...perfilData,
      cuenta_id,
    });

    return await this.perfilAdminRepository.save(perfilAdmin);
  }

  async findAll(): Promise<PerfilAdmin[]> {
    return await this.perfilAdminRepository.find({
      relations: ['cuenta'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<PerfilAdmin> {
    const perfilAdmin = await this.perfilAdminRepository.findOne({
      where: { id },
      relations: ['cuenta'],
    });

    if (!perfilAdmin) {
      throw new NotFoundException('Perfil de administrador no encontrado');
    }

    return perfilAdmin;
  }

  async findByCuentaId(cuentaId: string): Promise<PerfilAdmin> {
    const perfilAdmin = await this.perfilAdminRepository.findOne({
      where: { cuenta_id: cuentaId },
      relations: ['cuenta'],
    });

    if (!perfilAdmin) {
      throw new NotFoundException(
        'Perfil de administrador no encontrado para esta cuenta',
      );
    }

    return perfilAdmin;
  }

  async findByEmail(email: string): Promise<PerfilAdmin> {
    const perfilAdmin = await this.perfilAdminRepository
      .createQueryBuilder('perfilAdmin')
      .leftJoinAndSelect('perfilAdmin.cuenta', 'cuenta')
      .where('cuenta.email = :email', { email })
      .getOne();

    if (!perfilAdmin) {
      throw new NotFoundException(
        'Perfil de administrador no encontrado para este email',
      );
    }

    return perfilAdmin;
  }

  async update(
    id: string,
    updatePerfilAdminDto: UpdatePerfilAdminDto,
  ): Promise<PerfilAdmin> {
    const perfilAdmin = await this.findOne(id);

    Object.assign(perfilAdmin, updatePerfilAdminDto);

    return await this.perfilAdminRepository.save(perfilAdmin);
  }

  async remove(id: string): Promise<void> {
    const perfilAdmin = await this.findOne(id);
    await this.perfilAdminRepository.remove(perfilAdmin);
  }

  async getAdminStats(): Promise<{
    totalAdmins: number;
    adminsActivos: number;
    departamentos: string[];
  }> {
    const totalAdmins = await this.perfilAdminRepository.count();

    const adminsActivos = await this.perfilAdminRepository
      .createQueryBuilder('perfilAdmin')
      .leftJoin('perfilAdmin.cuenta', 'cuenta')
      .where('cuenta.activa = :activa', { activa: true })
      .getCount();

    const departamentos = await this.perfilAdminRepository
      .createQueryBuilder('perfilAdmin')
      .select('DISTINCT perfilAdmin.departamento', 'departamento')
      .where('perfilAdmin.departamento IS NOT NULL')
      .getRawMany();

    return {
      totalAdmins,
      adminsActivos,
      departamentos: departamentos.map((d) => d.departamento).filter(Boolean),
    };
  }

  async searchAdmins(query: string): Promise<PerfilAdmin[]> {
    return await this.perfilAdminRepository
      .createQueryBuilder('perfilAdmin')
      .leftJoinAndSelect('perfilAdmin.cuenta', 'cuenta')
      .where('perfilAdmin.nombre ILIKE :query', { query: `%${query}%` })
      .orWhere('perfilAdmin.departamento ILIKE :query', { query: `%${query}%` })
      .orWhere('cuenta.email ILIKE :query', { query: `%${query}%` })
      .getMany();
  }

  async getAdminCompleto(id: string): Promise<any> {
    const perfilAdmin = await this.perfilAdminRepository.findOne({
      where: { id },
      relations: ['cuenta'],
    });

    if (!perfilAdmin) {
      throw new NotFoundException('Perfil de administrador no encontrado');
    }

    // Obtener estadísticas adicionales que el admin podría necesitar
    const stats = {
      totalDoctores: 0, // Podrías agregar esto más tarde
      totalUsuarios: 0, // Podrías agregar esto más tarde
      totalAlimentos: 0, // Podrías agregar esto más tarde
    };

    return {
      ...perfilAdmin,
      stats,
    };
  }
}
