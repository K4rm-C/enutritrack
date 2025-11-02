package com.example.enutritrack_app.data.remote.dto

import com.google.gson.annotations.SerializedName

/**
 * DTO de respuesta del servidor para RegistroComidaItem
 * Incluye información del alimento asociado
 */
data class RegistroComidaItemResponse(
    @SerializedName("id")
    val id: String,
    
    @SerializedName("registro_comida_id")
    val registroComidaId: String,
    
    @SerializedName("alimento_id")
    val alimentoId: String,
    
    @SerializedName("cantidad_gramos")
    val cantidadGramos: Double,
    
    @SerializedName("calorias")
    val calorias: Double,
    
    @SerializedName("proteinas_g")
    val proteinasG: Double,
    
    @SerializedName("carbohidratos_g")
    val carbohidratosG: Double,
    
    @SerializedName("grasas_g")
    val grasasG: Double,
    
    @SerializedName("fibra_g")
    val fibraG: Double?,
    
    @SerializedName("notas")
    val notas: String?,
    
    @SerializedName("created_at")
    val createdAt: String?,
    
    @SerializedName("alimento")
    val alimento: AlimentoResponse?
)

