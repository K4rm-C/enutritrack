package com.example.enutritrack_app.data.remote.dto

import com.google.gson.annotations.SerializedName

/**
 * DTO para crear o actualizar historial médico en el servidor
 */
data class CreateMedicalHistoryDto(
    @SerializedName("condiciones")
    val condiciones: List<String>? = null,
    
    @SerializedName("alergias")
    val alergias: List<String>? = null,
    
    @SerializedName("medicamentos")
    val medicamentos: List<String>? = null
)

/**
 * DTO de respuesta del servidor para historial médico
 */
data class MedicalHistoryResponse(
    @SerializedName("id")
    val id: String,
    
    @SerializedName("usuario")
    val usuario: UsuarioInfo? = null,
    
    @SerializedName("condiciones")
    val condiciones: List<String>? = null,
    
    @SerializedName("alergias")
    val alergias: List<String>? = null,
    
    @SerializedName("medicamentos")
    val medicamentos: List<String>? = null,
    
    @SerializedName("created_at")
    val createdAt: String? = null,
    
    @SerializedName("updated_at")
    val updatedAt: String? = null
)

/**
 * Información del usuario en la respuesta (puede venir anidado)
 */
data class UsuarioInfo(
    @SerializedName("id")
    val id: String,
    
    @SerializedName("nombre")
    val nombre: String? = null
)

