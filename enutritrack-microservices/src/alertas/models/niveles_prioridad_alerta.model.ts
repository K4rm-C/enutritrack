import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';

@Entity('niveles_prioridad_alerta')
export class AlertPriority {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'int', unique: true, name: 'nivel_numerico' })
  nivel_numerico: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
