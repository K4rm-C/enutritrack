package com.example.enutritrack_app.presentation.nutrition

import android.app.Application
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.enutritrack_app.data.local.SecurityManager
import com.example.enutritrack_app.data.local.database.EnutritrackDatabase
import com.example.enutritrack_app.data.local.entities.*
import com.example.enutritrack_app.data.local.repositories.UserLocalRepository
import com.example.enutritrack_app.data.repositories.NutritionRepository
import com.example.enutritrack_app.di.DatabaseModule
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

/**
 * ViewModel para el módulo de Nutrición
 */
class NutritionViewModel(application: Application) : AndroidViewModel(application) {

    private val database = DatabaseModule.getDatabase(application)
    private val securityManager = SecurityManager(application)
    private val userLocalRepository = UserLocalRepository(database.userDao(), application)

    private val nutritionRepository = NutritionRepository(
        context = application,
        alimentoDao = database.alimentoDao(),
        registroComidaDao = database.registroComidaDao(),
        registroComidaItemDao = database.registroComidaItemDao(),
        recomendacionDao = database.recomendacionDao()
    )

    private val userId: String? = securityManager.getUserId()

    // Estados de UI
    private val _uiState = MutableStateFlow(NutritionUiState())
    val uiState: StateFlow<NutritionUiState> = _uiState.asStateFlow()

