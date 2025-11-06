package com.example.enutritrack_app.data.remote.dto

import com.google.gson.annotations.SerializedName

/**
 * DTO para crear un registro de peso en el servidor
 * 
 * Nota: fecha_registro es opcional. Si no se envía, el servidor usa now() por defecto.
 * Esto evita problemas de transformación de string a Date en NestJS.
 */
data class CreateHistorialPesoRequest(
    @SerializedName("usuario_id")
    val usuarioId: String,
    
    @SerializedName("peso")
    val peso: Double,
    
    @SerializedName("fecha_registro")
    val fechaRegistro: String? = null,  // Opcional - servidor usa now() si es null
    
    @SerializedName("notas")
    val notas: String? = null
)

/**
 * DTO de respuesta del servidor para un registro de peso
 */
data class HistorialPesoResponse(
    @SerializedName("id")
    val id: String,
    
    @SerializedName("usuario_id")
    val usuarioId: String,
    
    @SerializedName("peso")
    val peso: Double,
    
    @SerializedName("fecha_registro")
    val fechaRegistro: String,
    
    @SerializedName("notas")
    val notas: String?
)

