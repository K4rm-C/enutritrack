package com.example.enutritrack_app.data.local.dao

import androidx.room.*
import com.example.enutritrack_app.data.local.entities.CitaMedicaEntity
import com.example.enutritrack_app.data.local.database.SyncStatus
import kotlinx.coroutines.flow.Flow

/**
 * Data Access Object para operaciones con CitaMedicaEntity
 */
@Dao
interface CitaMedicaDao {

    /**
     * Obtiene todas las citas médicas de un usuario como Flow
     */
    @Query("SELECT * FROM citas_medicas WHERE usuario_id = :usuarioId ORDER BY fecha_hora_programada DESC")
    fun getByUsuarioIdFlow(usuarioId: String): Flow<List<CitaMedicaEntity>>

    /**
     * Obtiene todas las citas médicas de un usuario
     */
    @Query("SELECT * FROM citas_medicas WHERE usuario_id = :usuarioId ORDER BY fecha_hora_programada DESC")
    suspend fun getByUsuarioId(usuarioId: String): List<CitaMedicaEntity>

    /**
     * Obtiene una cita médica por ID
     */
    @Query("SELECT * FROM citas_medicas WHERE id = :id LIMIT 1")
    suspend fun getById(id: String): CitaMedicaEntity?

    /**
     * Obtiene una cita médica por serverId
     */
    @Query("SELECT * FROM citas_medicas WHERE serverId = :serverId LIMIT 1")
    suspend fun getByServerId(serverId: String): CitaMedicaEntity?

    /**
     * Obtiene citas médicas pasadas (fecha_hora_programada < ahora)
     */
    @Query("SELECT * FROM citas_medicas WHERE usuario_id = :usuarioId AND fecha_hora_programada < :timestamp ORDER BY fecha_hora_programada DESC")
    suspend fun getPasadas(usuarioId: String, timestamp: Long): List<CitaMedicaEntity>

    /**
     * Obtiene citas médicas futuras (fecha_hora_programada >= ahora)
     */
    @Query("SELECT * FROM citas_medicas WHERE usuario_id = :usuarioId AND fecha_hora_programada >= :timestamp ORDER BY fecha_hora_programada ASC")
    suspend fun getFuturas(usuarioId: String, timestamp: Long): List<CitaMedicaEntity>

    /**
     * Obtiene citas pendientes de sincronización
     */
    @Query("SELECT * FROM citas_medicas WHERE syncStatus = :status")
    suspend fun getPendingSync(status: SyncStatus): List<CitaMedicaEntity>

    /**
     * Inserta una cita médica
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(cita: CitaMedicaEntity)

    /**
     * Inserta o reemplaza múltiples citas médicas
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrReplaceAll(citas: List<CitaMedicaEntity>)

    /**
     * Actualiza una cita médica
     */
    @Update
    suspend fun update(cita: CitaMedicaEntity)

    /**
     * Elimina una cita médica
     */
    @Delete
    suspend fun delete(cita: CitaMedicaEntity)

    /**
     * Elimina una cita médica por ID
     */
    @Query("DELETE FROM citas_medicas WHERE id = :id")
    suspend fun deleteById(id: String)

    /**
     * Elimina todas las citas médicas de un usuario
     */
    @Query("DELETE FROM citas_medicas WHERE usuario_id = :usuarioId")
    suspend fun deleteByUsuarioId(usuarioId: String)
}

