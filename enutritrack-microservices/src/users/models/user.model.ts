// src/users/models/user.model.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FoodRecord } from '../../nutrition/models/nutrition.model';
import { MedicalHistory } from '../../medical-history/model/medical-history.model';
import { PhysicalActivity } from '../../activity/models/activity.model';
import { Recommendation } from '../../recommendation/models/recommendation.model';
import { Doctor } from '../../doctor/models/doctor.model';
import { Cuenta } from '../../shared/models/cuenta.model';

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

@Entity('perfil_usuario')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  cuenta_id: string;

  @Column({ type: 'uuid', nullable: true })
  doctor_id: string;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'date' })
  fecha_nacimiento: Date;

  @Column({ type: 'enum', enum: Gender })
  genero: Gender;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  altura: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  // Relacion con Cuenta
  @OneToOne(() => Cuenta)
  @JoinColumn({ name: 'cuenta_id' })
  cuenta: Cuenta;

  // Relacion con Doctor
  @ManyToOne(() => Doctor, (doctor) => doctor.pacientes, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'doctor_id' })
  doctor?: Doctor;

  // Relaciones con otras entidades
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

  // Nuevas relaciones para peso y objetivos
  @OneToMany(() => HistorialPeso, (historialPeso) => historialPeso.usuario)
  historialPeso: HistorialPeso[];

  @OneToMany(() => ObjetivoUsuario, (objetivo) => objetivo.usuario)
  objetivos: ObjetivoUsuario[];
}

// Importar las nuevas entidades al final del archivo
import { HistorialPeso } from './historial-peso.model';
import { ObjetivoUsuario } from './objetivo-usuario.model';
