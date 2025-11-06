package com.example.enutritrack_app.data.local.dao

import androidx.room.*
import com.example.enutritrack_app.data.local.database.SyncStatus
import com.example.enutritrack_app.data.local.entities.RegistroComidaEntity
import com.example.enutritrack_app.data.local.entities.TipoComidaEnum
import kotlinx.coroutines.flow.Flow

/**
 * Data Access Object para operaciones con RegistroComidaEntity
 */
@Dao
interface RegistroComidaDao {
    
    /**
     * Obtiene todos los registros de comida de un usuario como Flow
     */
    @Query("SELECT * FROM registro_comida WHERE usuario_id = :usuarioId ORDER BY fecha DESC")
    fun getByUsuarioFlow(usuarioId: String): Flow<List<RegistroComidaEntity>>
    
    /**
     * Obtiene todos los registros de comida de un usuario
     */
    @Query("SELECT * FROM registro_comida WHERE usuario_id = :usuarioId ORDER BY fecha DESC")
    suspend fun getByUsuario(usuarioId: String): List<RegistroComidaEntity>
    
    /**
     * Obtiene un registro de comida por ID
     */
    @Query("SELECT * FROM registro_comida WHERE id = :id LIMIT 1")
    suspend fun getById(id: String): RegistroComidaEntity?
    
    /**
     * Obtiene un registro de comida por ID como Flow
     */
    @Query("SELECT * FROM registro_comida WHERE id = :id LIMIT 1")
    fun getByIdFlow(id: String): Flow<RegistroComidaEntity?>
    
    /**
     * Obtiene registros de comida por tipo
     */
    @Query("SELECT * FROM registro_comida WHERE usuario_id = :usuarioId AND tipo_comida = :tipoComida ORDER BY fecha DESC")
    suspend fun getByTipoComida(usuarioId: String, tipoComida: TipoComidaEnum): List<RegistroComidaEntity>
    
    /**
     * Obtiene registros de comida por rango de fechas
     */
    @Query("SELECT * FROM registro_comida WHERE usuario_id = :usuarioId AND fecha BETWEEN :startDate AND :endDate ORDER BY fecha DESC")
    suspend fun getByDateRange(usuarioId: String, startDate: Long, endDate: Long): List<RegistroComidaEntity>
    
    /**
     * Obtiene todos los registros pendientes de sincronización
     */
    @Query("SELECT * FROM registro_comida WHERE syncStatus != 'SYNCED' ORDER BY createdAt ASC")
    suspend fun getPendingSync(): List<RegistroComidaEntity>
    
    /**
     * Obtiene registros por estado de sincronización
     */
    @Query("SELECT * FROM registro_comida WHERE syncStatus = :status ORDER BY createdAt ASC")
    suspend fun getBySyncStatus(status: SyncStatus): List<RegistroComidaEntity>
    
    /**
     * Inserta un nuevo registro de comida
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(registroComida: RegistroComidaEntity)
    
    /**
     * Actualiza un registro de comida existente
     */
    @Update
    suspend fun update(registroComida: RegistroComidaEntity)
    
    /**
     * Elimina un registro de comida
     */
    @Delete
    suspend fun delete(registroComida: RegistroComidaEntity)
    
    /**
     * Elimina un registro por ID
     */
    @Query("DELETE FROM registro_comida WHERE id = :id")
    suspend fun deleteById(id: String)
}

