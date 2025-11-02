package com.example.enutritrack_app.data.remote.dto

import com.google.gson.annotations.SerializedName
import java.text.SimpleDateFormat
import java.util.*

private val isoDateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
    timeZone = TimeZone.getTimeZone("UTC")
}

/**
 * DTO para crear una nueva cita médica desde la app
 * El usuario solo puede especificar ciertos campos
 */
data class CreateCitaMedicaRequest(
    @SerializedName("usuario_id")
    val usuario_id: String,

    @SerializedName("doctor_id")
    val doctor_id: String,

    @SerializedName("tipo_consulta_id")
    val tipo_consulta_id: String,

    @SerializedName("estado_cita_id")
    val estado_cita_id: String,

    @SerializedName("fecha_hora_programada")
    val fecha_hora_programada: String, // ISO 8601 format

    @SerializedName("motivo")
    val motivo: String? = null
) {
    constructor(
        usuario_id: String,
        doctor_id: String,
        tipo_consulta_id: String,
        estado_cita_id: String,
        fecha_hora_programada: Date,
        motivo: String? = null
    ) : this(
        usuario_id = usuario_id,
        doctor_id = doctor_id,
        tipo_consulta_id = tipo_consulta_id,
        estado_cita_id = estado_cita_id,
        fecha_hora_programada = isoDateFormat.format(fecha_hora_programada),
        motivo = motivo
    )
}

