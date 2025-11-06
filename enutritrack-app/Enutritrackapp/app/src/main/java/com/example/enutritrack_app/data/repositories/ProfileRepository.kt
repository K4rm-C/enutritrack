package com.example.enutritrack_app.data.repositories

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.util.Log
import com.example.enutritrack_app.data.local.dao.ProfileDao
import com.example.enutritrack_app.data.local.database.SyncStatus
import com.example.enutritrack_app.data.local.entities.ProfileEntity
import com.example.enutritrack_app.data.local.mappers.toProfileEntity
import com.example.enutritrack_app.data.local.mappers.toUpdateProfileRequest
import com.example.enutritrack_app.data.local.mappers.toUpdateAccountRequest
import com.example.enutritrack_app.data.local.repositories.UserLocalRepository
import com.example.enutritrack_app.data.remote.api.ProfileApiService
import com.example.enutritrack_app.data.remote.dto.UpdateAccountRequest
import com.example.enutritrack_app.di.NetworkModule
import kotlinx.coroutines.flow.Flow

/**
 * Repositorio para operaciones de perfil de usuario
 * 
 * Estrategia offline-first:
 * 1. Leer primero desde Room
 * 2. Sincronizar desde servidor en segundo plano
 * 3. Guardar cambios localmente primero, luego sincronizar
 */
