package com.example.enutritrack_app.data.remote.dto

import com.google.gson.annotations.SerializedName

data class AlertaResponse(
    val id: String,

    @SerializedName("usuario_id")
    val usuarioId: String,

    @SerializedName("doctor_id")
    val doctorId: String?,

    @SerializedName("tipo_alerta_id")
    val tipoAlertaId: String,

    @SerializedName("nivel_prioridad_id")
    val nivelPrioridadId: String,

    @SerializedName("estado_alerta_id")
    val estadoAlertaId: String,

    val titulo: String,

    val mensaje: String,

    @SerializedName("recomendacion_id")
    val recomendacionId: String?,

    @SerializedName("fecha_deteccion")
    val fechaDeteccion: String, // ISO 8601 format

    @SerializedName("fecha_resolucion")
    val fechaResolucion: String?, // ISO 8601 format

    @SerializedName("resuelta_por")
    val resueltaPor: String?,

    @SerializedName("notas_resolucion")
    val notasResolucion: String?,

    @SerializedName("created_at")
    val createdAt: String, // ISO 8601 format

    @SerializedName("updated_at")
    val updatedAt: String, // ISO 8601 format

    // Relaciones anidadas (opcionales, dependiendo del endpoint)
    @SerializedName("tipo_alerta")
    val tipoAlerta: TipoAlertaResponse? = null,

    @SerializedName("nivel_prioridad")
    val nivelPrioridad: NivelPrioridadAlertaResponse? = null,

    @SerializedName("estado_alerta")
    val estadoAlerta: EstadoAlertaResponse? = null
)

