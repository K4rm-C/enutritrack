// src/alergias/entities/alergia.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/models/user.model';

@Entity('alergias')
export class Alergia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column({ name: 'usuario_id' })
  usuarioId: string;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  tipo: string;

  @Column({ type: 'enum', enum: ['leve', 'moderada', 'severa'] })
  severidad: string;

  @Column({ type: 'text', nullable: true })
  reaccion: string;

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
