import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';

@Entity('configuracion_alertas_automaticas')
export class AutomaticAlertConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'usuario_id' })
  usuario_id: string;

  @Column({ name: 'tipo_alerta_id' })
  tipo_alerta_id: string;

  @Column({ name: 'doctor_id', nullable: true })
  doctor_id: string;

  @Column({ type: 'boolean', default: true, name: 'esta_activa' })
  esta_activa: boolean;

  @Column({ type: 'jsonb', nullable: true, name: 'umbral_configuracion' })
  umbral_configuracion: any;

  @Column({ type: 'int', default: 24, name: 'frecuencia_verificacion_horas' })
  frecuencia_verificacion_horas: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
