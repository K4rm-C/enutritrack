package com.example.enutritrack_app.data.local.dao

import androidx.room.*
import com.example.enutritrack_app.data.local.entities.CitaMedicaVitalesEntity
import kotlinx.coroutines.flow.Flow

/**
 * Data Access Object para operaciones con CitaMedicaVitalesEntity
 * Solo lectura - los vitales solo los crea el doctor
 */
@Dao
interface CitaMedicaVitalesDao {

    /**
     * Obtiene vitales de una cita médica como Flow
     */
    @Query("SELECT * FROM citas_medicas_vitales WHERE cita_medica_id = :citaMedicaId ORDER BY created_at DESC")
    fun getByCitaMedicaIdFlow(citaMedicaId: String): Flow<List<CitaMedicaVitalesEntity>>

    /**
     * Obtiene vitales de una cita médica
     */
    @Query("SELECT * FROM citas_medicas_vitales WHERE cita_medica_id = :citaMedicaId ORDER BY created_at DESC")
    suspend fun getByCitaMedicaId(citaMedicaId: String): List<CitaMedicaVitalesEntity>

    /**
     * Obtiene un registro de vitales por ID
     */
    @Query("SELECT * FROM citas_medicas_vitales WHERE id = :id LIMIT 1")
    suspend fun getById(id: String): CitaMedicaVitalesEntity?

    /**
     * Inserta o reemplaza vitales
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrReplaceAll(vitales: List<CitaMedicaVitalesEntity>)

    /**
     * Elimina vitales de una cita médica
     */
    @Query("DELETE FROM citas_medicas_vitales WHERE cita_medica_id = :citaMedicaId")
    suspend fun deleteByCitaMedicaId(citaMedicaId: String)
}

