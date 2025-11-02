package com.example.enutritrack_app.data.local.dao

import androidx.room.*
import com.example.enutritrack_app.data.local.entities.TipoAlertaEntity
import kotlinx.coroutines.flow.Flow

/**
 * Data Access Object para operaciones con TipoAlertaEntity
 */
@Dao
interface TipoAlertaDao {

    @Query("SELECT * FROM tipos_alerta ORDER BY nombre ASC")
    fun getAllFlow(): Flow<List<TipoAlertaEntity>>

    @Query("SELECT * FROM tipos_alerta ORDER BY nombre ASC")
    suspend fun getAll(): List<TipoAlertaEntity>

    @Query("SELECT * FROM tipos_alerta WHERE id = :id LIMIT 1")
    suspend fun getById(id: String): TipoAlertaEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrReplaceAll(tipos: List<TipoAlertaEntity>)

    @Query("DELETE FROM tipos_alerta")
    suspend fun deleteAll()
}

