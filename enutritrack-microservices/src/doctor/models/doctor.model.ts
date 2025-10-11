// src/doctor/models/doctor.model.ts
// Modelo que usa las tablas normalizadas del backend
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/models/user.model';
import { Cuenta } from '../../shared/models/cuenta.model';

// Modelo para el perfil del doctor
@Entity('perfil_doctor')
export class Doctor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  cuenta_id: string;

  @Column({ type: 'uuid', nullable: true })
  admin_id: string;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  especialidad: string;

  @Column({ type: 'varchar', length: 50, nullable: true, unique: true })
  cedula_profesional: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @OneToOne(() => Cuenta)
  @JoinColumn({ name: 'cuenta_id' })
  cuenta: Cuenta;

  @OneToMany(() => User, (user) => user.doctor)
  pacientes: User[];
}
