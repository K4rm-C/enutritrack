package com.example.enutritrack_app.data.local.mappers

import com.example.enutritrack_app.data.local.entities.RecomendacionEntity
import com.example.enutritrack_app.data.remote.dto.RecomendacionResponse
import java.text.SimpleDateFormat
import java.util.*

/**
 * Funciones de mapeo para Recomendacion
 * 
 * Nota: Las recomendaciones son solo lectura, sincronizadas desde el servidor
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
 * Convierte RecomendacionResponse del servidor a RecomendacionEntity
 */
fun RecomendacionResponse.toEntity(): RecomendacionEntity {
    val fechaGeneracionMillis = try {
        isoDateFormatWithMillis.parse(fechaGeneracion)?.time 
            ?: isoDateFormat.parse(fechaGeneracion)?.time 
            ?: System.currentTimeMillis()
    } catch (e: Exception) {
        System.currentTimeMillis()
    }
    
    val vigenciaHastaMillis = vigenciaHasta?.let { fechaStr ->
        try {
            isoDateFormatWithMillis.parse(fechaStr)?.time 
                ?: isoDateFormat.parse(fechaStr)?.time 
                ?: null
        } catch (e: Exception) {
            null
        }
    }
    
    return RecomendacionEntity(
        id = id,
        usuario_id = usuarioId,
        tipo_recomendacion_id = tipoRecomendacionId,
        contenido = contenido,
        fecha_generacion = fechaGeneracionMillis,
        vigencia_hasta = vigenciaHastaMillis,
        activa = activa,
        prioridad = prioridad,
        cita_medica_id = citaMedicaId,
        alerta_generadora_id = alertaGeneradoraId,
        lastSync = System.currentTimeMillis()
    )
}

