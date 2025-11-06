package com.example.enutritrack_app.data.local.dao

import androidx.room.*
import com.example.enutritrack_app.data.local.database.SyncStatus
import com.example.enutritrack_app.data.local.entities.ActividadFisicaEntity
import kotlinx.coroutines.flow.Flow

/**
 * Data Access Object para operaciones con ActividadFisicaEntity
 */
@Dao
interface ActividadFisicaDao {
    
    /**
     * Obtiene todas las actividades físicas de un usuario como Flow
     */
    @Query("SELECT * FROM actividad_fisica WHERE usuario_id = :usuarioId ORDER BY fecha DESC")
    fun getByUsuarioFlow(usuarioId: String): Flow<List<ActividadFisicaEntity>>
    
    /**
     * Obtiene todas las actividades físicas de un usuario
     */
    @Query("SELECT * FROM actividad_fisica WHERE usuario_id = :usuarioId ORDER BY fecha DESC")
    suspend fun getByUsuario(usuarioId: String): List<ActividadFisicaEntity>
    
    /**
     * Obtiene una actividad física por ID
     */
    @Query("SELECT * FROM actividad_fisica WHERE id = :id LIMIT 1")
    suspend fun getById(id: String): ActividadFisicaEntity?
    
    /**
     * Obtiene una actividad física por ID como Flow
     */
    @Query("SELECT * FROM actividad_fisica WHERE id = :id LIMIT 1")
    fun getByIdFlow(id: String): Flow<ActividadFisicaEntity?>
    
    /**
     * Obtiene actividades físicas por rango de fechas
     */
    @Query("SELECT * FROM actividad_fisica WHERE usuario_id = :usuarioId AND fecha BETWEEN :startDate AND :endDate ORDER BY fecha DESC")
    suspend fun getByDateRange(usuarioId: String, startDate: Long, endDate: Long): List<ActividadFisicaEntity>
    
    /**
     * Obtiene todas las actividades pendientes de sincronización
     */
    @Query("SELECT * FROM actividad_fisica WHERE syncStatus != 'SYNCED' ORDER BY createdAt ASC")
    suspend fun getPendingSync(): List<ActividadFisicaEntity>
    
    /**
     * Obtiene actividades por estado de sincronización
     */
    @Query("SELECT * FROM actividad_fisica WHERE syncStatus = :status ORDER BY createdAt ASC")
    suspend fun getBySyncStatus(status: SyncStatus): List<ActividadFisicaEntity>
    
    /**
     * Inserta una nueva actividad física
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(actividadFisica: ActividadFisicaEntity)
    
    /**
     * Actualiza una actividad física existente
     */
    @Update
    suspend fun update(actividadFisica: ActividadFisicaEntity)
    
    /**
     * Elimina una actividad física
     */
    @Delete
    suspend fun delete(actividadFisica: ActividadFisicaEntity)
    
    /**
     * Elimina una actividad física por ID
     */
    @Query("DELETE FROM actividad_fisica WHERE id = :id")
    suspend fun deleteById(id: String)
}

