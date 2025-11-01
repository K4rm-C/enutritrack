// shared/entities/Especialidad.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { PerfilDoctor } from './PerfilDoctor';

@Entity('especialidades')
export class Especialidad {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  // Relaciones
  @OneToMany(() => PerfilDoctor, doctor => doctor.especialidad)
  doctores?: PerfilDoctor[];
}