import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PerfilUsuario } from '../../users/models/user.model';
import { NivelActividadEnum } from '../../shared/enum';

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
    enum: NivelActividadEnum,
    enumName: 'nivel_actividad_enum',
  })
  nivel_actividad: NivelActividadEnum;


  @Column({ type: 'timestamp', default: () => 'now()' })
  fecha_establecido: Date;

  @Column({ type: 'boolean', default: true })
  vigente: boolean;

  @ManyToOne(() => PerfilUsuario, (usuario) => usuario.id)
  @JoinColumn({ name: 'usuario_id' })
  usuario: PerfilUsuario;
}
