package com.example.enutritrack_app.data.local.dao

import androidx.room.*
import com.example.enutritrack_app.data.local.database.SyncStatus
import com.example.enutritrack_app.data.local.entities.HistorialPesoEntity
import kotlinx.coroutines.flow.Flow

/**
 * Data Access Object para operaciones con HistorialPesoEntity
 */
@Dao
interface HistorialPesoDao {
    
    /**
     * Obtiene todos los registros de peso de un usuario ordenados por fecha descendente
     */
    @Query("SELECT * FROM historial_peso WHERE usuario_id = :userId ORDER BY fecha_registro DESC")
    suspend fun getByUsuario(userId: String): List<HistorialPesoEntity>
    
    /**
     * Obtiene todos los registros de peso de un usuario como Flow
     */
    @Query("SELECT * FROM historial_peso WHERE usuario_id = :userId ORDER BY fecha_registro DESC")
    fun getByUsuarioFlow(userId: String): Flow<List<HistorialPesoEntity>>
    
    /**
     * Obtiene registros de peso por rango de fechas
     */
    @Query("SELECT * FROM historial_peso WHERE usuario_id = :userId AND fecha_registro BETWEEN :startDate AND :endDate ORDER BY fecha_registro DESC")
    suspend fun getByRange(userId: String, startDate: Long, endDate: Long): List<HistorialPesoEntity>
    
    /**
     * Obtiene el último registro de peso de un usuario
     */
    @Query("SELECT * FROM historial_peso WHERE usuario_id = :userId ORDER BY fecha_registro DESC LIMIT 1")
    suspend fun getLast(userId: String): HistorialPesoEntity?
    
    /**
     * Obtiene el último registro de peso como Flow
     */
    @Query("SELECT * FROM historial_peso WHERE usuario_id = :userId ORDER BY fecha_registro DESC LIMIT 1")
    fun getLastFlow(userId: String): Flow<HistorialPesoEntity?>
    
    /**
     * Obtiene todos los registros pendientes de sincronización
     */
    @Query("SELECT * FROM historial_peso WHERE syncStatus != 'SYNCED' ORDER BY createdAt ASC")
    suspend fun getPendingSync(): List<HistorialPesoEntity>
    
    /**
     * Obtiene registros por estado de sincronización
     */
    @Query("SELECT * FROM historial_peso WHERE syncStatus = :status ORDER BY createdAt ASC")
    suspend fun getBySyncStatus(status: SyncStatus): List<HistorialPesoEntity>
    
    /**
     * Inserta un nuevo registro de peso
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(historial: HistorialPesoEntity)
    
    /**
     * Actualiza un registro de peso existente
     */
    @Update
    suspend fun update(historial: HistorialPesoEntity)
    
    /**
     * Elimina un registro de peso
     */
    @Delete
    suspend fun delete(historial: HistorialPesoEntity)
    
    /**
     * Elimina un registro por ID
     */
    @Query("DELETE FROM historial_peso WHERE id = :id")
    suspend fun deleteById(id: String)
    
    /**
     * Elimina todos los registros de un usuario
     */
    @Query("DELETE FROM historial_peso WHERE usuario_id = :userId")
    suspend fun deleteByUsuario(userId: String)
}

