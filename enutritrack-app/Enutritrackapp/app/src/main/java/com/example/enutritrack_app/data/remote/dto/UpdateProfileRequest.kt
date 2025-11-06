package com.example.enutritrack_app.data.remote.dto

import com.google.gson.annotations.SerializedName

/**
 * DTO para actualizar perfil de usuario
 * Solo incluye campos editables del perfil_usuario
 */
data class UpdateProfileRequest(
    @SerializedName("nombre")
    val nombre: String? = null,
    
    @SerializedName("altura")
    val altura: Double? = null,
    
    @SerializedName("telefono")
    val telefono: String? = null,
    
    @SerializedName("telefono_1")
    val telefono1: String? = null,
    
    @SerializedName("telefono_2")
    val telefono2: String? = null
)

