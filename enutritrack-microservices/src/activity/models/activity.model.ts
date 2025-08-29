// src/physical-activity/entities/physical-activity.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/models/user.model';

@Entity('actividad_fisica')
export class PhysicalActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.nivelActividad)
  usuario: User;

  @Column({ type: 'varchar', length: 100 })
  tipo_actividad: string;

  @Column({ type: 'int', name: 'duracion_min' })
  duracion: number;

  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
    name: 'calorias_quemadas',
  })
  caloriasQuemadas: number;

  @Column({ type: 'timestamp' })
  fecha: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
