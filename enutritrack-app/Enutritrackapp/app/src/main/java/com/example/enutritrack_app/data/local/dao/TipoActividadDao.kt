package com.example.enutritrack_app.data.local.dao

import androidx.room.*
import com.example.enutritrack_app.data.local.entities.TipoActividadEntity
import kotlinx.coroutines.flow.Flow

/**
 * Data Access Object para operaciones con TipoActividadEntity
 */
@Dao
interface TipoActividadDao {
    
    /**
     * Obtiene todos los tipos de actividad como Flow
     */
    @Query("SELECT * FROM tipos_actividad ORDER BY nombre ASC")
    fun getAllFlow(): Flow<List<TipoActividadEntity>>
    
    /**
     * Obtiene todos los tipos de actividad
     */
    @Query("SELECT * FROM tipos_actividad ORDER BY nombre ASC")
    suspend fun getAll(): List<TipoActividadEntity>
    
    /**
     * Obtiene un tipo de actividad por ID
     */
    @Query("SELECT * FROM tipos_actividad WHERE id = :id LIMIT 1")
    suspend fun getById(id: String): TipoActividadEntity?
    
    /**
     * Inserta o reemplaza tipos de actividad
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrReplaceAll(tipos: List<TipoActividadEntity>)
    
    /**
     * Elimina todos los tipos de actividad
     */
    @Query("DELETE FROM tipos_actividad")
    suspend fun deleteAll()
}

