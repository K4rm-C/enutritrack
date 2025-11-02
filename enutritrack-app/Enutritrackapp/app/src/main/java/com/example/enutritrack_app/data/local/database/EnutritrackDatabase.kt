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
        ActividadFisicaEntity::class
    ],
    version = 7, // Incremented version - Added ActividadFisicaEntity
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

