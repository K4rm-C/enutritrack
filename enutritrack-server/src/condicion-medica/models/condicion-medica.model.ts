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

@Entity('condiciones_medicas')
export class CondicionMedica {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  usuario_id: string;

  @Column({ type: 'varchar', length: 200 })
  nombre: string;

  @Column({
    type: 'enum',
    enum: SeveridadEnum,
    enumName: 'condicion_medica_severidad_enum',
    nullable: true,
  })
  severidad: SeveridadEnum;

  @Column({ type: 'date', nullable: true })
  fecha_diagnostico: Date;

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
