package com.example.enutritrack_app.data.local.dao

import androidx.room.*
import com.example.enutritrack_app.data.local.entities.UserEntity
import kotlinx.coroutines.flow.Flow

/**
 * Data Access Object para operaciones con UserEntity
 */
@Dao
interface UserDao {
    
    /**
     * Obtiene el usuario por ID
     */
    @Query("SELECT * FROM usuario WHERE id = :id LIMIT 1")
    suspend fun getUserById(id: String): UserEntity?
    
    /**
     * Obtiene el usuario por ID como Flow para observación reactiva
     */
    @Query("SELECT * FROM usuario WHERE id = :id LIMIT 1")
    fun getUserByIdFlow(id: String): Flow<UserEntity?>
    
    /**
     * Inserta o actualiza un usuario (REPLACE strategy)
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(user: UserEntity)
    
    /**
     * Elimina un usuario por ID
     */
    @Query("DELETE FROM usuario WHERE id = :id")
    suspend fun deleteById(id: String)
    
    /**
     * Elimina todos los usuarios (útil para logout)
     */
    @Query("DELETE FROM usuario")
    suspend fun deleteAll()
    
    /**
     * Verifica si existe un usuario
     */
    @Query("SELECT EXISTS(SELECT 1 FROM usuario WHERE id = :id)")
    suspend fun exists(id: String): Boolean
}

