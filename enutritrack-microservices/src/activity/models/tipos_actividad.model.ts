import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('tipos_actividad')
export class ActivityType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'decimal', precision: 4, scale: 2, name: 'met_value' })
  met_value: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  categoria: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
