// src/nutrition/entities/food-record.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/models/user.model';
import { TipoComidaEnum } from '../../shared/enums';

@Entity('registro_comida')
export class FoodRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.foodRecords)
  usuario: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  @Column({ 
    type: 'enum', 
    enum: TipoComidaEnum,
    enumName: 'registro_comida_tipo_enum'
  })
  tipo_comida: TipoComidaEnum;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  calorias: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'proteinas_g' })
  proteinas: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'carbohidratos_g' })
  carbohidratos: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'grasas_g' })
  grasas: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
