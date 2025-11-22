package com.example.enutritrack_app.data.local.mappers

import com.example.enutritrack_app.data.local.database.SyncStatus
import com.example.enutritrack_app.data.local.entities.ActividadFisicaEntity
import com.example.enutritrack_app.data.remote.dto.ActividadFisicaResponse
import com.example.enutritrack_app.data.remote.dto.CreateActividadFisicaRequest
import java.text.SimpleDateFormat
import java.util.*

private val isoDateFormatWithMillis = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
    timeZone = TimeZone.getTimeZone("UTC")
}

private val isoDateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply {
    timeZone = TimeZone.getTimeZone("UTC")
}

/**
 * Convierte ActividadFisicaResponse a ActividadFisicaEntity
 */
fun ActividadFisicaResponse.toEntity(): ActividadFisicaEntity {
    val fechaMillis = try {
        isoDateFormatWithMillis.parse(fecha)?.time
            ?: isoDateFormat.parse(fecha)?.time
            ?: System.currentTimeMillis()
    } catch (e: Exception) {
        System.currentTimeMillis()
    }
    
    val createdAtMillis = try {
        isoDateFormatWithMillis.parse(createdAt)?.time
            ?: isoDateFormat.parse(createdAt)?.time
            ?: System.currentTimeMillis()
    } catch (e: Exception) {
        System.currentTimeMillis()
    }

    return ActividadFisicaEntity(
        id = id,
        usuario_id = usuarioId,
        tipo_actividad_id = tipoActividadId,
        duracion_min = duracionMin,
        calorias_quemadas = caloriasQuemadas,
        intensidad = intensidad,
        notas = notas,
        fecha = fechaMillis,
        syncStatus = SyncStatus.SYNCED,
        serverId = id,
        retryCount = 0,
        lastSyncAttempt = System.currentTimeMillis(),
        createdAt = createdAtMillis,
        updatedAt = System.currentTimeMillis()
    )
}

/**
 * Convierte ActividadFisicaEntity a CreateActividadFisicaRequest
 */
fun ActividadFisicaEntity.toCreateRequest(): CreateActividadFisicaRequest {
    return CreateActividadFisicaRequest(
        usuario_id = usuario_id,
        tipo_actividad_id = tipo_actividad_id,
        duracion_min = duracion_min,
        calorias_quemadas = calorias_quemadas,
        intensidad = intensidad,
        notas = notas,
        fecha = Date(fecha)
    )
}

