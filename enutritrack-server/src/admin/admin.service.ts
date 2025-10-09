// src/admin/admin.service.ts
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './models/admin.model';
import * as bcrypt from 'bcrypt';
import { CreateAdminDto } from './dto/create-admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
  ) {}

  async findByEmailWithPassword(email: string): Promise<Admin | null> {
    try {
      const admin = await this.adminRepository.findOne({
        where: { email },
        select: ['id', 'nombre', 'email', 'contraseñaHash'],
      });

      if (!admin || !admin.contraseñaHash) {
        return null;
      }

      return admin;
    } catch (error) {
      console.error(`Error fetching admin by email with password:`, error);
      return null;
    }
  }

  async create(createAdminDto: CreateAdminDto): Promise<Admin> {
    const existingAdmin = await this.findByEmail(createAdminDto.email);
    if (existingAdmin) {
      throw new ConflictException('Admin with this email already exists');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createAdminDto.contraseña,
      saltRounds,
    );

    const admin = this.adminRepository.create({
      nombre: createAdminDto.nombre,
      email: createAdminDto.email,
      contraseñaHash: hashedPassword,
    });

    const savedAdmin = await this.adminRepository.save(admin);
    console.log('Admin guardado en base de datos:', savedAdmin.id);
    return savedAdmin;
  }

  async findByEmail(email: string): Promise<Admin | undefined> {
    const admin = await this.adminRepository.findOne({
      where: { email },
    });
    return admin ?? undefined;
  }

  async findById(id: string): Promise<Admin | undefined> {
    const admin = await this.adminRepository.findOne({
      where: { id },
    });
    return admin ?? undefined;
  }

  async findAll(): Promise<Admin[]> {
    return await this.adminRepository.find();
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
