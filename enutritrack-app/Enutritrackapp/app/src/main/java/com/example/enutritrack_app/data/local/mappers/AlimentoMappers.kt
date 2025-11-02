package com.example.enutritrack_app.data.local.mappers

import com.example.enutritrack_app.data.local.database.SyncStatus
import com.example.enutritrack_app.data.local.entities.AlimentoEntity
import com.example.enutritrack_app.data.remote.dto.AlimentoResponse
import com.example.enutritrack_app.data.remote.dto.CreateAlimentoRequest
import com.example.enutritrack_app.data.remote.dto.UpdateAlimentoRequest
import java.text.SimpleDateFormat
import java.util.*

/**
 * Funciones de mapeo para Alimento
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
 * Convierte AlimentoEntity a CreateAlimentoRequest para API
 */
fun AlimentoEntity.toCreateRequest(): CreateAlimentoRequest {
    return CreateAlimentoRequest(
        nombre = nombre,
        descripcion = descripcion,
        caloriasPor100g = calorias_por_100g,
        proteinasGPor100g = proteinas_g_por_100g,
        carbohidratosGPor100g = carbohidratos_g_por_100g,
        grasasGPor100g = grasas_g_por_100g,
        fibraGPor100g = fibra_g_por_100g,
        categoria = categoria
    )
}

/**
 * Convierte AlimentoEntity a UpdateAlimentoRequest para API
 */
fun AlimentoEntity.toUpdateRequest(): UpdateAlimentoRequest {
    return UpdateAlimentoRequest(
        nombre = nombre,
        descripcion = descripcion,
        caloriasPor100g = calorias_por_100g,
        proteinasGPor100g = proteinas_g_por_100g,
        carbohidratosGPor100g = carbohidratos_g_por_100g,
        grasasGPor100g = grasas_g_por_100g,
        fibraGPor100g = fibra_g_por_100g,
        categoria = categoria
    )
}

/**
 * Convierte AlimentoResponse del servidor a AlimentoEntity
 */
fun AlimentoResponse.toEntity(
    syncStatus: SyncStatus = SyncStatus.SYNCED,
    serverId: String? = null
): AlimentoEntity {
    return AlimentoEntity(
        id = serverId ?: id,
        nombre = nombre,
        descripcion = descripcion,
        calorias_por_100g = caloriasPor100g,
        proteinas_g_por_100g = proteinasGPor100g,
        carbohidratos_g_por_100g = carbohidratosGPor100g,
        grasas_g_por_100g = grasasGPor100g,
        fibra_g_por_100g = fibraGPor100g,
        categoria = categoria,
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
        },
        updatedAt = try {
            updatedAt?.let {
                isoDateFormatWithMillis.parse(it)?.time 
                    ?: isoDateFormat.parse(it)?.time 
                    ?: System.currentTimeMillis()
            } ?: System.currentTimeMillis()
        } catch (e: Exception) {
            System.currentTimeMillis()
        }
    )
}

