package com.example.enutritrack_app.data.remote.dto

import com.google.gson.annotations.SerializedName

/**
 * DTO de request para actualizar un Alimento
 */
data class UpdateAlimentoRequest(
    @SerializedName("nombre")
    val nombre: String? = null,
    
    @SerializedName("descripcion")
    val descripcion: String? = null,
    
    @SerializedName("calorias_por_100g")
    val caloriasPor100g: Double? = null,
    
    @SerializedName("proteinas_g_por_100g")
    val proteinasGPor100g: Double? = null,
    
    @SerializedName("carbohidratos_g_por_100g")
    val carbohidratosGPor100g: Double? = null,
    
    @SerializedName("grasas_g_por_100g")
    val grasasGPor100g: Double? = null,
    
    @SerializedName("fibra_g_por_100g")
    val fibraGPor100g: Double? = null,
    
    @SerializedName("categoria")
    val categoria: String? = null
)

