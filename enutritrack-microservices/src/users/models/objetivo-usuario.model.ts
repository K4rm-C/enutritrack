// src/users/models/objetivo-usuario.model.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.model';
import { ActivityLevel } from './user.model';

@Entity('objetivo_usuario')
export class ObjetivoUsuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  usuario_id: string;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  peso_objetivo: number;

  @Column({
    type: 'enum',
    enum: ActivityLevel,
    enumName: 'nivel_actividad_enum',
  })
  nivel_actividad: ActivityLevel;

  @Column({ type: 'integer', nullable: true })
  calorias_objetivo: number;

  @Column({ type: 'timestamp', default: () => 'now()' })
  fecha_establecido: Date;

  @Column({ type: 'boolean', default: true })
  vigente: boolean;

  @ManyToOne(() => User, (usuario) => usuario.objetivos)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;
}

