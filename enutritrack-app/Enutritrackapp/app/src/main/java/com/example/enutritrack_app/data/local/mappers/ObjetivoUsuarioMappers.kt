package com.example.enutritrack_app.data.local.mappers

import com.example.enutritrack_app.data.local.database.SyncStatus
import com.example.enutritrack_app.data.local.entities.ActivityLevel
import com.example.enutritrack_app.data.local.entities.ObjetivoUsuarioEntity
import com.example.enutritrack_app.data.remote.dto.CreateObjetivoUsuarioRequest
import com.example.enutritrack_app.data.remote.dto.ObjetivoUsuarioResponse
import java.text.SimpleDateFormat
import java.util.*

/**
 * Funciones de mapeo para ObjetivoUsuario
 */

/**
 * Formato de fecha ISO 8601 para API
 */
private val isoDateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply {
    timeZone = TimeZone.getTimeZone("UTC")
}

/**
 * Convierte ActivityLevel enum a string para API
 */
fun ActivityLevel.toApiString(): String {
    return when (this) {
        ActivityLevel.SEDENTARY -> "sedentario"
        ActivityLevel.MODERATE -> "moderado"
        ActivityLevel.ACTIVE -> "activo"
        ActivityLevel.VERY_ACTIVE -> "muy_activo"
    }
}

/**
 * Convierte string de API a ActivityLevel enum
 */
fun String.toActivityLevel(): ActivityLevel {
    return when (this.lowercase()) {
        "sedentario" -> ActivityLevel.SEDENTARY
        "moderado" -> ActivityLevel.MODERATE
        "activo" -> ActivityLevel.ACTIVE
        "muy_activo" -> ActivityLevel.VERY_ACTIVE
        else -> ActivityLevel.MODERATE  // Default
    }
}

/**
 * Convierte ObjetivoUsuarioEntity a CreateObjetivoUsuarioRequest para API
 */
fun ObjetivoUsuarioEntity.toRequest(): CreateObjetivoUsuarioRequest {
    // nivel_actividad ya es string en el formato de la API, solo asegurarse que está normalizado
    val nivelActividadApi = nivel_actividad.lowercase()
    
    return CreateObjetivoUsuarioRequest(
        usuarioId = usuario_id,
        pesoObjetivo = peso_objetivo,
        nivelActividad = nivelActividadApi,
        vigente = vigente
    )
}

/**
 * Convierte ObjetivoUsuarioResponse del servidor a ObjetivoUsuarioEntity
 */
fun ObjetivoUsuarioResponse.toEntity(
    syncStatus: SyncStatus = SyncStatus.SYNCED,
    serverId: String? = null
): ObjetivoUsuarioEntity {
    // Parsear fecha ISO 8601 a timestamp
    val fechaEstablecido = try {
        isoDateFormat.parse(fechaEstablecido)?.time ?: System.currentTimeMillis()
    } catch (e: Exception) {
        System.currentTimeMillis()
    }
    
    return ObjetivoUsuarioEntity(
        id = serverId ?: id,
        usuario_id = usuarioId,
        peso_objetivo = pesoObjetivo,
        nivel_actividad = nivelActividad.toActivityLevel().toApiString(),  // Normalizar
        fecha_establecido = fechaEstablecido,
        vigente = vigente,
        syncStatus = syncStatus,
        serverId = id,
        retryCount = 0,
        lastSyncAttempt = System.currentTimeMillis(),
        createdAt = System.currentTimeMillis(),
        updatedAt = System.currentTimeMillis()
    )
}

