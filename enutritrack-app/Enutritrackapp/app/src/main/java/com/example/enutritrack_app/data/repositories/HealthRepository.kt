package com.example.enutritrack_app.data.repositories

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.util.Log
import com.example.enutritrack_app.data.local.dao.*
import com.example.enutritrack_app.data.local.database.SyncStatus
import com.example.enutritrack_app.data.local.entities.*
import com.example.enutritrack_app.data.local.mappers.*
import com.example.enutritrack_app.data.remote.dto.MedicamentoResponse
import com.example.enutritrack_app.data.local.repositories.UserLocalRepository
import com.example.enutritrack_app.data.remote.api.HealthApiService
import com.example.enutritrack_app.data.remote.api.MedicalHistoryApiService
import com.example.enutritrack_app.data.remote.dto.CreateHistorialPesoRequest
import com.example.enutritrack_app.di.NetworkModule
import com.google.gson.Gson
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import java.util.*

/**
 * Repositorio que combina operaciones locales (Room) y remotas (API)
 * para el módulo de salud
 * 
 * Estrategia offline-first:
 * 1. Escribir primero en Room
 * 2. Marcar como PENDING si no hay conexión
 * 3. Sincronizar automáticamente cuando hay conexión
 */
class HealthRepository(
    private val context: Context,
    private val historialPesoDao: HistorialPesoDao,
    private val objetivoUsuarioDao: ObjetivoUsuarioDao,
    private val medicalHistoryDao: MedicalHistoryDao,
    private val medicamentoDao: MedicamentoDao,
    private val alergiaDao: AlergiaDao,
    private val actividadFisicaDao: ActividadFisicaDao,
    private val tipoActividadDao: TipoActividadDao,
    private val userLocalRepository: UserLocalRepository
) {
    
    private val healthApiService: HealthApiService = NetworkModule.createHealthApiService(context)
    private val medicalHistoryApiService: MedicalHistoryApiService = NetworkModule.createMedicalHistoryApiService(context)
    private val gson = Gson()
    
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
     * Agrega un nuevo registro de peso
     * 
     * Estrategia: Guardar en Room primero, luego sincronizar si hay conexión
     */
    suspend fun addWeight(
        usuarioId: String,
        peso: Double,
        fecha: Date,
        notas: String? = null
    ): Result<HistorialPesoEntity> {
        return try {
            // 1. Verificar que el usuario existe localmente
            val userExists = userLocalRepository.userExists(usuarioId)
            if (!userExists) {
                Log.w("HealthRepository", "Usuario $usuarioId no existe localmente")
                // Podríamos fallar o continuar con validación posterior
            }
            
            // 2. Crear entidad local
            val entity = HistorialPesoEntity(
                id = UUID.randomUUID().toString(),
                usuario_id = usuarioId,
                peso = peso,
                fecha_registro = fecha.time,
                notas = notas,
                syncStatus = if (isOnline()) SyncStatus.PENDING_CREATE else SyncStatus.PENDING_CREATE,
                createdAt = System.currentTimeMillis(),
                updatedAt = System.currentTimeMillis()
            )
            
            // 3. Guardar en Room
            historialPesoDao.insert(entity)
            Log.d("HealthRepository", "Registro de peso guardado localmente: ${entity.id}")
            
            // 4. Intentar sincronizar si hay conexión
            if (isOnline()) {
                syncSingleWeightRecord(entity)
            } else {
                Log.d("HealthRepository", "Sin conexión, registro marcado como PENDING_CREATE")
            }
            
            Result.success(entity)
        } catch (e: Exception) {
            Log.e("HealthRepository", "Error al agregar registro de peso", e)
            Result.failure(e)
        }
    }
    
    /**
     * Obtiene el historial de peso de un usuario desde Room
     */
    fun getWeightHistory(usuarioId: String): Flow<List<HistorialPesoEntity>> {
        return historialPesoDao.getByUsuarioFlow(usuarioId)
    }
    
    /**
     * Obtiene el último registro de peso de un usuario
     */
    fun getLastWeight(usuarioId: String): Flow<HistorialPesoEntity?> {
        return historialPesoDao.getLastFlow(usuarioId)
    }
    
    /**
     * Obtiene registros de peso por rango de fechas
     */
    suspend fun getWeightByRange(
        usuarioId: String,
        startDate: Date,
        endDate: Date
    ): List<HistorialPesoEntity> {
        return historialPesoDao.getByRange(usuarioId, startDate.time, endDate.time)
    }
    
    /**
     * Sincroniza un registro individual de peso con el servidor
     */
    private suspend fun syncSingleWeightRecord(entity: HistorialPesoEntity) {
        try {
            when (entity.syncStatus) {
                SyncStatus.PENDING_CREATE -> {
                    val request = entity.toRequest()
                    val response = healthApiService.createWeightRecord(request)
                    
                    if (response.isSuccessful && response.body() != null) {
                        val serverEntity = response.body()!!.toEntity(
                            syncStatus = SyncStatus.SYNCED,
                            serverId = response.body()!!.id
                        )
                        // Actualizar con el ID del servidor
                        val updated = entity.copy(
                            serverId = serverEntity.serverId,
                            syncStatus = SyncStatus.SYNCED,
                            id = serverEntity.serverId ?: entity.id,
                            updatedAt = System.currentTimeMillis()
                        )
                        historialPesoDao.update(updated)
                        Log.d("HealthRepository", "Registro sincronizado: ${updated.id}")
                    } else {
                        handleSyncFailure(entity, "Error ${response.code()}: ${response.message()}")
                    }
                }
                SyncStatus.PENDING_UPDATE -> {
                    // TODO: Implementar actualización
                }
                SyncStatus.PENDING_DELETE -> {
                    // TODO: Implementar borrado
                }
                else -> {
                    // Ya sincronizado o sin cambios
                }
            }
        } catch (e: Exception) {
            Log.e("HealthRepository", "Error sincronizando registro ${entity.id}", e)
            handleSyncFailure(entity, e.message ?: "Error desconocido")
        }
    }
    
    /**
     * Maneja fallos en sincronización
     */
    private suspend fun handleSyncFailure(entity: HistorialPesoEntity, errorMessage: String) {
        val maxRetries = 3
        val updated = entity.copy(
            retryCount = entity.retryCount + 1,
            lastSyncAttempt = System.currentTimeMillis(),
            syncStatus = if (entity.retryCount >= maxRetries) {
                SyncStatus.FAILED
            } else {
                entity.syncStatus  // Mantener estado pendiente para reintentar
            }
        )
        historialPesoDao.update(updated)
        Log.w("HealthRepository", "Fallo sincronización registro ${entity.id}: $errorMessage (intentos: ${updated.retryCount})")
    }
    
    /**
     * Sincroniza todos los registros pendientes (peso y objetivos)
     */
    suspend fun syncAllPending() {
        val pendingWeights = historialPesoDao.getPendingSync()
        Log.d("HealthRepository", "Sincronizando ${pendingWeights.size} registros de peso pendientes")
        pendingWeights.forEach { entity ->
            syncSingleWeightRecord(entity)
        }
        
        syncAllPendingObjectives()
    }
    
    /**
     * Carga el historial completo desde el servidor y actualiza Room
     * 
     * Retorna Result.failure solo para errores críticos, no para 404
     */
    suspend fun syncFromServer(usuarioId: String): Result<Unit> {
        return try {
            if (!isOnline()) {
                return Result.failure(Exception("No hay conexión a internet"))
            }
            
            val response = healthApiService.getWeightHistory(usuarioId)
            if (response.isSuccessful && response.body() != null) {
                val serverRecords = response.body()!!
                
                // Obtener registros locales existentes para comparar
                val localRecords = historialPesoDao.getByUsuario(usuarioId)
                
                // Sincronizar registros del servidor
                serverRecords.forEach { serverRecord ->
                    val entity = serverRecord.toEntity(syncStatus = SyncStatus.SYNCED)
                    
                    // Buscar registro local existente por serverId o por ID del servidor
                    val existingByServerId = localRecords.firstOrNull { 
                        it.serverId == entity.serverId || (it.serverId == null && it.id == entity.id)
                    }
                    
                    if (existingByServerId != null) {
                        // Actualizar solo si el registro del servidor es más reciente o igual
                        if (entity.fecha_registro >= existingByServerId.fecha_registro) {
                            // Actualizar el registro existente manteniendo su ID local
                            val updated = existingByServerId.copy(
                                peso = entity.peso,
                                fecha_registro = entity.fecha_registro, // Usar fecha del servidor (mejor parseada)
                                notas = entity.notas,
                                syncStatus = SyncStatus.SYNCED,
                                serverId = entity.serverId // Actualizar serverId si es necesario
                            )
                            historialPesoDao.update(updated)
                            Log.d("HealthRepository", "Actualizado registro: ${updated.id}, peso: ${updated.peso}, fecha: ${updated.fecha_registro}")
                        } else {
                            Log.d("HealthRepository", "Preservando registro local más reciente: ${existingByServerId.id}, peso: ${existingByServerId.peso}, fecha: ${existingByServerId.fecha_registro}")
                        }
                    } else {
                        // No existe, insertar nuevo (usando REPLACE strategy para evitar duplicados)
                        historialPesoDao.insert(entity)
                        Log.d("HealthRepository", "Insertado nuevo registro: ${entity.id}, peso: ${entity.peso}, fecha: ${entity.fecha_registro}")
                    }
                }
                
                // Verificar el último registro después de la sincronización
                val lastRecord = historialPesoDao.getLast(usuarioId)
                Log.d("HealthRepository", "Último registro después de sync: ${lastRecord?.id}, peso: ${lastRecord?.peso}, fecha: ${lastRecord?.fecha_registro}")
                
                Log.d("HealthRepository", "Sincronizados ${serverRecords.size} registros desde servidor")
                Result.success(Unit)
            } else if (response.code() == 404) {
                // 404 no es un error crítico, puede ser que el usuario no tenga datos aún
                Log.d("HealthRepository", "No hay datos de peso en el servidor (404)")
                Result.success(Unit)  // Retornar success para no bloquear la UI
            } else {
                Log.w("HealthRepository", "Error ${response.code()}: ${response.message()}")
                Result.failure(Exception("Error ${response.code()}: ${response.message()}"))
            }
        } catch (e: Exception) {
            Log.e("HealthRepository", "Error sincronizando desde servidor", e)
            Result.failure(e)
        }
    }
    
    // ========== MÉTODOS PARA OBJETIVOS DE USUARIO ==========
    
    /**
     * Establece un nuevo objetivo de usuario
     * 
     * Estrategia:
     * 1. Desactiva objetivos anteriores vigentes
     * 2. Crea nuevo objetivo localmente
     * 3. Sincroniza si hay conexión
     */
    suspend fun setObjective(
        usuarioId: String,
        pesoObjetivo: Double?,
        nivelActividad: ActivityLevel
    ): Result<ObjetivoUsuarioEntity> {
        return try {
            // 1. Verificar que el usuario existe localmente
            val userExists = userLocalRepository.userExists(usuarioId)
            if (!userExists) {
                Log.w("HealthRepository", "Usuario $usuarioId no existe localmente")
            }
            
            // 2. Desactivar objetivos anteriores vigentes
            objetivoUsuarioDao.desactivarVigentes(usuarioId)
            
            // 3. Crear nuevo objetivo
            val entity = ObjetivoUsuarioEntity(
                id = java.util.UUID.randomUUID().toString(),
                usuario_id = usuarioId,
                peso_objetivo = pesoObjetivo,
                nivel_actividad = nivelActividad.toApiString(),
                fecha_establecido = System.currentTimeMillis(),
                vigente = true,
                syncStatus = if (isOnline()) SyncStatus.PENDING_CREATE else SyncStatus.PENDING_CREATE,
                createdAt = System.currentTimeMillis(),
                updatedAt = System.currentTimeMillis()
            )
            
            // 4. Guardar en Room
            objetivoUsuarioDao.insert(entity)
            Log.d("HealthRepository", "Objetivo guardado localmente: ${entity.id}")
            
            // 5. Intentar sincronizar si hay conexión
            if (isOnline()) {
                syncSingleObjective(entity)
            } else {
                Log.d("HealthRepository", "Sin conexión, objetivo marcado como PENDING_CREATE")
            }
            
            Result.success(entity)
        } catch (e: Exception) {
            Log.e("HealthRepository", "Error al establecer objetivo", e)
            Result.failure(e)
        }
    }
    
    /**
     * Obtiene el objetivo vigente de un usuario desde Room
     */
    fun getCurrentObjective(usuarioId: String): Flow<ObjetivoUsuarioEntity?> {
        return objetivoUsuarioDao.getVigenteFlow(usuarioId)
    }
    
    /**
     * Obtiene todos los objetivos de un usuario
     */
    fun getAllObjectives(usuarioId: String): Flow<List<ObjetivoUsuarioEntity>> {
        return objetivoUsuarioDao.getByUsuarioFlow(usuarioId)
    }
    
    /**
     * Actualiza un objetivo existente
     */
    suspend fun updateObjective(
        objetivoId: String,
        pesoObjetivo: Double?,
        nivelActividad: ActivityLevel?,
        vigente: Boolean?
    ): Result<ObjetivoUsuarioEntity> {
        return try {
            val existing = objetivoUsuarioDao.getById(objetivoId)
            
            if (existing == null) {
                return Result.failure(Exception("Objetivo no encontrado"))
            }
            
            val updated = existing.copy(
                peso_objetivo = pesoObjetivo ?: existing.peso_objetivo,
                nivel_actividad = nivelActividad?.toApiString() ?: existing.nivel_actividad,
                vigente = vigente ?: existing.vigente,
                syncStatus = if (existing.syncStatus == SyncStatus.SYNCED) {
                    SyncStatus.PENDING_UPDATE
                } else {
                    existing.syncStatus
                },
                updatedAt = System.currentTimeMillis()
            )
            
            objetivoUsuarioDao.update(updated)
            
            if (isOnline()) {
                syncSingleObjective(updated)
            }
            
            Result.success(updated)
        } catch (e: Exception) {
            Log.e("HealthRepository", "Error actualizando objetivo", e)
            Result.failure(e)
        }
    }
    
    /**
     * Sincroniza un objetivo individual con el servidor
     */
    private suspend fun syncSingleObjective(entity: ObjetivoUsuarioEntity) {
        try {
            when (entity.syncStatus) {
                SyncStatus.PENDING_CREATE -> {
                    val request = entity.toRequest()
                    val response = healthApiService.createObjective(request)
                    
                    if (response.isSuccessful && response.body() != null) {
                        val serverEntity = response.body()!!.toEntity(
                            syncStatus = SyncStatus.SYNCED,
                            serverId = response.body()!!.id
                        )
                        val updated = entity.copy(
                            serverId = serverEntity.serverId,
                            syncStatus = SyncStatus.SYNCED,
                            id = serverEntity.serverId ?: entity.id,
                            updatedAt = System.currentTimeMillis()
                        )
                        objetivoUsuarioDao.update(updated)
                        Log.d("HealthRepository", "Objetivo sincronizado: ${updated.id}")
                    } else {
                        handleObjectiveSyncFailure(entity, "Error ${response.code()}: ${response.message()}")
                    }
                }
                SyncStatus.PENDING_UPDATE -> {
                    // TODO: Implementar actualización
                    entity.serverId?.let { serverId ->
                        val request = entity.toRequest()
                        val response = healthApiService.updateObjective(serverId, request)
                        if (response.isSuccessful) {
                            val updated = entity.copy(
                                syncStatus = SyncStatus.SYNCED,
                                updatedAt = System.currentTimeMillis()
                            )
                            objetivoUsuarioDao.update(updated)
                            Log.d("HealthRepository", "Objetivo actualizado: ${updated.id}")
                        } else {
                            handleObjectiveSyncFailure(entity, "Error ${response.code()}: ${response.message()}")
                        }
                    }
                }
                SyncStatus.PENDING_DELETE -> {
                    // TODO: Implementar borrado
                }
                else -> {
                    // Ya sincronizado o sin cambios
                }
            }
        } catch (e: Exception) {
            Log.e("HealthRepository", "Error sincronizando objetivo ${entity.id}", e)
            handleObjectiveSyncFailure(entity, e.message ?: "Error desconocido")
        }
    }
    
    /**
     * Maneja fallos en sincronización de objetivos
     */
    private suspend fun handleObjectiveSyncFailure(entity: ObjetivoUsuarioEntity, errorMessage: String) {
        val maxRetries = 3
        val updated = entity.copy(
            retryCount = entity.retryCount + 1,
            lastSyncAttempt = System.currentTimeMillis(),
            syncStatus = if (entity.retryCount >= maxRetries) {
                SyncStatus.FAILED
            } else {
                entity.syncStatus
            }
        )
        objetivoUsuarioDao.update(updated)
        Log.w("HealthRepository", "Fallo sincronización objetivo ${entity.id}: $errorMessage (intentos: ${updated.retryCount})")
    }
    
    /**
     * Sincroniza todos los objetivos pendientes
     */
    suspend fun syncAllPendingObjectives() {
        val pending = objetivoUsuarioDao.getPendingSync()
        Log.d("HealthRepository", "Sincronizando ${pending.size} objetivos pendientes")
        pending.forEach { entity ->
            syncSingleObjective(entity)
        }
    }
    
    /**
     * Carga objetivos desde el servidor y actualiza Room
     * 
     * Retorna Result.success para 404 (usuario sin objetivos aún)
     */
    suspend fun syncObjectivesFromServer(usuarioId: String): Result<Unit> {
        return try {
            if (!isOnline()) {
                return Result.failure(Exception("No hay conexión a internet"))
            }
            
            val response = healthApiService.getObjectives(usuarioId)
            if (response.isSuccessful && response.body() != null) {
                val serverObjective = response.body()!!
                // El servidor retorna un objeto único (el vigente)
                val entity = serverObjective.toEntity(syncStatus = SyncStatus.SYNCED)
                objetivoUsuarioDao.insert(entity)
                Log.d("HealthRepository", "Sincronizado objetivo desde servidor: ${entity.id}")
                Result.success(Unit)
            } else if (response.code() == 404) {
                Log.d("HealthRepository", "No hay objetivos en el servidor (404)")
                Result.success(Unit)  // No es un error, simplemente no hay datos
            } else {
                Log.w("HealthRepository", "Error sincronizando objetivos: ${response.code()}")
                Result.failure(Exception("Error ${response.code()}: ${response.message()}"))
            }
        } catch (e: Exception) {
            Log.e("HealthRepository", "Error sincronizando objetivos desde servidor", e)
            Result.failure(e)
        }
    }
    
    // ========== MÉTODOS PARA HISTORIAL MÉDICO ==========
    
    /**
     * Obtiene el historial médico de un usuario desde Room
     */
    fun getMedicalHistory(usuarioId: String): Flow<MedicalHistoryEntity?> {
        return medicalHistoryDao.getByUsuarioFlow(usuarioId)
    }
    
    /**
     * Actualiza condiciones médicas del usuario
     */
    suspend fun updateMedicalConditions(
        usuarioId: String,
        condiciones: List<String>
    ): Result<MedicalHistoryEntity> {
        return updateMedicalHistory(usuarioId, MedicalHistoryUpdate(condiciones = condiciones))
    }
    
    /**
     * Actualiza alergias del usuario
     */
    suspend fun updateAllergies(
        usuarioId: String,
        alergias: List<String>
    ): Result<MedicalHistoryEntity> {
        return updateMedicalHistory(usuarioId, MedicalHistoryUpdate(alergias = alergias))
    }
    
    /**
     * Actualiza medicamentos del usuario
     */
    suspend fun updateMedications(
        usuarioId: String,
        medicamentos: List<String>
    ): Result<MedicalHistoryEntity> {
        return updateMedicalHistory(usuarioId, MedicalHistoryUpdate(medicamentos = medicamentos))
    }
    
    /**
     * Actualiza el historial médico completo o parcialmente
     */
    suspend fun updateMedicalHistory(
        usuarioId: String,
        update: MedicalHistoryUpdate
    ): Result<MedicalHistoryEntity> {
        return try {
            // 1. Obtener historial existente o crear nuevo
            var existing = medicalHistoryDao.getByUsuario(usuarioId)
            
            if (existing == null) {
                // Crear nuevo historial
                existing = MedicalHistoryEntity(
                    id = java.util.UUID.randomUUID().toString(),
                    usuario_id = usuarioId,
                    condiciones = update.condiciones?.let { gson.toJson(it) },
                    alergias = update.alergias?.let { gson.toJson(it) },
                    medicamentos = update.medicamentos?.let { gson.toJson(it) },
                    syncStatus = if (isOnline()) SyncStatus.PENDING_CREATE else SyncStatus.PENDING_CREATE,
                    createdAt = System.currentTimeMillis(),
                    updatedAt = System.currentTimeMillis()
                )
                medicalHistoryDao.insert(existing)
                Log.d("HealthRepository", "Nuevo historial médico creado localmente: ${existing.id}")
            } else {
                // Actualizar historial existente
                val updatedCondiciones = update.condiciones?.let { gson.toJson(it) } ?: existing.condiciones
                val updatedAlergias = update.alergias?.let { gson.toJson(it) } ?: existing.alergias
                val updatedMedicamentos = update.medicamentos?.let { gson.toJson(it) } ?: existing.medicamentos
                
                existing = existing.copy(
                    condiciones = updatedCondiciones,
                    alergias = updatedAlergias,
                    medicamentos = updatedMedicamentos,
                    syncStatus = if (existing.syncStatus == SyncStatus.SYNCED) {
                        SyncStatus.PENDING_UPDATE
                    } else {
                        existing.syncStatus
                    },
                    updatedAt = System.currentTimeMillis()
                )
                medicalHistoryDao.update(existing)
                Log.d("HealthRepository", "Historial médico actualizado localmente: ${existing.id}")
            }
            
            // 2. Intentar sincronizar si hay conexión
            if (isOnline()) {
                syncSingleMedicalHistory(existing)
            } else {
                Log.d("HealthRepository", "Sin conexión, historial marcado como pendiente")
            }
            
            Result.success(existing)
        } catch (e: Exception) {
            Log.e("HealthRepository", "Error actualizando historial médico", e)
            Result.failure(e)
        }
    }
    
    /**
     * Sincroniza un historial médico individual con el servidor
     */
    private suspend fun syncSingleMedicalHistory(entity: MedicalHistoryEntity) {
        try {
            when (entity.syncStatus) {
                SyncStatus.PENDING_CREATE -> {
                    val request = entity.toRequest()
                    val response = medicalHistoryApiService.createMedicalHistory(request)
                    
                    if (response.isSuccessful && response.body() != null) {
                        val serverEntity = response.body()!!.toEntity(
                            usuarioId = entity.usuario_id,
                            syncStatus = SyncStatus.SYNCED,
                            serverId = response.body()!!.id
                        )
                        val updated = entity.copy(
                            serverId = serverEntity.serverId,
                            syncStatus = SyncStatus.SYNCED,
                            id = serverEntity.serverId ?: entity.id,
                            updatedAt = System.currentTimeMillis()
                        )
                        medicalHistoryDao.update(updated)
                        Log.d("HealthRepository", "Historial médico sincronizado: ${updated.id}")
                    } else {
                        handleMedicalHistorySyncFailure(entity, "Error ${response.code()}: ${response.message()}")
                    }
                }
                SyncStatus.PENDING_UPDATE -> {
                    val request = entity.toRequest()
                    val response = medicalHistoryApiService.updateMedicalHistory(entity.usuario_id, request)
                    
                    if (response.isSuccessful) {
                        val updated = entity.copy(
                            syncStatus = SyncStatus.SYNCED,
                            updatedAt = System.currentTimeMillis()
                        )
                        medicalHistoryDao.update(updated)
                        Log.d("HealthRepository", "Historial médico actualizado: ${updated.id}")
                    } else {
                        handleMedicalHistorySyncFailure(entity, "Error ${response.code()}: ${response.message()}")
                    }
                }
                else -> {
                    // Ya sincronizado o sin cambios
                }
            }
        } catch (e: Exception) {
            Log.e("HealthRepository", "Error sincronizando historial médico ${entity.id}", e)
            handleMedicalHistorySyncFailure(entity, e.message ?: "Error desconocido")
        }
    }
    
    /**
     * Maneja fallos en sincronización de historial médico
     */
    private suspend fun handleMedicalHistorySyncFailure(entity: MedicalHistoryEntity, errorMessage: String) {
        val maxRetries = 3
        val updated = entity.copy(
            retryCount = entity.retryCount + 1,
            lastSyncAttempt = System.currentTimeMillis(),
            syncStatus = if (entity.retryCount >= maxRetries) {
                SyncStatus.FAILED
            } else {
                entity.syncStatus
            }
        )
        medicalHistoryDao.update(updated)
        Log.w("HealthRepository", "Fallo sincronización historial médico ${entity.id}: $errorMessage (intentos: ${updated.retryCount})")
    }
    
    /**
     * Sincroniza todos los historiales médicos pendientes
     */
    suspend fun syncAllPendingMedicalHistory() {
        val pending = medicalHistoryDao.getPendingSync()
        Log.d("HealthRepository", "Sincronizando ${pending.size} historiales médicos pendientes")
        pending.forEach { entity ->
            syncSingleMedicalHistory(entity)
        }
    }
    
    /**
     * Carga historial médico desde el servidor y actualiza Room
     */
    suspend fun syncMedicalHistoryFromServer(usuarioId: String): Result<Unit> {
        return try {
            if (!isOnline()) {
                return Result.failure(Exception("No hay conexión a internet"))
            }
            
            val response = medicalHistoryApiService.getMedicalHistory(usuarioId)
            if (response.isSuccessful && response.body() != null) {
                val serverHistories = response.body()!!
                // El servidor puede devolver lista, pero normalmente hay uno por usuario
                serverHistories.firstOrNull()?.let { serverHistory ->
                    val entity = serverHistory.toEntity(
                        usuarioId = usuarioId,
                        syncStatus = SyncStatus.SYNCED
                    )
                    medicalHistoryDao.insert(entity)
                    Log.d("HealthRepository", "Historial médico sincronizado desde servidor")
                } ?: run {
                    Log.d("HealthRepository", "No hay historial médico en el servidor (lista vacía)")
                }
                Result.success(Unit)
            } else if (response.code() == 404) {
                // 404 no es un error crítico, puede ser que el usuario no tenga historial aún
                Log.d("HealthRepository", "No hay historial médico en el servidor (404)")
                Result.success(Unit)
            } else {
                Log.w("HealthRepository", "Error sincronizando historial médico: ${response.code()}")
                Result.failure(Exception("Error ${response.code()}: ${response.message()}"))
            }
        } catch (e: Exception) {
            Log.e("HealthRepository", "Error sincronizando historial médico desde servidor", e)
            Result.failure(e)
        }
    }
    
    /**
     * Sincroniza todo (peso, objetivos, historial médico y actividad física)
     */
    suspend fun syncAllPendingHealthData() {
        syncAllPending()
        syncAllPendingMedicalHistory()
        syncAllPendingActividadesFisicas()
    }
    
    // ========== ACTIVIDAD FÍSICA ==========
    
    /**
     * Obtiene todas las actividades físicas de un usuario desde Room
     */
    fun getActividadesFisicas(usuarioId: String): Flow<List<ActividadFisicaEntity>> {
        return actividadFisicaDao.getByUsuarioFlow(usuarioId)
    }
    
    /**
     * Agrega una nueva actividad física
     */
    suspend fun addActividadFisica(
        usuarioId: String,
        tipoActividadId: String,
        duracionMin: Int,
        caloriasQuemadas: Double,
        fecha: Date
    ): Result<ActividadFisicaEntity> {
        return try {
            // 1. Crear entidad local
            val entity = ActividadFisicaEntity(
                id = UUID.randomUUID().toString(),
                usuario_id = usuarioId,
                tipo_actividad_id = tipoActividadId,
                duracion_min = duracionMin,
                calorias_quemadas = caloriasQuemadas,
                fecha = fecha.time,
                syncStatus = if (isOnline()) SyncStatus.PENDING_CREATE else SyncStatus.PENDING_CREATE,
                createdAt = System.currentTimeMillis(),
                updatedAt = System.currentTimeMillis()
            )
            
            // 2. Guardar en Room
            actividadFisicaDao.insert(entity)
            Log.d("HealthRepository", "Actividad física guardada localmente: ${entity.id}")
            
            // 3. Intentar sincronizar si hay conexión
            if (isOnline()) {
                syncSingleActividadFisica(entity)
            } else {
                Log.d("HealthRepository", "Sin conexión, actividad física marcada como PENDING_CREATE")
            }
            
            Result.success(entity)
        } catch (e: Exception) {
            Log.e("HealthRepository", "Error al agregar actividad física", e)
            Result.failure(e)
        }
    }
    
    /**
     * Actualiza una actividad física existente
     */
    suspend fun updateActividadFisica(
        actividadFisicaId: String,
        tipoActividadId: String? = null,
        duracionMin: Int? = null,
        caloriasQuemadas: Double? = null,
        fecha: Date? = null
    ): Result<ActividadFisicaEntity> {
        return try {
            val existing = actividadFisicaDao.getById(actividadFisicaId)
            
            if (existing == null) {
                return Result.failure(Exception("Actividad física no encontrada"))
            }
            
            val updated = existing.copy(
                tipo_actividad_id = tipoActividadId ?: existing.tipo_actividad_id,
                duracion_min = duracionMin ?: existing.duracion_min,
                calorias_quemadas = caloriasQuemadas ?: existing.calorias_quemadas,
                fecha = fecha?.time ?: existing.fecha,
                syncStatus = if (existing.syncStatus == SyncStatus.SYNCED) {
                    SyncStatus.PENDING_UPDATE
                } else {
                    existing.syncStatus
                },
                updatedAt = System.currentTimeMillis()
            )
            
            actividadFisicaDao.update(updated)
            
            if (isOnline()) {
                syncSingleActividadFisica(updated)
            }
            
            Result.success(updated)
        } catch (e: Exception) {
            Log.e("HealthRepository", "Error actualizando actividad física", e)
            Result.failure(e)
        }
    }
    
    /**
     * Elimina una actividad física
     */
    suspend fun deleteActividadFisica(actividadFisicaId: String): Result<Unit> {
        return try {
            val existing = actividadFisicaDao.getById(actividadFisicaId)
            
            if (existing == null) {
                return Result.failure(Exception("Actividad física no encontrada"))
            }
            
            // Si ya está sincronizada, marcar como PENDING_DELETE
            // Si no, eliminar directamente
            if (existing.serverId != null && existing.syncStatus == SyncStatus.SYNCED) {
                val updated = existing.copy(
                    syncStatus = SyncStatus.PENDING_DELETE,
                    updatedAt = System.currentTimeMillis()
                )
                actividadFisicaDao.update(updated)
                
                if (isOnline()) {
                    syncSingleActividadFisica(updated)
                }
            } else {
                actividadFisicaDao.delete(existing)
            }
            
            Result.success(Unit)
        } catch (e: Exception) {
            Log.e("HealthRepository", "Error eliminando actividad física", e)
            Result.failure(e)
        }
    }
    
    /**
     * Sincroniza una actividad física individual con el servidor
     */
    private suspend fun syncSingleActividadFisica(entity: ActividadFisicaEntity) {
        try {
            when (entity.syncStatus) {
                SyncStatus.PENDING_CREATE -> {
                    val request = entity.toCreateRequest()
                    val response = healthApiService.createActividadFisica(request)
                    
                    if (response.isSuccessful && response.body() != null) {
                        val serverResponse = response.body()!!
                        val serverEntity = serverResponse.toEntity()
                        
                        // Actualizar entidad local con ID del servidor
                        val updated = entity.copy(
                            syncStatus = SyncStatus.SYNCED,
                            serverId = serverEntity.id,
                            retryCount = 0,
                            lastSyncAttempt = System.currentTimeMillis(),
                            updatedAt = System.currentTimeMillis()
                        )
                        actividadFisicaDao.update(updated)
                        Log.d("HealthRepository", "Actividad física sincronizada: ${updated.id}")
                    } else {
                        handleActividadFisicaSyncFailure(entity, "Error ${response.code()}: ${response.message()}")
                    }
                }
                SyncStatus.PENDING_UPDATE -> {
                    val serverId = entity.serverId ?: return
                    val request = entity.toCreateRequest()
                    val response = healthApiService.updateActividadFisica(serverId, request)
                    
                    if (response.isSuccessful && response.body() != null) {
                        val updated = entity.copy(
                            syncStatus = SyncStatus.SYNCED,
                            retryCount = 0,
                            lastSyncAttempt = System.currentTimeMillis(),
                            updatedAt = System.currentTimeMillis()
                        )
                        actividadFisicaDao.update(updated)
                        Log.d("HealthRepository", "Actividad física actualizada: ${updated.id}")
                    } else {
                        handleActividadFisicaSyncFailure(entity, "Error ${response.code()}: ${response.message()}")
                    }
                }
                SyncStatus.PENDING_DELETE -> {
                    val serverId = entity.serverId ?: run {
                        // Si no tiene serverId, eliminar localmente
                        actividadFisicaDao.delete(entity)
                        return
                    }
                    val response = healthApiService.deleteActividadFisica(serverId)
                    
                    if (response.isSuccessful) {
                        actividadFisicaDao.delete(entity)
                        Log.d("HealthRepository", "Actividad física eliminada: ${entity.id}")
                    } else {
                        handleActividadFisicaSyncFailure(entity, "Error ${response.code()}: ${response.message()}")
                    }
                }
                else -> {
                    // Ya está sincronizado o no necesita sincronización
                }
            }
        } catch (e: Exception) {
            Log.e("HealthRepository", "Error sincronizando actividad física", e)
            handleActividadFisicaSyncFailure(entity, e.message ?: "Error desconocido")
        }
    }
    
    /**
     * Maneja fallos de sincronización de actividad física
     */
    private suspend fun handleActividadFisicaSyncFailure(entity: ActividadFisicaEntity, errorMessage: String) {
        val updated = entity.copy(
            retryCount = entity.retryCount + 1,
            lastSyncAttempt = System.currentTimeMillis(),
            updatedAt = System.currentTimeMillis()
        )
        actividadFisicaDao.update(updated)
        Log.w("HealthRepository", "Error sincronizando actividad física: $errorMessage. Retry count: ${updated.retryCount}")
    }
    
    /**
     * Sincroniza todas las actividades físicas pendientes
     */
    suspend fun syncAllPendingActividadesFisicas() {
        val pending = actividadFisicaDao.getPendingSync()
        pending.forEach { entity ->
            syncSingleActividadFisica(entity)
        }
    }
    
    /**
     * Sincroniza actividades físicas desde el servidor
     */
    suspend fun syncActividadesFisicasFromServer(usuarioId: String): Result<Unit> {
        return try {
            if (!isOnline()) {
                return Result.failure(Exception("No hay conexión a internet"))
            }
            
            val response = healthApiService.getActividadesFisicasByUsuario(usuarioId)
            if (response.isSuccessful && response.body() != null) {
                val serverActividades = response.body()!!
                val entities = serverActividades.map { actividadResponse ->
                    actividadResponse.toEntity()
                }
                
                // Obtener actividades locales existentes
                val localActividades = actividadFisicaDao.getByUsuario(usuarioId)
                
                // Sincronizar: actualizar existentes y agregar nuevas
                entities.forEach { serverEntity ->
                    val existing = localActividades.firstOrNull { 
                        it.serverId == serverEntity.serverId || (it.serverId == null && it.id == serverEntity.id)
                    }
                    
                    if (existing != null) {
                        // Actualizar existente
                        val updated = existing.copy(
                            tipo_actividad_id = serverEntity.tipo_actividad_id,
                            duracion_min = serverEntity.duracion_min,
                            calorias_quemadas = serverEntity.calorias_quemadas,
                            intensidad = serverEntity.intensidad,
                            notas = serverEntity.notas,
                            fecha = serverEntity.fecha,
                            syncStatus = SyncStatus.SYNCED,
                            serverId = serverEntity.serverId
                        )
                        actividadFisicaDao.update(updated)
                    } else {
                        // Insertar nueva
                        actividadFisicaDao.insert(serverEntity)
                    }
                }
                
                Log.d("HealthRepository", "Sincronizadas ${entities.size} actividades físicas desde servidor")
                Result.success(Unit)
            } else if (response.code() == 404) {
                Log.d("HealthRepository", "No hay actividades físicas en el servidor (404)")
                Result.success(Unit)
            } else {
                Log.w("HealthRepository", "Error sincronizando actividades físicas: ${response.code()}")
                Result.failure(Exception("Error ${response.code()}: ${response.message()}"))
            }
        } catch (e: Exception) {
            Log.e("HealthRepository", "Error sincronizando actividades físicas desde servidor", e)
            Result.failure(e)
        }
    }
    
    // ========== TIPOS DE ACTIVIDAD (SOLO LECTURA) ==========
    
    /**
     * Obtiene todos los tipos de actividad desde Room
     */
    fun getTiposActividad(): Flow<List<TipoActividadEntity>> {
        return tipoActividadDao.getAllFlow()
    }
    
    /**
     * Sincroniza tipos de actividad desde el servidor
     */
    suspend fun syncTiposActividadFromServer(): Result<List<TipoActividadEntity>> {
        return try {
            if (!isOnline()) {
                return Result.failure(Exception("No hay conexión a internet"))
            }
            
            val response = healthApiService.getTiposActividad()
            
            if (response.isSuccessful && response.body() != null) {
                val serverTipos = response.body()!!
                val entities = serverTipos.map { tipoResponse ->
                    tipoResponse.toEntity()
                }
                
                // Reemplazar todos los tipos de actividad
                tipoActividadDao.deleteAll()
                if (entities.isNotEmpty()) {
                    tipoActividadDao.insertOrReplaceAll(entities)
                }
                
                Log.d("HealthRepository", "Sincronizados ${entities.size} tipos de actividad desde servidor")
                Result.success(entities)
            } else {
                Log.w("HealthRepository", "Error sincronizando tipos de actividad: ${response.code()}")
                Result.failure(Exception("Error ${response.code()}: ${response.message()}"))
            }
        } catch (e: Exception) {
            Log.e("HealthRepository", "Error sincronizando tipos de actividad desde servidor", e)
            Result.failure(e)
        }
    }
    
    // ========== MÉTODOS PARA MEDICAMENTOS (SOLO LECTURA) ==========
    
    /**
     * Obtiene todos los medicamentos de un usuario desde Room
     */
    fun getMedications(usuarioId: String): Flow<List<MedicamentoEntity>> {
        return medicamentoDao.getByUsuarioFlow(usuarioId)
    }
    
    /**
     * Obtiene solo los medicamentos activos de un usuario
     */
    fun getActiveMedications(usuarioId: String): Flow<List<MedicamentoEntity>> {
        return medicamentoDao.getActivosByUsuarioFlow(usuarioId)
    }
    
    /**
     * Sincroniza medicamentos desde el servidor
     * 
     * IMPORTANTE: Los medicamentos son de solo lectura.
     * Solo se sincronizan desde el servidor, no se crean/modifican localmente.
     */
    suspend fun syncMedicationsFromServer(usuarioId: String): Result<List<MedicamentoEntity>> {
        return try {
            if (!isOnline()) {
                return Result.failure(Exception("No hay conexión a internet"))
            }
            
            // Intentar primero obtener solo activos, si falla obtener todos
            var response = healthApiService.getActiveMedications(usuarioId)
            var usedActiveEndpoint = true
            
            // Si el endpoint de activos no existe (404), usar el endpoint general y filtrar localmente
            if (!response.isSuccessful && response.code() == 404) {
                Log.d("HealthRepository", "Endpoint activos no disponible, obteniendo todos los medicamentos")
                response = healthApiService.getMedications(usuarioId)
                usedActiveEndpoint = false
            }
            
            if (response.isSuccessful && response.body() != null) {
                val serverMedications: List<com.example.enutritrack_app.data.remote.dto.MedicamentoResponse> = response.body()!!
                
                // Filtrar solo activos si obtuvimos todos los medicamentos (no del endpoint activos)
                val activeMedications: List<com.example.enutritrack_app.data.remote.dto.MedicamentoResponse> = if (!usedActiveEndpoint) {
                    // Si obtuvimos todos, filtrar solo los activos
                    serverMedications.filter { it.activo }
                } else {
                    // Ya vienen filtrados desde el endpoint activos
                    serverMedications
                }
                
                // Convertir a entidades usando la función de extensión MedicamentoResponse.toEntity()
                val entities: List<MedicamentoEntity> = activeMedications.map { medicamentoResponse ->
                    medicamentoResponse.toEntity()
                }
                
                // Eliminar medicamentos antiguos del usuario y reemplazar con los del servidor
                medicamentoDao.deleteByUsuario(usuarioId)
                if (entities.isNotEmpty()) {
                    medicamentoDao.insertOrReplaceAll(entities)
                }
                
                Log.d("HealthRepository", "Sincronizados ${entities.size} medicamentos desde servidor")
                Result.success(entities)
            } else {
                Log.w("HealthRepository", "Error sincronizando medicamentos: ${response.code()}, ${response.message()}")
                // No fallar si no hay medicamentos, simplemente retornar lista vacía
                Result.success(emptyList())
            }
        } catch (e: Exception) {
            Log.e("HealthRepository", "Error sincronizando medicamentos desde servidor", e)
            Result.failure(e)
        }
    }
    
    /**
     * Sincroniza todos los medicamentos (activos e inactivos) desde el servidor
     */
    suspend fun syncAllMedicationsFromServer(usuarioId: String): Result<List<MedicamentoEntity>> {
        return try {
            if (!isOnline()) {
                return Result.failure(Exception("No hay conexión a internet"))
            }
            
            val response = healthApiService.getMedications(usuarioId)
            
            if (response.isSuccessful && response.body() != null) {
                val serverMedications: List<com.example.enutritrack_app.data.remote.dto.MedicamentoResponse> = response.body()!!
                val entities: List<MedicamentoEntity> = serverMedications.map { medicamentoResponse ->
                    medicamentoResponse.toEntity()
                }
                
                medicamentoDao.deleteByUsuario(usuarioId)
                medicamentoDao.insertOrReplaceAll(entities)
                
                Log.d("HealthRepository", "Sincronizados ${entities.size} medicamentos (todos) desde servidor")
                Result.success(entities)
            } else {
                Result.failure(Exception("Error ${response.code()}: ${response.message()}"))
            }
        } catch (e: Exception) {
            Log.e("HealthRepository", "Error sincronizando todos los medicamentos", e)
            Result.failure(e)
        }
    }
    
    // ========== MÉTODOS PARA ALERGIAS ==========
    
    /**
     * Obtiene todas las alergias de un usuario desde Room
     */
    fun getAlergias(usuarioId: String): Flow<List<AlergiaEntity>> {
        return alergiaDao.getByUsuarioFlow(usuarioId)
    }
    
    /**
     * Obtiene solo las alergias activas de un usuario desde Room
     */
    fun getActiveAlergias(usuarioId: String): Flow<List<AlergiaEntity>> {
        return alergiaDao.getActivasByUsuarioFlow(usuarioId)
    }
    
    /**
     * Agrega una nueva alergia
     *
     * Estrategia:
     * 1. Guarda localmente en Room
     * 2. Intenta sincronizar con el servidor si hay conexión
     */
    suspend fun addAlergia(
        usuarioId: String,
        tipo: String?,
        nombre: String,
        severidad: String,
        reaccion: String,
        notas: String?
    ): Result<AlergiaEntity> {
        return try {
            // 1. Crear entidad local
            val entity = AlergiaEntity(
                id = java.util.UUID.randomUUID().toString(),
                usuario_id = usuarioId,
                tipo = tipo,
                nombre = nombre,
                severidad = severidad.lowercase(),
                reaccion = reaccion,
                notas = notas,
                activa = true,
                syncStatus = if (isOnline()) SyncStatus.PENDING_CREATE else SyncStatus.PENDING_CREATE,
                createdAt = System.currentTimeMillis(),
                updatedAt = System.currentTimeMillis()
            )
            
            // 2. Guardar en Room
            alergiaDao.insert(entity)
            Log.d("HealthRepository", "Alergia guardada localmente: ${entity.id}")
            
            // 3. Intentar sincronizar si hay conexión
            if (isOnline()) {
                syncSingleAlergia(entity)
            } else {
                Log.d("HealthRepository", "Sin conexión, alergia marcada como PENDING_CREATE")
            }
            
            Result.success(entity)
        } catch (e: Exception) {
            Log.e("HealthRepository", "Error al agregar alergia", e)
            Result.failure(e)
        }
    }
    
    /**
     * Actualiza una alergia existente
     */
    suspend fun updateAlergia(
        alergiaId: String,
        tipo: String?,
        nombre: String,
        severidad: String,
        reaccion: String,
        notas: String?,
        activa: Boolean?
    ): Result<AlergiaEntity> {
        return try {
            val existing = alergiaDao.getById(alergiaId)
            
            if (existing == null) {
                return Result.failure(Exception("Alergia no encontrada"))
            }
            
            val updated = existing.copy(
                tipo = tipo ?: existing.tipo,
                nombre = nombre,
                severidad = severidad.lowercase(),
                reaccion = reaccion,
                notas = notas ?: existing.notas,
                activa = activa ?: existing.activa,
                syncStatus = if (existing.syncStatus == SyncStatus.SYNCED) {
                    SyncStatus.PENDING_UPDATE
                } else {
                    existing.syncStatus
                },
                updatedAt = System.currentTimeMillis()
            )
            
            alergiaDao.update(updated)
            
            if (isOnline()) {
                syncSingleAlergia(updated)
            }
            
            Result.success(updated)
        } catch (e: Exception) {
            Log.e("HealthRepository", "Error actualizando alergia", e)
            Result.failure(e)
        }
    }
    
    /**
     * Desactiva una alergia
     */
    suspend fun desactivarAlergia(alergiaId: String): Result<AlergiaEntity> {
        return updateAlergia(
            alergiaId = alergiaId,
            tipo = null,
            nombre = "",
            severidad = "",
            reaccion = "",
            notas = null,
            activa = false
        )
    }
    
    /**
     * Elimina una alergia
     */
    suspend fun deleteAlergia(alergiaId: String): Result<Unit> {
        return try {
            val existing = alergiaDao.getById(alergiaId)
            
            if (existing == null) {
                return Result.failure(Exception("Alergia no encontrada"))
            }
            
            // Si ya está sincronizada, marcar como PENDING_DELETE
            // Si no, eliminar directamente
            if (existing.serverId != null && existing.syncStatus == SyncStatus.SYNCED) {
                val updated = existing.copy(
                    syncStatus = SyncStatus.PENDING_DELETE,
                    updatedAt = System.currentTimeMillis()
                )
                alergiaDao.update(updated)
                
                if (isOnline()) {
                    syncSingleAlergia(updated)
                }
            } else {
                alergiaDao.delete(existing)
            }
            
            Result.success(Unit)
        } catch (e: Exception) {
            Log.e("HealthRepository", "Error eliminando alergia", e)
            Result.failure(e)
        }
    }
    
    /**
     * Sincroniza una alergia individual con el servidor
     */
    private suspend fun syncSingleAlergia(entity: AlergiaEntity) {
        try {
            when (entity.syncStatus) {
                SyncStatus.PENDING_CREATE -> {
                    val request = entity.toRequest()
                    val response = healthApiService.createAlergia(request)
                    
                    if (response.isSuccessful && response.body() != null) {
                        val serverEntity = toEntityAlergia(
                            response.body()!!,
                            SyncStatus.SYNCED,
                            response.body()!!.id
                        )
                        val updated = entity.copy(
                            serverId = serverEntity.serverId,
                            syncStatus = SyncStatus.SYNCED,
                            id = serverEntity.serverId ?: entity.id,
                            updatedAt = System.currentTimeMillis()
                        )
                        alergiaDao.update(updated)
                        Log.d("HealthRepository", "Alergia sincronizada: ${updated.id}")
                    } else {
                        handleAlergiaSyncFailure(entity, "Error ${response.code()}: ${response.message()}")
                    }
                }
                SyncStatus.PENDING_UPDATE -> {
                    entity.serverId?.let { serverId ->
                        val request = entity.toRequest()
                        val response = healthApiService.updateAlergia(serverId, request)
                        if (response.isSuccessful) {
                            val updated = entity.copy(
                                syncStatus = SyncStatus.SYNCED,
                                updatedAt = System.currentTimeMillis()
                            )
                            alergiaDao.update(updated)
                            Log.d("HealthRepository", "Alergia actualizada: ${updated.id}")
                        } else {
                            handleAlergiaSyncFailure(entity, "Error ${response.code()}: ${response.message()}")
                        }
                    } ?: run {
                        Log.e("HealthRepository", "Intento de UPDATE para alergia sin serverId: ${entity.id}")
                        handleAlergiaSyncFailure(entity, "No se puede actualizar sin Server ID")
                    }
                }
                SyncStatus.PENDING_DELETE -> {
                    entity.serverId?.let { serverId ->
                        val response = healthApiService.deleteAlergia(serverId)
                        if (response.isSuccessful) {
                            alergiaDao.delete(entity)
                            Log.d("HealthRepository", "Alergia eliminada: ${entity.id}")
                        } else {
                            handleAlergiaSyncFailure(entity, "Error ${response.code()}: ${response.message()}")
                        }
                    }
                }
                else -> {
                    // Ya sincronizado o sin cambios
                }
            }
        } catch (e: Exception) {
            Log.e("HealthRepository", "Error sincronizando alergia ${entity.id}", e)
            handleAlergiaSyncFailure(entity, e.message ?: "Error desconocido")
        }
    }
    
    /**
     * Maneja fallos en sincronización de alergias
     */
    private suspend fun handleAlergiaSyncFailure(entity: AlergiaEntity, errorMessage: String) {
        val maxRetries = 3
        val updated = entity.copy(
            retryCount = entity.retryCount + 1,
            lastSyncAttempt = System.currentTimeMillis(),
            syncStatus = if (entity.retryCount >= maxRetries) {
                SyncStatus.FAILED
            } else {
                entity.syncStatus
            }
        )
        alergiaDao.update(updated)
        Log.w("HealthRepository", "Fallo sincronización alergia ${entity.id}: $errorMessage (intentos: ${updated.retryCount})")
    }
    
    /**
     * Sincroniza todas las alergias pendientes
     */
    suspend fun syncAllPendingAlergias() {
        val pending = alergiaDao.getPendingSync()
        Log.d("HealthRepository", "Sincronizando ${pending.size} alergias pendientes")
        pending.forEach { entity ->
            syncSingleAlergia(entity)
        }
    }
    
    /**
     * Carga alergias desde el servidor y actualiza Room
     */
    suspend fun syncAlergiasFromServer(usuarioId: String): Result<Unit> {
        return try {
            if (!isOnline()) {
                return Result.failure(Exception("No hay conexión a internet"))
            }
            
            // Intentar obtener solo activas primero
            var response = healthApiService.getActiveAlergiasByUsuario(usuarioId)
            var usedActiveEndpoint = true
            
            if (!response.isSuccessful && response.code() == 404) {
                Log.d("HealthRepository", "Endpoint activas no disponible, obteniendo todas las alergias")
                response = healthApiService.getAlergiasByUsuario(usuarioId)
                usedActiveEndpoint = false
            }
            
            if (response.isSuccessful && response.body() != null) {
                val serverAlergias = response.body()!!
                val entities = serverAlergias.map { alergiaResponse ->
                    toEntityAlergia(alergiaResponse, SyncStatus.SYNCED)
                }
                
                // Obtener alergias locales existentes
                val localAlergias = alergiaDao.getByUsuario(usuarioId)
                
                // Sincronizar: actualizar existentes y agregar nuevas
                entities.forEach { serverEntity ->
                    val existing = localAlergias.firstOrNull { 
                        it.serverId == serverEntity.serverId || (it.serverId == null && it.id == serverEntity.id)
                    }
                    
                    if (existing != null) {
                        // Actualizar existente
                        val updated = existing.copy(
                            tipo = serverEntity.tipo,
                            nombre = serverEntity.nombre,
                            severidad = serverEntity.severidad,
                            reaccion = serverEntity.reaccion,
                            notas = serverEntity.notas,
                            activa = serverEntity.activa,
                            syncStatus = SyncStatus.SYNCED,
                            serverId = serverEntity.serverId
                        )
                        alergiaDao.update(updated)
                    } else {
                        // Insertar nueva
                        alergiaDao.insert(serverEntity)
                    }
                }
                
                Log.d("HealthRepository", "Sincronizadas ${entities.size} alergias desde servidor")
                Result.success(Unit)
            } else if (response.code() == 404) {
                Log.d("HealthRepository", "No hay alergias en el servidor (404)")
                Result.success(Unit)
            } else {
                Log.w("HealthRepository", "Error sincronizando alergias: ${response.code()}")
                Result.failure(Exception("Error ${response.code()}: ${response.message()}"))
            }
        } catch (e: Exception) {
            Log.e("HealthRepository", "Error sincronizando alergias desde servidor", e)
            Result.failure(e)
        }
    }
}

