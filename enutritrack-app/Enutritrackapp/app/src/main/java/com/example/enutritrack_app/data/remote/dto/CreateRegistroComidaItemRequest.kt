package com.example.enutritrack_app.data.remote.dto

import com.google.gson.annotations.SerializedName

/**
 * DTO de request para crear un RegistroComidaItem
 * 
 * Nota: Los valores nutricionales (calorias, proteinas_g, etc.) se calculan
 * automáticamente en el servidor basándose en el alimento y cantidad_gramos
 */
data class CreateRegistroComidaItemRequest(
    @SerializedName("registro_comida_id")
    val registroComidaId: String,
    
    @SerializedName("alimento_id")
    val alimentoId: String,
    
    @SerializedName("cantidad_gramos")
    val cantidadGramos: Double,
    
    @SerializedName("notas")
    val notas: String?
)

