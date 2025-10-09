// src/doctor/models/doctor.model.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/models/user.model';
import { Admin } from '../../admin/models/admin.model';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, name: 'contraseña_hash' })
  contraseñaHash: string;

  @ManyToOne(() => Admin, (a) => a.admins)
  @JoinColumn({ name: 'admin_id' })
  admin: Admin;

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

  @OneToMany(() => User, (user) => user.doctor)
  patients: User[];
}
