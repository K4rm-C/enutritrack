// src/nutrition/entities/food.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('alimentos')
export class Food {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
    name: 'calorias_por_100g',
  })
  calorias_por_100g: number;

  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
    name: 'proteinas_g_por_100g',
  })
  proteinas_g_por_100g: number;

  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
    name: 'carbohidratos_g_por_100g',
  })
  carbohidratos_g_por_100g: number;

  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
    name: 'grasas_g_por_100g',
  })
  grasas_g_por_100g: number;

  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
    name: 'fibra_g_por_100g',
    nullable: true,
  })
  fibra_g_por_100g: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  categoria: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
