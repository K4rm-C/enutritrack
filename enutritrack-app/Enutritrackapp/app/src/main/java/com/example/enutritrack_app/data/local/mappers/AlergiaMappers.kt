package com.example.enutritrack_app.data.local.mappers

import com.example.enutritrack_app.data.local.database.SyncStatus
import com.example.enutritrack_app.data.local.entities.AlergiaEntity
import com.example.enutritrack_app.data.remote.dto.AlergiaResponse
import com.example.enutritrack_app.data.remote.dto.CreateAlergiaRequest
import java.text.SimpleDateFormat
import java.util.*

/**
 * Funciones de mapeo para Alergia
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
 * Convierte AlergiaEntity a CreateAlergiaRequest para API
 */
fun AlergiaEntity.toRequest(): CreateAlergiaRequest {
    return CreateAlergiaRequest(
        usuarioId = usuario_id,
        tipo = tipo,
        nombre = nombre,
        severidad = severidad,
        reaccion = reaccion,
        notas = notas,
        activa = activa
    )
}

/**
 * Convierte AlergiaResponse del servidor a AlergiaEntity
 * 
 * Nota: Esta función está definida como función normal (no extensión) para evitar
 * conflictos con otras funciones toEntity que son funciones de extensión.
 * Usar como: toEntityAlergia(alergiaResponse, syncStatus, serverId)
 */
fun toEntityAlergia(
    alergiaResponse: AlergiaResponse,
    syncStatus: SyncStatus = SyncStatus.SYNCED,
    serverId: String? = null
): AlergiaEntity {
    return AlergiaEntity(
        id = serverId ?: alergiaResponse.id,
        usuario_id = alergiaResponse.usuarioId,
        tipo = alergiaResponse.tipo,
        nombre = alergiaResponse.nombre,
        severidad = alergiaResponse.severidad.lowercase(),  // Normalizar a lowercase
        reaccion = alergiaResponse.reaccion ?: "",  // Si es null, usar string vacío (aunque debería ser obligatorio)
        notas = alergiaResponse.notas,
        activa = alergiaResponse.activa,
        syncStatus = syncStatus,
        serverId = alergiaResponse.id,
        retryCount = 0,
        lastSyncAttempt = System.currentTimeMillis(),
        createdAt = System.currentTimeMillis(),
        updatedAt = System.currentTimeMillis()
    )
}

