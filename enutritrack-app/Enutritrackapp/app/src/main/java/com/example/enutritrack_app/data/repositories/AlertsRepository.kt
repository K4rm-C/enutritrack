package com.example.enutritrack_app.data.repositories

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.util.Log
import com.example.enutritrack_app.data.local.dao.*
import com.example.enutritrack_app.data.local.entities.*
import com.example.enutritrack_app.data.local.mappers.*
import com.example.enutritrack_app.data.remote.api.AlertsApiService
import com.example.enutritrack_app.di.NetworkModule
import kotlinx.coroutines.flow.Flow

/**
 * Repositorio para operaciones con alertas
 * Solo lectura - las alertas son creadas por el doctor o automáticamente
 */
class AlertsRepository(
    private val context: Context,
    private val alertaDao: AlertaDao,
    private val tipoAlertaDao: TipoAlertaDao,
    private val categoriaAlertaDao: CategoriaAlertaDao,
    private val nivelPrioridadAlertaDao: NivelPrioridadAlertaDao,
    private val estadoAlertaDao: EstadoAlertaDao
) {
    
    private val alertsApiService: AlertsApiService = NetworkModule.createAlertsApiService(context)
    
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
    
    // ========== OPERACIONES LOCALES ==========
    
    /**
     * Obtiene todas las alertas de un usuario como Flow
     */
    fun getAlertasByUsuarioFlow(usuarioId: String): Flow<List<AlertaEntity>> {
        return alertaDao.getByUsuarioIdFlow(usuarioId)
    }
    
    /**
     * Obtiene todas las alertas de un usuario
     */
    suspend fun getAlertasByUsuario(usuarioId: String): List<AlertaEntity> {
        return alertaDao.getByUsuarioId(usuarioId)
    }
    
    /**
     * Obtiene alertas activas (no resueltas) de un usuario
     */
    suspend fun getAlertasActivasByUsuario(usuarioId: String): List<AlertaEntity> {
        return alertaDao.getActivasByUsuarioId(usuarioId)
    }
    
    /**
     * Obtiene una alerta por ID
     */
    suspend fun getAlertaById(id: String): AlertaEntity? {
        return alertaDao.getById(id)
    }
    
    /**
     * Obtiene tipos de alerta como Flow
     */
    fun getTiposAlertaFlow(): Flow<List<TipoAlertaEntity>> {
        return tipoAlertaDao.getAllFlow()
    }
    
    /**
     * Obtiene categorías de alerta como Flow
     */
    fun getCategoriasAlertaFlow(): Flow<List<CategoriaAlertaEntity>> {
        return categoriaAlertaDao.getAllFlow()
    }
    
    /**
     * Obtiene niveles de prioridad como Flow
     */
    fun getNivelesPrioridadFlow(): Flow<List<NivelPrioridadAlertaEntity>> {
        return nivelPrioridadAlertaDao.getAllFlow()
    }
    
    /**
     * Obtiene estados de alerta como Flow
     */
    fun getEstadosAlertaFlow(): Flow<List<EstadoAlertaEntity>> {
        return estadoAlertaDao.getAllFlow()
    }
    
    // ========== SINCRONIZACIÓN ==========
    
    /**
     * Sincroniza alertas desde el servidor
     */
    suspend fun syncAlertasFromServer(usuarioId: String): Result<List<AlertaEntity>> {
        return try {
            if (!isOnline()) {
                return Result.failure(Exception("No hay conexión a internet"))
            }
            
            val response = alertsApiService.getAlertsByUser(usuarioId)
            
            if (response.isSuccessful && response.body() != null) {
                val serverAlertas = response.body()!!
                val entities = serverAlertas.map { it.toEntity() }
                
                // Eliminar alertas antiguas del usuario y guardar las nuevas
                alertaDao.deleteByUsuarioId(usuarioId)
                if (entities.isNotEmpty()) {
                    alertaDao.insertOrReplaceAll(entities)
                }
                
                Log.d("AlertsRepository", "Sincronizadas ${entities.size} alertas desde servidor")
                Result.success(entities)
            } else {
                Log.w("AlertsRepository", "Error sincronizando alertas: ${response.code()}")
                Result.failure(Exception("Error ${response.code()}: ${response.message()}"))
            }
        } catch (e: Exception) {
            Log.e("AlertsRepository", "Error sincronizando alertas desde servidor", e)
            Result.failure(e)
        }
    }
    
    /**
     * Sincroniza catálogos de alertas desde el servidor
     */
    suspend fun syncTiposAlertaFromServer(): Result<List<TipoAlertaEntity>> {
        return try {
            if (!isOnline()) {
                return Result.failure(Exception("No hay conexión a internet"))
            }
            
            val response = alertsApiService.getTiposAlerta()
            
            if (response.isSuccessful && response.body() != null) {
                val serverTipos = response.body()!!
                val entities = serverTipos.map { it.toEntity() }
                
                tipoAlertaDao.deleteAll()
                if (entities.isNotEmpty()) {
                    tipoAlertaDao.insertOrReplaceAll(entities)
                }
                
                Log.d("AlertsRepository", "Sincronizados ${entities.size} tipos de alerta desde servidor")
                Result.success(entities)
            } else {
                Result.failure(Exception("Error ${response.code()}: ${response.message()}"))
            }
        } catch (e: Exception) {
            Log.e("AlertsRepository", "Error sincronizando tipos de alerta", e)
            Result.failure(e)
        }
    }
    
    suspend fun syncCategoriasAlertaFromServer(): Result<List<CategoriaAlertaEntity>> {
        return try {
            if (!isOnline()) {
                return Result.failure(Exception("No hay conexión a internet"))
            }
            
            val response = alertsApiService.getCategoriasAlerta()
            
            if (response.isSuccessful && response.body() != null) {
                val serverCategorias = response.body()!!
                val entities = serverCategorias.map { it.toEntity() }
                
                categoriaAlertaDao.deleteAll()
                if (entities.isNotEmpty()) {
                    categoriaAlertaDao.insertOrReplaceAll(entities)
                }
                
                Log.d("AlertsRepository", "Sincronizadas ${entities.size} categorías de alerta desde servidor")
                Result.success(entities)
            } else {
                Result.failure(Exception("Error ${response.code()}: ${response.message()}"))
            }
        } catch (e: Exception) {
            Log.e("AlertsRepository", "Error sincronizando categorías de alerta", e)
            Result.failure(e)
        }
    }
    
    suspend fun syncNivelesPrioridadFromServer(): Result<List<NivelPrioridadAlertaEntity>> {
        return try {
            if (!isOnline()) {
                return Result.failure(Exception("No hay conexión a internet"))
            }
            
            val response = alertsApiService.getNivelesPrioridadAlerta()
            
            if (response.isSuccessful && response.body() != null) {
                val serverNiveles = response.body()!!
                val entities = serverNiveles.map { it.toEntity() }
                
                nivelPrioridadAlertaDao.deleteAll()
                if (entities.isNotEmpty()) {
                    nivelPrioridadAlertaDao.insertOrReplaceAll(entities)
                }
                
                Log.d("AlertsRepository", "Sincronizados ${entities.size} niveles de prioridad desde servidor")
                Result.success(entities)
            } else {
                Result.failure(Exception("Error ${response.code()}: ${response.message()}"))
            }
        } catch (e: Exception) {
            Log.e("AlertsRepository", "Error sincronizando niveles de prioridad", e)
            Result.failure(e)
        }
    }
    
    suspend fun syncEstadosAlertaFromServer(): Result<List<EstadoAlertaEntity>> {
        return try {
            if (!isOnline()) {
                return Result.failure(Exception("No hay conexión a internet"))
            }
            
            val response = alertsApiService.getEstadosAlerta()
            
            if (response.isSuccessful && response.body() != null) {
                val serverEstados = response.body()!!
                val entities = serverEstados.map { it.toEntity() }
                
                estadoAlertaDao.deleteAll()
                if (entities.isNotEmpty()) {
                    estadoAlertaDao.insertOrReplaceAll(entities)
                }
                
                Log.d("AlertsRepository", "Sincronizados ${entities.size} estados de alerta desde servidor")
                Result.success(entities)
            } else {
                Result.failure(Exception("Error ${response.code()}: ${response.message()}"))
            }
        } catch (e: Exception) {
            Log.e("AlertsRepository", "Error sincronizando estados de alerta", e)
            Result.failure(e)
        }
    }
}

