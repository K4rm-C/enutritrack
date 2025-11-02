import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('tipos_recomendacion')
export class TipoRecomendacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  categoria: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  // Relación OneToMany eliminada porque Recomendacion usa 'tipo' como string
  // en lugar de una FK a tipos_recomendacion.id
  // Si se necesita la relación, se debe agregar una FK en la BD primero
}
