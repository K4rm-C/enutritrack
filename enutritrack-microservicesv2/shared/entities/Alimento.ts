// shared/entities/Alimento.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { RegistroComidaItem } from './RegistroComidaItem';

@Entity('alimentos')
export class Alimento {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  nombre!: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'calorias_por_100g' })
  caloriasPor100g!: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'proteinas_g_por_100g' })
  proteinasGPor100g!: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'carbohidratos_g_por_100g' })
  carbohidratosGPor100g!: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'grasas_g_por_100g' })
  grasasGPor100g!: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true, name: 'fibra_g_por_100g' })
  fibraGPor100g?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  categoria?: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  // Relaciones
  @OneToMany(() => RegistroComidaItem, item => item.alimento)
  registroComidaItems?: RegistroComidaItem[];
}