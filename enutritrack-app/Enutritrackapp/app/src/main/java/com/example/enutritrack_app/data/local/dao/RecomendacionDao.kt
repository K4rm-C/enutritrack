package com.example.enutritrack_app.data.local.dao

import androidx.room.*
import com.example.enutritrack_app.data.local.entities.RecomendacionEntity
import kotlinx.coroutines.flow.Flow

/**
 * Data Access Object para operaciones con RecomendacionEntity
 * 
 * Nota: Las recomendaciones son solo lectura, se sincronizan desde el servidor
 */
@Dao
interface RecomendacionDao {
    
    /**
     * Obtiene todas las recomendaciones activas de un usuario como Flow
     */
    @Query("""
        SELECT * FROM recomendaciones 
        WHERE usuario_id = :usuarioId 
        AND activa = 1 
        AND (vigencia_hasta IS NULL OR vigencia_hasta > :currentTime)
        ORDER BY fecha_generacion DESC
    """)
    fun getActivasFlow(usuarioId: String, currentTime: Long = System.currentTimeMillis()): Flow<List<RecomendacionEntity>>
    
    /**
     * Obtiene todas las recomendaciones activas de un usuario
     */
    @Query("""
        SELECT * FROM recomendaciones 
        WHERE usuario_id = :usuarioId 
        AND activa = 1 
        AND (vigencia_hasta IS NULL OR vigencia_hasta > :currentTime)
        ORDER BY fecha_generacion DESC
    """)
    suspend fun getActivas(usuarioId: String, currentTime: Long = System.currentTimeMillis()): List<RecomendacionEntity>
    
    /**
     * Obtiene todas las recomendaciones de un usuario
     */
    @Query("SELECT * FROM recomendaciones WHERE usuario_id = :usuarioId ORDER BY fecha_generacion DESC")
    suspend fun getByUsuario(usuarioId: String): List<RecomendacionEntity>
    
    /**
     * Obtiene una recomendación por ID
     */
    @Query("SELECT * FROM recomendaciones WHERE id = :id LIMIT 1")
    suspend fun getById(id: String): RecomendacionEntity?
    
    /**
     * Inserta o actualiza recomendaciones (sincronización desde servidor)
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(recomendacion: RecomendacionEntity)
    
    /**
     * Inserta o actualiza múltiples recomendaciones
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(recomendaciones: List<RecomendacionEntity>)
    
    /**
     * Elimina todas las recomendaciones de un usuario (útil para resincronización)
     */
    @Query("DELETE FROM recomendaciones WHERE usuario_id = :usuarioId")
    suspend fun deleteByUsuario(usuarioId: String)
    
    /**
     * Elimina una recomendación por ID
     */
    @Query("DELETE FROM recomendaciones WHERE id = :id")
    suspend fun deleteById(id: String)
}

