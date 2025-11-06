package com.example.enutritrack_app.data.remote.dto

import com.google.gson.annotations.SerializedName

/**
 * DTO de respuesta del servidor para RegistroComida
 * Incluye los items asociados
 */
data class RegistroComidaResponse(
    @SerializedName("id")
    val id: String,
    
    @SerializedName("usuario_id")
    val usuarioId: String,
    
    @SerializedName("fecha")
    val fecha: String, // ISO 8601
    
    @SerializedName("tipo_comida")
    val tipoComida: String, // "desayuno", "almuerzo", "cena", "merienda"
    
    @SerializedName("notas")
    val notas: String?,
    
    @SerializedName("created_at")
    val createdAt: String?,
    
    @SerializedName("updated_at")
    val updatedAt: String?,
    
    @SerializedName("items")
    val items: List<RegistroComidaItemResponse>?
)

