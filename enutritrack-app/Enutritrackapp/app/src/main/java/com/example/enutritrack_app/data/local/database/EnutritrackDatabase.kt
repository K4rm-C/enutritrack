package com.example.enutritrack_app.data.local.database

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase
import com.example.enutritrack_app.data.local.dao.*
import com.example.enutritrack_app.data.local.entities.*

/**
 * Base de datos Room principal para la aplicación
 * 
 * Version 10: Actualizada ActividadFisicaEntity con campos opcionales
 * - intensidad: String? (opcional)
 * - notas: String? (opcional)
 * - calorias_quemadas ahora puede ser calculado por el servidor si no se proporciona
 * 
 * Version 9: Agregadas entidades del módulo de Citas y Alertas
 * - CitaMedicaEntity, CitaMedicaVitalesEntity, CitaMedicaDocumentosEntity
 * - TipoConsultaEntity, EstadoCitaEntity
 * - AlertaEntity, TipoAlertaEntity, CategoriaAlertaEntity
 * - NivelPrioridadAlertaEntity, EstadoAlertaEntity
 * 
 * Version 8: Added TipoActividadEntity
 * Version 6: Agregadas entidades del módulo de Nutrición
 * - AlimentoEntity
 * - RegistroComidaEntity
 * - RegistroComidaItemEntity
 * - RecomendacionEntity
 * 
 * Version 5: Actualizada ProfileEntity con campos adicionales
 * - fecha_nacimiento, genero_id, genero_nombre
 * - doctor_email_1, doctor_email_2
 * 
 * Version 4: Agregada entidad ProfileEntity
 * Version 3: Agregada entidad AlergiaEntity
 * Version 2: Agregadas nuevas entidades
 * - UserEntity
 * - HistorialPesoEntity
 * - ObjetivoUsuarioEntity
 * - MedicalHistoryEntity
 * - MedicamentoEntity (solo lectura)
 * - AlergiaEntity
 * 
 * @property version Versión actual de la base de datos
 */
@Database(
    entities = [
        UserEntity::class,
        HistorialPesoEntity::class,
        ObjetivoUsuarioEntity::class,
        MedicalHistoryEntity::class,
        MedicamentoEntity::class,
        AlergiaEntity::class,
        ProfileEntity::class,
        AlimentoEntity::class,
        RegistroComidaEntity::class,
        RegistroComidaItemEntity::class,
        RecomendacionEntity::class,
        ActividadFisicaEntity::class,
        TipoActividadEntity::class,
        // Citas Médicas
        CitaMedicaEntity::class,
        CitaMedicaVitalesEntity::class,
        CitaMedicaDocumentosEntity::class,
        TipoConsultaEntity::class,
        EstadoCitaEntity::class,
        // Alertas
        AlertaEntity::class,
        TipoAlertaEntity::class,
        CategoriaAlertaEntity::class,
        NivelPrioridadAlertaEntity::class,
        EstadoAlertaEntity::class
    ],
    version = 10, // Incremented version - Added optional fields to ActividadFisicaEntity
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class EnutritrackDatabase : RoomDatabase() {
    
    /**
     * DAO para operaciones con usuarios
     */
    abstract fun userDao(): UserDao
    
    /**
     * DAO para operaciones con historial de peso
     */
    abstract fun historialPesoDao(): HistorialPesoDao
    
    /**
     * DAO para operaciones con objetivos de usuario
     */
    abstract fun objetivoUsuarioDao(): ObjetivoUsuarioDao
    
    /**
     * DAO para operaciones con historial médico
     */
    abstract fun medicalHistoryDao(): MedicalHistoryDao
    
    /**
     * DAO para operaciones con medicamentos (solo lectura)
     */
    abstract fun medicamentoDao(): MedicamentoDao

    /**
     * DAO para operaciones con alergias
     */
    abstract fun alergiaDao(): AlergiaDao

    /**
     * DAO para operaciones con perfil de usuario
     */
    abstract fun profileDao(): ProfileDao

    /**
     * DAO para operaciones con alimentos
     */
    abstract fun alimentoDao(): AlimentoDao

    /**
     * DAO para operaciones con registros de comida
     */
    abstract fun registroComidaDao(): RegistroComidaDao

    /**
     * DAO para operaciones con items de registro de comida
     */
    abstract fun registroComidaItemDao(): RegistroComidaItemDao

    /**
     * DAO para operaciones con recomendaciones (solo lectura)
     */
    abstract fun recomendacionDao(): RecomendacionDao

    /**
     * DAO para operaciones con actividad física
     */
    abstract fun actividadFisicaDao(): ActividadFisicaDao

    /**
     * DAO para operaciones con tipos de actividad (solo lectura)
     */
    abstract fun tipoActividadDao(): TipoActividadDao

    // ========== CITAS MÉDICAS ==========

    /**
     * DAO para operaciones con citas médicas
     */
    abstract fun citaMedicaDao(): CitaMedicaDao

    /**
     * DAO para operaciones con vitales de citas médicas (solo lectura)
     */
    abstract fun citaMedicaVitalesDao(): CitaMedicaVitalesDao

    /**
     * DAO para operaciones con documentos de citas médicas (solo lectura)
     */
    abstract fun citaMedicaDocumentosDao(): CitaMedicaDocumentosDao

    /**
     * DAO para operaciones con tipos de consulta (solo lectura)
     */
    abstract fun tipoConsultaDao(): TipoConsultaDao

    /**
     * DAO para operaciones con estados de cita (solo lectura)
     */
    abstract fun estadoCitaDao(): EstadoCitaDao

    // ========== ALERTAS ==========

    /**
     * DAO para operaciones con alertas (solo lectura)
     */
    abstract fun alertaDao(): AlertaDao

    /**
     * DAO para operaciones con tipos de alerta (solo lectura)
     */
    abstract fun tipoAlertaDao(): TipoAlertaDao

    /**
     * DAO para operaciones con categorías de alerta (solo lectura)
     */
    abstract fun categoriaAlertaDao(): CategoriaAlertaDao

    /**
     * DAO para operaciones con niveles de prioridad de alerta (solo lectura)
     */
    abstract fun nivelPrioridadAlertaDao(): NivelPrioridadAlertaDao

    /**
     * DAO para operaciones con estados de alerta (solo lectura)
     */
    abstract fun estadoAlertaDao(): EstadoAlertaDao

    companion object {
        private const val DATABASE_NAME = "enutritrack_db"
        
        @Volatile
        private var INSTANCE: EnutritrackDatabase? = null
        
        /**
         * Obtiene la instancia singleton de la base de datos
         */
        fun getDatabase(context: Context): EnutritrackDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    EnutritrackDatabase::class.java,
                    DATABASE_NAME
                )
                    .fallbackToDestructiveMigration() // Solo para desarrollo - elimina DB antigua y crea nueva
                    .build()
                
                INSTANCE = instance
                instance
            }
        }
        
        /**
         * Limpia la instancia (útil para tests)
         */
        fun clearInstance() {
            INSTANCE = null
        }
    }
}

