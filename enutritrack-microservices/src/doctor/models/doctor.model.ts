// src/doctor/models/doctor.model.ts
// Modelo que usa las tablas normalizadas del backend
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/models/user.model';
import { Cuenta } from '../../shared/models/cuenta.model';
import { Especialidad } from '../../shared/models/especialidad.model';

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

  @Column({ type: 'uuid', nullable: true })
  especialidad_id: string;

  @Column({ type: 'varchar', length: 50, nullable: true, unique: true })
  cedula_profesional: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono_1: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono_2: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @OneToOne(() => Cuenta)
  @JoinColumn({ name: 'cuenta_id' })
  cuenta: Cuenta;

  @ManyToOne(() => Especialidad, (especialidad) => especialidad.doctores)
  @JoinColumn({ name: 'especialidad_id' })
  especialidad: Especialidad;

  @OneToMany(() => User, (user) => user.doctor)
  pacientes: User[];
}
