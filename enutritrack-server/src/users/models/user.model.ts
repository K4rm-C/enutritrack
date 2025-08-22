// src/user/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { FoodRecord } from '../../nutrition/models/nutrition.model';
import { MedicalHistory } from '../../medical-history/model/medical-history.model';
import { PhysicalActivity } from '../../activity/models/activity.model';
import { Recommendation } from '../../recommendation/models/recommendation.model';

export enum Gender {
  MALE = 'M',
  FEMALE = 'F',
  OTHER = 'O',
}

export enum ActivityLevel {
  SEDENTARY = 'sedentario',
  MODERATE = 'moderado',
  ACTIVE = 'activo',
  VERY_ACTIVE = 'muy_activo',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, name: 'contraseña_hash' })
  contraseñaHash: string;

  @Column({ type: 'date', name: 'fecha_nacimiento' })
  fechaNacimiento: Date;

  @Column({ type: 'enum', enum: Gender })
  genero: Gender;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  altura: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'peso_actual' })
  pesoActual: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'objetivo_peso' })
  objetivoPeso: number;

  @Column({ type: 'enum', enum: ActivityLevel, name: 'nivel_actividad' })
  nivelActividad: ActivityLevel;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    name: 'updated_at',
  })
  updatedAt: Date;

  // Relaciones
  @OneToMany(() => FoodRecord, (foodRecord) => foodRecord.usuario)
  foodRecords: FoodRecord[];

  @OneToMany(() => MedicalHistory, (medicalHistory) => medicalHistory.usuario)
  medicalHistories: MedicalHistory[];

  @OneToMany(
    () => PhysicalActivity,
    (physicalActivity) => physicalActivity.usuario,
  )
  physicalActivities: PhysicalActivity[];

  @OneToMany(() => Recommendation, (recommendation) => recommendation.usuario)
  recommendations: Recommendation[];
}
