package com.example.enutritrack_app.presentation.appointments

import android.app.Application
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.enutritrack_app.data.local.SecurityManager
import com.example.enutritrack_app.data.local.database.EnutritrackDatabase
import com.example.enutritrack_app.data.local.entities.*
import com.example.enutritrack_app.data.local.repositories.UserLocalRepository
import com.example.enutritrack_app.data.repositories.AppointmentsRepository
import com.example.enutritrack_app.di.DatabaseModule
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.util.*

/**
 * ViewModel para el módulo de Citas Médicas
 */
class AppointmentsViewModel(application: Application) : AndroidViewModel(application) {
    
    private val database = DatabaseModule.getDatabase(application)
    private val securityManager = SecurityManager(application)
    private val userLocalRepository = UserLocalRepository(database.userDao(), application)
    
    private val appointmentsRepository = AppointmentsRepository(
        context = application,
        citaMedicaDao = database.citaMedicaDao(),
        citaMedicaVitalesDao = database.citaMedicaVitalesDao(),
        citaMedicaDocumentosDao = database.citaMedicaDocumentosDao(),
        tipoConsultaDao = database.tipoConsultaDao(),
        estadoCitaDao = database.estadoCitaDao(),
        userLocalRepository = userLocalRepository
    )
    
    private val userId: String? = securityManager.getUserId()
    
    // Estados de UI
    private val _uiState = MutableStateFlow(AppointmentsUiState())
    val uiState: StateFlow<AppointmentsUiState> = _uiState.asStateFlow()
    
    // Datos observables
    val citas: StateFlow<List<CitaMedicaEntity>> = if (userId != null) {
        appointmentsRepository.getCitasByUsuarioFlow(userId).stateIn(
            viewModelScope,
            SharingStarted.WhileSubscribed(5000),
            emptyList()
        )
    } else {
        MutableStateFlow(emptyList())
    }
    
    val tiposConsulta: StateFlow<List<TipoConsultaEntity>> =
        appointmentsRepository.getTiposConsultaFlow().stateIn(
            viewModelScope,
            SharingStarted.WhileSubscribed(5000),
            emptyList()
        )
    
    val estadosCita: StateFlow<List<EstadoCitaEntity>> =
        appointmentsRepository.getEstadosCitaFlow().stateIn(
            viewModelScope,
            SharingStarted.WhileSubscribed(5000),
            emptyList()
        )
    
    /**
     * Obtiene vitales de una cita como Flow
     */
    fun getVitalesByCitaFlow(citaId: String): Flow<List<CitaMedicaVitalesEntity>> {
        return appointmentsRepository.getVitalesByCitaFlow(citaId)
    }
    
    /**
     * Obtiene documentos de una cita como Flow
     */
    fun getDocumentosByCitaFlow(citaId: String): Flow<List<CitaMedicaDocumentosEntity>> {
        return appointmentsRepository.getDocumentosByCitaFlow(citaId)
    }
    
    /**
     * Obtiene una cita por ID
     */
    suspend fun getCitaById(id: String): CitaMedicaEntity? {
        return appointmentsRepository.getCitaById(id)
    }
    
    /**
     * Crea una nueva cita médica
     */
    fun createCita(
        doctorId: String,
        tipoConsultaId: String,
        estadoCitaId: String,
        fechaHoraProgramada: Date,
        motivo: String? = null
    ) {
        if (userId == null) {
            _uiState.value = _uiState.value.copy(
                error = "Usuario no autenticado"
            )
            return
        }
        
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            val result = appointmentsRepository.createCita(
                usuarioId = userId,
                doctorId = doctorId,
                tipoConsultaId = tipoConsultaId,
                estadoCitaId = estadoCitaId,
                fechaHoraProgramada = fechaHoraProgramada,
                motivo = motivo
            )
            
            if (result.isSuccess) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    successMessage = "Cita médica creada exitosamente"
                )
            } else {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = result.exceptionOrNull()?.message ?: "Error al crear la cita"
                )
            }
        }
    }
    
    /**
     * Cancela una cita médica
     */
    fun cancelCita(citaId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            val result = appointmentsRepository.cancelCita(citaId)
            
            if (result.isSuccess) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    successMessage = "Cita cancelada exitosamente"
                )
            } else {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = result.exceptionOrNull()?.message ?: "Error al cancelar la cita"
                )
            }
        }
    }
    
    /**
     * Reprograma una cita médica
     */
    fun rescheduleCita(citaId: String, nuevaFecha: Date) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            // Buscar estado "Reprogramar" o similar
            val estados = estadosCita.value
            val estadoReprogramar = estados.find { 
                it.nombre.lowercase().contains("reprogram") || 
                it.nombre.lowercase().contains("pendiente")
            }
            
            if (estadoReprogramar == null) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = "Estado para reprogramar no encontrado"
                )
                return@launch
            }
            
            val result = appointmentsRepository.updateCita(
                citaId = citaId,
                estadoCitaId = estadoReprogramar.id,
                fechaHoraProgramada = nuevaFecha
            )
            
            if (result.isSuccess) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    successMessage = "Cita reprogramada exitosamente"
                )
            } else {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = result.exceptionOrNull()?.message ?: "Error al reprogramar la cita"
                )
            }
        }
    }
    
    /**
     * Sincroniza datos desde el servidor
     */
    fun syncFromServer() {
        if (userId == null) return
        
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            var syncCount = 0
            var errorCount = 0
            
            // Sincronizar catálogos primero
            val tiposResult = appointmentsRepository.syncTiposConsultaFromServer()
            if (tiposResult.isSuccess) {
                syncCount++
            } else {
                errorCount++
                Log.w("AppointmentsViewModel", "No se pudo sincronizar tipos de consulta")
            }
            
            val estadosResult = appointmentsRepository.syncEstadosCitaFromServer()
            if (estadosResult.isSuccess) {
                syncCount++
            } else {
                errorCount++
                Log.w("AppointmentsViewModel", "No se pudo sincronizar estados de cita")
            }
            
            // Sincronizar citas
            val citasResult = appointmentsRepository.syncCitasFromServer(userId)
            if (citasResult.isSuccess) {
                syncCount++
            } else {
                errorCount++
                Log.w("AppointmentsViewModel", "No se pudo sincronizar citas")
            }
            
            // Sincronizar citas pendientes
            val pendingCount = appointmentsRepository.syncAllPendingCitas()
            if (pendingCount > 0) {
                syncCount++
            }
            
            _uiState.value = _uiState.value.copy(
                isLoading = false,
                successMessage = if (errorCount == 0) "Sincronización completada" else "Sincronización parcial ($syncCount exitosas, $errorCount errores)"
            )
        }
    }
    
    /**
     * Limpia mensajes de error
     */
    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
    
    /**
     * Limpia mensajes de éxito
     */
    fun clearSuccessMessage() {
        _uiState.value = _uiState.value.copy(successMessage = null)
    }
}

/**
 * Estado de UI para el módulo de Citas
 */
data class AppointmentsUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val successMessage: String? = null
)

