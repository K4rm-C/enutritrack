import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { PerfilUsuario } from '../../users/models/user.model';
import { TipoRecomendacion } from '../../tipo-recomendacion/models/tipo-recomendacion.model';
import { RecomendacionDato } from '../../recomendacion-dato/models/recomendacion-dato.model';
import { CitaMedica } from '../../citas-medicas/models/citas-medicas.model';
import { Alerta } from '../../alertas/models/alertas.model';

@Entity('recomendacion')
export class Recomendacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  usuario_id: string;

  @Column({ type: 'uuid' })
  tipo_recomendacion_id: string;

  @Column({ type: 'text' })
  contenido: string;

  @Column({ type: 'timestamp', default: () => 'now()' })
  fecha_generacion: Date;

  @Column({ type: 'timestamp', nullable: true })
  vigencia_hasta: Date;

  @Column({ type: 'boolean', default: true })
  activa: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true })
  prioridad: string;

  @Column({ type: 'uuid', nullable: true })
  cita_medica_id: string;

  @Column({ type: 'uuid', nullable: true })
  alerta_generadora_id: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @ManyToOne(() => PerfilUsuario, (usuario) => usuario.id)
  @JoinColumn({ name: 'usuario_id' })
  usuario: PerfilUsuario;

  @ManyToOne(
    () => TipoRecomendacion,
    (tipoRecomendacion) => tipoRecomendacion.id,
  )
  @JoinColumn({ name: 'tipo_recomendacion_id' })
  tipoRecomendacion: TipoRecomendacion;

  @OneToMany(
    () => RecomendacionDato,
    (recomendacionDato) => recomendacionDato.recomendacion,
  )
  datos: RecomendacionDato[];

  @ManyToOne(() => CitaMedica)
  @JoinColumn({ name: 'cita_medica_id' })
  cita_medica: CitaMedica;

  @ManyToOne(() => Alerta)
  @JoinColumn({ name: 'alerta_generadora_id' })
  alerta_generadora: Alerta;
}
