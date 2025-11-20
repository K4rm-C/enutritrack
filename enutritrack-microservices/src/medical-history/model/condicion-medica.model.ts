// src/condiciones-medicas/entities/condicion-medica.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/models/user.model';

@Entity('condiciones_medicas')
export class CondicionMedica {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column({ name: 'usuario_id' })
  usuarioId: string;

  @Column()
  nombre: string;

  @Column({
    type: 'enum',
    enum: ['leve', 'moderada', 'severa'],
    nullable: true,
  })
  severidad: string;

  @Column({ type: 'date', nullable: true })
  fecha_diagnostico: Date;

  @Column({ type: 'text', nullable: true })
  notas: string;

  @Column({ default: true })
  activa: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
