package com.example.enutritrack_app.data.local.dao

import androidx.room.*
import com.example.enutritrack_app.data.local.entities.MedicamentoEntity
import kotlinx.coroutines.flow.Flow

/**
 * Data Access Object para operaciones con MedicamentoEntity
 * 
 * IMPORTANTE: Solo lectura. Los medicamentos vienen del servidor.
 */
@Dao
interface MedicamentoDao {
    
    /**
     * Obtiene todos los medicamentos de un usuario
     */
    @Query("SELECT * FROM medicamentos WHERE usuario_id = :userId ORDER BY fecha_inicio DESC")
    suspend fun getByUsuario(userId: String): List<MedicamentoEntity>
    
    /**
     * Obtiene todos los medicamentos de un usuario como Flow
     */
    @Query("SELECT * FROM medicamentos WHERE usuario_id = :userId ORDER BY fecha_inicio DESC")
    fun getByUsuarioFlow(userId: String): Flow<List<MedicamentoEntity>>
    
    /**
     * Obtiene solo los medicamentos activos de un usuario
     */
    @Query("SELECT * FROM medicamentos WHERE usuario_id = :userId AND activo = 1 ORDER BY fecha_inicio DESC")
    suspend fun getActivosByUsuario(userId: String): List<MedicamentoEntity>
    
    /**
     * Obtiene solo los medicamentos activos como Flow
     */
    @Query("SELECT * FROM medicamentos WHERE usuario_id = :userId AND activo = 1 ORDER BY fecha_inicio DESC")
    fun getActivosByUsuarioFlow(userId: String): Flow<List<MedicamentoEntity>>
    
    /**
     * Obtiene un medicamento por ID
     */
    @Query("SELECT * FROM medicamentos WHERE id = :id LIMIT 1")
    suspend fun getById(id: String): MedicamentoEntity?
    
    /**
     * Inserta o reemplaza un medicamento (solo para sincronización desde servidor)
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrReplace(medicamento: MedicamentoEntity)
    
    /**
     * Inserta o reemplaza múltiples medicamentos
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrReplaceAll(medicamentos: List<MedicamentoEntity>)
    
    /**
     * Elimina todos los medicamentos de un usuario
     * Útil para re-sincronizar desde el servidor
     */
    @Query("DELETE FROM medicamentos WHERE usuario_id = :userId")
    suspend fun deleteByUsuario(userId: String)
    
    /**
     * Elimina un medicamento por ID
     */
    @Query("DELETE FROM medicamentos WHERE id = :id")
    suspend fun deleteById(id: String)
    
    /**
     * Elimina todos los medicamentos (útil para limpiar cache)
     */
    @Query("DELETE FROM medicamentos")
    suspend fun deleteAll()
}

