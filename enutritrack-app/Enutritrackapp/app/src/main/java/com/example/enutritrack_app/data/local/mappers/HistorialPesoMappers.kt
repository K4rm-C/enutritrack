package com.example.enutritrack_app.data.local.mappers

import com.example.enutritrack_app.data.local.database.SyncStatus
import com.example.enutritrack_app.data.local.entities.HistorialPesoEntity
import com.example.enutritrack_app.data.remote.dto.CreateHistorialPesoRequest
import com.example.enutritrack_app.data.remote.dto.HistorialPesoResponse
import java.text.SimpleDateFormat
import java.util.*

/**
 * Funciones de mapeo para HistorialPeso
 */

/**
 * Formato de fecha ISO 8601 para API con milisegundos (formato del servidor)
 * Ejemplo: "2025-11-02T02:57:41.127Z"
 */
private val isoDateFormatWithMillis = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
    timeZone = TimeZone.getTimeZone("UTC")
}

/**
 * Formato de fecha ISO 8601 para API sin milisegundos (fallback)
 * Ejemplo: "2025-11-02T02:57:41Z"
 */
private val isoDateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply {
    timeZone = TimeZone.getTimeZone("UTC")
}

/**
 * Formato de fecha simple para API (solo fecha sin hora)
 */
private val dateOnlyFormat = SimpleDateFormat("yyyy-MM-dd", Locale.US)

/**
 * Convierte HistorialPesoEntity a CreateHistorialPesoRequest para API
 * 
 * Nota: No enviamos fecha_registro ya que el servidor tiene problemas
 * transformando strings a Date. El servidor usará now() por defecto.
 * La fecha del registro se mantiene en la app localmente.
 */
fun HistorialPesoEntity.toRequest(): CreateHistorialPesoRequest {
    // No enviar fecha_registro - el servidor usará now() por defecto
    // Esto evita errores de transformación Date en NestJS
    return CreateHistorialPesoRequest(
        usuarioId = usuario_id,
        peso = peso,
        fechaRegistro = null,  // No enviar - servidor usará fecha actual
        notas = notas
    )
}

/**
 * Convierte HistorialPesoResponse del servidor a HistorialPesoEntity
 */
fun HistorialPesoResponse.toEntity(
    syncStatus: SyncStatus = SyncStatus.SYNCED,
    serverId: String? = null
): HistorialPesoEntity {
    // Parsear fecha ISO 8601 a timestamp
    // Intentar primero con milisegundos, luego sin milisegundos, luego solo fecha
    val fechaRegistro = try {
        isoDateFormatWithMillis.parse(fechaRegistro)?.time
            ?: isoDateFormat.parse(fechaRegistro)?.time
            ?: dateOnlyFormat.parse(fechaRegistro)?.time
            ?: System.currentTimeMillis()
    } catch (e: Exception) {
        // Si falla el parsing, usar la fecha actual como fallback
        // Pero loguear el error para debug
        android.util.Log.w("HistorialPesoMappers", "Error parseando fecha: $fechaRegistro", e)
        System.currentTimeMillis()
    }
    
    return HistorialPesoEntity(
        id = serverId ?: id,  // Usar serverId si está disponible
        usuario_id = usuarioId,
        peso = peso,
        fecha_registro = fechaRegistro,
        notas = notas,
        syncStatus = syncStatus,
        serverId = id,  // El ID del servidor
        retryCount = 0,
        lastSyncAttempt = System.currentTimeMillis(),
        createdAt = System.currentTimeMillis(),
        updatedAt = System.currentTimeMillis()
    )
}

