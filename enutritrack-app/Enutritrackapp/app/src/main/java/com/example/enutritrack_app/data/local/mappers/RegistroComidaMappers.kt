package com.example.enutritrack_app.data.local.mappers

import com.example.enutritrack_app.data.local.database.SyncStatus
import com.example.enutritrack_app.data.local.entities.RegistroComidaEntity
import com.example.enutritrack_app.data.local.entities.TipoComidaEnum
import com.example.enutritrack_app.data.remote.dto.CreateRegistroComidaRequest
import com.example.enutritrack_app.data.remote.dto.RegistroComidaResponse
import com.example.enutritrack_app.data.remote.dto.UpdateRegistroComidaRequest
import java.text.SimpleDateFormat
import java.util.*

/**
 * Funciones de mapeo para RegistroComida
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
 * Convierte string del servidor (lowercase) a TipoComidaEnum
 */
private fun stringToTipoComidaEnum(value: String): TipoComidaEnum {
    return when (value.lowercase()) {
        "desayuno" -> TipoComidaEnum.DESAYUNO
        "almuerzo" -> TipoComidaEnum.ALMUERZO
        "cena" -> TipoComidaEnum.CENA
        "merienda" -> TipoComidaEnum.MERIENDA
        else -> TipoComidaEnum.DESAYUNO // Default
    }
}

/**
 * Convierte TipoComidaEnum a string (lowercase) para API
 */
private fun tipoComidaEnumToString(value: TipoComidaEnum): String {
    return when (value) {
        TipoComidaEnum.DESAYUNO -> "desayuno"
        TipoComidaEnum.ALMUERZO -> "almuerzo"
        TipoComidaEnum.CENA -> "cena"
        TipoComidaEnum.MERIENDA -> "merienda"
    }
}

/**
 * Formatea timestamp a ISO 8601 string
 */
private fun formatTimestampToISO(timestamp: Long): String {
    return isoDateFormatWithMillis.format(Date(timestamp))
}

/**
 * Convierte RegistroComidaEntity a CreateRegistroComidaRequest para API
 */
fun RegistroComidaEntity.toCreateRequest(): CreateRegistroComidaRequest {
    return CreateRegistroComidaRequest(
        usuarioId = usuario_id,
        fecha = formatTimestampToISO(fecha),
        tipoComida = tipoComidaEnumToString(tipo_comida),
        notas = notas
    )
}

/**
 * Convierte RegistroComidaEntity a UpdateRegistroComidaRequest para API
 */
fun RegistroComidaEntity.toUpdateRequest(): UpdateRegistroComidaRequest {
    return UpdateRegistroComidaRequest(
        fecha = formatTimestampToISO(fecha),
        tipoComida = tipoComidaEnumToString(tipo_comida),
        notas = notas
    )
}

/**
 * Convierte RegistroComidaResponse del servidor a RegistroComidaEntity
 */
fun RegistroComidaResponse.toEntity(
    syncStatus: SyncStatus = SyncStatus.SYNCED,
    serverId: String? = null
): RegistroComidaEntity {
    val fechaMillis = try {
        isoDateFormatWithMillis.parse(fecha)?.time 
            ?: isoDateFormat.parse(fecha)?.time 
            ?: System.currentTimeMillis()
    } catch (e: Exception) {
        System.currentTimeMillis()
    }
    
    return RegistroComidaEntity(
        id = serverId ?: id,
        usuario_id = usuarioId,
        fecha = fechaMillis,
        tipo_comida = stringToTipoComidaEnum(tipoComida),
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

