import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Cuenta } from '../../cuentas/models/cuenta.model';
import { PerfilAdmin } from '../../admin/models/admin.model';
import { PerfilUsuario } from '../../users/models/user.model';

@Entity('perfil_doctor')
export class PerfilDoctor {
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

  @ManyToOne(() => PerfilAdmin)
  @JoinColumn({ name: 'admin_id' })
  admin: PerfilAdmin;

  @OneToMany(() => PerfilUsuario, (perfilUsuario) => perfilUsuario.doctor)
  pacientes: PerfilUsuario[];
}
