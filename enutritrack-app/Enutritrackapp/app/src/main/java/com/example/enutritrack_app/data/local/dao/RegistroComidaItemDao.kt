package com.example.enutritrack_app.data.local.dao

import androidx.room.*
import com.example.enutritrack_app.data.local.database.SyncStatus
import com.example.enutritrack_app.data.local.entities.RegistroComidaItemEntity
import kotlinx.coroutines.flow.Flow

/**
 * Data Access Object para operaciones con RegistroComidaItemEntity
 */
@Dao
interface RegistroComidaItemDao {
    
    /**
     * Obtiene todos los items de un registro de comida como Flow
     */
    @Query("SELECT * FROM registro_comida_items WHERE registro_comida_id = :registroComidaId ORDER BY createdAt ASC")
    fun getByRegistroComidaFlow(registroComidaId: String): Flow<List<RegistroComidaItemEntity>>
    
    /**
     * Obtiene todos los items de un registro de comida
     */
    @Query("SELECT * FROM registro_comida_items WHERE registro_comida_id = :registroComidaId ORDER BY createdAt ASC")
    suspend fun getByRegistroComida(registroComidaId: String): List<RegistroComidaItemEntity>
    
    /**
     * Obtiene un item por ID
     */
    @Query("SELECT * FROM registro_comida_items WHERE id = :id LIMIT 1")
    suspend fun getById(id: String): RegistroComidaItemEntity?
    
    /**
     * Obtiene todos los items pendientes de sincronización
     */
    @Query("SELECT * FROM registro_comida_items WHERE syncStatus != 'SYNCED' ORDER BY createdAt ASC")
    suspend fun getPendingSync(): List<RegistroComidaItemEntity>
    
    /**
     * Obtiene items por estado de sincronización
     */
    @Query("SELECT * FROM registro_comida_items WHERE syncStatus = :status ORDER BY createdAt ASC")
    suspend fun getBySyncStatus(status: SyncStatus): List<RegistroComidaItemEntity>
    
    /**
     * Inserta un nuevo item
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(item: RegistroComidaItemEntity)
    
    /**
     * Inserta múltiples items
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(items: List<RegistroComidaItemEntity>)
    
    /**
     * Actualiza un item existente
     */
    @Update
    suspend fun update(item: RegistroComidaItemEntity)
    
    /**
     * Elimina un item
     */
    @Delete
    suspend fun delete(item: RegistroComidaItemEntity)
    
    /**
     * Elimina un item por ID
     */
    @Query("DELETE FROM registro_comida_items WHERE id = :id")
    suspend fun deleteById(id: String)
    
    /**
     * Elimina todos los items de un registro de comida
     */
    @Query("DELETE FROM registro_comida_items WHERE registro_comida_id = :registroComidaId")
    suspend fun deleteByRegistroComida(registroComidaId: String)
}

