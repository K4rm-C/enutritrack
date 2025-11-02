package com.example.enutritrack_app.data.remote.dto

import com.google.gson.annotations.SerializedName
import java.text.SimpleDateFormat
import java.util.*

private val isoDateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
    timeZone = TimeZone.getTimeZone("UTC")
}

/**
 * DTO para actualizar una cita médica desde la app
 * El usuario solo puede cambiar el estado (cancelar o reprogramar)
 */
data class UpdateCitaMedicaRequest(
    @SerializedName("estado_cita_id")
    val estado_cita_id: String? = null,

    @SerializedName("fecha_hora_programada")
    val fecha_hora_programada: String? = null, // ISO 8601 format (para reprogramar)

    @SerializedName("motivo")
    val motivo: String? = null // Opcional, para actualizar motivo
) {
    constructor(
        estadoCitaId: String?,
        fechaHoraProgramada: Date?,
        motivo: String? = null
    ) : this(
        estado_cita_id = estadoCitaId,
        fecha_hora_programada = fechaHoraProgramada?.let { isoDateFormat.format(it) },
        motivo = motivo
    )
}

