import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('niveles_prioridad_alerta')
export class NivelPrioridadAlerta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'integer', unique: true })
  nivel_numerico: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
