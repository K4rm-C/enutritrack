package com.example.enutritrack_app.data.local.mappers

import com.example.enutritrack_app.data.local.entities.EstadoAlertaEntity
import com.example.enutritrack_app.data.remote.dto.EstadoAlertaResponse
import java.text.SimpleDateFormat
import java.util.*

private val isoDateFormatWithMillis = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
    timeZone = TimeZone.getTimeZone("UTC")
}

private val isoDateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply {
    timeZone = TimeZone.getTimeZone("UTC")
}

/**
 * Convierte EstadoAlertaResponse a EstadoAlertaEntity
 */
fun EstadoAlertaResponse.toEntity(): EstadoAlertaEntity {
    val createdAtMillis = try {
        isoDateFormatWithMillis.parse(createdAt)?.time
            ?: isoDateFormat.parse(createdAt)?.time
            ?: System.currentTimeMillis()
    } catch (e: Exception) {
        System.currentTimeMillis()
    }

    return EstadoAlertaEntity(
        id = id,
        nombre = nombre,
        descripcion = descripcion,
        created_at = createdAtMillis
    )
}

