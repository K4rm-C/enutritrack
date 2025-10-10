import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { RegistroComidaItem } from '../../registro-comida-item/models/registro-comida-item.model';

@Entity('alimentos')
export class Alimento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200, unique: true })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'numeric', precision: 8, scale: 2 })
  calorias_por_100g: number;

  @Column({ type: 'numeric', precision: 8, scale: 2 })
  proteinas_g_por_100g: number;

  @Column({ type: 'numeric', precision: 8, scale: 2 })
  carbohidratos_g_por_100g: number;

  @Column({ type: 'numeric', precision: 8, scale: 2 })
  grasas_g_por_100g: number;

  @Column({ type: 'numeric', precision: 8, scale: 2, nullable: true })
  fibra_g_por_100g: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  categoria: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @OneToMany(
    () => RegistroComidaItem,
    (registroComidaItem) => registroComidaItem.alimento,
  )
  registroComidaItems: RegistroComidaItem[];
}
