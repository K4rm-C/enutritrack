package com.example.enutritrack_app.data.local.dao

import androidx.room.*
import com.example.enutritrack_app.data.local.entities.CitaMedicaDocumentosEntity
import kotlinx.coroutines.flow.Flow

/**
 * Data Access Object para operaciones con CitaMedicaDocumentosEntity
 * Solo lectura - los documentos solo los agrega el doctor
 */
@Dao
interface CitaMedicaDocumentosDao {

    /**
     * Obtiene documentos de una cita médica como Flow
     */
    @Query("SELECT * FROM citas_medicas_documentos WHERE cita_medica_id = :citaMedicaId ORDER BY created_at DESC")
    fun getByCitaMedicaIdFlow(citaMedicaId: String): Flow<List<CitaMedicaDocumentosEntity>>

    /**
     * Obtiene documentos de una cita médica
     */
    @Query("SELECT * FROM citas_medicas_documentos WHERE cita_medica_id = :citaMedicaId ORDER BY created_at DESC")
    suspend fun getByCitaMedicaId(citaMedicaId: String): List<CitaMedicaDocumentosEntity>

    /**
     * Obtiene un documento por ID
     */
    @Query("SELECT * FROM citas_medicas_documentos WHERE id = :id LIMIT 1")
    suspend fun getById(id: String): CitaMedicaDocumentosEntity?

    /**
     * Inserta o reemplaza documentos
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrReplaceAll(documentos: List<CitaMedicaDocumentosEntity>)

    /**
     * Elimina documentos de una cita médica
     */
    @Query("DELETE FROM citas_medicas_documentos WHERE cita_medica_id = :citaMedicaId")
    suspend fun deleteByCitaMedicaId(citaMedicaId: String)
}

