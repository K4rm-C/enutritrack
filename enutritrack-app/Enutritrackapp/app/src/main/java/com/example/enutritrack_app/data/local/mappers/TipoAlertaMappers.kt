package com.example.enutritrack_app.data.local.mappers

import com.example.enutritrack_app.data.local.entities.TipoAlertaEntity
import com.example.enutritrack_app.data.remote.dto.TipoAlertaResponse
import java.text.SimpleDateFormat
import java.util.*

private val isoDateFormatWithMillis = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
    timeZone = TimeZone.getTimeZone("UTC")
}

private val isoDateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply {
    timeZone = TimeZone.getTimeZone("UTC")
}

/**
 * Convierte TipoAlertaResponse a TipoAlertaEntity
 */
fun TipoAlertaResponse.toEntity(): TipoAlertaEntity {
    val createdAtMillis = try {
        isoDateFormatWithMillis.parse(createdAt)?.time
            ?: isoDateFormat.parse(createdAt)?.time
            ?: System.currentTimeMillis()
    } catch (e: Exception) {
        System.currentTimeMillis()
    }

    return TipoAlertaEntity(
        id = id,
        nombre = nombre,
        descripcion = descripcion,
        categoria_id = categoriaId,
        es_automatica = esAutomatica,
        created_at = createdAtMillis
    )
}

