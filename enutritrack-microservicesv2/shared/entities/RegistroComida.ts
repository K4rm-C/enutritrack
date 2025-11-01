// shared/entities/RegistroComida.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { PerfilUsuario } from './PerfilUsuario';
import { RegistroComidaItem } from './RegistroComidaItem';

export type RegistroComidaTipoEnum = 'desayuno' | 'almuerzo' | 'cena' | 'merienda';

@Entity('registro_comida')
export class RegistroComida {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'usuario_id' })
  usuarioId!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha!: Date;

  @Column({ 
    type: 'enum', 
    enum: ['desayuno', 'almuerzo', 'cena', 'merienda'],
    name: 'tipo_comida'
  })
  tipoComida!: RegistroComidaTipoEnum;

  @Column({ type: 'text', nullable: true })
  notas?: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  // Relaciones
  @ManyToOne(() => PerfilUsuario, usuario => usuario.registrosComida)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: PerfilUsuario;

  @OneToMany(() => RegistroComidaItem, item => item.registroComida)
  items?: RegistroComidaItem[];
}