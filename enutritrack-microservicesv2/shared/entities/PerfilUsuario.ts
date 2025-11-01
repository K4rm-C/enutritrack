// shared/entities/PerfilUsuario.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { Cuenta } from './Cuenta';
import { Genero } from './Genero';
import { PerfilDoctor } from './PerfilDoctor';
import { CitaMedica } from './CitaMedica';
import { Alergia } from './Alergia';
import { CondicionMedica } from './CondicionMedica';
import { Medicamento } from './Medicamento';
import { HistorialPeso } from './HistorialPeso';
import { ObjetivoUsuario } from './ObjetivoUsuario';
import { RegistroComida } from './RegistroComida';
import { ActividadFisica } from './ActividadFisica';
import { Alerta } from './Alerta';
import { Recomendacion } from './Recomendacion';

@Entity('perfil_usuario')
export class PerfilUsuario {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'cuenta_id' })
  cuentaId!: string;

  @Column({ type: 'uuid', nullable: true, name: 'doctor_id' })
  doctorId?: string;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'date', name: 'fecha_nacimiento' })
  fechaNacimiento!: Date;

  @Column({ type: 'uuid', name: 'genero_id' })
  generoId!: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  altura!: number;

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
  @OneToOne(() => Cuenta, cuenta => cuenta.perfilUsuario)
  @JoinColumn({ name: 'cuenta_id' })
  cuenta!: Cuenta;

  @ManyToOne(() => Genero, genero => genero.usuarios)
  @JoinColumn({ name: 'genero_id' })
  genero!: Genero;

  @ManyToOne(() => PerfilDoctor, doctor => doctor.pacientes)
  @JoinColumn({ name: 'doctor_id' })
  doctor?: PerfilDoctor;

  @OneToMany(() => CitaMedica, cita => cita.usuario)
  citas?: CitaMedica[];

  @OneToMany(() => Alergia, alergia => alergia.usuario)
  alergias?: Alergia[];

  @OneToMany(() => CondicionMedica, condicion => condicion.usuario)
  condicionesMedicas?: CondicionMedica[];

  @OneToMany(() => Medicamento, medicamento => medicamento.usuario)
  medicamentos?: Medicamento[];

  @OneToMany(() => HistorialPeso, historial => historial.usuario)
  historialPeso?: HistorialPeso[];

  @OneToMany(() => ObjetivoUsuario, objetivo => objetivo.usuario)
  objetivos?: ObjetivoUsuario[];

  @OneToMany(() => RegistroComida, registro => registro.usuario)
  registrosComida?: RegistroComida[];

  @OneToMany(() => ActividadFisica, actividad => actividad.usuario)
  actividadesFisicas?: ActividadFisica[];

  @OneToMany(() => Alerta, alerta => alerta.usuario)
  alertas?: Alerta[];

  @OneToMany(() => Recomendacion, recomendacion => recomendacion.usuario)
  recomendaciones?: Recomendacion[];
}