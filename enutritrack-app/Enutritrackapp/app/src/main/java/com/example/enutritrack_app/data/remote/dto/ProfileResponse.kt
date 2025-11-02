package com.example.enutritrack_app.data.remote.dto

import com.google.gson.annotations.SerializedName

/**
 * DTO de respuesta del servidor para perfil completo de usuario
 * Incluye datos del perfil_usuario y de la cuenta relacionada
 */
data class ProfileResponse(
    @SerializedName("id")
    val id: String,  // perfil_usuario.id
    
    @SerializedName("cuenta_id")
    val cuentaId: String,
    
    @SerializedName("doctor_id")
    val doctorId: String?,
    
    @SerializedName("nombre")
    val nombre: String,
    
    @SerializedName("fecha_nacimiento")
    val fechaNacimiento: String,  // ISO 8601
    
    @SerializedName("genero_id")
    val generoId: String,
    
    // Relación género
    @SerializedName("genero")
    val genero: GeneroResponse?,
    
    @SerializedName("altura")
    val altura: Double,
    
    @SerializedName("telefono")
    val telefono: String?,
    
    @SerializedName("telefono_1")
    val telefono1: String?,
    
    @SerializedName("telefono_2")
    val telefono2: String?,
    
    @SerializedName("created_at")
    val createdAt: String,
    
    @SerializedName("updated_at")
    val updatedAt: String,
    
    // Relación cuenta
    @SerializedName("cuenta")
    val cuenta: CuentaResponse?,
    
    // Relación doctor (puede ser null)
    @SerializedName("doctor")
    val doctor: DoctorInfoResponse?
)

/**
 * DTO de respuesta para datos de cuenta
 */
data class CuentaResponse(
    @SerializedName("id")
    val id: String,
    
    @SerializedName("email")
    val email: String,
    
    @SerializedName("email_1")
    val email1: String?,
    
    @SerializedName("email_2")
    val email2: String?,
    
    @SerializedName("tipo_cuenta")
    val tipoCuenta: String,
    
    @SerializedName("activa")
    val activa: Boolean
)

/**
 * DTO de respuesta para género
 */
data class GeneroResponse(
    @SerializedName("id")
    val id: String,
    
    @SerializedName("nombre")
    val nombre: String
)

