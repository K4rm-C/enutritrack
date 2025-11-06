package com.example.enutritrack_app.data.local.dao

import androidx.room.*
import com.example.enutritrack_app.data.local.entities.NivelPrioridadAlertaEntity
import kotlinx.coroutines.flow.Flow

/**
 * Data Access Object para operaciones con NivelPrioridadAlertaEntity
 */
@Dao
interface NivelPrioridadAlertaDao {

    @Query("SELECT * FROM niveles_prioridad_alerta ORDER BY nivel_numerico ASC")
    fun getAllFlow(): Flow<List<NivelPrioridadAlertaEntity>>

    @Query("SELECT * FROM niveles_prioridad_alerta ORDER BY nivel_numerico ASC")
    suspend fun getAll(): List<NivelPrioridadAlertaEntity>

    @Query("SELECT * FROM niveles_prioridad_alerta WHERE id = :id LIMIT 1")
    suspend fun getById(id: String): NivelPrioridadAlertaEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrReplaceAll(niveles: List<NivelPrioridadAlertaEntity>)

    @Query("DELETE FROM niveles_prioridad_alerta")
    suspend fun deleteAll()
}

