package com.example.enutritrack_app.data.local.dao

import androidx.room.*
import com.example.enutritrack_app.data.local.database.SyncStatus
import com.example.enutritrack_app.data.local.entities.ProfileEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface ProfileDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(profile: ProfileEntity)
    
    @Update
    suspend fun update(profile: ProfileEntity)
    
    @Delete
    suspend fun delete(profile: ProfileEntity)
    
    @Query("SELECT * FROM perfil WHERE id = :id")
    suspend fun getById(id: String): ProfileEntity?
    
    @Query("SELECT * FROM perfil WHERE cuenta_id = :cuentaId")
    fun getByCuentaIdFlow(cuentaId: String): Flow<ProfileEntity?>
    
    @Query("SELECT * FROM perfil WHERE cuenta_id = :cuentaId")
    suspend fun getByCuentaId(cuentaId: String): ProfileEntity?
    
    @Query("SELECT * FROM perfil WHERE syncStatus != 'SYNCED' ORDER BY updatedAt ASC")
    suspend fun getPendingSync(): List<ProfileEntity>
    
    @Query("SELECT * FROM perfil")
    suspend fun getAll(): List<ProfileEntity>
    
    @Query("DELETE FROM perfil WHERE cuenta_id = :cuentaId")
    suspend fun deleteByCuentaId(cuentaId: String)
}

