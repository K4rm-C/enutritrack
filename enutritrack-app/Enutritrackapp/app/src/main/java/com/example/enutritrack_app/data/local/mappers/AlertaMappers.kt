package com.example.enutritrack_app.data.local.mappers

import com.example.enutritrack_app.data.local.entities.AlertaEntity
import com.example.enutritrack_app.data.remote.dto.AlertaResponse
import java.text.SimpleDateFormat
import java.util.*

private val isoDateFormatWithMillis = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
    timeZone = TimeZone.getTimeZone("UTC")
}

private val isoDateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply {
    timeZone = TimeZone.getTimeZone("UTC")
}

private fun parseDate(dateString: String?): Long? {
    if (dateString == null) return null
    return try {
        isoDateFormatWithMillis.parse(dateString)?.time
            ?: isoDateFormat.parse(dateString)?.time
    } catch (e: Exception) {
        null
    }
}

/**
 * Convierte AlertaResponse a AlertaEntity
 */
fun AlertaResponse.toEntity(): AlertaEntity {
    val fechaDeteccionMillis = parseDate(fechaDeteccion) ?: System.currentTimeMillis()
    val fechaResolucionMillis = parseDate(fechaResolucion)
    val createdAtMillis = parseDate(createdAt) ?: System.currentTimeMillis()
    val updatedAtMillis = parseDate(updatedAt) ?: System.currentTimeMillis()

    return AlertaEntity(
        id = id,
        usuario_id = usuarioId,
        doctor_id = doctorId,
        tipo_alerta_id = tipoAlertaId,
        nivel_prioridad_id = nivelPrioridadId,
        estado_alerta_id = estadoAlertaId,
        titulo = titulo,
        mensaje = mensaje,
        recomendacion_id = recomendacionId,
        fecha_deteccion = fechaDeteccionMillis,
        fecha_resolucion = fechaResolucionMillis,
        resuelta_por = resueltaPor,
        notas_resolucion = notasResolucion,
        created_at = createdAtMillis,
        updated_at = updatedAtMillis
    )
}

