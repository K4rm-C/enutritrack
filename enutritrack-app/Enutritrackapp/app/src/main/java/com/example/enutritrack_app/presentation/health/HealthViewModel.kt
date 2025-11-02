package com.example.enutritrack_app.presentation.health

import android.app.Application
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.enutritrack_app.data.local.SecurityManager
import com.example.enutritrack_app.data.local.database.EnutritrackDatabase
import com.example.enutritrack_app.data.local.entities.ActivityLevel
import com.example.enutritrack_app.data.local.entities.HistorialPesoEntity
import com.example.enutritrack_app.data.local.entities.MedicalHistoryEntity
import com.example.enutritrack_app.data.local.entities.MedicamentoEntity
import com.example.enutritrack_app.data.local.entities.ObjetivoUsuarioEntity
import com.example.enutritrack_app.data.local.repositories.UserLocalRepository
import com.example.enutritrack_app.data.repositories.HealthRepository
import com.example.enutritrack_app.di.DatabaseModule
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.util.*

/**
 * ViewModel para el módulo de Salud
 */
class HealthViewModel(application: Application) : AndroidViewModel(application) {
    
    private val database = DatabaseModule.getDatabase(application)
    private val securityManager = SecurityManager(application)
    private val userLocalRepository = UserLocalRepository(database.userDao(), application)
    
    private val healthRepository = HealthRepository(
        context = application,
        historialPesoDao = database.historialPesoDao(),
        objetivoUsuarioDao = database.objetivoUsuarioDao(),
        medicalHistoryDao = database.medicalHistoryDao(),
        medicamentoDao = database.medicamentoDao(),
        alergiaDao = database.alergiaDao(),
        actividadFisicaDao = database.actividadFisicaDao(),
        userLocalRepository = userLocalRepository
    )
    
    private val userId: String? = securityManager.getUserId()
    
    // Estados de UI
    private val _uiState = MutableStateFlow(HealthUiState())
    val uiState: StateFlow<HealthUiState> = _uiState.asStateFlow()
    
    // Datos observables
    val currentWeight: StateFlow<HistorialPesoEntity?> = if (userId != null) {
        healthRepository.getLastWeight(userId).stateIn(
            viewModelScope,
            SharingStarted.WhileSubscribed(5000),
            null
        )
    } else {
        MutableStateFlow(null)
    }
    
    val weightHistory: StateFlow<List<HistorialPesoEntity>> = if (userId != null) {
        healthRepository.getWeightHistory(userId).stateIn(
            viewModelScope,
            SharingStarted.WhileSubscribed(5000),
            emptyList()
        )
    } else {
        MutableStateFlow(emptyList())
    }
    
    val currentObjective: StateFlow<ObjetivoUsuarioEntity?> = if (userId != null) {
        healthRepository.getCurrentObjective(userId).stateIn(
            viewModelScope,
            SharingStarted.WhileSubscribed(5000),
            null
        )
    } else {
        MutableStateFlow(null)
    }
    
    val activeMedications: StateFlow<List<MedicamentoEntity>> = if (userId != null) {
        healthRepository.getActiveMedications(userId).stateIn(
            viewModelScope,
            SharingStarted.WhileSubscribed(5000),
            emptyList()
        )
    } else {
        MutableStateFlow(emptyList())
    }
    
    val medicalHistory: StateFlow<MedicalHistoryEntity?> = if (userId != null) {
        healthRepository.getMedicalHistory(userId).stateIn(
            viewModelScope,
            SharingStarted.WhileSubscribed(5000),
            null
        )
    } else {
        MutableStateFlow(null)
    }
    
    val alergias: StateFlow<List<com.example.enutritrack_app.data.local.entities.AlergiaEntity>> = if (userId != null) {
        healthRepository.getActiveAlergias(userId).stateIn(
            viewModelScope,
            SharingStarted.WhileSubscribed(5000),
            emptyList()
        )
    } else {
        MutableStateFlow(emptyList())
    }
    
    val actividadesFisicas: StateFlow<List<com.example.enutritrack_app.data.local.entities.ActividadFisicaEntity>> = if (userId != null) {
        healthRepository.getActividadesFisicas(userId).stateIn(
            viewModelScope,
            SharingStarted.WhileSubscribed(5000),
            emptyList()
        )
    } else {
        MutableStateFlow(emptyList())
    }
    
    init {
        loadHealthData()
    }
    
