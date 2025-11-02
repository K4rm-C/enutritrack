package com.example.enutritrack_app.presentation.appointments

import android.app.Application
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.enutritrack_app.data.local.SecurityManager
import com.example.enutritrack_app.data.local.database.EnutritrackDatabase
import com.example.enutritrack_app.data.local.entities.*
import com.example.enutritrack_app.data.repositories.AlertsRepository
import com.example.enutritrack_app.di.DatabaseModule
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

/**
 * ViewModel para el módulo de Alertas
 */
class AlertsViewModel(application: Application) : AndroidViewModel(application) {
    
    private val database = DatabaseModule.getDatabase(application)
    private val securityManager = SecurityManager(application)
    
    private val alertsRepository = AlertsRepository(
        context = application,
        alertaDao = database.alertaDao(),
        tipoAlertaDao = database.tipoAlertaDao(),
        categoriaAlertaDao = database.categoriaAlertaDao(),
        nivelPrioridadAlertaDao = database.nivelPrioridadAlertaDao(),
        estadoAlertaDao = database.estadoAlertaDao()
    )
    
    private val userId: String? = securityManager.getUserId()
    
    // Estados de UI
    private val _uiState = MutableStateFlow(AlertsUiState())
    val uiState: StateFlow<AlertsUiState> = _uiState.asStateFlow()
    
    // Datos observables
    val alertas: StateFlow<List<AlertaEntity>> = if (userId != null) {
        alertsRepository.getAlertasByUsuarioFlow(userId).stateIn(
            viewModelScope,
            SharingStarted.WhileSubscribed(5000),
            emptyList()
        )
    } else {
        MutableStateFlow(emptyList())
    }
    
    val alertasActivas: StateFlow<List<AlertaEntity>> = if (userId != null) {
        alertsRepository.getAlertasByUsuarioFlow(userId)
            .map { lista -> lista.filter { it.fecha_resolucion == null } }
            .stateIn(
                viewModelScope,
                SharingStarted.WhileSubscribed(5000),
                emptyList()
            )
    } else {
        MutableStateFlow(emptyList())
    }
    
    val tiposAlerta: StateFlow<List<TipoAlertaEntity>> =
        alertsRepository.getTiposAlertaFlow().stateIn(
            viewModelScope,
            SharingStarted.WhileSubscribed(5000),
            emptyList()
        )
    
    val categoriasAlerta: StateFlow<List<CategoriaAlertaEntity>> =
        alertsRepository.getCategoriasAlertaFlow().stateIn(
            viewModelScope,
            SharingStarted.WhileSubscribed(5000),
            emptyList()
        )
    
    val nivelesPrioridad: StateFlow<List<NivelPrioridadAlertaEntity>> =
        alertsRepository.getNivelesPrioridadFlow().stateIn(
            viewModelScope,
            SharingStarted.WhileSubscribed(5000),
            emptyList()
        )
    
    val estadosAlerta: StateFlow<List<EstadoAlertaEntity>> =
        alertsRepository.getEstadosAlertaFlow().stateIn(
            viewModelScope,
            SharingStarted.WhileSubscribed(5000),
            emptyList()
        )
    
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
            val tiposResult = alertsRepository.syncTiposAlertaFromServer()
            if (tiposResult.isSuccess) {
                syncCount++
            } else {
                errorCount++
                Log.w("AlertsViewModel", "No se pudo sincronizar tipos de alerta")
            }
            
            val categoriasResult = alertsRepository.syncCategoriasAlertaFromServer()
            if (categoriasResult.isSuccess) {
                syncCount++
            } else {
                errorCount++
                Log.w("AlertsViewModel", "No se pudo sincronizar categorías de alerta")
            }
            
            val nivelesResult = alertsRepository.syncNivelesPrioridadFromServer()
            if (nivelesResult.isSuccess) {
                syncCount++
            } else {
                errorCount++
                Log.w("AlertsViewModel", "No se pudo sincronizar niveles de prioridad")
            }
            
            val estadosResult = alertsRepository.syncEstadosAlertaFromServer()
            if (estadosResult.isSuccess) {
                syncCount++
            } else {
                errorCount++
                Log.w("AlertsViewModel", "No se pudo sincronizar estados de alerta")
            }
            
            // Sincronizar alertas
            val alertasResult = alertsRepository.syncAlertasFromServer(userId)
            if (alertasResult.isSuccess) {
                syncCount++
            } else {
                errorCount++
                Log.w("AlertsViewModel", "No se pudo sincronizar alertas")
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
 * Estado de UI para el módulo de Alertas
 */
data class AlertsUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val successMessage: String? = null
)

