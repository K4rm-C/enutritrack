package com.example.enutritrack_app.data.remote.dto

import com.google.gson.annotations.SerializedName

/**
 * DTO de request para actualizar un RegistroComida
 */
data class UpdateRegistroComidaRequest(
    @SerializedName("fecha")
    val fecha: String? = null, // ISO 8601
    
    @SerializedName("tipo_comida")
    val tipoComida: String? = null, // "desayuno", "almuerzo", "cena", "merienda"
    
    @SerializedName("notas")
    val notas: String? = null
)

