package com.example.enutritrack_app.data.remote.dto

import com.google.gson.annotations.SerializedName

/**
 * DTO de respuesta del servidor para medicamentos
 */
data class MedicamentoResponse(
    @SerializedName("id")
    val id: String,
    
    @SerializedName("usuario_id")
    val usuarioId: String,
    
    @SerializedName("nombre")
    val nombre: String,
    
    @SerializedName("dosis")
    val dosis: String?,
    
    @SerializedName("frecuencia")
    val frecuencia: String?,
    
    @SerializedName("fecha_inicio")
    val fechaInicio: String,  // ISO 8601 o formato fecha
    
    @SerializedName("fecha_fin")
    val fechaFin: String?,  // ISO 8601 o formato fecha
    
    @SerializedName("notas")
    val notas: String?,
    
    @SerializedName("activo")
    val activo: Boolean,
    
    @SerializedName("created_at")
    val createdAt: String? = null,
    
    @SerializedName("updated_at")
    val updatedAt: String? = null
)

