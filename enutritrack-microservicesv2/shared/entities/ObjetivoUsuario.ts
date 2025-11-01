// shared/entities/ObjetivoUsuario.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PerfilUsuario } from './PerfilUsuario';

export type NivelActividadEnum = 'sedentario' | 'ligero' | 'moderado' | 'activo' | 'muy_activo';

@Entity('objetivo_usuario')
export class ObjetivoUsuario {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'usuario_id' })
  usuarioId!: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'peso_objetivo' })
  pesoObjetivo?: number;

  @Column({ 
    type: 'enum', 
    enum: ['sedentario', 'ligero', 'moderado', 'activo', 'muy_activo'],
    name: 'nivel_actividad'
  })
  nivelActividad!: NivelActividadEnum;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'fecha_establecido' })
  fechaEstablecido!: Date;

  @Column({ type: 'boolean', default: true })
  vigente!: boolean;

  // Relaciones
  @ManyToOne(() => PerfilUsuario, usuario => usuario.objetivos)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: PerfilUsuario;
}