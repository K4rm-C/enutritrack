package com.example.enutritrack_app.data.local.mappers

import com.example.enutritrack_app.data.local.database.SyncStatus
import com.example.enutritrack_app.data.local.entities.RegistroComidaItemEntity
import com.example.enutritrack_app.data.remote.dto.CreateRegistroComidaItemRequest
import com.example.enutritrack_app.data.remote.dto.RegistroComidaItemResponse
import java.text.SimpleDateFormat
import java.util.*

/**
 * Funciones de mapeo para RegistroComidaItem
 */

/**
 * Formato de fecha ISO 8601 para API con milisegundos
 */
private val isoDateFormatWithMillis = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
    timeZone = TimeZone.getTimeZone("UTC")
}

/**
 * Formato de fecha ISO 8601 para API sin milisegundos (fallback)
 */
private val isoDateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply {
    timeZone = TimeZone.getTimeZone("UTC")
}

/**
 * Convierte RegistroComidaItemEntity a CreateRegistroComidaItemRequest para API
 * 
 * Nota: Los valores nutricionales se calculan en el servidor basándose
 * en el alimento y cantidad_gramos. Solo enviamos estos campos.
 */
fun RegistroComidaItemEntity.toRequest(): CreateRegistroComidaItemRequest {
    return CreateRegistroComidaItemRequest(
        registroComidaId = registro_comida_id,
        alimentoId = alimento_id,
        cantidadGramos = cantidad_gramos,
        notas = notas
    )
}

/**
 * Convierte RegistroComidaItemResponse del servidor a RegistroComidaItemEntity
 */
fun RegistroComidaItemResponse.toEntity(
    syncStatus: SyncStatus = SyncStatus.SYNCED,
    serverId: String? = null
): RegistroComidaItemEntity {
    return RegistroComidaItemEntity(
        id = serverId ?: id,
        registro_comida_id = registroComidaId,
        alimento_id = alimentoId,
        cantidad_gramos = cantidadGramos,
        calorias = calorias,
        proteinas_g = proteinasG,
        carbohidratos_g = carbohidratosG,
        grasas_g = grasasG,
        fibra_g = fibraG,
        notas = notas,
        syncStatus = syncStatus,
        serverId = id,
        retryCount = 0,
        lastSyncAttempt = System.currentTimeMillis(),
        createdAt = try {
            createdAt?.let {
                isoDateFormatWithMillis.parse(it)?.time 
                    ?: isoDateFormat.parse(it)?.time 
                    ?: System.currentTimeMillis()
            } ?: System.currentTimeMillis()
        } catch (e: Exception) {
            System.currentTimeMillis()
        }
    )
}

