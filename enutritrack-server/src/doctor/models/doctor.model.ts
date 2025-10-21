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
import { Especialidad } from '../../especialidad/models/especialidad.model';

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

  @ManyToOne(() => PerfilAdmin)
  @JoinColumn({ name: 'admin_id' })
  admin: PerfilAdmin;

  @OneToMany(() => PerfilUsuario, (perfilUsuario) => perfilUsuario.doctor)
  pacientes: PerfilUsuario[];

  @ManyToOne(() => Especialidad, (especialidad) => especialidad.doctores)
  @JoinColumn({ name: 'especialidad_id' })
  especialidad: Especialidad;
}
