// src/nutrition/entities/food-record-item.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { FoodRecord } from './nutrition.model';
import { Food } from './alimentos.model';

@Entity('registro_comida_items')
export class FoodRecordItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => FoodRecord, (record) => record.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'registro_comida_id' })
  registro_comida: FoodRecord;

  @ManyToOne(() => Food)
  @JoinColumn({ name: 'alimento_id' })
  alimento: Food;

  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'cantidad_gramos' })
  cantidad_gramos: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  calorias: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'proteinas_g' })
  proteinas_g: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'carbohidratos_g' })
  carbohidratos_g: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'grasas_g' })
  grasas_g: number;

  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
    name: 'fibra_g',
    nullable: true,
  })
  fibra_g: number;

  @Column({ type: 'text', nullable: true })
  notas: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
