// shared/entities/RegistroComidaItem.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { RegistroComida } from './RegistroComida';
import { Alimento } from './Alimento';

@Entity('registro_comida_items')
export class RegistroComidaItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'registro_comida_id' })
  registroComidaId!: string;

  @Column({ type: 'uuid', name: 'alimento_id' })
  alimentoId!: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'cantidad_gramos' })
  cantidadGramos!: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  calorias!: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'proteinas_g' })
  proteinasG!: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'carbohidratos_g' })
  carbohidratosG!: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'grasas_g' })
  grasasG!: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true, name: 'fibra_g' })
  fibraG?: number;

  @Column({ type: 'text', nullable: true })
  notas?: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  // Relaciones
  @ManyToOne(() => RegistroComida, registroComida => registroComida.items)
  @JoinColumn({ name: 'registro_comida_id' })
  registroComida!: RegistroComida;

  @ManyToOne(() => Alimento, alimento => alimento.registroComidaItems)
  @JoinColumn({ name: 'alimento_id' })
  alimento!: Alimento;
}