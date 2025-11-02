package com.example.enutritrack_app.data.remote.dto

import com.google.gson.annotations.SerializedName

/**
 * DTO de respuesta del servidor para Alimento
 */
data class AlimentoResponse(
    @SerializedName("id")
    val id: String,
    
    @SerializedName("nombre")
    val nombre: String,
    
    @SerializedName("descripcion")
    val descripcion: String?,
    
    @SerializedName("calorias_por_100g")
    val caloriasPor100g: Double,
    
    @SerializedName("proteinas_g_por_100g")
    val proteinasGPor100g: Double,
    
    @SerializedName("carbohidratos_g_por_100g")
    val carbohidratosGPor100g: Double,
    
    @SerializedName("grasas_g_por_100g")
    val grasasGPor100g: Double,
    
    @SerializedName("fibra_g_por_100g")
    val fibraGPor100g: Double?,
    
    @SerializedName("categoria")
    val categoria: String?,
    
    @SerializedName("created_at")
    val createdAt: String?,
    
    @SerializedName("updated_at")
    val updatedAt: String?
)

