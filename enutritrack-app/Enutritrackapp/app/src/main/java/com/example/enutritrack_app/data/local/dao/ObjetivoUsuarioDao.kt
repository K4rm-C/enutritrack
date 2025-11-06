package com.example.enutritrack_app.data.local.dao

import androidx.room.*
import com.example.enutritrack_app.data.local.database.SyncStatus
import com.example.enutritrack_app.data.local.entities.ObjetivoUsuarioEntity
import kotlinx.coroutines.flow.Flow

/**
 * Data Access Object para operaciones con ObjetivoUsuarioEntity
 */
@Dao
interface ObjetivoUsuarioDao {
    
    /**
     * Obtiene todos los objetivos de un usuario ordenados por fecha descendente
     */
    @Query("SELECT * FROM objetivo_usuario WHERE usuario_id = :userId ORDER BY fecha_establecido DESC")
    suspend fun getByUsuario(userId: String): List<ObjetivoUsuarioEntity>
    
    /**
     * Obtiene todos los objetivos de un usuario como Flow
     */
    @Query("SELECT * FROM objetivo_usuario WHERE usuario_id = :userId ORDER BY fecha_establecido DESC")
    fun getByUsuarioFlow(userId: String): Flow<List<ObjetivoUsuarioEntity>>
    
    /**
     * Obtiene el objetivo vigente de un usuario
     */
    @Query("SELECT * FROM objetivo_usuario WHERE usuario_id = :userId AND vigente = 1 LIMIT 1")
    suspend fun getVigente(userId: String): ObjetivoUsuarioEntity?
    
    /**
     * Obtiene el objetivo vigente como Flow
     */
    @Query("SELECT * FROM objetivo_usuario WHERE usuario_id = :userId AND vigente = 1 LIMIT 1")
    fun getVigenteFlow(userId: String): Flow<ObjetivoUsuarioEntity?>
    
    /**
     * Obtiene un objetivo por ID
     */
    @Query("SELECT * FROM objetivo_usuario WHERE id = :id LIMIT 1")
    suspend fun getById(id: String): ObjetivoUsuarioEntity?
    
    /**
     * Obtiene todos los objetivos pendientes de sincronización
     */
    @Query("SELECT * FROM objetivo_usuario WHERE syncStatus != 'SYNCED' ORDER BY createdAt ASC")
    suspend fun getPendingSync(): List<ObjetivoUsuarioEntity>
    
    /**
     * Obtiene objetivos por estado de sincronización
     */
    @Query("SELECT * FROM objetivo_usuario WHERE syncStatus = :status ORDER BY createdAt ASC")
    suspend fun getBySyncStatus(status: SyncStatus): List<ObjetivoUsuarioEntity>
    
    /**
     * Desactiva todos los objetivos vigentes de un usuario
     * Útil antes de crear un nuevo objetivo vigente
     */
    @Query("UPDATE objetivo_usuario SET vigente = 0, updatedAt = :timestamp WHERE usuario_id = :userId AND vigente = 1")
    suspend fun desactivarVigentes(userId: String, timestamp: Long = System.currentTimeMillis())
    
    /**
     * Inserta un nuevo objetivo
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(objetivo: ObjetivoUsuarioEntity)
    
    /**
     * Actualiza un objetivo existente
     */
    @Update
    suspend fun update(objetivo: ObjetivoUsuarioEntity)
    
    /**
     * Elimina un objetivo
     */
    @Delete
    suspend fun delete(objetivo: ObjetivoUsuarioEntity)
    
    /**
     * Elimina un objetivo por ID
     */
    @Query("DELETE FROM objetivo_usuario WHERE id = :id")
    suspend fun deleteById(id: String)
    
    /**
     * Elimina todos los objetivos de un usuario
     */
    @Query("DELETE FROM objetivo_usuario WHERE usuario_id = :userId")
    suspend fun deleteByUsuario(userId: String)
}

