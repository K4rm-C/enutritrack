package com.example.enutritrack_app.data.local.mappers

import com.example.enutritrack_app.data.local.entities.TipoActividadEntity
import com.example.enutritrack_app.data.remote.dto.TipoActividadResponse
import java.text.SimpleDateFormat
import java.util.*

private val isoDateFormatWithMillis = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
    timeZone = TimeZone.getTimeZone("UTC")
}

private val isoDateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply {
    timeZone = TimeZone.getTimeZone("UTC")
}

/**
 * Convierte TipoActividadResponse a TipoActividadEntity
 */
fun TipoActividadResponse.toEntity(): TipoActividadEntity {
    val createdAtMillis = try {
        isoDateFormatWithMillis.parse(createdAt)?.time
            ?: isoDateFormat.parse(createdAt)?.time
            ?: System.currentTimeMillis()
    } catch (e: Exception) {
        System.currentTimeMillis()
    }

    return TipoActividadEntity(
        id = id,
        nombre = nombre,
        descripcion = descripcion,
        met_value = metValue,
        categoria = categoria,
        created_at = createdAtMillis
    )
}

