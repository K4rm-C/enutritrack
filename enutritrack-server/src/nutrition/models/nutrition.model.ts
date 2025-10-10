import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { PerfilUsuario } from '../../users/models/user.model';
import { TipoComidaEnum } from '../../shared/enum';
import { RegistroComidaItem } from '../../registro-comida-item/models/registro-comida-item.model';

@Entity('registro_comida')
export class RegistroComida {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  usuario_id: string;

  @Column({ type: 'timestamp', default: () => 'now()' })
  fecha: Date;

  @Column({
    type: 'enum',
    enum: TipoComidaEnum,
    enumName: 'tipo_comida_enum',
  })
  tipo_comida: TipoComidaEnum;

  @Column({ type: 'text', nullable: true })
  notas: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @ManyToOne(() => PerfilUsuario, (usuario) => usuario.id)
  @JoinColumn({ name: 'usuario_id' })
  usuario: PerfilUsuario;

  @OneToMany(
    () => RegistroComidaItem,
    (registroComidaItem) => registroComidaItem.registroComida,
  )
  items: RegistroComidaItem[];
}
