package com.example.enutritrack_app.data.local.dao

import androidx.room.*
import com.example.enutritrack_app.data.local.entities.TipoConsultaEntity
import kotlinx.coroutines.flow.Flow

/**
 * Data Access Object para operaciones con TipoConsultaEntity
 */
@Dao
interface TipoConsultaDao {

    /**
     * Obtiene todos los tipos de consulta como Flow
     */
    @Query("SELECT * FROM tipos_consulta ORDER BY nombre ASC")
    fun getAllFlow(): Flow<List<TipoConsultaEntity>>

    /**
     * Obtiene todos los tipos de consulta
     */
    @Query("SELECT * FROM tipos_consulta ORDER BY nombre ASC")
    suspend fun getAll(): List<TipoConsultaEntity>

    /**
     * Obtiene un tipo de consulta por ID
     */
    @Query("SELECT * FROM tipos_consulta WHERE id = :id LIMIT 1")
    suspend fun getById(id: String): TipoConsultaEntity?

    /**
     * Inserta o reemplaza tipos de consulta
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrReplaceAll(tipos: List<TipoConsultaEntity>)

    /**
     * Elimina todos los tipos de consulta
     */
    @Query("DELETE FROM tipos_consulta")
    suspend fun deleteAll()
}

