package com.example.enutritrack_app.data.local.dao

import androidx.room.*
import com.example.enutritrack_app.data.local.database.SyncStatus
import com.example.enutritrack_app.data.local.entities.AlergiaEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface AlergiaDao {
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(alergia: AlergiaEntity)
    
    @Update
    suspend fun update(alergia: AlergiaEntity)
    
    @Delete
    suspend fun delete(alergia: AlergiaEntity)
    
    @Query("SELECT * FROM alergias WHERE id = :id")
    suspend fun getById(id: String): AlergiaEntity?
    
    @Query("SELECT * FROM alergias WHERE usuario_id = :usuarioId ORDER BY nombre ASC")
    fun getByUsuarioFlow(usuarioId: String): Flow<List<AlergiaEntity>>
    
    @Query("SELECT * FROM alergias WHERE usuario_id = :usuarioId ORDER BY nombre ASC")
    suspend fun getByUsuario(usuarioId: String): List<AlergiaEntity>
    
    @Query("SELECT * FROM alergias WHERE usuario_id = :usuarioId AND activa = 1 ORDER BY nombre ASC")
    fun getActivasByUsuarioFlow(usuarioId: String): Flow<List<AlergiaEntity>>
    
    @Query("SELECT * FROM alergias WHERE usuario_id = :usuarioId AND activa = 1 ORDER BY nombre ASC")
    suspend fun getActivasByUsuario(usuarioId: String): List<AlergiaEntity>
    
    @Query("SELECT * FROM alergias WHERE syncStatus != 'SYNCED' ORDER BY createdAt ASC")
    suspend fun getPendingSync(): List<AlergiaEntity>
    
    @Query("DELETE FROM alergias WHERE usuario_id = :usuarioId")
    suspend fun deleteByUsuario(usuarioId: String)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrReplaceAll(entities: List<AlergiaEntity>)
}