class ProfileRepository(
    private val context: Context,
    private val profileDao: ProfileDao,
    private val userLocalRepository: UserLocalRepository
) {
    
    // Servicios API: uno para users/ (microservicio) y otro para cuentas/doctors/ (servidor principal)
    private val profileApiServiceForUsers: ProfileApiService = NetworkModule.createProfileApiServiceForUsers(context)
    private val profileApiServiceForServer: ProfileApiService = NetworkModule.createProfileApiServiceForServer(context)
    
    /**
     * Verifica si hay conexión a internet
     */
    private fun isOnline(): Boolean {
        val cm = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = cm.activeNetwork ?: return false
        val capabilities = cm.getNetworkCapabilities(network) ?: return false
        return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) &&
               capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED)
    }
    
    /**
     * Obtiene el perfil del usuario actual desde Room (Flow)
     */
    fun getProfile(cuentaId: String): Flow<ProfileEntity?> {
        return profileDao.getByCuentaIdFlow(cuentaId)
    }
    
    /**
     * Obtiene el perfil por usuario_id y retorna cuenta_id
     * Útil cuando cuenta_id no está disponible localmente
     */
    suspend fun getCuentaIdFromUserId(usuarioId: String): String? {
        return try {
            if (!isOnline()) {
                return null
            }
            
            // El endpoint GET /users/:id también está en el servidor principal
            val response = profileApiServiceForServer.getProfileByUserId(usuarioId)
            if (response.isSuccessful && response.body() != null) {
                response.body()!!.cuentaId
            } else {
                null
            }
        } catch (e: Exception) {
            Log.e("ProfileRepository", "Error obteniendo cuenta_id desde usuario_id", e)
            null
        }
    }
    
    /**
     * Actualiza el perfil de usuario
     */
    suspend fun updateProfile(
        cuentaId: String,
        nombre: String? = null,
        altura: Double? = null,
        telefono: String? = null,
        telefono1: String? = null,
        telefono2: String? = null
    ): Result<ProfileEntity> {
        return try {
            val existing = profileDao.getByCuentaId(cuentaId)
                ?: return Result.failure(Exception("Perfil no encontrado localmente"))
            
            val updated = existing.copy(
                nombre = nombre ?: existing.nombre,
                altura = altura ?: existing.altura,
                telefono = telefono ?: existing.telefono,
                telefono_1 = telefono1 ?: existing.telefono_1,
                telefono_2 = telefono2 ?: existing.telefono_2,
                syncStatus = if (existing.syncStatus == SyncStatus.SYNCED) SyncStatus.PENDING_UPDATE else existing.syncStatus,
                updatedAt = System.currentTimeMillis()
            )
            
            profileDao.update(updated)
            
            // Intentar sincronizar si hay conexión
            if (isOnline()) {
                syncProfileUpdate(updated)
            }
            
            Result.success(updated)
        } catch (e: Exception) {
            Log.e("ProfileRepository", "Error al actualizar perfil", e)
            Result.failure(e)
        }
    }
    
    /**
     * Actualiza los datos de cuenta (emails, contraseña)
     */
    suspend fun updateAccount(
        cuentaId: String,
        email: String? = null,
        email1: String? = null,
        email2: String? = null,
        password: String? = null
    ): Result<Unit> {
        return try {
            val existing = profileDao.getByCuentaId(cuentaId)
                ?: return Result.failure(Exception("Perfil no encontrado localmente"))
            
            val updated = existing.copy(
                email = email ?: existing.email,
                email_1 = email1 ?: existing.email_1,
                email_2 = email2 ?: existing.email_2,
                syncStatus = if (existing.syncStatus == SyncStatus.SYNCED) SyncStatus.PENDING_UPDATE else existing.syncStatus,
                updatedAt = System.currentTimeMillis()
            )
            
            profileDao.update(updated)
            
            // Intentar sincronizar si hay conexión
            if (isOnline()) {
                syncAccountUpdate(cuentaId, updated, password)
            }
            
            Result.success(Unit)
        } catch (e: Exception) {
            Log.e("ProfileRepository", "Error al actualizar cuenta", e)
            Result.failure(e)
        }
    }
    
    /**
     * Sincroniza el perfil desde el servidor
     */
    suspend fun syncFromServer(cuentaId: String): Result<Unit> {
        return try {
            if (!isOnline()) {
                return Result.failure(Exception("No hay conexión a internet"))
            }
            
            // Obtener perfil desde el servidor principal (el endpoint está ahí, no en microservicio)
            val response = profileApiServiceForServer.getProfileByCuentaId(cuentaId)
            
            if (response.isSuccessful && response.body() != null) {
                val profileResponse = response.body()!!
                val entity = toProfileEntity(profileResponse, SyncStatus.SYNCED)
                profileDao.insert(entity)
                Log.d("ProfileRepository", "Perfil sincronizado desde servidor")
                Result.success(Unit)
            } else {
                Log.w("ProfileRepository", "Error sincronizando perfil: ${response.code()}, ${response.message()}")
                Result.failure(Exception("Error ${response.code()}: ${response.message()}"))
            }
        } catch (e: Exception) {
            Log.e("ProfileRepository", "Error sincronizando perfil desde servidor", e)
            Result.failure(e)
        }
    }
    
    /**
     * Sincroniza una actualización de perfil con el servidor
     */
    private suspend fun syncProfileUpdate(entity: ProfileEntity) {
        try {
            val request = entity.toUpdateProfileRequest()
            // El endpoint PATCH /users/:id está en el servidor principal
            val response = profileApiServiceForServer.updateProfile(entity.id, request)  // entity.id es perfil_usuario.id
            
            if (response.isSuccessful) {
                val updated = entity.copy(
                    syncStatus = SyncStatus.SYNCED,
                    updatedAt = System.currentTimeMillis()
                )
                profileDao.update(updated)
                Log.d("ProfileRepository", "Perfil actualizado en servidor")
            } else {
                handleSyncFailure(entity, "Error ${response.code()}: ${response.message()}")
            }
        } catch (e: Exception) {
            handleSyncFailure(entity, e.message ?: "Error desconocido")
        }
    }
    
    /**
     * Sincroniza una actualización de cuenta con el servidor
     */
    private suspend fun syncAccountUpdate(cuentaId: String, entity: ProfileEntity, password: String?) {
        try {
            val request = entity.toUpdateAccountRequest().copy(password = password)
            val response = profileApiServiceForServer.updateAccount(cuentaId, request)
            
            if (response.isSuccessful && response.body() != null) {
                val cuentaResponse = response.body()!!
                val updated = entity.copy(
                    email = cuentaResponse.email,
                    email_1 = cuentaResponse.email1,
                    email_2 = cuentaResponse.email2,
                    syncStatus = SyncStatus.SYNCED,
                    updatedAt = System.currentTimeMillis()
                )
                profileDao.update(updated)
                Log.d("ProfileRepository", "Cuenta actualizada en servidor")
            } else {
                handleSyncFailure(entity, "Error ${response.code()}: ${response.message()}")
            }
        } catch (e: Exception) {
            handleSyncFailure(entity, e.message ?: "Error desconocido")
        }
    }
    
    /**
     * Maneja errores de sincronización
     */
    private suspend fun handleSyncFailure(entity: ProfileEntity, error: String) {
        val updated = entity.copy(
            retryCount = entity.retryCount + 1,
            lastSyncAttempt = System.currentTimeMillis()
        )
        profileDao.update(updated)
        Log.w("ProfileRepository", "Error sincronizando perfil: $error. Retry count: ${updated.retryCount}")
    }
    
}

