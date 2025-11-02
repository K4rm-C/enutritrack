package com.example.enutritrack_app.data.local.dao

import androidx.room.*
import com.example.enutritrack_app.data.local.entities.EstadoCitaEntity
import kotlinx.coroutines.flow.Flow

/**
 * Data Access Object para operaciones con EstadoCitaEntity
 */
@Dao
interface EstadoCitaDao {

    /**
     * Obtiene todos los estados de cita como Flow
     */
    @Query("SELECT * FROM estados_cita ORDER BY nombre ASC")
    fun getAllFlow(): Flow<List<EstadoCitaEntity>>

    /**
     * Obtiene todos los estados de cita
     */
    @Query("SELECT * FROM estados_cita ORDER BY nombre ASC")
    suspend fun getAll(): List<EstadoCitaEntity>

    /**
     * Obtiene un estado de cita por ID
     */
    @Query("SELECT * FROM estados_cita WHERE id = :id LIMIT 1")
    suspend fun getById(id: String): EstadoCitaEntity?

    /**
     * Obtiene estados de cita por nombre (útil para validaciones)
     */
    @Query("SELECT * FROM estados_cita WHERE nombre = :nombre LIMIT 1")
    suspend fun getByName(nombre: String): EstadoCitaEntity?

    /**
     * Inserta o reemplaza estados de cita
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrReplaceAll(estados: List<EstadoCitaEntity>)

    /**
     * Elimina todos los estados de cita
     */
    @Query("DELETE FROM estados_cita")
    suspend fun deleteAll()
}

