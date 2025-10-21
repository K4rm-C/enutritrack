import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CitaMedica } from './models/citas-medicas.model';
import { CitaMedicaVitales } from '../citas-medicas-vitales/models/citas-medicas-vitales.model';
import { CitaMedicaDocumentos } from '../citas-medicas-documentos/models/citas-medicas-documentos.model';
import { CreateCitaMedicaDto } from './dto/create-citas-medicas.dto';
import { UpdateCitaMedicaDto } from './dto/update-citas-medicas.dto';

@Injectable()
export class CitasMedicasService {
  constructor(
    @InjectRepository(CitaMedica)
    private citaMedicaRepository: Repository<CitaMedica>,
    @InjectRepository(CitaMedicaVitales)
    private citaMedicaVitalesRepository: Repository<CitaMedicaVitales>,
    @InjectRepository(CitaMedicaDocumentos)
    private citaMedicaDocumentosRepository: Repository<CitaMedicaDocumentos>,
  ) {}

  async create(createCitaMedicaDto: CreateCitaMedicaDto): Promise<CitaMedica> {
    const { vitales, ...citaData } = createCitaMedicaDto;
    
    const citaMedica = this.citaMedicaRepository.create(citaData);
    const savedCita = await this.citaMedicaRepository.save(citaMedica);

    // Crear vitales si se proporcionaron
    if (vitales) {
      const citaVitales = this.citaMedicaVitalesRepository.create({
        ...vitales,
        cita_medica_id: savedCita.id,
      });
      await this.citaMedicaVitalesRepository.save(citaVitales);
    }

    const result = await this.findOne(savedCita.id);
    if (!result) {
      throw new Error(`No se pudo encontrar la cita médica recién creada con ID: ${savedCita.id}`);
    }
    return result;
  }

  async findAll(): Promise<CitaMedica[]> {
    return await this.citaMedicaRepository.find({
      relations: ['usuario', 'doctor', 'tipo_consulta', 'estado_cita'],
      order: { fecha_hora_programada: 'DESC' }
    });
  }

  async findByUser(userId: string): Promise<CitaMedica[]> {
    return await this.citaMedicaRepository.find({
      where: { usuario_id: userId },
      relations: ['usuario', 'doctor', 'tipo_consulta', 'estado_cita'],
      order: { fecha_hora_programada: 'DESC' }
    });
  }

  async findByDoctor(doctorId: string): Promise<CitaMedica[]> {
    return await this.citaMedicaRepository.find({
      where: { doctor_id: doctorId },
      relations: ['usuario', 'doctor', 'tipo_consulta', 'estado_cita'],
      order: { fecha_hora_programada: 'DESC' }
    });
  }

  async findOne(id: string): Promise<CitaMedica | null> {
    const cita = await this.citaMedicaRepository.findOne({
      where: { id },
      relations: [
        'usuario', 
        'usuario.cuenta', 
        'doctor', 
        'tipo_consulta', 
        'estado_cita'
      ]
    });

    if (!cita) {
      return null;
    }

    // Buscar vitales y documentos relacionados
    const [vitales, documentos] = await Promise.all([
      this.citaMedicaVitalesRepository.findOne({
        where: { cita_medica_id: id },
        order: { created_at: 'DESC' }
      }),
      this.citaMedicaDocumentosRepository.find({
        where: { cita_medica_id: id }
      })
    ]);

    return {
      ...cita,
      vitales,
      documentos
    } as any;
  }

  async update(id: string, updateCitaMedicaDto: UpdateCitaMedicaDto): Promise<CitaMedica | null> {
    const { vitales, ...citaData } = updateCitaMedicaDto;
    
    const result = await this.citaMedicaRepository.update(id, citaData);
    if (result.affected === 0) {
      throw new NotFoundException('Cita médica no encontrada');
    }

    // Actualizar vitales si se proporcionaron
    if (vitales) {
      const existingVitales = await this.citaMedicaVitalesRepository.findOne({
        where: { cita_medica_id: id }
      });

      if (existingVitales) {
        await this.citaMedicaVitalesRepository.update(existingVitales.id, vitales);
      } else {
        const newVitales = this.citaMedicaVitalesRepository.create({
          ...vitales,
          cita_medica_id: id,
        });
        await this.citaMedicaVitalesRepository.save(newVitales);
      }
    }

    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    // Primero eliminar registros relacionados
    await this.citaMedicaVitalesRepository.delete({ cita_medica_id: id });
    await this.citaMedicaDocumentosRepository.delete({ cita_medica_id: id });
    
    // Luego eliminar la cita
    const result = await this.citaMedicaRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Cita médica no encontrada');
    }
  }
}
