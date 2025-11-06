package com.example.enutritrack_app.data.local.repositories

import android.content.Context
import com.example.enutritrack_app.data.local.SecurityManager
import com.example.enutritrack_app.data.local.dao.UserDao
import com.example.enutritrack_app.data.local.entities.UserEntity
import kotlinx.coroutines.flow.Flow

/**
 * Repositorio local para operaciones con UserEntity
 */
class UserLocalRepository(
    private val userDao: UserDao,
    private val context: Context
) {
    
    private val securityManager = SecurityManager(context)
    
    /**
     * Obtiene el usuario actual desde la base de datos local
     */
    suspend fun getCurrentUser(): UserEntity? {
        val userId = securityManager.getUserId()
        return userId?.let { userDao.getUserById(it) }
    }
    
    /**
     * Obtiene un usuario por ID
     */
    suspend fun getUserById(id: String): UserEntity? {
        return userDao.getUserById(id)
    }
    
    /**
     * Obtiene un usuario por ID como Flow
     */
    fun getUserByIdFlow(id: String): Flow<UserEntity?> {
        return userDao.getUserByIdFlow(id)
    }
    
    /**
     * Guarda o actualiza un usuario en la base de datos local
     */
    suspend fun saveUser(user: UserEntity) {
        userDao.insertOrUpdate(user)
    }
    
    /**
     * Elimina un usuario por ID
     */
    suspend fun deleteUser(id: String) {
        userDao.deleteById(id)
    }
    
    /**
     * Elimina todos los usuarios (útil para logout)
     */
    suspend fun deleteAll() {
        userDao.deleteAll()
    }
    
    /**
     * Verifica si existe un usuario
     */
    suspend fun userExists(id: String): Boolean {
        return userDao.exists(id)
    }
}

