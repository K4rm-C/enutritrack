// shared/entities/CitaDocumento.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CitaMedica } from './CitaMedica';

@Entity('citas_medicas_documentos')
export class CitaDocumento {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'cita_medica_id' })
  citaMedicaId!: string;

  @Column({ type: 'varchar', length: 255, name: 'nombre_archivo' })
  nombreArchivo!: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'tipo_documento' })
  tipoDocumento?: string;

  @Column({ type: 'varchar', length: 500, name: 'ruta_archivo' })
  rutaArchivo!: string;

  @Column({ type: 'bigint', nullable: true, name: 'tamano_bytes' })
  tamanoBytes?: number;

  @Column({ type: 'text', nullable: true })
  notas?: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  // Relaciones
  @ManyToOne(() => CitaMedica, citaMedica => citaMedica.documentos)
  @JoinColumn({ name: 'cita_medica_id' })
  citaMedica!: CitaMedica;
}