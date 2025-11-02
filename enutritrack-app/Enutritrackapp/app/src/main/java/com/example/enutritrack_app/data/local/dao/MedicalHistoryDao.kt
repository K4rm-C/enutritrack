package com.example.enutritrack_app.data.local.dao

import androidx.room.*
import com.example.enutritrack_app.data.local.database.SyncStatus
import com.example.enutritrack_app.data.local.entities.MedicalHistoryEntity
import kotlinx.coroutines.flow.Flow

/**
 * Data Access Object para operaciones con MedicalHistoryEntity
 */
@Dao
interface MedicalHistoryDao {
    
    /**
     * Obtiene el historial médico de un usuario
     */
    @Query("SELECT * FROM historial_medico WHERE usuario_id = :userId LIMIT 1")
    suspend fun getByUsuario(userId: String): MedicalHistoryEntity?
    
    /**
     * Obtiene el historial médico de un usuario como Flow
     */
    @Query("SELECT * FROM historial_medico WHERE usuario_id = :userId LIMIT 1")
    fun getByUsuarioFlow(userId: String): Flow<MedicalHistoryEntity?>
    
    /**
     * Obtiene todos los historiales pendientes de sincronización
     */
    @Query("SELECT * FROM historial_medico WHERE syncStatus != 'SYNCED' ORDER BY createdAt ASC")
    suspend fun getPendingSync(): List<MedicalHistoryEntity>
    
    /**
     * Obtiene historiales por estado de sincronización
     */
    @Query("SELECT * FROM historial_medico WHERE syncStatus = :status ORDER BY createdAt ASC")
    suspend fun getBySyncStatus(status: SyncStatus): List<MedicalHistoryEntity>
    
    /**
     * Inserta un nuevo historial médico
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(historial: MedicalHistoryEntity)
    
    /**
     * Actualiza un historial médico existente
     */
    @Update
    suspend fun update(historial: MedicalHistoryEntity)
    
    /**
     * Elimina un historial médico
     */
    @Delete
    suspend fun delete(historial: MedicalHistoryEntity)
    
    /**
     * Elimina un historial por ID
     */
    @Query("DELETE FROM historial_medico WHERE id = :id")
    suspend fun deleteById(id: String)
    
    /**
     * Elimina el historial de un usuario
     */
    @Query("DELETE FROM historial_medico WHERE usuario_id = :userId")
    suspend fun deleteByUsuario(userId: String)
}

