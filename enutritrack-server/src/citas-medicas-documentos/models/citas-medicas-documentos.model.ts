import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CitaMedica } from '../../citas-medicas/models/citas-medicas.model';

@Entity('citas_medicas_documentos')
export class CitaMedicaDocumentos {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  cita_medica_id: string;

  @Column({ type: 'varchar', length: 255 })
  nombre_archivo: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  tipo_documento: string;

  @Column({ type: 'varchar', length: 500 })
  ruta_archivo: string;

  @Column({ type: 'bigint', nullable: true })
  tamano_bytes: number;

  @Column({ type: 'text', nullable: true })
  notas: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @ManyToOne(() => CitaMedica)
  @JoinColumn({ name: 'cita_medica_id' })
  cita_medica: CitaMedica;
}