    // Flows de datos
    val recomendaciones: StateFlow<List<RecomendacionEntity>> = userId?.let { uid ->
        nutritionRepository.getRecomendacionesActivas(uid).stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )
    } ?: MutableStateFlow(emptyList())

    val alimentos: StateFlow<List<AlimentoEntity>> = nutritionRepository.getAlimentos().stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )

    val registrosComida: StateFlow<List<RegistroComidaEntity>> = userId?.let { uid ->
        nutritionRepository.getRegistrosComida(uid).stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )
    } ?: MutableStateFlow(emptyList())

    init {
        loadData()
    }

    /**
     * Carga datos iniciales desde el servidor
     */
    fun loadData() {
        val usuarioId = userId ?: return
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            // Sincronizar recomendaciones, alimentos y registros
            val resultados = listOf(
                nutritionRepository.syncRecomendacionesFromServer(usuarioId),
                nutritionRepository.syncAlimentosFromServer(),
                nutritionRepository.syncRegistrosComidaFromServer(usuarioId)
            )
            
            val errores = resultados.filter { it.isFailure }
            if (errores.isNotEmpty()) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = errores.first().exceptionOrNull()?.message ?: "Error al cargar datos"
                )
            } else {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    successMessage = "Datos actualizados"
                )
                clearSuccessMessage()
            }
        }
    }

    /**
     * Sincroniza todos los datos pendientes
     */
    fun syncFromServer() {
        val usuarioId = userId ?: return
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            nutritionRepository.syncAllPending()
            
            val resultados = listOf(
                nutritionRepository.syncRecomendacionesFromServer(usuarioId),
                nutritionRepository.syncAlimentosFromServer(),
                nutritionRepository.syncRegistrosComidaFromServer(usuarioId)
            )
            
            val errores = resultados.filter { it.isFailure }
            if (errores.isNotEmpty()) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = errores.first().exceptionOrNull()?.message ?: "Error al sincronizar"
                )
            } else {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    successMessage = "Sincronización exitosa"
                )
                clearSuccessMessage()
            }
        }
    }

    /**
     * Crea un nuevo alimento
     */
    fun createAlimento(
        nombre: String,
        descripcion: String?,
        caloriasPor100g: Double,
        proteinasGPor100g: Double,
        carbohidratosGPor100g: Double,
        grasasGPor100g: Double,
        fibraGPor100g: Double?,
        categoria: String?
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            val result = nutritionRepository.createAlimento(
                nombre = nombre,
                descripcion = descripcion,
                caloriasPor100g = caloriasPor100g,
                proteinasGPor100g = proteinasGPor100g,
                carbohidratosGPor100g = carbohidratosGPor100g,
                grasasGPor100g = grasasGPor100g,
                fibraGPor100g = fibraGPor100g,
                categoria = categoria
            )
            
            result.fold(
                onSuccess = {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        successMessage = "Alimento creado exitosamente"
                    )
                    clearSuccessMessage()
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Error al crear alimento"
                    )
                }
            )
        }
    }

    /**
     * Actualiza un alimento existente
     */
    fun updateAlimento(
        alimentoId: String,
        nombre: String? = null,
        descripcion: String? = null,
        caloriasPor100g: Double? = null,
        proteinasGPor100g: Double? = null,
        carbohidratosGPor100g: Double? = null,
        grasasGPor100g: Double? = null,
        fibraGPor100g: Double? = null,
        categoria: String? = null
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            val result = nutritionRepository.updateAlimento(
                alimentoId = alimentoId,
                nombre = nombre,
                descripcion = descripcion,
                caloriasPor100g = caloriasPor100g,
                proteinasGPor100g = proteinasGPor100g,
                carbohidratosGPor100g = carbohidratosGPor100g,
                grasasGPor100g = grasasGPor100g,
                fibraGPor100g = fibraGPor100g,
                categoria = categoria
            )
            
            result.fold(
                onSuccess = {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        successMessage = "Alimento actualizado exitosamente"
                    )
                    clearSuccessMessage()
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Error al actualizar alimento"
                    )
                }
            )
        }
    }

    /**
     * Elimina un alimento
     */
    fun deleteAlimento(alimentoId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            val result = nutritionRepository.deleteAlimento(alimentoId)
            
            result.fold(
                onSuccess = {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        successMessage = "Alimento eliminado exitosamente"
                    )
                    clearSuccessMessage()
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Error al eliminar alimento"
                    )
                }
            )
        }
    }

    /**
     * Busca alimentos por nombre
     */
    suspend fun searchAlimentos(query: String): List<AlimentoEntity> {
        return nutritionRepository.searchAlimentos(query)
    }

    /**
     * Crea un nuevo registro de comida
     */
    fun createRegistroComida(
        fecha: Long,
        tipoComida: TipoComidaEnum,
        notas: String? = null
    ) {
        val usuarioId = userId ?: return
        
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            val result = nutritionRepository.createRegistroComida(
                usuarioId = usuarioId,
                fecha = fecha,
                tipoComida = tipoComida,
                notas = notas
            )
            
            result.fold(
                onSuccess = { registro ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        successMessage = "Registro de comida creado exitosamente",
                        createdRegistroId = registro.id
                    )
                    clearSuccessMessage()
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Error al crear registro de comida"
                    )
                }
            )
        }
    }

    /**
     * Actualiza un registro de comida
     */
    fun updateRegistroComida(
        registroComidaId: String,
        fecha: Long? = null,
        tipoComida: TipoComidaEnum? = null,
        notas: String? = null
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            val result = nutritionRepository.updateRegistroComida(
                registroComidaId = registroComidaId,
                fecha = fecha,
                tipoComida = tipoComida,
                notas = notas
            )
            
            result.fold(
                onSuccess = {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        successMessage = "Registro de comida actualizado exitosamente"
                    )
                    clearSuccessMessage()
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Error al actualizar registro de comida"
                    )
                }
            )
        }
    }

    /**
     * Elimina un registro de comida
     */
    fun deleteRegistroComida(registroComidaId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            val result = nutritionRepository.deleteRegistroComida(registroComidaId)
            
            result.fold(
                onSuccess = {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        successMessage = "Registro de comida eliminado exitosamente"
                    )
                    clearSuccessMessage()
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Error al eliminar registro de comida"
                    )
                }
            )
        }
    }

    /**
     * Agrega un item a un registro de comida
     * Calcula automáticamente los valores nutricionales
     */
    fun addItemToRegistroComida(
        registroComidaId: String,
        alimentoId: String,
        cantidadGramos: Double,
        notas: String? = null
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            val result = nutritionRepository.addItemToRegistroComida(
                registroComidaId = registroComidaId,
                alimentoId = alimentoId,
                cantidadGramos = cantidadGramos,
                notas = notas
            )
            
            result.fold(
                onSuccess = {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        successMessage = "Item agregado exitosamente"
                    )
                    clearSuccessMessage()
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Error al agregar item"
                    )
                }
            )
        }
    }

    /**
     * Actualiza un item de registro de comida
     */
    fun updateItem(
        itemId: String,
        alimentoId: String? = null,
        cantidadGramos: Double? = null,
        notas: String? = null
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            val result = nutritionRepository.updateItem(
                itemId = itemId,
                alimentoId = alimentoId,
                cantidadGramos = cantidadGramos,
                notas = notas
            )
            
            result.fold(
                onSuccess = {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        successMessage = "Item actualizado exitosamente"
                    )
                    clearSuccessMessage()
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Error al actualizar item"
                    )
                }
            )
        }
    }

    /**
     * Elimina un item de registro de comida
     */
    fun deleteItem(itemId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            val result = nutritionRepository.deleteItem(itemId)
            
            result.fold(
                onSuccess = {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        successMessage = "Item eliminado exitosamente"
                    )
                    clearSuccessMessage()
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Error al eliminar item"
                    )
                }
            )
        }
    }

    /**
     * Obtiene el total nutricional de un registro de comida
     */
    suspend fun getTotalNutricional(registroComidaId: String): NutritionRepository.CalculatedNutrition {
        return nutritionRepository.calcularTotalNutricional(registroComidaId)
    }

    /**
     * Obtiene un registro de comida por ID como Flow
     */
    fun getRegistroComidaById(id: String): Flow<RegistroComidaEntity?> {
        return nutritionRepository.getRegistroComidaById(id)
    }

    /**
     * Obtiene los items de un registro de comida como Flow
     */
    fun getItemsByRegistroComida(registroComidaId: String): Flow<List<RegistroComidaItemEntity>> {
        return nutritionRepository.getItemsByRegistroComida(registroComidaId)
    }

    /**
     * Limpia el mensaje de éxito después de 3 segundos
     */
    private fun clearSuccessMessage() {
        viewModelScope.launch {
            kotlinx.coroutines.delay(3000)
            _uiState.value = _uiState.value.copy(successMessage = null, createdRegistroId = null)
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
 * Estado de UI para el módulo de Nutrición
 */
data class NutritionUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val successMessage: String? = null,
    val createdRegistroId: String? = null // ID del registro creado para navegación
)

