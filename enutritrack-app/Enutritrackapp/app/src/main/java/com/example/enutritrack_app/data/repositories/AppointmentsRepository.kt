package com.example.enutritrack_app.data.repositories

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.util.Log
import com.example.enutritrack_app.data.local.dao.*
import com.example.enutritrack_app.data.local.database.SyncStatus
import com.example.enutritrack_app.data.local.entities.*
import com.example.enutritrack_app.data.local.mappers.*
import com.example.enutritrack_app.data.local.repositories.UserLocalRepository
import com.example.enutritrack_app.data.remote.api.AppointmentsApiService
import com.example.enutritrack_app.data.remote.dto.UpdateCitaMedicaRequest
import com.example.enutritrack_app.di.NetworkModule
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import java.util.*

/**
 * Repositorio que combina operaciones locales (Room) y remotas (API)
 * para el módulo de citas médicas
 * 
 * Estrategia offline-first:
 * 1. Escribir primero en Room
 * 2. Marcar como PENDING si no hay conexión
 * 3. Sincronizar automáticamente cuando hay conexión
 */
class AppointmentsRepository(
    private val context: Context,
    private val citaMedicaDao: CitaMedicaDao,
    private val citaMedicaVitalesDao: CitaMedicaVitalesDao,
    private val citaMedicaDocumentosDao: CitaMedicaDocumentosDao,
    private val tipoConsultaDao: TipoConsultaDao,
    private val estadoCitaDao: EstadoCitaDao,
    private val userLocalRepository: UserLocalRepository
) {
    
    private val appointmentsApiService: AppointmentsApiService = NetworkModule.createAppointmentsApiService(context)
    
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
     * Obtiene todas las citas de un usuario como Flow
     */
    fun getCitasByUsuarioFlow(usuarioId: String): Flow<List<CitaMedicaEntity>> {
        return citaMedicaDao.getByUsuarioIdFlow(usuarioId)
    }
    
    /**
     * Obtiene todas las citas de un usuario
     */
    suspend fun getCitasByUsuario(usuarioId: String): List<CitaMedicaEntity> {
        return citaMedicaDao.getByUsuarioId(usuarioId)
    }
    
    /**
     * Obtiene una cita por ID
     */
    suspend fun getCitaById(id: String): CitaMedicaEntity? {
        return citaMedicaDao.getById(id)
    }
    
    /**
     * Obtiene tipos de consulta como Flow
     */
    fun getTiposConsultaFlow(): Flow<List<TipoConsultaEntity>> {
        return tipoConsultaDao.getAllFlow()
    }
    
    /**
     * Obtiene estados de cita como Flow
     */
    fun getEstadosCitaFlow(): Flow<List<EstadoCitaEntity>> {
        return estadoCitaDao.getAllFlow()
    }
    
    /**
     * Obtiene vitales de una cita como Flow
     */
    fun getVitalesByCitaFlow(citaMedicaId: String): Flow<List<CitaMedicaVitalesEntity>> {
        return citaMedicaVitalesDao.getByCitaMedicaIdFlow(citaMedicaId)
    }
    
    /**
     * Obtiene documentos de una cita como Flow
     */
    fun getDocumentosByCitaFlow(citaMedicaId: String): Flow<List<CitaMedicaDocumentosEntity>> {
        return citaMedicaDocumentosDao.getByCitaMedicaIdFlow(citaMedicaId)
    }
    
    // ========== CREAR CITAS ==========
    
    /**
     * Crea una nueva cita médica
     */
    suspend fun createCita(
        usuarioId: String,
        doctorId: String,
        tipoConsultaId: String,
        estadoCitaId: String,
        fechaHoraProgramada: Date,
        motivo: String? = null
    ): Result<CitaMedicaEntity> {
        return try {
            // Crear entidad local
            val entity = CitaMedicaEntity(
                id = UUID.randomUUID().toString(),
                usuario_id = usuarioId,
                doctor_id = doctorId,
                tipo_consulta_id = tipoConsultaId,
                estado_cita_id = estadoCitaId,
                fecha_hora_programada = fechaHoraProgramada.time,
                fecha_hora_inicio = null,
                fecha_hora_fin = null,
                motivo = motivo,
                observaciones = null,
                diagnostico = null,
                tratamiento_recomendado = null,
                proxima_cita_sugerida = null,
                syncStatus = if (isOnline()) SyncStatus.PENDING_CREATE else SyncStatus.PENDING_CREATE,
                createdAt = System.currentTimeMillis(),
                updatedAt = System.currentTimeMillis()
            )
            
            // Guardar en Room
            citaMedicaDao.insert(entity)
            Log.d("AppointmentsRepository", "Cita médica guardada localmente: ${entity.id}")
            
            // Intentar sincronizar si hay conexión
            if (isOnline()) {
                syncSingleCita(entity)
            } else {
                Log.d("AppointmentsRepository", "Sin conexión, cita marcada como PENDING_CREATE")
            }
            
            Result.success(entity)
        } catch (e: Exception) {
            Log.e("AppointmentsRepository", "Error creando cita médica", e)
            Result.failure(e)
        }
    }
    
    // ========== ACTUALIZAR CITAS ==========
    
    /**
     * Actualiza una cita médica (solo estado y/o fecha para reprogramar)
     */
    suspend fun updateCita(
        citaId: String,
        estadoCitaId: String? = null,
        fechaHoraProgramada: Date? = null,
        motivo: String? = null
    ): Result<CitaMedicaEntity> {
        return try {
            val existing = citaMedicaDao.getById(citaId)
                ?: return Result.failure(Exception("Cita no encontrada"))
            
            val updated = existing.copy(
                estado_cita_id = estadoCitaId ?: existing.estado_cita_id,
                fecha_hora_programada = fechaHoraProgramada?.time ?: existing.fecha_hora_programada,
                motivo = motivo ?: existing.motivo,
                syncStatus = if (isOnline()) SyncStatus.PENDING_UPDATE else SyncStatus.PENDING_UPDATE,
                updatedAt = System.currentTimeMillis()
            )
            
            citaMedicaDao.update(updated)
            Log.d("AppointmentsRepository", "Cita médica actualizada localmente: ${updated.id}")
            
            // Intentar sincronizar si hay conexión
            if (isOnline()) {
                syncUpdateCita(updated)
            }
            
            Result.success(updated)
        } catch (e: Exception) {
            Log.e("AppointmentsRepository", "Error actualizando cita médica", e)
            Result.failure(e)
        }
    }
    
    /**
     * Cancela una cita médica (cambia el estado a "Cancelada")
     */
    suspend fun cancelCita(citaId: String): Result<CitaMedicaEntity> {
        // Buscar estado "Cancelada" por nombre
        val estadosCita = estadoCitaDao.getAll()
        val estadoCancelada = estadosCita.find { it.nombre.lowercase().contains("cancel") }
            ?: return Result.failure(Exception("Estado 'Cancelada' no encontrado"))
        
        return updateCita(citaId, estadoCitaId = estadoCancelada.id)
    }
    
    // ========== SINCRONIZACIÓN ==========
    
    /**
     * Sincroniza una cita pendiente individual
     */
    private suspend fun syncSingleCita(entity: CitaMedicaEntity) {
        try {
            // Si ya tiene serverId, no es necesario sincronizar (ya está en el servidor)
            if (entity.serverId != null && entity.syncStatus == SyncStatus.SYNCED) {
                Log.d("AppointmentsRepository", "Cita ya está sincronizada: ${entity.id}")
                return
            }
            
            val request = entity.toCreateRequest()
            val response = appointmentsApiService.createAppointment(request)
            
            if (response.isSuccessful && response.body() != null) {
                val serverCita = response.body()!!
                val syncedEntity = serverCita.toEntity()
                
                // Si la cita local tiene un ID diferente al del servidor, eliminar la local y guardar la del servidor
                if (entity.id != syncedEntity.id) {
                    // Eliminar la cita local con ID local
                    citaMedicaDao.deleteById(entity.id)
                    Log.d("AppointmentsRepository", "Eliminada cita local con ID: ${entity.id}")
                }
                
                // Insertar o reemplazar con la cita del servidor
                citaMedicaDao.insertOrReplaceAll(listOf(syncedEntity))
                Log.d("AppointmentsRepository", "Cita sincronizada desde servidor: ${syncedEntity.id} (ID local era: ${entity.id})")
            } else {
                Log.w("AppointmentsRepository", "Error sincronizando cita: ${response.code()}")
            }
        } catch (e: Exception) {
            Log.e("AppointmentsRepository", "Error sincronizando cita", e)
        }
    }
    
    /**
     * Sincroniza una actualización de cita
     */
    private suspend fun syncUpdateCita(entity: CitaMedicaEntity) {
        try {
            // Si ya está sincronizada, no hacer nada
            if (entity.serverId != null && entity.syncStatus == SyncStatus.SYNCED) {
                Log.d("AppointmentsRepository", "Cita ya está sincronizada: ${entity.id}")
                return
            }
            
            // Usar serverId si está disponible, sino el id local
            val citaIdParaActualizar = entity.serverId ?: entity.id
            
            val request = UpdateCitaMedicaRequest(
                estadoCitaId = entity.estado_cita_id,
                fechaHoraProgramada = Date(entity.fecha_hora_programada),
                motivo = entity.motivo
            )
            val response = appointmentsApiService.updateAppointment(citaIdParaActualizar, request)
            
            if (response.isSuccessful && response.body() != null) {
                val serverCita = response.body()!!
                val syncedEntity = serverCita.toEntity()
                
                // Si el ID del servidor es diferente al ID local, eliminar la local y guardar la del servidor
                if (entity.id != syncedEntity.id) {
                    citaMedicaDao.deleteById(entity.id)
                    Log.d("AppointmentsRepository", "Eliminada cita local después de actualización: ${entity.id}")
                }
                
                // Insertar o actualizar con la cita del servidor
                citaMedicaDao.insertOrReplaceAll(listOf(syncedEntity))
                Log.d("AppointmentsRepository", "Cita actualizada sincronizada: ${syncedEntity.id}")
            } else {
                Log.w("AppointmentsRepository", "Error sincronizando actualización: ${response.code()}")
            }
        } catch (e: Exception) {
            Log.e("AppointmentsRepository", "Error sincronizando actualización de cita", e)
        }
    }
    
    /**
     * Sincroniza todas las citas pendientes
     */
    suspend fun syncAllPendingCitas(): Int {
        val pendingCreate = citaMedicaDao.getPendingSync(SyncStatus.PENDING_CREATE)
        val pendingUpdate = citaMedicaDao.getPendingSync(SyncStatus.PENDING_UPDATE)
        
        var syncedCount = 0
        
        // Sincronizar creaciones
        pendingCreate.forEach { cita ->
            // Verificar nuevamente el estado antes de sincronizar (puede haber cambiado)
            val citaActual = citaMedicaDao.getById(cita.id)
            if (citaActual != null && citaActual.syncStatus == SyncStatus.PENDING_CREATE) {
                syncSingleCita(citaActual)
                syncedCount++
            }
        }
        
        // Sincronizar actualizaciones
        pendingUpdate.forEach { cita ->
            // Verificar nuevamente el estado antes de sincronizar
            val citaActual = citaMedicaDao.getById(cita.id)
            if (citaActual != null && citaActual.syncStatus == SyncStatus.PENDING_UPDATE) {
                syncUpdateCita(citaActual)
                syncedCount++
            }
        }
        
        return syncedCount
    }
    
    /**
     * Sincroniza citas desde el servidor
     */
    suspend fun syncCitasFromServer(usuarioId: String): Result<List<CitaMedicaEntity>> {
        return try {
            if (!isOnline()) {
                return Result.failure(Exception("No hay conexión a internet"))
            }
            
            val response = appointmentsApiService.getAppointmentsByUser(usuarioId)
            
            if (response.isSuccessful && response.body() != null) {
                val serverCitas = response.body()!!
                val entities = serverCitas.map { it.toEntity() }
                
                // Obtener citas locales pendientes para evitar duplicados
                val citasLocalesPendientes = citaMedicaDao.getPendingSync(SyncStatus.PENDING_CREATE)
                
                // Obtener todas las citas locales actuales del usuario
                val todasLasCitasLocales = citaMedicaDao.getByUsuarioId(usuarioId)
                
                // Para cada cita del servidor, verificar si hay una local que corresponda
                entities.forEach { serverEntity ->
                    // El serverId de la entidad del servidor es igual a su id (según el mapper)
                    val serverId = serverEntity.id
                    
                    // Buscar por serverId en citas locales existentes
                    var citaLocalExistente = todasLasCitasLocales.find { local ->
                        local.serverId == serverId || local.id == serverId
                    }
                    
                    // Si no se encuentra por serverId o id, buscar por datos similares en citas pendientes
                    if (citaLocalExistente == null) {
                        citaLocalExistente = citasLocalesPendientes.find { local ->
                            local.usuario_id == serverEntity.usuario_id &&
                            local.doctor_id == serverEntity.doctor_id &&
                            Math.abs(local.fecha_hora_programada - serverEntity.fecha_hora_programada) < 60000 // Diferencia menor a 1 minuto
                        }
                    }
                    
                    // Si existe una cita local con ID diferente, eliminarla para evitar duplicado
                    if (citaLocalExistente != null && citaLocalExistente.id != serverEntity.id) {
                        citaMedicaDao.deleteById(citaLocalExistente.id)
                        Log.d("AppointmentsRepository", "Eliminada cita local duplicada: ${citaLocalExistente.id} (ID servidor: ${serverEntity.id})")
                    }
                }
                
                // Guardar citas del servidor (con sus IDs del servidor como PK)
                citaMedicaDao.insertOrReplaceAll(entities)
                
                // Sincronizar vitales y documentos si vienen en la respuesta
                serverCitas.forEach { citaResponse ->
                    citaResponse.vitales?.let { vitales ->
                        val vitalesEntities = vitales.map { it.toEntity() }
                        citaMedicaVitalesDao.insertOrReplaceAll(vitalesEntities)
                    }
                    
                    citaResponse.documentos?.let { documentos ->
                        val documentosEntities = documentos.map { it.toEntity() }
                        citaMedicaDocumentosDao.insertOrReplaceAll(documentosEntities)
                    }
                }
                
                Log.d("AppointmentsRepository", "Sincronizadas ${entities.size} citas desde servidor")
                Result.success(entities)
            } else {
                Log.w("AppointmentsRepository", "Error sincronizando citas: ${response.code()}")
                Result.failure(Exception("Error ${response.code()}: ${response.message()}"))
            }
        } catch (e: Exception) {
            Log.e("AppointmentsRepository", "Error sincronizando citas desde servidor", e)
            Result.failure(e)
        }
    }
    
    /**
     * Sincroniza catálogos desde el servidor
     */
    suspend fun syncTiposConsultaFromServer(): Result<List<TipoConsultaEntity>> {
        return try {
            if (!isOnline()) {
                return Result.failure(Exception("No hay conexión a internet"))
            }
            
            val response = appointmentsApiService.getTiposConsulta()
            
            if (response.isSuccessful && response.body() != null) {
                val serverTipos = response.body()!!
                val entities = serverTipos.map { it.toEntity() }
                
                tipoConsultaDao.deleteAll()
                if (entities.isNotEmpty()) {
                    tipoConsultaDao.insertOrReplaceAll(entities)
                }
                
                Log.d("AppointmentsRepository", "Sincronizados ${entities.size} tipos de consulta desde servidor")
                Result.success(entities)
            } else {
                Result.failure(Exception("Error ${response.code()}: ${response.message()}"))
            }
        } catch (e: Exception) {
            Log.e("AppointmentsRepository", "Error sincronizando tipos de consulta", e)
            Result.failure(e)
        }
    }
    
    suspend fun syncEstadosCitaFromServer(): Result<List<EstadoCitaEntity>> {
        return try {
            if (!isOnline()) {
                return Result.failure(Exception("No hay conexión a internet"))
            }
            
            val response = appointmentsApiService.getEstadosCita()
            
            if (response.isSuccessful && response.body() != null) {
                val serverEstados = response.body()!!
                val entities = serverEstados.map { it.toEntity() }
                
                estadoCitaDao.deleteAll()
                if (entities.isNotEmpty()) {
                    estadoCitaDao.insertOrReplaceAll(entities)
                }
                
                Log.d("AppointmentsRepository", "Sincronizados ${entities.size} estados de cita desde servidor")
                Result.success(entities)
            } else {
                Result.failure(Exception("Error ${response.code()}: ${response.message()}"))
            }
        } catch (e: Exception) {
            Log.e("AppointmentsRepository", "Error sincronizando estados de cita", e)
            Result.failure(e)
        }
    }
}

