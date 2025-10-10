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
import { PerfilDoctor } from '../../doctor/models/doctor.model';
import { GeneroEnum } from '../../shared/enum';

@Entity('perfil_usuario')
export class PerfilUsuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  cuenta_id: string;

  @Column({ type: 'uuid', nullable: true })
  doctor_id: string;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'date' })
  fecha_nacimiento: Date;

  @Column({
    type: 'enum',
    enum: GeneroEnum,
    enumName: 'genero_enum',
  })
  genero: GeneroEnum;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  altura: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @OneToOne(() => Cuenta)
  @JoinColumn({ name: 'cuenta_id' })
  cuenta: Cuenta;

  @ManyToOne(() => PerfilDoctor, (doctor) => doctor.pacientes)
  @JoinColumn({ name: 'doctor_id' })
  doctor: PerfilDoctor;
}
