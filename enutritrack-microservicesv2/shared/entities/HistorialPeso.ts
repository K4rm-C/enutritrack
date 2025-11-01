// shared/entities/HistorialPeso.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PerfilUsuario } from './PerfilUsuario';

@Entity('historial_peso')
export class HistorialPeso {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'usuario_id' })
  usuarioId!: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  peso!: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'fecha_registro' })
  fechaRegistro!: Date;

  @Column({ type: 'text', nullable: true })
  notas?: string;

  // Relaciones
  @ManyToOne(() => PerfilUsuario, usuario => usuario.historialPeso)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: PerfilUsuario;
}