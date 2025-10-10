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
