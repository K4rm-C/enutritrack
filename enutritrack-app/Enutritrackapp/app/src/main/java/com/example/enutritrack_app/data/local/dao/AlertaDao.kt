package com.example.enutritrack_app.data.local.dao

import androidx.room.*
import com.example.enutritrack_app.data.local.entities.AlertaEntity
import kotlinx.coroutines.flow.Flow

/**
 * Data Access Object para operaciones con AlertaEntity
 * Solo lectura - las alertas son creadas por el doctor o automáticamente
 */
@Dao
interface AlertaDao {

    /**
     * Obtiene todas las alertas de un usuario como Flow
     */
    @Query("SELECT * FROM alertas WHERE usuario_id = :usuarioId ORDER BY fecha_deteccion DESC")
    fun getByUsuarioIdFlow(usuarioId: String): Flow<List<AlertaEntity>>

    /**
     * Obtiene todas las alertas de un usuario
     */
    @Query("SELECT * FROM alertas WHERE usuario_id = :usuarioId ORDER BY fecha_deteccion DESC")
    suspend fun getByUsuarioId(usuarioId: String): List<AlertaEntity>

    /**
     * Obtiene alertas activas (no resueltas) de un usuario
     */
    @Query("SELECT * FROM alertas WHERE usuario_id = :usuarioId AND fecha_resolucion IS NULL ORDER BY fecha_deteccion DESC")
    suspend fun getActivasByUsuarioId(usuarioId: String): List<AlertaEntity>

    /**
     * Obtiene una alerta por ID
     */
    @Query("SELECT * FROM alertas WHERE id = :id LIMIT 1")
    suspend fun getById(id: String): AlertaEntity?

    /**
     * Inserta o reemplaza alertas
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrReplaceAll(alertas: List<AlertaEntity>)

    /**
     * Elimina todas las alertas de un usuario
     */
    @Query("DELETE FROM alertas WHERE usuario_id = :usuarioId")
    suspend fun deleteByUsuarioId(usuarioId: String)
}

