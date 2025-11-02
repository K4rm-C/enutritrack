package com.example.enutritrack_app.data.remote.dto

import com.google.gson.annotations.SerializedName

/**
 * DTO de request para crear un RegistroComida
 */
data class CreateRegistroComidaRequest(
    @SerializedName("usuario_id")
    val usuarioId: String,
    
    @SerializedName("fecha")
    val fecha: String?, // ISO 8601, opcional (default now())
    
    @SerializedName("tipo_comida")
    val tipoComida: String, // "desayuno", "almuerzo", "cena", "merienda"
    
    @SerializedName("notas")
    val notas: String?
)

