package com.example.enutritrack_app.presentation.profile

import android.app.Application
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.enutritrack_app.data.local.SecurityManager
import com.example.enutritrack_app.data.local.database.EnutritrackDatabase
import com.example.enutritrack_app.data.local.entities.ProfileEntity
import com.example.enutritrack_app.data.local.repositories.UserLocalRepository
import com.example.enutritrack_app.data.repositories.ProfileRepository
import com.example.enutritrack_app.di.DatabaseModule
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

/**
 * ViewModel para el módulo de Perfil
 */
class ProfileViewModel(application: Application) : AndroidViewModel(application) {
    
    private val database = DatabaseModule.getDatabase(application)
    private val securityManager = SecurityManager(application)
    private val userLocalRepository = UserLocalRepository(database.userDao(), application)
    
    private val profileRepository = ProfileRepository(
        context = application,
        profileDao = database.profileDao(),
        userLocalRepository = userLocalRepository
    )
    
    private val userId: String? = securityManager.getUserId()
    
    // Obtener cuenta_id desde UserEntity (se inicializa en init)
    private var cuentaId: String? = null
    
    // Estados de UI
    private val _uiState = MutableStateFlow(ProfileUiState())
    val uiState: StateFlow<ProfileUiState> = _uiState.asStateFlow()
    
    // Perfil observable
    private val _profile = MutableStateFlow<ProfileEntity?>(null)
    val profile: StateFlow<ProfileEntity?> = _profile.asStateFlow()
    
    init {
        viewModelScope.launch {
            // Obtener cuenta_id desde UserEntity
            val user = userId?.let { userLocalRepository.getUserById(it) }
            cuentaId = user?.cuenta_id
            
            // Si cuenta_id está vacío o no existe, intentar obtenerlo del servidor usando usuario_id
            if ((cuentaId.isNullOrEmpty()) && userId != null) {
                // Intentar obtener cuenta_id desde el servidor usando GET /users/:id
                cuentaId = profileRepository.getCuentaIdFromUserId(userId)
                
                // Actualizar UserEntity con cuenta_id
                if (!cuentaId.isNullOrEmpty() && user != null) {
                    val updatedUser = user.copy(cuenta_id = cuentaId!!)
                    userLocalRepository.saveUser(updatedUser)
                    Log.d("ProfileViewModel", "Cuenta_id obtenido desde servidor: $cuentaId")
                }
            }
            
            if (!cuentaId.isNullOrEmpty()) {
                // Observar cambios en el perfil desde Room
                profileRepository.getProfile(cuentaId!!).collect { profileEntity ->
                    _profile.value = profileEntity
                }
            }
            
            if (!cuentaId.isNullOrEmpty()) {
                loadProfile()
            }
        }
    }
    
    /**
     * Carga el perfil desde el servidor
     */
    fun loadProfile() {
        val cuentaIdValue = cuentaId
        if (cuentaIdValue == null) {
            _uiState.value = _uiState.value.copy(
                error = "No se pudo obtener la cuenta del usuario"
            )
            return
        }
        
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            val result = profileRepository.syncFromServer(cuentaIdValue)
            result.fold(
                onSuccess = {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        successMessage = "Perfil actualizado"
                    )
                    clearSuccessMessage()
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Error al cargar el perfil"
                    )
                }
            )
        }
    }
    
    /**
     * Actualiza el perfil de usuario
     */
    fun updateProfile(
        nombre: String? = null,
        altura: Double? = null,
        telefono: String? = null,
        telefono1: String? = null,
        telefono2: String? = null
    ) {
        val cuentaIdValue = cuentaId ?: return
        
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            val result = profileRepository.updateProfile(
                cuentaId = cuentaIdValue,
                nombre = nombre,
                altura = altura,
                telefono = telefono,
                telefono1 = telefono1,
                telefono2 = telefono2
            )
            
            result.fold(
                onSuccess = {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        successMessage = "Perfil actualizado exitosamente"
                    )
                    clearSuccessMessage()
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Error al actualizar el perfil"
                    )
                }
            )
        }
    }
    
    /**
     * Actualiza los datos de cuenta (emails, contraseña)
     */
    fun updateAccount(
        email: String? = null,
        email1: String? = null,
        email2: String? = null,
        password: String? = null
    ) {
        val cuentaIdValue = cuentaId ?: return
        
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            val result = profileRepository.updateAccount(
                cuentaId = cuentaIdValue,
                email = email,
                email1 = email1,
                email2 = email2,
                password = password
            )
            
            result.fold(
                onSuccess = {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        successMessage = "Cuenta actualizada exitosamente"
                    )
                    clearSuccessMessage()
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Error al actualizar la cuenta"
                    )
                }
            )
        }
    }
    
    /**
     * Sincroniza el perfil desde el servidor
     */
    fun syncFromServer() {
        val cuentaIdValue = cuentaId ?: return
        
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            val result = profileRepository.syncFromServer(cuentaIdValue)
            result.fold(
                onSuccess = {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        successMessage = "Sincronización exitosa"
                    )
                    clearSuccessMessage()
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Error al sincronizar"
                    )
                }
            )
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
     * Limpia el mensaje de error
     */
    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}

/**
 * Estado de UI para el módulo de Perfil
 */
data class ProfileUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val successMessage: String? = null
)

