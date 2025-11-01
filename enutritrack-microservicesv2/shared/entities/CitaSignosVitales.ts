// shared/entities/CitaSignosVitales.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CitaMedica } from './CitaMedica';

@Entity('citas_medicas_vitales')
export class CitaSignosVitales {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'cita_medica_id' })
  citaMedicaId!: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  peso?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  altura?: number;

  @Column({ type: 'int', nullable: true, name: 'tension_arterial_sistolica' })
  tensionArterialSistolica?: number;

  @Column({ type: 'int', nullable: true, name: 'tension_arterial_diastolica' })
  tensionArterialDiastolica?: number;

  @Column({ type: 'int', nullable: true, name: 'frecuencia_cardiaca' })
  frecuenciaCardiaca?: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  temperatura?: number;

  @Column({ type: 'int', nullable: true, name: 'saturacion_oxigeno' })
  saturacionOxigeno?: number;

  @Column({ type: 'text', nullable: true })
  notas?: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  // Relaciones
  @ManyToOne(() => CitaMedica, citaMedica => citaMedica.signosVitales)
  @JoinColumn({ name: 'cita_medica_id' })
  citaMedica!: CitaMedica;
}