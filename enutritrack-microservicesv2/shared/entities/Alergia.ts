// shared/entities/Alergia.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { PerfilUsuario } from "./PerfilUsuario";

export type AlergiaSeveridadEnum = "leve" | "moderada" | "grave" | "severa";

@Entity("alergias")
export class Alergia {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", name: "usuario_id" })
  usuarioId!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  tipo?: string;

  @Column({ type: "varchar", length: 200 })
  nombre!: string;

  @Column({
    type: "enum",
    enum: ["leve", "moderada", "grave", "severa"],
  })
  severidad!: AlergiaSeveridadEnum;

  @Column({ type: "text", nullable: true })
  reaccion?: string;

  @Column({ type: "text", nullable: true })
  notas?: string;

  @Column({ type: "boolean", default: true })
  activa!: boolean;

  @CreateDateColumn({ type: "timestamp", name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp", name: "updated_at" })
  updatedAt!: Date;

  // Relaciones
  @ManyToOne(() => PerfilUsuario, (usuario) => usuario.alergias)
  @JoinColumn({ name: "usuario_id" })
  usuario!: PerfilUsuario;
}
