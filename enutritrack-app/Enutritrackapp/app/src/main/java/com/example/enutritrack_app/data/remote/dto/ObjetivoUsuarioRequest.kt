package com.example.enutritrack_app.data.remote.dto

import com.google.gson.annotations.SerializedName

/**
 * DTO para crear un objetivo de usuario en el servidor
 */
data class CreateObjetivoUsuarioRequest(
    @SerializedName("usuario_id")
    val usuarioId: String,
    
    @SerializedName("peso_objetivo")
    val pesoObjetivo: Double? = null,
    
    @SerializedName("nivel_actividad")
    val nivelActividad: String,  // "sedentario", "moderado", "activo", "muy_activo"
    
    @SerializedName("vigente")
    val vigente: Boolean = true
)

/**
 * DTO de respuesta del servidor para un objetivo de usuario
 */
data class ObjetivoUsuarioResponse(
    @SerializedName("id")
    val id: String,
    
    @SerializedName("usuario_id")
    val usuarioId: String,
    
    @SerializedName("peso_objetivo")
    val pesoObjetivo: Double?,
    
    @SerializedName("nivel_actividad")
    val nivelActividad: String,
    
    @SerializedName("fecha_establecido")
    val fechaEstablecido: String,  // ISO 8601
    
    @SerializedName("vigente")
    val vigente: Boolean
)

