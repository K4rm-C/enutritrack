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

  @ManyToOne(() => PerfilUsuario, (usuario) => usuario.id)
  @JoinColumn({ name: 'usuario_id' })
  usuario: PerfilUsuario;

  @Column({ type: 'timestamp', default: () => 'now()' })
  fecha: Date;

  @Column({
    type: 'enum',
    enum: TipoComidaEnum,
    enumName: 'registro_comida_tipo_enum',
  })
  tipo_comida: TipoComidaEnum;

  @Column({ type: 'text', nullable: true, name: 'notas' })
  notas: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @OneToMany(
    () => RegistroComidaItem,
    (registroComidaItem) => registroComidaItem.registroComida,
  )
  items: RegistroComidaItem[];
}
