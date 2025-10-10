import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ActividadFisica } from '../../activity/models/activity.model';

@Entity('tipos_actividad')
export class TipoActividad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'numeric', precision: 4, scale: 2 })
  met_value: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  categoria: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @OneToMany(
    () => ActividadFisica,
    (actividadFisica) => actividadFisica.tipoActividad,
  )
  actividadesFisicas: ActividadFisica[];
}
