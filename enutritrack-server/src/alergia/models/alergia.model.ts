import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PerfilUsuario } from '../../users/models/user.model';
import { SeveridadEnum } from '../../shared/enum';

@Entity('alergias')
export class Alergia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  usuario_id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  tipo: string;

  @Column({ type: 'varchar', length: 200 })
  nombre: string;

  @Column({
    type: 'enum',
    enum: SeveridadEnum,
    enumName: 'severidad_enum',
  })
  severidad: SeveridadEnum;

  @Column({ type: 'text', nullable: true })
  reaccion: string;

  @Column({ type: 'text', nullable: true })
  notas: string;

  @Column({ type: 'boolean', default: true })
  activa: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @ManyToOne(() => PerfilUsuario, (usuario) => usuario.id)
  @JoinColumn({ name: 'usuario_id' })
  usuario: PerfilUsuario;
}
