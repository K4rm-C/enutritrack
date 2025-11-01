// shared/entities/CitaMedica.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { PerfilUsuario } from './PerfilUsuario';
import { PerfilDoctor } from './PerfilDoctor';
import { TipoConsulta } from './TipoConsulta';
import { EstadoCita } from './EstadoCita';
import { CitaSignosVitales } from './CitaSignosVitales';
import { CitaDocumento } from './CitaDocumento';
import { Recomendacion } from './Recomendacion';

@Entity('citas_medicas')
export class CitaMedica {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'usuario_id' })
  usuarioId!: string;

  @Column({ type: 'uuid', name: 'doctor_id' })
  doctorId!: string;

  @Column({ type: 'uuid', name: 'tipo_consulta_id' })
  tipoConsultaId!: string;

  @Column({ type: 'uuid', name: 'estado_cita_id' })
  estadoCitaId!: string;

  @Column({ type: 'timestamp', name: 'fecha_hora_programada' })
  fechaHoraProgramada!: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'fecha_hora_inicio' })
  fechaHoraInicio?: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'fecha_hora_fin' })
  fechaHoraFin?: Date;

  @Column({ type: 'text', nullable: true })
  motivo?: string;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @Column({ type: 'text', nullable: true })
  diagnostico?: string;

  @Column({ type: 'text', nullable: true, name: 'tratamiento_recomendado' })
  tratamientoRecomendado?: string;

  @Column({ type: 'date', nullable: true, name: 'proxima_cita_sugerida' })
  proximaCitaSugerida?: Date;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  // Relaciones
  @ManyToOne(() => PerfilUsuario, usuario => usuario.citas)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: PerfilUsuario;

  @ManyToOne(() => PerfilDoctor, doctor => doctor.citas)
  @JoinColumn({ name: 'doctor_id' })
  doctor!: PerfilDoctor;

  @ManyToOne(() => TipoConsulta, tipoConsulta => tipoConsulta.citas)
  @JoinColumn({ name: 'tipo_consulta_id' })
  tipoConsulta!: TipoConsulta;

  @ManyToOne(() => EstadoCita, estadoCita => estadoCita.citas)
  @JoinColumn({ name: 'estado_cita_id' })
  estadoCita!: EstadoCita;

  @OneToMany(() => CitaSignosVitales, signosVitales => signosVitales.citaMedica)
  signosVitales?: CitaSignosVitales[];

  @OneToMany(() => CitaDocumento, documento => documento.citaMedica)
  documentos?: CitaDocumento[];

  @OneToMany(() => Recomendacion, recomendacion => recomendacion.citaMedica)
  recomendaciones?: Recomendacion[];
}