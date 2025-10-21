import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { CategoriaAlerta } from '../../categorias-alerta/models/categorias-alerta.model';

@Entity('tipos_alerta')
export class TipoAlerta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'uuid' })
  categoria_id: string;

  @Column({ type: 'boolean', default: false })
  es_automatica: boolean;

  @Column({ type: 'jsonb', nullable: true })
  config_validacion: any;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @ManyToOne(() => CategoriaAlerta)
  @JoinColumn({ name: 'categoria_id' })
  categoria: CategoriaAlerta;
}
