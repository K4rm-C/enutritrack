package com.example.enutritrack_app.data.repositories

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.util.Log
import com.example.enutritrack_app.data.local.dao.*
import com.example.enutritrack_app.data.local.database.SyncStatus
import com.example.enutritrack_app.data.local.entities.*
import com.example.enutritrack_app.data.local.mappers.*
import com.example.enutritrack_app.data.remote.api.NutritionApiService
import com.example.enutritrack_app.di.NetworkModule
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import java.util.*

/**
 * Repositorio que combina operaciones locales (Room) y remotas (API)
 * para el módulo de nutrición
 * 
 * Estrategia offline-first:
 * 1. Escribir primero en Room
 * 2. Marcar como PENDING si no hay conexión
 * 3. Sincronizar automáticamente cuando hay conexión
 * 
 * Incluye lógica de cálculo automático de valores nutricionales
 * basado en cantidad en gramos y valores por 100g del alimento
 */
class NutritionRepository(
    private val context: Context,
    private val alimentoDao: AlimentoDao,
    private val registroComidaDao: RegistroComidaDao,
    private val registroComidaItemDao: RegistroComidaItemDao,
    private val recomendacionDao: RecomendacionDao
) {
    
    private val nutritionApiService: NutritionApiService = NetworkModule.createNutritionApiService(context)
    
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
     * Redondea un valor a 2 decimales
     */
    private fun roundToTwoDecimals(value: Double): Double {
        return kotlin.math.round(value * 100.0) / 100.0
    }
    
    /**
     * Calcula valores nutricionales para un item basándose en:
     * - Alimento (con valores por 100g)
     * - Cantidad en gramos consumida
     * 
     * Fórmula: valor_nutricional = (valor_por_100g * cantidad_gramos) / 100
     */
    private fun calcularValoresNutricionales(
        alimento: AlimentoEntity,
        cantidadGramos: Double
    ): CalculatedNutrition {
        val factor = cantidadGramos / 100.0
        
        return CalculatedNutrition(
            calorias = roundToTwoDecimals(alimento.calorias_por_100g * factor),
            proteinas_g = roundToTwoDecimals(alimento.proteinas_g_por_100g * factor),
            carbohidratos_g = roundToTwoDecimals(alimento.carbohidratos_g_por_100g * factor),
            grasas_g = roundToTwoDecimals(alimento.grasas_g_por_100g * factor),
            fibra_g = alimento.fibra_g_por_100g?.let { roundToTwoDecimals(it * factor) }
        )
    }
    
    /**
     * Calcula el total nutricional de todos los items de un registro de comida
     */
    suspend fun calcularTotalNutricional(registroComidaId: String): CalculatedNutrition {
        val items = registroComidaItemDao.getByRegistroComida(registroComidaId)
        return items.fold(CalculatedNutrition()) { acc, item ->
            acc.copy(
                calorias = roundToTwoDecimals(acc.calorias + item.calorias),
                proteinas_g = roundToTwoDecimals(acc.proteinas_g + item.proteinas_g),
                carbohidratos_g = roundToTwoDecimals(acc.carbohidratos_g + item.carbohidratos_g),
                grasas_g = roundToTwoDecimals(acc.grasas_g + item.grasas_g),
                fibra_g = roundToTwoDecimals((acc.fibra_g ?: 0.0) + (item.fibra_g ?: 0.0)).takeIf { it > 0.0 }
            )
        }
    }
    
    /**
     * Data class para valores nutricionales calculados
     */
    data class CalculatedNutrition(
        val calorias: Double = 0.0,
        val proteinas_g: Double = 0.0,
        val carbohidratos_g: Double = 0.0,
        val grasas_g: Double = 0.0,
        val fibra_g: Double? = null
    )
    
    // ========== ALIMENTOS ==========
    
    /**
     * Obtiene todos los alimentos como Flow
     */
    fun getAlimentos(): Flow<List<AlimentoEntity>> {
        return alimentoDao.getAllFlow()
    }
    
    /**
     * Obtiene un alimento por ID como Flow
     */
    fun getAlimentoById(id: String): Flow<AlimentoEntity?> {
        return alimentoDao.getByIdFlow(id)
    }
    
    /**
     * Busca alimentos por nombre
     */
    suspend fun searchAlimentos(query: String): List<AlimentoEntity> {
        return if (query.isBlank()) {
            alimentoDao.getAll()
        } else {
            alimentoDao.searchByName(query)
        }
    }
    
    /**
     * Crea un nuevo alimento
     */
    suspend fun createAlimento(
        nombre: String,
        descripcion: String? = null,
        caloriasPor100g: Double,
        proteinasGPor100g: Double,
        carbohidratosGPor100g: Double,
        grasasGPor100g: Double,
        fibraGPor100g: Double? = null,
        categoria: String? = null
    ): Result<AlimentoEntity> {
        return try {
            val entity = AlimentoEntity(
                id = UUID.randomUUID().toString(),
                nombre = nombre,
                descripcion = descripcion,
                calorias_por_100g = caloriasPor100g,
                proteinas_g_por_100g = proteinasGPor100g,
                carbohidratos_g_por_100g = carbohidratosGPor100g,
                grasas_g_por_100g = grasasGPor100g,
                fibra_g_por_100g = fibraGPor100g,
                categoria = categoria,
                syncStatus = if (isOnline()) SyncStatus.PENDING_CREATE else SyncStatus.PENDING_CREATE,
                createdAt = System.currentTimeMillis(),
                updatedAt = System.currentTimeMillis()
            )
            
            alimentoDao.insert(entity)
            Log.d("NutritionRepository", "Alimento guardado localmente: ${entity.id}")
            
            if (isOnline()) {
                syncSingleAlimento(entity)
            }
            
            Result.success(entity)
        } catch (e: Exception) {
            Log.e("NutritionRepository", "Error al crear alimento", e)
            Result.failure(e)
        }
    }
    
    /**
     * Actualiza un alimento existente
     */
    suspend fun updateAlimento(
        alimentoId: String,
        nombre: String? = null,
        descripcion: String? = null,
        caloriasPor100g: Double? = null,
        proteinasGPor100g: Double? = null,
        carbohidratosGPor100g: Double? = null,
        grasasGPor100g: Double? = null,
        fibraGPor100g: Double? = null,
        categoria: String? = null
    ): Result<AlimentoEntity> {
        return try {
            val existing = alimentoDao.getById(alimentoId)
                ?: return Result.failure(Exception("Alimento no encontrado"))
            
            val updated = existing.copy(
                nombre = nombre ?: existing.nombre,
                descripcion = descripcion ?: existing.descripcion,
                calorias_por_100g = caloriasPor100g ?: existing.calorias_por_100g,
                proteinas_g_por_100g = proteinasGPor100g ?: existing.proteinas_g_por_100g,
                carbohidratos_g_por_100g = carbohidratosGPor100g ?: existing.carbohidratos_g_por_100g,
                grasas_g_por_100g = grasasGPor100g ?: existing.grasas_g_por_100g,
                fibra_g_por_100g = fibraGPor100g ?: existing.fibra_g_por_100g,
                categoria = categoria ?: existing.categoria,
                syncStatus = if (existing.syncStatus == SyncStatus.SYNCED) SyncStatus.PENDING_UPDATE else existing.syncStatus,
                updatedAt = System.currentTimeMillis()
            )
            
            alimentoDao.update(updated)
            
            if (isOnline()) {
                syncAlimentoUpdate(updated)
            }
            
            Result.success(updated)
        } catch (e: Exception) {
            Log.e("NutritionRepository", "Error al actualizar alimento", e)
            Result.failure(e)
        }
    }
    
    /**
     * Elimina un alimento
     */
    suspend fun deleteAlimento(alimentoId: String): Result<Unit> {
        return try {
            val alimento = alimentoDao.getById(alimentoId)
                ?: return Result.failure(Exception("Alimento no encontrado"))
            
            // Verificar si está siendo usado en registros de comida
            // TODO: Opcional - agregar validación para prevenir eliminación si está en uso
            
            alimentoDao.deleteById(alimentoId)
            
            if (isOnline() && alimento.serverId != null) {
                syncAlimentoDelete(alimento.serverId!!)
            }
            
            Result.success(Unit)
        } catch (e: Exception) {
            Log.e("NutritionRepository", "Error al eliminar alimento", e)
            Result.failure(e)
        }
    }
    
    // ========== REGISTROS DE COMIDA ==========
    
    /**
     * Obtiene todos los registros de comida de un usuario como Flow
     */
    fun getRegistrosComida(usuarioId: String): Flow<List<RegistroComidaEntity>> {
        return registroComidaDao.getByUsuarioFlow(usuarioId)
    }
    
    /**
     * Obtiene un registro de comida por ID como Flow
     */
    fun getRegistroComidaById(id: String): Flow<RegistroComidaEntity?> {
        return registroComidaDao.getByIdFlow(id)
    }
    
    /**
     * Obtiene los items de un registro de comida como Flow
     */
    fun getItemsByRegistroComida(registroComidaId: String): Flow<List<RegistroComidaItemEntity>> {
        return registroComidaItemDao.getByRegistroComidaFlow(registroComidaId)
    }
    
    /**
     * Crea un nuevo registro de comida
     */
    suspend fun createRegistroComida(
        usuarioId: String,
        fecha: Long, // timestamp en millis
        tipoComida: TipoComidaEnum,
        notas: String? = null
    ): Result<RegistroComidaEntity> {
        return try {
            val entity = RegistroComidaEntity(
                id = UUID.randomUUID().toString(),
                usuario_id = usuarioId,
                fecha = fecha,
                tipo_comida = tipoComida,
                notas = notas,
                syncStatus = if (isOnline()) SyncStatus.PENDING_CREATE else SyncStatus.PENDING_CREATE,
                createdAt = System.currentTimeMillis(),
                updatedAt = System.currentTimeMillis()
            )
            
            registroComidaDao.insert(entity)
            Log.d("NutritionRepository", "Registro de comida guardado localmente: ${entity.id}")
            
            if (isOnline()) {
                syncSingleRegistroComida(entity)
            }
            
            Result.success(entity)
        } catch (e: Exception) {
            Log.e("NutritionRepository", "Error al crear registro de comida", e)
            Result.failure(e)
        }
    }
    
    /**
     * Actualiza un registro de comida existente
     */
    suspend fun updateRegistroComida(
        registroComidaId: String,
        fecha: Long? = null,
        tipoComida: TipoComidaEnum? = null,
        notas: String? = null
    ): Result<RegistroComidaEntity> {
        return try {
            val existing = registroComidaDao.getById(registroComidaId)
                ?: return Result.failure(Exception("Registro de comida no encontrado"))
            
            val updated = existing.copy(
                fecha = fecha ?: existing.fecha,
                tipo_comida = tipoComida ?: existing.tipo_comida,
                notas = notas ?: existing.notas,
                syncStatus = if (existing.syncStatus == SyncStatus.SYNCED) SyncStatus.PENDING_UPDATE else existing.syncStatus,
                updatedAt = System.currentTimeMillis()
            )
            
            registroComidaDao.update(updated)
            
            if (isOnline()) {
                syncRegistroComidaUpdate(updated)
            }
            
            Result.success(updated)
        } catch (e: Exception) {
            Log.e("NutritionRepository", "Error al actualizar registro de comida", e)
            Result.failure(e)
        }
    }
    
    /**
     * Elimina un registro de comida (y todos sus items)
     */
    suspend fun deleteRegistroComida(registroComidaId: String): Result<Unit> {
        return try {
            val registro = registroComidaDao.getById(registroComidaId)
                ?: return Result.failure(Exception("Registro de comida no encontrado"))
            
            // Eliminar items primero
            registroComidaItemDao.deleteByRegistroComida(registroComidaId)
            
            // Eliminar registro
            registroComidaDao.deleteById(registroComidaId)
            
            if (isOnline() && registro.serverId != null) {
                syncRegistroComidaDelete(registro.serverId!!)
            }
            
            Result.success(Unit)
        } catch (e: Exception) {
            Log.e("NutritionRepository", "Error al eliminar registro de comida", e)
            Result.failure(e)
        }
    }
    
    // ========== ITEMS DE REGISTRO DE COMIDA ==========
    
    /**
     * Agrega un item a un registro de comida
     * Calcula automáticamente los valores nutricionales basándose en el alimento y cantidad
     */
    suspend fun addItemToRegistroComida(
        registroComidaId: String,
        alimentoId: String,
        cantidadGramos: Double,
        notas: String? = null
    ): Result<RegistroComidaItemEntity> {
        return try {
            // 1. Obtener el alimento
            val alimento = alimentoDao.getById(alimentoId)
                ?: return Result.failure(Exception("Alimento no encontrado"))
            
            // 2. Calcular valores nutricionales automáticamente
            val valoresNutricionales = calcularValoresNutricionales(alimento, cantidadGramos)
            
            // 3. Crear entidad del item
            val entity = RegistroComidaItemEntity(
                id = UUID.randomUUID().toString(),
                registro_comida_id = registroComidaId,
                alimento_id = alimentoId,
                cantidad_gramos = cantidadGramos,
                calorias = valoresNutricionales.calorias,
                proteinas_g = valoresNutricionales.proteinas_g,
                carbohidratos_g = valoresNutricionales.carbohidratos_g,
                grasas_g = valoresNutricionales.grasas_g,
                fibra_g = valoresNutricionales.fibra_g,
                notas = notas,
                syncStatus = if (isOnline()) SyncStatus.PENDING_CREATE else SyncStatus.PENDING_CREATE,
                createdAt = System.currentTimeMillis()
            )
            
            // 4. Guardar en Room
            registroComidaItemDao.insert(entity)
            Log.d("NutritionRepository", "Item agregado a registro de comida: ${entity.id}")
            Log.d("NutritionRepository", "Valores calculados - Calorías: ${entity.calorias}, Proteínas: ${entity.proteinas_g}")
            
            // 5. Intentar sincronizar si hay conexión
            if (isOnline()) {
                syncSingleItem(entity)
            }
            
            Result.success(entity)
        } catch (e: Exception) {
            Log.e("NutritionRepository", "Error al agregar item a registro de comida", e)
            Result.failure(e)
        }
    }
    
    /**
     * Actualiza un item existente
     * Recalcula los valores nutricionales si cambia la cantidad o el alimento
     */
    suspend fun updateItem(
        itemId: String,
        alimentoId: String? = null,
        cantidadGramos: Double? = null,
        notas: String? = null
    ): Result<RegistroComidaItemEntity> {
        return try {
            val existing = registroComidaItemDao.getById(itemId)
                ?: return Result.failure(Exception("Item no encontrado"))
            
            val finalAlimentoId = alimentoId ?: existing.alimento_id
            val finalCantidadGramos = cantidadGramos ?: existing.cantidad_gramos
            
            // Si cambió el alimento o la cantidad, recalcular valores nutricionales
            val valoresNutricionales = if (alimentoId != null || cantidadGramos != null) {
                val alimento = alimentoDao.getById(finalAlimentoId)
                    ?: return Result.failure(Exception("Alimento no encontrado"))
                calcularValoresNutricionales(alimento, finalCantidadGramos)
            } else {
                // Mantener valores existentes
                CalculatedNutrition(
                    calorias = existing.calorias,
                    proteinas_g = existing.proteinas_g,
                    carbohidratos_g = existing.carbohidratos_g,
                    grasas_g = existing.grasas_g,
                    fibra_g = existing.fibra_g
                )
            }
            
            val updated = existing.copy(
                alimento_id = finalAlimentoId,
                cantidad_gramos = finalCantidadGramos,
                calorias = valoresNutricionales.calorias,
                proteinas_g = valoresNutricionales.proteinas_g,
                carbohidratos_g = valoresNutricionales.carbohidratos_g,
                grasas_g = valoresNutricionales.grasas_g,
                fibra_g = valoresNutricionales.fibra_g,
                notas = notas ?: existing.notas,
                syncStatus = if (existing.syncStatus == SyncStatus.SYNCED) SyncStatus.PENDING_UPDATE else existing.syncStatus
            )
            
            registroComidaItemDao.update(updated)
            
            if (isOnline()) {
                syncItemUpdate(updated)
            }
            
            Result.success(updated)
        } catch (e: Exception) {
            Log.e("NutritionRepository", "Error al actualizar item", e)
            Result.failure(e)
        }
    }
    
    /**
     * Elimina un item
     */
    suspend fun deleteItem(itemId: String): Result<Unit> {
        return try {
            val item = registroComidaItemDao.getById(itemId)
                ?: return Result.failure(Exception("Item no encontrado"))
            
            registroComidaItemDao.deleteById(itemId)
            
            if (isOnline() && item.serverId != null) {
                syncItemDelete(item.serverId!!)
            }
            
            Result.success(Unit)
        } catch (e: Exception) {
            Log.e("NutritionRepository", "Error al eliminar item", e)
            Result.failure(e)
        }
    }
    
    // ========== RECOMENDACIONES ==========
    
    /**
     * Obtiene recomendaciones activas de un usuario como Flow
     */
    fun getRecomendacionesActivas(usuarioId: String): Flow<List<RecomendacionEntity>> {
        return recomendacionDao.getActivasFlow(usuarioId, System.currentTimeMillis())
    }
    
    // ========== SINCRONIZACIÓN ==========
    
    /**
     * Sincroniza un alimento individual con el servidor
     */
    private suspend fun syncSingleAlimento(entity: AlimentoEntity) {
        try {
            when (entity.syncStatus) {
                SyncStatus.PENDING_CREATE -> {
                    val request = entity.toCreateRequest()
                    val response = nutritionApiService.createAlimento(request)
                    
                    if (response.isSuccessful && response.body() != null) {
                        val serverAlimento = response.body()!!
                        val updated = serverAlimento.toEntity(SyncStatus.SYNCED, serverAlimento.id)
                        alimentoDao.update(updated)
                        Log.d("NutritionRepository", "Alimento sincronizado: ${entity.id}")
                    } else {
                        handleAlimentoSyncFailure(entity, "Error ${response.code()}: ${response.message()}")
                    }
                }
                SyncStatus.PENDING_UPDATE -> {
                    if (entity.serverId != null) {
                        syncAlimentoUpdate(entity)
                    } else {
                        // Si no tiene serverId, tratar como creación
                        syncSingleAlimento(entity.copy(syncStatus = SyncStatus.PENDING_CREATE))
                    }
                }
                SyncStatus.PENDING_DELETE -> {
                    if (entity.serverId != null) {
                        syncAlimentoDelete(entity.serverId!!)
                    }
                }
                else -> {} // SYNCED o FAILED - no hacer nada
            }
        } catch (e: Exception) {
            handleAlimentoSyncFailure(entity, e.message ?: "Error desconocido")
        }
    }
    
    private suspend fun syncAlimentoUpdate(entity: AlimentoEntity) {
        try {
            if (entity.serverId == null) return
            
            val request = entity.toUpdateRequest()
            val response = nutritionApiService.updateAlimento(entity.serverId!!, request)
            
            if (response.isSuccessful) {
                val updated = entity.copy(
                    syncStatus = SyncStatus.SYNCED,
                    updatedAt = System.currentTimeMillis()
                )
                alimentoDao.update(updated)
                Log.d("NutritionRepository", "Alimento actualizado en servidor: ${entity.id}")
            } else {
                handleAlimentoSyncFailure(entity, "Error ${response.code()}: ${response.message()}")
            }
        } catch (e: Exception) {
            handleAlimentoSyncFailure(entity, e.message ?: "Error desconocido")
        }
    }
    
    private suspend fun syncAlimentoDelete(serverId: String) {
        try {
            val response = nutritionApiService.deleteAlimento(serverId)
            if (response.isSuccessful) {
                Log.d("NutritionRepository", "Alimento eliminado del servidor: $serverId")
            }
        } catch (e: Exception) {
            Log.w("NutritionRepository", "Error al eliminar alimento del servidor: $serverId", e)
        }
    }
    
    private suspend fun handleAlimentoSyncFailure(entity: AlimentoEntity, error: String) {
        val updated = entity.copy(
            retryCount = entity.retryCount + 1,
            lastSyncAttempt = System.currentTimeMillis(),
            syncStatus = if (entity.retryCount >= 3) SyncStatus.FAILED else entity.syncStatus,
            updatedAt = System.currentTimeMillis()
        )
        alimentoDao.update(updated)
        Log.w("NutritionRepository", "Error sincronizando alimento: $error. Retry count: ${updated.retryCount}")
    }
    
    /**
     * Sincroniza un registro de comida individual con el servidor
     */
    private suspend fun syncSingleRegistroComida(entity: RegistroComidaEntity) {
        try {
            when (entity.syncStatus) {
                SyncStatus.PENDING_CREATE -> {
                    val request = entity.toCreateRequest()
                    val response = nutritionApiService.createRegistroComida(request)
                    
                    if (response.isSuccessful && response.body() != null) {
                        val serverRegistro = response.body()!!
                        val updated = serverRegistro.toEntity(SyncStatus.SYNCED, serverRegistro.id)
                        registroComidaDao.update(updated)
                        Log.d("NutritionRepository", "Registro de comida sincronizado: ${entity.id}")
                    } else {
                        handleRegistroComidaSyncFailure(entity, "Error ${response.code()}: ${response.message()}")
                    }
                }
                SyncStatus.PENDING_UPDATE -> {
                    if (entity.serverId != null) {
                        syncRegistroComidaUpdate(entity)
                    } else {
                        syncSingleRegistroComida(entity.copy(syncStatus = SyncStatus.PENDING_CREATE))
                    }
                }
                SyncStatus.PENDING_DELETE -> {
                    if (entity.serverId != null) {
                        syncRegistroComidaDelete(entity.serverId!!)
                    }
                }
                else -> {}
            }
        } catch (e: Exception) {
            handleRegistroComidaSyncFailure(entity, e.message ?: "Error desconocido")
        }
    }
    
    private suspend fun syncRegistroComidaUpdate(entity: RegistroComidaEntity) {
        try {
            if (entity.serverId == null) return
            
            val request = entity.toUpdateRequest()
            val response = nutritionApiService.updateRegistroComida(entity.serverId!!, request)
            
            if (response.isSuccessful) {
                val updated = entity.copy(
                    syncStatus = SyncStatus.SYNCED,
                    updatedAt = System.currentTimeMillis()
                )
                registroComidaDao.update(updated)
                Log.d("NutritionRepository", "Registro de comida actualizado en servidor: ${entity.id}")
            } else {
                handleRegistroComidaSyncFailure(entity, "Error ${response.code()}: ${response.message()}")
            }
        } catch (e: Exception) {
            handleRegistroComidaSyncFailure(entity, e.message ?: "Error desconocido")
        }
    }
    
    private suspend fun syncRegistroComidaDelete(serverId: String) {
        try {
            val response = nutritionApiService.deleteRegistroComida(serverId)
            if (response.isSuccessful) {
                Log.d("NutritionRepository", "Registro de comida eliminado del servidor: $serverId")
            }
        } catch (e: Exception) {
            Log.w("NutritionRepository", "Error al eliminar registro de comida del servidor: $serverId", e)
        }
    }
    
    private suspend fun handleRegistroComidaSyncFailure(entity: RegistroComidaEntity, error: String) {
        val updated = entity.copy(
            retryCount = entity.retryCount + 1,
            lastSyncAttempt = System.currentTimeMillis(),
            syncStatus = if (entity.retryCount >= 3) SyncStatus.FAILED else entity.syncStatus,
            updatedAt = System.currentTimeMillis()
        )
        registroComidaDao.update(updated)
        Log.w("NutritionRepository", "Error sincronizando registro de comida: $error. Retry count: ${updated.retryCount}")
    }
    
    /**
     * Sincroniza un item individual con el servidor
     */
    private suspend fun syncSingleItem(entity: RegistroComidaItemEntity) {
        try {
            when (entity.syncStatus) {
                SyncStatus.PENDING_CREATE -> {
                    val request = entity.toRequest()
                    val response = nutritionApiService.createRegistroComidaItem(request)
                    
                    if (response.isSuccessful && response.body() != null) {
                        val serverItem = response.body()!!
                        val updated = serverItem.toEntity(SyncStatus.SYNCED, serverItem.id)
                        registroComidaItemDao.update(updated)
                        Log.d("NutritionRepository", "Item sincronizado: ${entity.id}")
                    } else {
                        handleItemSyncFailure(entity, "Error ${response.code()}: ${response.message()}")
                    }
                }
                SyncStatus.PENDING_UPDATE -> {
                    if (entity.serverId != null) {
                        syncItemUpdate(entity)
                    } else {
                        syncSingleItem(entity.copy(syncStatus = SyncStatus.PENDING_CREATE))
                    }
                }
                SyncStatus.PENDING_DELETE -> {
                    if (entity.serverId != null) {
                        syncItemDelete(entity.serverId!!)
                    }
                }
                else -> {}
            }
        } catch (e: Exception) {
            handleItemSyncFailure(entity, e.message ?: "Error desconocido")
        }
    }
    
    private suspend fun syncItemUpdate(entity: RegistroComidaItemEntity) {
        try {
            if (entity.serverId == null) return
            
            val request = entity.toRequest()
            val response = nutritionApiService.updateRegistroComidaItem(entity.serverId!!, request)
            
            if (response.isSuccessful) {
                val updated = entity.copy(syncStatus = SyncStatus.SYNCED)
                registroComidaItemDao.update(updated)
                Log.d("NutritionRepository", "Item actualizado en servidor: ${entity.id}")
            } else {
                handleItemSyncFailure(entity, "Error ${response.code()}: ${response.message()}")
            }
        } catch (e: Exception) {
            handleItemSyncFailure(entity, e.message ?: "Error desconocido")
        }
    }
    
    private suspend fun syncItemDelete(serverId: String) {
        try {
            val response = nutritionApiService.deleteRegistroComidaItem(serverId)
            if (response.isSuccessful) {
                Log.d("NutritionRepository", "Item eliminado del servidor: $serverId")
            }
        } catch (e: Exception) {
            Log.w("NutritionRepository", "Error al eliminar item del servidor: $serverId", e)
        }
    }
    
    private suspend fun handleItemSyncFailure(entity: RegistroComidaItemEntity, error: String) {
        val updated = entity.copy(
            retryCount = entity.retryCount + 1,
            lastSyncAttempt = System.currentTimeMillis(),
            syncStatus = if (entity.retryCount >= 3) SyncStatus.FAILED else entity.syncStatus
        )
        registroComidaItemDao.update(updated)
        Log.w("NutritionRepository", "Error sincronizando item: $error. Retry count: ${updated.retryCount}")
    }
    
    /**
     * Sincroniza todos los alimentos desde el servidor
     */
    suspend fun syncAlimentosFromServer(): Result<Unit> {
        return try {
            if (!isOnline()) {
                return Result.failure(Exception("No hay conexión a internet"))
            }
            
            val response = nutritionApiService.getAllAlimentos()
            if (response.isSuccessful && response.body() != null) {
                val serverAlimentos = response.body()!!
                serverAlimentos.forEach { alimentoResponse ->
                    val entity = alimentoResponse.toEntity(SyncStatus.SYNCED, alimentoResponse.id)
                    alimentoDao.insert(entity)
                }
                Log.d("NutritionRepository", "Alimentos sincronizados desde servidor: ${serverAlimentos.size}")
                Result.success(Unit)
            } else {
                Result.failure(Exception("Error ${response.code()}: ${response.message()}"))
            }
        } catch (e: Exception) {
            Log.e("NutritionRepository", "Error sincronizando alimentos desde servidor", e)
            Result.failure(e)
        }
    }
    
    /**
     * Sincroniza todos los registros de comida de un usuario desde el servidor
     * Si falla, retorna éxito para no bloquear la UI (offline-first)
     */
    suspend fun syncRegistrosComidaFromServer(usuarioId: String): Result<Unit> {
        return try {
            if (!isOnline()) {
                return Result.success(Unit) // No es crítico si no hay conexión
            }
            
            val response = nutritionApiService.getRegistrosByUsuario(usuarioId)
            if (response.isSuccessful && response.body() != null) {
                val serverRegistros = response.body()!!
                serverRegistros.forEach { registroResponse ->
                    val entity = registroResponse.toEntity(SyncStatus.SYNCED, registroResponse.id)
                    registroComidaDao.insert(entity)
                    
                    // Sincronizar items también
                    registroResponse.items?.forEach { itemResponse ->
                        val itemEntity = itemResponse.toEntity(SyncStatus.SYNCED, itemResponse.id)
                        registroComidaItemDao.insert(itemEntity)
                    }
                }
                Log.d("NutritionRepository", "Registros de comida sincronizados desde servidor: ${serverRegistros.size}")
                Result.success(Unit)
            } else if (response.code() == 500) {
                // Error 500 del servidor - no crítico, solo loguear
                Log.w("NutritionRepository", "Error 500 del servidor al obtener registros de comida. Continuando con registros locales.")
                Result.success(Unit) // Retornar éxito para no bloquear la UI
            } else {
                Log.w("NutritionRepository", "Error ${response.code()} obteniendo registros de comida: ${response.message()}")
                Result.success(Unit) // No crítico - continuar con registros locales
            }
        } catch (e: Exception) {
            Log.w("NutritionRepository", "Error sincronizando registros de comida desde servidor (no crítico)", e)
            Result.success(Unit) // No crítico - la app puede funcionar con registros locales
        }
    }
    
    /**
     * Sincroniza recomendaciones activas desde el servidor
     * Si falla, retorna éxito con lista vacía (no crítico)
     */
    suspend fun syncRecomendacionesFromServer(usuarioId: String): Result<Unit> {
        return try {
            if (!isOnline()) {
                return Result.success(Unit) // No es crítico si no hay conexión
            }
            
            val response = nutritionApiService.getRecomendacionesActivas(usuarioId)
            if (response.isSuccessful && response.body() != null) {
                val serverRecomendaciones = response.body()!!
                
                // Eliminar recomendaciones antiguas y reemplazar con nuevas
                recomendacionDao.deleteByUsuario(usuarioId)
                
                serverRecomendaciones.forEach { recomendacionResponse ->
                    val entity = recomendacionResponse.toEntity()
                    recomendacionDao.insert(entity)
                }
                Log.d("NutritionRepository", "Recomendaciones sincronizadas desde servidor: ${serverRecomendaciones.size}")
                Result.success(Unit)
            } else if (response.code() == 500) {
                // Error 500 del servidor - no crítico, solo loguear
                Log.w("NutritionRepository", "Error 500 del servidor al obtener recomendaciones. Continuando sin recomendaciones.")
                Result.success(Unit) // Retornar éxito para no bloquear la UI
            } else {
                Log.w("NutritionRepository", "Error ${response.code()} obteniendo recomendaciones: ${response.message()}")
                Result.success(Unit) // No crítico - continuar sin recomendaciones
            }
        } catch (e: Exception) {
            Log.w("NutritionRepository", "Error sincronizando recomendaciones desde servidor (no crítico)", e)
            Result.success(Unit) // No crítico - la app puede funcionar sin recomendaciones
        }
    }
    
    /**
     * Sincroniza todos los elementos pendientes
     */
    suspend fun syncAllPending() {
        // Sincronizar alimentos pendientes
        val alimentosPendientes = alimentoDao.getPendingSync()
        alimentosPendientes.forEach { alimento ->
            syncSingleAlimento(alimento)
        }
        
        // Sincronizar registros de comida pendientes
        val registrosPendientes = registroComidaDao.getPendingSync()
        registrosPendientes.forEach { registro ->
            syncSingleRegistroComida(registro)
        }
        
        // Sincronizar items pendientes
        val itemsPendientes = registroComidaItemDao.getPendingSync()
        itemsPendientes.forEach { item ->
            syncSingleItem(item)
        }
    }
}

