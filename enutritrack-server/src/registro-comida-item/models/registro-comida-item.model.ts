import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RegistroComida } from '../../nutrition/models/nutrition.model';
import { Alimento } from '../../alimento/models/alimento.model';

@Entity('registro_comida_items')
export class RegistroComidaItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  registro_comida_id: string;

  @Column({ type: 'uuid' })
  alimento_id: string;

  @Column({ type: 'numeric', precision: 8, scale: 2 })
  cantidad_gramos: number;

  // Campos calculados - Snapshot de valores nutricionales al momento del registro
  // Esto previene cambios historicos si se actualizan los datos del alimento
  @Column({ type: 'numeric', precision: 8, scale: 2 })
  calorias: number;

  @Column({ type: 'numeric', precision: 8, scale: 2 })
  proteinas_g: number;

  @Column({ type: 'numeric', precision: 8, scale: 2 })
  carbohidratos_g: number;

  @Column({ type: 'numeric', precision: 8, scale: 2 })
  grasas_g: number;

  @Column({ type: 'numeric', precision: 8, scale: 2, nullable: true })
  fibra_g: number;

  @Column({ type: 'text', nullable: true })
  notas: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @ManyToOne(() => RegistroComida, (registroComida) => registroComida.items)
  @JoinColumn({ name: 'registro_comida_id' })
  registroComida: RegistroComida;

  @ManyToOne(() => Alimento, (alimento) => alimento.id)
  @JoinColumn({ name: 'alimento_id' })
  alimento: Alimento;
}