    /**
     * Carga datos de salud desde Room
     * 
     * Nota: La sincronización desde servidor solo se hace cuando el usuario
     * presiona el botón "Sincronizar Datos" para evitar errores por autenticación
     * diferente entre microservicio y servidor principal
     */
    private fun loadHealthData() {
        viewModelScope.launch {
            if (userId == null) {
                _uiState.value = _uiState.value.copy(
                    error = "Usuario no autenticado",
                    isLoading = false
                )
                return@launch
            }
            
            // Solo sincronizar datos pendientes offline, no desde servidor
            // La sincronización desde servidor se hace manualmente
            syncAllPendingOffline()
        }
    }
    
    /**
     * Sincroniza solo datos pendientes de sincronización offline
     */
    private suspend fun syncAllPendingOffline() {
        try {
            healthRepository.syncAllPendingHealthData()
        } catch (e: Exception) {
            Log.e("HealthViewModel", "Error sincronizando datos pendientes", e)
            // No mostrar error al usuario, solo loguear
        }
    }
    
    /**
     * Agrega un nuevo registro de peso
     */
    fun addWeight(weight: Double, date: Date, notes: String? = null) {
        if (userId == null) return
        
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            val result = healthRepository.addWeight(userId, weight, date, notes)
            result.fold(
                onSuccess = {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        successMessage = "Peso registrado exitosamente"
                    )
                    clearSuccessMessage()
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Error al registrar peso"
                    )
                }
            )
        }
    }
    
    /**
     * Establece un nuevo objetivo de usuario
     */
    fun setObjective(weightGoal: Double?, activityLevel: ActivityLevel) {
        if (userId == null) return
        
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            val result = healthRepository.setObjective(userId, weightGoal, activityLevel)
            result.fold(
                onSuccess = {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        successMessage = "Objetivo actualizado exitosamente"
                    )
                    clearSuccessMessage()
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Error al establecer objetivo"
                    )
                }
            )
        }
    }
    
    /**
     * Sincroniza datos desde el servidor
     * 
     * Maneja errores 404 de manera silenciosa ya que puede haber problemas
     * de autenticación entre microservicio y servidor principal
     */
    fun syncFromServer() {
        if (userId == null) return
        
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSyncing = true, error = null)
            
            try {
                var syncCount = 0
                var errorCount = 0
                
                // Sincronizar peso (manejar 404 silenciosamente)
                val weightResult = healthRepository.syncFromServer(userId)
                if (weightResult.isSuccess) {
                    syncCount++
                } else {
                    errorCount++
                    Log.w("HealthViewModel", "No se pudo sincronizar peso desde servidor")
                }
                
                // Sincronizar objetivos (manejar 404 silenciosamente)
                val objectiveResult = healthRepository.syncObjectivesFromServer(userId)
                if (objectiveResult.isSuccess) {
                    syncCount++
                } else {
                    errorCount++
                    Log.w("HealthViewModel", "No se pudo sincronizar objetivos desde servidor")
                }
                
                // Sincronizar medicamentos (manejar 404 silenciosamente)
                val medicationResult = healthRepository.syncMedicationsFromServer(userId)
                if (medicationResult.isSuccess) {
                    syncCount++
                } else {
                    errorCount++
                    Log.w("HealthViewModel", "No se pudo sincronizar medicamentos desde servidor")
                }
                
                // Sincronizar historial médico (manejar 404 silenciosamente)
                val medicalHistoryResult = healthRepository.syncMedicalHistoryFromServer(userId)
                if (medicalHistoryResult.isSuccess) {
                    syncCount++
                } else {
                    errorCount++
                    Log.w("HealthViewModel", "No se pudo sincronizar historial médico desde servidor")
                }
                
                // Sincronizar alergias (manejar 404 silenciosamente)
                val alergiasResult = healthRepository.syncAlergiasFromServer(userId)
                if (alergiasResult.isSuccess) {
                    syncCount++
                } else {
                    errorCount++
                    Log.w("HealthViewModel", "No se pudo sincronizar alergias desde servidor")
                }
                
                // Sincronizar actividades físicas (manejar 404 silenciosamente)
                val actividadFisicaResult = healthRepository.syncActividadesFisicasFromServer(userId)
                if (actividadFisicaResult.isSuccess) {
                    syncCount++
                } else {
                    errorCount++
                    Log.w("HealthViewModel", "No se pudo sincronizar actividades físicas desde servidor")
                }
                
                // Sincronizar datos pendientes offline
                healthRepository.syncAllPendingHealthData()
                
                // Mensaje según resultados
                _uiState.value = if (syncCount > 0) {
                    _uiState.value.copy(
                        isSyncing = false,
                        successMessage = if (errorCount > 0) {
                            "Algunos datos sincronizados. Algunos endpoints no están disponibles."
                        } else {
                            "Datos sincronizados"
                        }
                    )
                } else {
                    _uiState.value.copy(
                        isSyncing = false,
                        successMessage = "Datos locales actualizados. Sincronización con servidor no disponible por ahora."
                    )
                }
                clearSuccessMessage()
            } catch (e: Exception) {
                Log.e("HealthViewModel", "Error sincronizando", e)
                _uiState.value = _uiState.value.copy(
                    isSyncing = false,
                    successMessage = "Datos locales actualizados. Sincronización con servidor no disponible."
                )
                clearSuccessMessage()
            }
        }
    }
    
    /**
     * Limpia el mensaje de éxito después de 3 segundos
     */
    private fun clearSuccessMessage() {
        viewModelScope.launch {
            kotlinx.coroutines.delay(3000)
            _uiState.value = _uiState.value.copy(successMessage = null)
        }
    }
    
    /**
     * Agrega una nueva alergia
     */
    fun addAlergia(
        tipo: String?,
        nombre: String,
        severidad: String,
        reaccion: String,
        notas: String?
    ) {
        if (userId == null) return
        
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            val result = healthRepository.addAlergia(userId, tipo, nombre, severidad, reaccion, notas)
            result.fold(
                onSuccess = {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        successMessage = "Alergia agregada exitosamente"
                    )
                    clearSuccessMessage()
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Error al agregar alergia"
                    )
                }
            )
        }
    }
    
    /**
     * Actualiza una alergia existente
     */
    fun updateAlergia(
        alergiaId: String,
        tipo: String?,
        nombre: String,
        severidad: String,
        reaccion: String,
        notas: String?
    ) {
        if (userId == null) return
        
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            val result = healthRepository.updateAlergia(alergiaId, tipo, nombre, severidad, reaccion, notas, null)
            result.fold(
                onSuccess = {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        successMessage = "Alergia actualizada exitosamente"
                    )
                    clearSuccessMessage()
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Error al actualizar alergia"
                    )
                }
            )
        }
    }
    
    /**
     * Elimina una alergia
     */
    fun deleteAlergia(alergiaId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            val result = healthRepository.deleteAlergia(alergiaId)
            result.fold(
                onSuccess = {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        successMessage = "Alergia eliminada exitosamente"
                    )
                    clearSuccessMessage()
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Error al eliminar alergia"
                    )
                }
            )
        }
    }
    
    /**
     * Agrega una nueva actividad física
     */
    fun addActividadFisica(
        tipoActividad: String,
        duracionMin: Int,
        caloriasQuemadas: Double,
        fecha: Date
    ) {
        if (userId == null) return
        
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            val result = healthRepository.addActividadFisica(
                usuarioId = userId!!,
                tipoActividad = tipoActividad,
                duracionMin = duracionMin,
                caloriasQuemadas = caloriasQuemadas,
                fecha = fecha
            )
            result.fold(
                onSuccess = {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        successMessage = "Actividad física registrada exitosamente"
                    )
                    clearSuccessMessage()
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Error al registrar actividad física"
                    )
                }
            )
        }
    }
    
    /**
     * Actualiza una actividad física existente
     */
    fun updateActividadFisica(
        actividadFisicaId: String,
        tipoActividad: String? = null,
        duracionMin: Int? = null,
        caloriasQuemadas: Double? = null,
        fecha: Date? = null
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            val result = healthRepository.updateActividadFisica(
                actividadFisicaId = actividadFisicaId,
                tipoActividad = tipoActividad,
                duracionMin = duracionMin,
                caloriasQuemadas = caloriasQuemadas,
                fecha = fecha
            )
            result.fold(
                onSuccess = {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        successMessage = "Actividad física actualizada exitosamente"
                    )
                    clearSuccessMessage()
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Error al actualizar actividad física"
                    )
                }
            )
        }
    }
    
    /**
     * Elimina una actividad física
     */
    fun deleteActividadFisica(actividadFisicaId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            val result = healthRepository.deleteActividadFisica(actividadFisicaId)
            result.fold(
                onSuccess = {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        successMessage = "Actividad física eliminada exitosamente"
                    )
                    clearSuccessMessage()
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Error al eliminar actividad física"
                    )
                }
            )
        }
    }
    
    /**
     * Limpia el error
     */
    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}

/**
 * Estado de UI para el módulo de Salud
 */
data class HealthUiState(
    val isLoading: Boolean = false,
    val isSyncing: Boolean = false,
    val error: String? = null,
    val successMessage: String? = null
)

