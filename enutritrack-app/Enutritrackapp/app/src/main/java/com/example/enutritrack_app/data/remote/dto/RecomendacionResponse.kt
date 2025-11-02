package com.example.enutritrack_app.data.remote.dto

import com.google.gson.annotations.SerializedName

/**
 * DTO de respuesta del servidor para Recomendacion
 */
data class RecomendacionResponse(
    @SerializedName("id")
    val id: String,
    
    @SerializedName("usuario_id")
    val usuarioId: String,
    
    @SerializedName("tipo_recomendacion_id")
    val tipoRecomendacionId: String,
    
    @SerializedName("contenido")
    val contenido: String,
    
    @SerializedName("fecha_generacion")
    val fechaGeneracion: String, // ISO 8601
    
    @SerializedName("vigencia_hasta")
    val vigenciaHasta: String?, // ISO 8601, nullable
    
    @SerializedName("activa")
    val activa: Boolean,
    
    @SerializedName("prioridad")
    val prioridad: String?,
    
    @SerializedName("cita_medica_id")
    val citaMedicaId: String?,
    
    @SerializedName("alerta_generadora_id")
    val alertaGeneradoraId: String?
)

