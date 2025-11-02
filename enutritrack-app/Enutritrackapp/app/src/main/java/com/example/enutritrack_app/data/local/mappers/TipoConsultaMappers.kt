package com.example.enutritrack_app.data.local.mappers

import com.example.enutritrack_app.data.local.entities.TipoConsultaEntity
import com.example.enutritrack_app.data.remote.dto.TipoConsultaResponse
import java.text.SimpleDateFormat
import java.util.*

private val isoDateFormatWithMillis = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
    timeZone = TimeZone.getTimeZone("UTC")
}

private val isoDateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply {
    timeZone = TimeZone.getTimeZone("UTC")
}

/**
 * Convierte TipoConsultaResponse a TipoConsultaEntity
 */
fun TipoConsultaResponse.toEntity(): TipoConsultaEntity {
    val createdAtMillis = try {
        isoDateFormatWithMillis.parse(createdAt)?.time
            ?: isoDateFormat.parse(createdAt)?.time
            ?: System.currentTimeMillis()
    } catch (e: Exception) {
        System.currentTimeMillis()
    }

    return TipoConsultaEntity(
        id = id,
        nombre = nombre,
        descripcion = descripcion,
        duracion_minutos = duracionMinutos,
        created_at = createdAtMillis
    )
}

