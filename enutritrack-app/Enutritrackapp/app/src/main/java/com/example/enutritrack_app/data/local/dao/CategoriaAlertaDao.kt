package com.example.enutritrack_app.data.local.dao

import androidx.room.*
import com.example.enutritrack_app.data.local.entities.CategoriaAlertaEntity
import kotlinx.coroutines.flow.Flow

/**
 * Data Access Object para operaciones con CategoriaAlertaEntity
 */
@Dao
interface CategoriaAlertaDao {

    @Query("SELECT * FROM categorias_alerta ORDER BY nombre ASC")
    fun getAllFlow(): Flow<List<CategoriaAlertaEntity>>

    @Query("SELECT * FROM categorias_alerta ORDER BY nombre ASC")
    suspend fun getAll(): List<CategoriaAlertaEntity>

    @Query("SELECT * FROM categorias_alerta WHERE id = :id LIMIT 1")
    suspend fun getById(id: String): CategoriaAlertaEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrReplaceAll(categorias: List<CategoriaAlertaEntity>)

    @Query("DELETE FROM categorias_alerta")
    suspend fun deleteAll()
}

