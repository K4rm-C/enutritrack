// shared/entities/PerfilAdmin.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { Cuenta } from './Cuenta';
import { PerfilDoctor } from './PerfilDoctor';

@Entity('perfil_admin')
export class PerfilAdmin {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'cuenta_id' })
  cuentaId!: string;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  departamento?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono?: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'telefono_1' })
  telefono1?: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'telefono_2' })
  telefono2?: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  // Relaciones
  @OneToOne(() => Cuenta, cuenta => cuenta.perfilAdmin)
  @JoinColumn({ name: 'cuenta_id' })
  cuenta!: Cuenta;

  @OneToMany(() => PerfilDoctor, doctor => doctor.admin)
  doctores?: PerfilDoctor[];
}