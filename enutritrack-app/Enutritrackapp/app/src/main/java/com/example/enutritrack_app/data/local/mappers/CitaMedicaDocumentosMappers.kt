package com.example.enutritrack_app.data.local.mappers

import com.example.enutritrack_app.data.local.entities.CitaMedicaDocumentosEntity
import com.example.enutritrack_app.data.remote.dto.CitaMedicaDocumentosResponse
import java.text.SimpleDateFormat
import java.util.*

private val isoDateFormatWithMillis = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
    timeZone = TimeZone.getTimeZone("UTC")
}

private val isoDateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply {
    timeZone = TimeZone.getTimeZone("UTC")
}

/**
 * Convierte CitaMedicaDocumentosResponse a CitaMedicaDocumentosEntity
 */
fun CitaMedicaDocumentosResponse.toEntity(): CitaMedicaDocumentosEntity {
    val createdAtMillis = try {
        isoDateFormatWithMillis.parse(createdAt)?.time
            ?: isoDateFormat.parse(createdAt)?.time
            ?: System.currentTimeMillis()
    } catch (e: Exception) {
        System.currentTimeMillis()
    }

    return CitaMedicaDocumentosEntity(
        id = id,
        cita_medica_id = citaMedicaId,
        nombre_archivo = nombreArchivo,
        tipo_documento = tipoDocumento,
        ruta_archivo = rutaArchivo,
        tamano_bytes = tamanoBytes,
        notas = notas,
        created_at = createdAtMillis
    )
}

