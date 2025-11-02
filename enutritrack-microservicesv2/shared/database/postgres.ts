// shared/database/postgres.ts
import { DataSource } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";

// Importar todas las entidades
import { Cuenta } from "../entities/Cuenta";
import { PerfilDoctor } from "../entities/PerfilDoctor";
import { PerfilUsuario } from "../entities/PerfilUsuario";
import { PerfilAdmin } from "../entities/PerfilAdmin";
import { Especialidad } from "../entities/Especialidad";
import { Genero } from "../entities/Genero";
import { CondicionMedica } from "../entities/CondicionMedica";
import { Alergia } from "../entities/Alergia";
import { Medicamento } from "../entities/Medicamento";
import { HistorialPeso } from "../entities/HistorialPeso";
import { ObjetivoUsuario } from "../entities/ObjetivoUsuario";
import { CitaMedica } from "../entities/CitaMedica";
import { CitaSignosVitales } from "../entities/CitaSignosVitales";
import { CitaDocumento } from "../entities/CitaDocumento";
import { TipoConsulta } from "../entities/TipoConsulta";
import { EstadoCita } from "../entities/EstadoCita";
import { Alerta } from "../entities/Alerta";
import { AlertaAccion } from "../entities/AlertaAccion";
import { TipoAlerta } from "../entities/TipoAlerta";
import { CategoriaAlerta } from "../entities/CategoriaAlerta";
import { NivelPrioridadAlerta } from "../entities/NivelPrioridadAlerta";
import { EstadoAlerta } from "../entities/EstadoAlerta";
import { ConfiguracionAlertaAutomatica } from "../entities/ConfiguracionAlertaAutomatica";
import { Alimento } from "../entities/Alimento";
import { RegistroComida } from "../entities/RegistroComida";
import { RegistroComidaItem } from "../entities/RegistroComidaItem";
import { ActividadFisica } from "../entities/ActividadFisica";
import { TipoActividad } from "../entities/TipoActividad";
import { Recomendacion } from "../entities/Recomendacion";
import { RecomendacionDato } from "../entities/RecomendacionDato";
import { TipoRecomendacion } from "../entities/TipoRecomendacion";

// Configuración de PostgreSQL
const postgresConfig = {
  host: "localhost",
  port: 5433,
  username: "postgres",
  password: "1234",
  database: "enutritrack",
};

// Crear DataSource de TypeORM
export const AppDataSource = new DataSource({
  type: "postgres",
  ...postgresConfig,
  synchronize: false,
  logging: true,
  entities: [
    Cuenta,
    PerfilDoctor,
    PerfilUsuario,
    PerfilAdmin,
    Especialidad,
    Genero,
    CondicionMedica,
    Alergia,
    Medicamento,
    HistorialPeso,
    ObjetivoUsuario,
    CitaMedica,
    CitaSignosVitales,
    CitaDocumento,
    TipoConsulta,
    EstadoCita,
    Alerta,
    AlertaAccion,
    TipoAlerta,
    CategoriaAlerta,
    NivelPrioridadAlerta,
    EstadoAlerta,
    ConfiguracionAlertaAutomatica,
    Alimento,
    RegistroComida,
    RegistroComidaItem,
    ActividadFisica,
    TipoActividad,
    Recomendacion,
    RecomendacionDato,
    TipoRecomendacion,
  ],
  namingStrategy: new SnakeNamingStrategy(),
  extra: {
    max: 20,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
  },
});

// Inicializar conexión
export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log("✅ Conectado a PostgreSQL");
  } catch (error) {
    console.error("❌ Error conectando a PostgreSQL:", error);
    throw error;
  }
};
