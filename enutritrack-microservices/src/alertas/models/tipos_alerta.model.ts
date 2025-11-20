import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { AlertCategory } from './categorias_alerta.model';

@Entity('tipos_alerta')
export class AlertType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ name: 'categoria_id' })
  categoria_id: string;

  @ManyToOne(() => AlertCategory)
  @JoinColumn({ name: 'categoria_id' })
  categoria: AlertCategory;

  @Column({ type: 'boolean', default: false, name: 'es_automatica' })
  es_automatica: boolean;

  @Column({ type: 'jsonb', nullable: true, name: 'config_validacion' })
  config_validacion: any;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
