import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PerfilUsuario } from '../../users/models/user.model';

@Entity('historial_peso')
export class HistorialPeso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  usuario_id: string;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  peso: number;

  @Column({ type: 'timestamp', default: () => 'now()' })
  fecha_registro: Date;

  @Column({ type: 'text', nullable: true })
  notas: string;

  @ManyToOne(() => PerfilUsuario, (usuario) => usuario.id)
  @JoinColumn({ name: 'usuario_id' })
  usuario: PerfilUsuario;
}
