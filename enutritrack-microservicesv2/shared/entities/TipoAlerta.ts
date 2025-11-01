// shared/entities/TipoAlerta.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { CategoriaAlerta } from './CategoriaAlerta';
import { Alerta } from './Alerta';
import { ConfiguracionAlertaAutomatica } from './ConfiguracionAlertaAutomatica';

@Entity('tipos_alerta')
export class TipoAlerta {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ type: 'uuid', name: 'categoria_id' })
  categoriaId!: string;

  @Column({ type: 'boolean', default: false, name: 'es_automatica' })
  esAutomatica!: boolean;

  @Column({ type: 'jsonb', nullable: true, name: 'config_validacion' })
  configValidacion?: any;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  // Relaciones
  @ManyToOne(() => CategoriaAlerta, categoria => categoria.tiposAlerta)
  @JoinColumn({ name: 'categoria_id' })
  categoria!: CategoriaAlerta;

  @OneToMany(() => Alerta, alerta => alerta.tipoAlerta)
  alertas?: Alerta[];

  @OneToMany(() => ConfiguracionAlertaAutomatica, config => config.tipoAlerta)
  configuraciones?: ConfiguracionAlertaAutomatica[];
}