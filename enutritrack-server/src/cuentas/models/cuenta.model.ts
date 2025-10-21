import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { TipoCuentaEnum } from '../../shared/enum';

@Entity('cuentas')
export class Cuenta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'email_1' })
  email_1: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'email_2' })
  email_2: string;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  password_hash: string;

  @Column({
    type: 'enum',
    enum: TipoCuentaEnum,
    enumName: 'tipo_cuenta_enum',
  })
  tipo_cuenta: TipoCuentaEnum;

  @Column({ type: 'boolean', default: true })
  activa: boolean;

  @Column({ type: 'timestamp', nullable: true })
  ultimo_acceso: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
