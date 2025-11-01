// shared/entities/Cuenta.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { PerfilDoctor } from './PerfilDoctor';
import { PerfilUsuario } from './PerfilUsuario';
import { PerfilAdmin } from './PerfilAdmin';

export type TipoCuentaEnum = 'doctor' | 'patient' | 'admin';

@Entity('cuentas')
export class Cuenta {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'email_1' })
  email1?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'email_2' })
  email2?: string;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash!: string;

  @Column({ 
    type: 'enum', 
    enum: ['doctor', 'patient', 'admin'],
    name: 'tipo_cuenta'
  })
  tipoCuenta!: TipoCuentaEnum;

  @Column({ type: 'boolean', default: true })
  activa!: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'ultimo_acceso' })
  ultimoAcceso?: Date;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  // Relaciones
  @OneToOne(() => PerfilDoctor, perfilDoctor => perfilDoctor.cuenta)
  perfilDoctor?: PerfilDoctor;

  @OneToOne(() => PerfilUsuario, perfilUsuario => perfilUsuario.cuenta)
  perfilUsuario?: PerfilUsuario;

  @OneToOne(() => PerfilAdmin, perfilAdmin => perfilAdmin.cuenta)
  perfilAdmin?: PerfilAdmin;
}