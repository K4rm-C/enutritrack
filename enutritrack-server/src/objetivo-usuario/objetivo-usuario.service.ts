import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObjetivoUsuario } from './models/objetivo-usuario.model';
import { CreateObjetivoUsuarioDto } from './dto/create-objetivo-usuario.dto';
import { UpdateObjetivoUsuarioDto } from './dto/update-objetivo-usuario.dto';

@Injectable()
export class ObjetivoUsuarioService {
  constructor(
    @InjectRepository(ObjetivoUsuario)
    private readonly objetivoUsuarioRepository: Repository<ObjetivoUsuario>,
  ) {}

  async create(
    createObjetivoUsuarioDto: CreateObjetivoUsuarioDto,
  ): Promise<ObjetivoUsuario> {
    const objetivoUsuario = this.objetivoUsuarioRepository.create(
      createObjetivoUsuarioDto,
    );
    return await this.objetivoUsuarioRepository.save(objetivoUsuario);
  }

  async findAll(): Promise<ObjetivoUsuario[]> {
    return await this.objetivoUsuarioRepository.find({
      relations: ['usuario'],
    });
  }

  async findOne(id: string): Promise<ObjetivoUsuario> {
    const objetivoUsuario = await this.objetivoUsuarioRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });
    if (!objetivoUsuario) {
      throw new NotFoundException('Objetivo de usuario no encontrado');
    }
    return objetivoUsuario;
  }

  async findByUsuarioId(usuarioId: string): Promise<ObjetivoUsuario[]> {
    return await this.objetivoUsuarioRepository.find({
      where: { usuario_id: usuarioId },
      relations: ['usuario'],
    });
  }

  async findVigenteByUsuarioId(usuarioId: string): Promise<ObjetivoUsuario> {
    const objetivo = await this.objetivoUsuarioRepository.findOne({
      where: { usuario_id: usuarioId, vigente: true },
      relations: ['usuario'],
    });
    if (!objetivo) {
      throw new NotFoundException(
        'No se encontró un objetivo vigente para el usuario',
      );
    }
    return objetivo;
  }

  async update(
    id: string,
    updateObjetivoUsuarioDto: UpdateObjetivoUsuarioDto,
  ): Promise<ObjetivoUsuario> {
    const objetivoUsuario = await this.findOne(id);
    Object.assign(objetivoUsuario, updateObjetivoUsuarioDto);
    return await this.objetivoUsuarioRepository.save(objetivoUsuario);
  }

  async remove(id: string): Promise<void> {
    const objetivoUsuario = await this.findOne(id);
    await this.objetivoUsuarioRepository.remove(objetivoUsuario);
  }

  async desactivarObjetivosAnteriores(usuarioId: string): Promise<void> {
    await this.objetivoUsuarioRepository.update(
      { usuario_id: usuarioId, vigente: true },
      { vigente: false },
    );
  }
}
