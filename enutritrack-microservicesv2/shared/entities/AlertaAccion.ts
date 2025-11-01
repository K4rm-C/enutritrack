// shared/entities/AlertaAccion.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Alerta } from './Alerta';
import { PerfilDoctor } from './PerfilDoctor';

@Entity('alertas_acciones')
export class AlertaAccion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'alerta_id' })
  alertaId!: string;

  @Column({ type: 'uuid', name: 'doctor_id' })
  doctorId!: string;

  @Column({ type: 'varchar', length: 200, name: 'accion_tomada' })
  accionTomada!: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'fecha_accion' })
  fechaAccion!: Date;

  // Relaciones
  @ManyToOne(() => Alerta, alerta => alerta.acciones)
  @JoinColumn({ name: 'alerta_id' })
  alerta!: Alerta;

  @ManyToOne(() => PerfilDoctor, doctor => doctor.alertas)
  @JoinColumn({ name: 'doctor_id' })
  doctor!: PerfilDoctor;
}