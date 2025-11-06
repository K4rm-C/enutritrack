package com.example.enutritrack_app.data.remote.dto

import com.google.gson.annotations.SerializedName

/**
 * DTO de respuesta del servidor para información del doctor
 */
data class DoctorInfoResponse(
    @SerializedName("id")
    val id: String,
    
    @SerializedName("nombre")
    val nombre: String,
    
    @SerializedName("telefono")
    val telefono: String?,
    
    @SerializedName("telefono_1")
    val telefono1: String?,
    
    @SerializedName("telefono_2")
    val telefono2: String?,
    
    @SerializedName("cedula_profesional")
    val cedulaProfesional: String?,
    
    // Relación especialidad
    @SerializedName("especialidad")
    val especialidad: EspecialidadResponse?,
    
    // Relación cuenta (para emails del doctor)
    @SerializedName("cuenta")
    val cuenta: CuentaResponse?
)

/**
 * DTO de respuesta para especialidad del doctor
 */
data class EspecialidadResponse(
    @SerializedName("id")
    val id: String,
    
    @SerializedName("nombre")
    val nombre: String,
    
    @SerializedName("descripcion")
    val descripcion: String?
)

