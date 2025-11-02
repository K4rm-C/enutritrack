package com.example.enutritrack_app.data.remote.dto

import com.google.gson.annotations.SerializedName

/**
 * DTO para actualizar datos de cuenta
 * Incluye emails y contraseña
 */
data class UpdateAccountRequest(
    @SerializedName("email")
    val email: String? = null,
    
    @SerializedName("email_1")
    val email1: String? = null,
    
    @SerializedName("email_2")
    val email2: String? = null,
    
    @SerializedName("password")
    val password: String? = null  // Si se proporciona, el servidor hará el hash
)

