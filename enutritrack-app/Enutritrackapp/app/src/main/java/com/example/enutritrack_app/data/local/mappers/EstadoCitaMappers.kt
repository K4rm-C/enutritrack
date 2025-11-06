package com.example.enutritrack_app.data.local.mappers

import com.example.enutritrack_app.data.local.entities.EstadoCitaEntity
import com.example.enutritrack_app.data.remote.dto.EstadoCitaResponse
import java.text.SimpleDateFormat
import java.util.*

private val isoDateFormatWithMillis = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
    timeZone = TimeZone.getTimeZone("UTC")
}

private val isoDateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply {
    timeZone = TimeZone.getTimeZone("UTC")
}

/**
 * Convierte EstadoCitaResponse a EstadoCitaEntity
 */
fun EstadoCitaResponse.toEntity(): EstadoCitaEntity {
    val createdAtMillis = try {
        isoDateFormatWithMillis.parse(createdAt)?.time
            ?: isoDateFormat.parse(createdAt)?.time
            ?: System.currentTimeMillis()
    } catch (e: Exception) {
        System.currentTimeMillis()
    }

    return EstadoCitaEntity(
        id = id,
        nombre = nombre,
        descripcion = descripcion,
        es_final = esFinal,
        created_at = createdAtMillis
    )
}

