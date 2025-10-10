import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Recomendacion } from './models/recommendation.model';
import { CreateRecomendacionDto } from './dto/create-recommendation.dto';
import { UpdateRecomendacionDto } from './dto/update-recommendation.dto';
import { RecomendacionDatosService } from '../recomendacion-dato/recomendacion-dato.service';

@Injectable()
export class RecomendacionService {
  constructor(
    @InjectRepository(Recomendacion)
    private readonly recomendacionRepository: Repository<Recomendacion>,
    private readonly recomendacionDatosService: RecomendacionDatosService,
  ) {}

  async create(
    createRecomendacionDto: CreateRecomendacionDto,
  ): Promise<Recomendacion> {
    const recomendacion = this.recomendacionRepository.create(
      createRecomendacionDto,
    );
    return await this.recomendacionRepository.save(recomendacion);
  }

  async findAll(): Promise<Recomendacion[]> {
    return await this.recomendacionRepository.find({
      relations: ['usuario', 'tipoRecomendacion', 'datos'],
      order: { fecha_generacion: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Recomendacion> {
    const recomendacion = await this.recomendacionRepository.findOne({
      where: { id },
      relations: ['usuario', 'tipoRecomendacion', 'datos'],
    });
    if (!recomendacion) {
      throw new NotFoundException('Recomendación no encontrada');
    }
    return recomendacion;
  }

  async findByUsuarioId(usuarioId: string): Promise<Recomendacion[]> {
    return await this.recomendacionRepository.find({
      where: { usuario_id: usuarioId },
      relations: ['usuario', 'tipoRecomendacion', 'datos'],
      order: { fecha_generacion: 'DESC' },
    });
  }

  async findByTipoRecomendacionId(
    tipoRecomendacionId: string,
  ): Promise<Recomendacion[]> {
    return await this.recomendacionRepository.find({
      where: { tipo_recomendacion_id: tipoRecomendacionId },
      relations: ['usuario', 'tipoRecomendacion', 'datos'],
    });
  }

  async findActivasByUsuarioId(usuarioId: string): Promise<Recomendacion[]> {
    const hoy = new Date();
    return await this.recomendacionRepository.find({
      where: {
        usuario_id: usuarioId,
        activa: true,
      },
      relations: ['usuario', 'tipoRecomendacion', 'datos'],
      order: { prioridad: 'DESC', fecha_generacion: 'DESC' },
    });
  }

  async findVigentes(): Promise<Recomendacion[]> {
    const hoy = new Date();
    return await this.recomendacionRepository
      .createQueryBuilder('recomendacion')
      .where('recomendacion.activa = :activa', { activa: true })
      .andWhere(
        '(recomendacion.vigencia_hasta IS NULL OR recomendacion.vigencia_hasta >= :hoy)',
        { hoy },
      )
      .leftJoinAndSelect('recomendacion.usuario', 'usuario')
      .leftJoinAndSelect('recomendacion.tipoRecomendacion', 'tipoRecomendacion')
      .leftJoinAndSelect('recomendacion.datos', 'datos')
      .orderBy('recomendacion.prioridad', 'DESC')
      .addOrderBy('recomendacion.fecha_generacion', 'DESC')
      .getMany();
  }

  async update(
    id: string,
    updateRecomendacionDto: UpdateRecomendacionDto,
  ): Promise<Recomendacion> {
    const recomendacion = await this.findOne(id);
    Object.assign(recomendacion, updateRecomendacionDto);
    return await this.recomendacionRepository.save(recomendacion);
  }

  async remove(id: string): Promise<void> {
    const recomendacion = await this.findOne(id);
    // Eliminar datos primero
    await this.recomendacionDatosService.removeByRecomendacionId(id);
    await this.recomendacionRepository.remove(recomendacion);
  }

  async desactivar(id: string): Promise<Recomendacion> {
    const recomendacion = await this.findOne(id);
    recomendacion.activa = false;
    return await this.recomendacionRepository.save(recomendacion);
  }

  async crearRecomendacionCompleta(
    createRecomendacionDto: CreateRecomendacionDto,
    datos: { clave: string; valor: string; tipo_dato?: string }[],
  ): Promise<Recomendacion> {
    const recomendacion = await this.create(createRecomendacionDto);

    if (datos && datos.length > 0) {
      const datosParaCrear = datos.map((dato) => ({
        ...dato,
        recomendacion_id: recomendacion.id,
      }));
      await this.recomendacionDatosService.createMultiple(datosParaCrear);
    }

    return await this.findOne(recomendacion.id);
  }
}
