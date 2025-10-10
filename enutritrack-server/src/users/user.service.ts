import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerfilUsuario } from './models/user.model';
import { CreatePerfilUsuarioDto } from './dto/create-user.dto';
import { UpdatePerfilUsuarioDto } from './dto/update-user.dto';

@Injectable()
export class PerfilUsuarioService {
  constructor(
    @InjectRepository(PerfilUsuario)
    private readonly perfilUsuarioRepository: Repository<PerfilUsuario>,
  ) {}

  async create(
    createPerfilUsuarioDto: CreatePerfilUsuarioDto,
  ): Promise<PerfilUsuario> {
    const perfilUsuario = this.perfilUsuarioRepository.create(
      createPerfilUsuarioDto,
    );
    return await this.perfilUsuarioRepository.save(perfilUsuario);
  }

  async findAll(): Promise<PerfilUsuario[]> {
    return await this.perfilUsuarioRepository.find({
      relations: ['cuenta', 'doctor'],
    });
  }

  async findOne(id: string): Promise<PerfilUsuario> {
    const perfilUsuario = await this.perfilUsuarioRepository.findOne({
      where: { id },
      relations: ['cuenta', 'doctor'],
    });
    if (!perfilUsuario) {
      throw new NotFoundException('Perfil de usuario no encontrado');
    }
    return perfilUsuario;
  }

  async findByCuentaId(cuentaId: string): Promise<PerfilUsuario> {
    const perfilUsuario = await this.perfilUsuarioRepository.findOne({
      where: { cuenta_id: cuentaId },
      relations: ['cuenta', 'doctor'],
    });
    if (!perfilUsuario) {
      throw new NotFoundException('Perfil de usuario no encontrado');
    }
    return perfilUsuario;
  }

  async update(
    id: string,
    updatePerfilUsuarioDto: UpdatePerfilUsuarioDto,
  ): Promise<PerfilUsuario> {
    const perfilUsuario = await this.findOne(id);
    Object.assign(perfilUsuario, updatePerfilUsuarioDto);
    return await this.perfilUsuarioRepository.save(perfilUsuario);
  }

  async remove(id: string): Promise<void> {
    const perfilUsuario = await this.findOne(id);
    await this.perfilUsuarioRepository.remove(perfilUsuario);
  }

  async asignarDoctor(
    usuarioId: string,
    doctorId: string,
  ): Promise<PerfilUsuario> {
    const perfilUsuario = await this.findOne(usuarioId);
    perfilUsuario.doctor_id = doctorId;
    return await this.perfilUsuarioRepository.save(perfilUsuario);
  }

  async removerDoctor(usuarioId: string): Promise<PerfilUsuario> {
    const perfilUsuario = await this.findOne(usuarioId);
    perfilUsuario.doctor_id = '';
    return await this.perfilUsuarioRepository.save(perfilUsuario);
  }

  async findByDoctorId(doctorId: string): Promise<PerfilUsuario[]> {
    return await this.perfilUsuarioRepository.find({
      where: { doctor_id: doctorId },
      relations: ['cuenta', 'doctor'],
    });
  }
}
