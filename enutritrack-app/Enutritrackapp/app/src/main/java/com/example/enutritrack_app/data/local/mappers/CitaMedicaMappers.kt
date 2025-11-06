package com.example.enutritrack_app.data.local.mappers

import com.example.enutritrack_app.data.local.database.SyncStatus
import com.example.enutritrack_app.data.local.entities.CitaMedicaEntity
import com.example.enutritrack_app.data.remote.dto.CitaMedicaResponse
import com.example.enutritrack_app.data.remote.dto.CreateCitaMedicaRequest
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
 * Convierte CitaMedicaResponse a CitaMedicaEntity
 */
fun CitaMedicaResponse.toEntity(): CitaMedicaEntity {
    val fechaHoraProgramadaMillis = parseDate(fechaHoraProgramada) ?: System.currentTimeMillis()
    val fechaHoraInicioMillis = parseDate(fechaHoraInicio)
    val fechaHoraFinMillis = parseDate(fechaHoraFin)
    val proximaCitaSugeridaMillis = parseDate(proximaCitaSugerida)
    
    val createdAtMillis = parseDate(createdAt) ?: System.currentTimeMillis()
    val updatedAtMillis = parseDate(updatedAt) ?: System.currentTimeMillis()

    return CitaMedicaEntity(
        id = id,
        usuario_id = usuarioId,
        doctor_id = doctorId,
        tipo_consulta_id = tipoConsultaId,
        estado_cita_id = estadoCitaId,
        fecha_hora_programada = fechaHoraProgramadaMillis,
        fecha_hora_inicio = fechaHoraInicioMillis,
        fecha_hora_fin = fechaHoraFinMillis,
        motivo = motivo,
        observaciones = observaciones,
        diagnostico = diagnostico,
        tratamiento_recomendado = tratamientoRecomendado,
        proxima_cita_sugerida = proximaCitaSugeridaMillis,
        syncStatus = SyncStatus.SYNCED,
        serverId = id,
        retryCount = 0,
        lastSyncAttempt = System.currentTimeMillis(),
        createdAt = createdAtMillis,
        updatedAt = updatedAtMillis
    )
}

/**
 * Convierte CitaMedicaEntity a CreateCitaMedicaRequest
 */
fun CitaMedicaEntity.toCreateRequest(): CreateCitaMedicaRequest {
    return CreateCitaMedicaRequest(
        usuario_id = usuario_id,
        doctor_id = doctor_id,
        tipo_consulta_id = tipo_consulta_id,
        estado_cita_id = estado_cita_id,
        fecha_hora_programada = Date(fecha_hora_programada),
        motivo = motivo
    )
}

