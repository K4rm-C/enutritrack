package com.example.enutritrack_app.data.remote.dto

import com.google.gson.annotations.SerializedName

data class CitaMedicaResponse(
    val id: String,

    @SerializedName("usuario_id")
    val usuarioId: String,

    @SerializedName("doctor_id")
    val doctorId: String,

    @SerializedName("tipo_consulta_id")
    val tipoConsultaId: String,

    @SerializedName("estado_cita_id")
    val estadoCitaId: String,

    @SerializedName("fecha_hora_programada")
    val fechaHoraProgramada: String, // ISO 8601 format

    @SerializedName("fecha_hora_inicio")
    val fechaHoraInicio: String?, // ISO 8601 format

    @SerializedName("fecha_hora_fin")
    val fechaHoraFin: String?, // ISO 8601 format

    val motivo: String?,

    val observaciones: String?,

    val diagnostico: String?,

    @SerializedName("tratamiento_recomendado")
    val tratamientoRecomendado: String?,

    @SerializedName("proxima_cita_sugerida")
    val proximaCitaSugerida: String?, // ISO 8601 format (date only)

    @SerializedName("created_at")
    val createdAt: String, // ISO 8601 format

    @SerializedName("updated_at")
    val updatedAt: String, // ISO 8601 format

    // Relaciones anidadas (opcionales, dependiendo del endpoint)
    @SerializedName("tipo_consulta")
    val tipoConsulta: TipoConsultaResponse? = null,

    @SerializedName("estado_cita")
    val estadoCita: EstadoCitaResponse? = null,

    @SerializedName("vitales")
    val vitales: List<CitaMedicaVitalesResponse>? = null,

    @SerializedName("documentos")
    val documentos: List<CitaMedicaDocumentosResponse>? = null
)

