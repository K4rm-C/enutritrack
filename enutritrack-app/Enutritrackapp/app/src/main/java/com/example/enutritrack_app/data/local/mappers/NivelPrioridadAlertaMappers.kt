package com.example.enutritrack_app.data.local.mappers

import com.example.enutritrack_app.data.local.entities.NivelPrioridadAlertaEntity
import com.example.enutritrack_app.data.remote.dto.NivelPrioridadAlertaResponse
import java.text.SimpleDateFormat
import java.util.*

private val isoDateFormatWithMillis = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
    timeZone = TimeZone.getTimeZone("UTC")
}

private val isoDateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply {
    timeZone = TimeZone.getTimeZone("UTC")
}

/**
 * Convierte NivelPrioridadAlertaResponse a NivelPrioridadAlertaEntity
 */
fun NivelPrioridadAlertaResponse.toEntity(): NivelPrioridadAlertaEntity {
    val createdAtMillis = try {
        isoDateFormatWithMillis.parse(createdAt)?.time
            ?: isoDateFormat.parse(createdAt)?.time
            ?: System.currentTimeMillis()
    } catch (e: Exception) {
        System.currentTimeMillis()
    }

    return NivelPrioridadAlertaEntity(
        id = id,
        nombre = nombre,
        descripcion = descripcion,
        nivel_numerico = nivelNumerico,
        created_at = createdAtMillis
    )
}

