package com.example.enutritrack_app.data.local.dao

import androidx.room.*
import com.example.enutritrack_app.data.local.database.SyncStatus
import com.example.enutritrack_app.data.local.entities.AlimentoEntity
import kotlinx.coroutines.flow.Flow

/**
 * Data Access Object para operaciones con AlimentoEntity
 */
@Dao
interface AlimentoDao {
    
    /**
     * Obtiene todos los alimentos como Flow
     */
    @Query("SELECT * FROM alimentos ORDER BY nombre ASC")
    fun getAllFlow(): Flow<List<AlimentoEntity>>
    
    /**
     * Obtiene todos los alimentos
     */
    @Query("SELECT * FROM alimentos ORDER BY nombre ASC")
    suspend fun getAll(): List<AlimentoEntity>
    
    /**
     * Obtiene un alimento por ID
     */
    @Query("SELECT * FROM alimentos WHERE id = :id LIMIT 1")
    suspend fun getById(id: String): AlimentoEntity?
    
    /**
     * Obtiene un alimento por ID como Flow
     */
    @Query("SELECT * FROM alimentos WHERE id = :id LIMIT 1")
    fun getByIdFlow(id: String): Flow<AlimentoEntity?>
    
    /**
     * Busca alimentos por nombre (case-insensitive, LIKE)
     */
    @Query("SELECT * FROM alimentos WHERE nombre LIKE '%' || :query || '%' ORDER BY nombre ASC")
    suspend fun searchByName(query: String): List<AlimentoEntity>
    
    /**
     * Busca alimentos por categoría
     */
    @Query("SELECT * FROM alimentos WHERE categoria = :categoria ORDER BY nombre ASC")
    suspend fun getByCategoria(categoria: String): List<AlimentoEntity>
    
    /**
     * Obtiene todos los alimentos pendientes de sincronización
     */
    @Query("SELECT * FROM alimentos WHERE syncStatus != 'SYNCED' ORDER BY createdAt ASC")
    suspend fun getPendingSync(): List<AlimentoEntity>
    
    /**
     * Obtiene alimentos por estado de sincronización
     */
    @Query("SELECT * FROM alimentos WHERE syncStatus = :status ORDER BY createdAt ASC")
    suspend fun getBySyncStatus(status: SyncStatus): List<AlimentoEntity>
    
    /**
     * Inserta un nuevo alimento
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(alimento: AlimentoEntity)
    
    /**
     * Actualiza un alimento existente
     */
    @Update
    suspend fun update(alimento: AlimentoEntity)
    
    /**
     * Elimina un alimento
     */
    @Delete
    suspend fun delete(alimento: AlimentoEntity)
    
    /**
     * Elimina un alimento por ID
     */
    @Query("DELETE FROM alimentos WHERE id = :id")
    suspend fun deleteById(id: String)
}

