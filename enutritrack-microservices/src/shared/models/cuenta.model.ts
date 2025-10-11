// src/shared/models/cuenta.model.ts
// Modelo centralizado para la entidad Cuenta
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('cuentas')
export class Cuenta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  password_hash: string;

  @Column({ type: 'varchar', length: 50 })
  tipo_cuenta: string;

  @Column({ type: 'boolean', default: true, nullable: true })
  activa?: boolean;

  @Column({ type: 'timestamp', nullable: true })
  ultimo_acceso?: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}

