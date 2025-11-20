// src/nutrition/entities/food-record.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/models/user.model';
import { FoodRecordItem } from './registro-comida-item.model';

@Entity('registro_comida')
export class FoodRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  @Column({ type: 'varchar', length: 50 })
  tipo_comida: string;

  @Column({ type: 'text', nullable: true })
  notas: string;

  @OneToMany(() => FoodRecordItem, (item) => item.registro_comida, {
    cascade: true,
  })
  items: FoodRecordItem[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
