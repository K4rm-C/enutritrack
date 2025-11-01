// shared/entities/PerfilDoctor.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { Cuenta } from './Cuenta';
import { Especialidad } from './Especialidad';
import { PerfilUsuario } from './PerfilUsuario';
import { CitaMedica } from './CitaMedica';
import { Alerta } from './Alerta';
import { PerfilAdmin } from './PerfilAdmin';

@Entity('perfil_doctor')
export class PerfilDoctor {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'cuenta_id' })
  cuentaId!: string;

  @Column({ type: 'uuid', nullable: true, name: 'admin_id' })
  adminId?: string;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'uuid', nullable: true, name: 'especialidad_id' })
  especialidadId?: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'cedula_profesional' })
  cedulaProfesional?: string;

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
  @OneToOne(() => Cuenta, cuenta => cuenta.perfilDoctor)
  @JoinColumn({ name: 'cuenta_id' })
  cuenta!: Cuenta;

  @ManyToOne(() => Especialidad, especialidad => especialidad.doctores)
  @JoinColumn({ name: 'especialidad_id' })
  especialidad?: Especialidad;

  @ManyToOne(() => PerfilAdmin, admin => admin.doctores)
  @JoinColumn({ name: 'admin_id' })
  admin?: PerfilAdmin;

  @OneToMany(() => PerfilUsuario, usuario => usuario.doctor)
  pacientes?: PerfilUsuario[];

  @OneToMany(() => CitaMedica, cita => cita.doctor)
  citas?: CitaMedica[];

  @OneToMany(() => Alerta, alerta => alerta.doctor)
  alertas?: Alerta[];
}