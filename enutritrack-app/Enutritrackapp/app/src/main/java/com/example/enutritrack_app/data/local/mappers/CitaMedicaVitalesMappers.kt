package com.example.enutritrack_app.data.local.mappers

import com.example.enutritrack_app.data.local.entities.CitaMedicaVitalesEntity
import com.example.enutritrack_app.data.remote.dto.CitaMedicaVitalesResponse
import java.text.SimpleDateFormat
import java.util.*

private val isoDateFormatWithMillis = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
    timeZone = TimeZone.getTimeZone("UTC")
}

private val isoDateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply {
    timeZone = TimeZone.getTimeZone("UTC")
}

/**
 * Convierte CitaMedicaVitalesResponse a CitaMedicaVitalesEntity
 */
fun CitaMedicaVitalesResponse.toEntity(): CitaMedicaVitalesEntity {
    val createdAtMillis = try {
        isoDateFormatWithMillis.parse(createdAt)?.time
            ?: isoDateFormat.parse(createdAt)?.time
            ?: System.currentTimeMillis()
    } catch (e: Exception) {
        System.currentTimeMillis()
    }

    return CitaMedicaVitalesEntity(
        id = id,
        cita_medica_id = citaMedicaId,
        peso = peso,
        altura = altura,
        tension_arterial_sistolica = tensionArterialSistolica,
        tension_arterial_diastolica = tensionArterialDiastolica,
        frecuencia_cardiaca = frecuenciaCardiaca,
        temperatura = temperatura,
        saturacion_oxigeno = saturacionOxigeno,
        notas = notas,
        created_at = createdAtMillis
    )
}

