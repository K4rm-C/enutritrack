package com.example.enutritrack_app.data.local.dao

import androidx.room.*
import com.example.enutritrack_app.data.local.entities.EstadoAlertaEntity
import kotlinx.coroutines.flow.Flow

/**
 * Data Access Object para operaciones con EstadoAlertaEntity
 */
@Dao
interface EstadoAlertaDao {

    @Query("SELECT * FROM estados_alerta ORDER BY nombre ASC")
    fun getAllFlow(): Flow<List<EstadoAlertaEntity>>

    @Query("SELECT * FROM estados_alerta ORDER BY nombre ASC")
    suspend fun getAll(): List<EstadoAlertaEntity>

    @Query("SELECT * FROM estados_alerta WHERE id = :id LIMIT 1")
    suspend fun getById(id: String): EstadoAlertaEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrReplaceAll(estados: List<EstadoAlertaEntity>)

    @Query("DELETE FROM estados_alerta")
    suspend fun deleteAll()
}

