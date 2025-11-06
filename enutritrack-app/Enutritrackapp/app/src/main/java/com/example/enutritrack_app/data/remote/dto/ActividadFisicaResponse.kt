package com.example.enutritrack_app.data.remote.dto

import com.google.gson.annotations.SerializedName

data class ActividadFisicaResponse(
    val id: String,
    
    @SerializedName("usuario_id")
    val usuarioId: String,
    
    @SerializedName("tipo_actividad_id")
    val tipoActividadId: String,
    
    @SerializedName("duracion_min")
    val duracionMin: Int,
    
    @SerializedName("calorias_quemadas")
    val caloriasQuemadas: Double,
    
    val fecha: String, // ISO 8601 format
    
    @SerializedName("created_at")
    val createdAt: String // ISO 8601 format
)

