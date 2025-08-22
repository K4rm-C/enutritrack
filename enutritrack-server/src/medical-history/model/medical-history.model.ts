// src/medical-history/entities/medical-history.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/models/user.model';

@Entity('historial_medico')
export class MedicalHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.medicalHistories)
  usuario: User;

  @Column({ type: 'jsonb', nullable: true })
  condiciones: string[];

  @Column({ type: 'jsonb', nullable: true })
  alergias: string[];

  @Column({ type: 'jsonb', nullable: true })
  medicamentos: string[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
