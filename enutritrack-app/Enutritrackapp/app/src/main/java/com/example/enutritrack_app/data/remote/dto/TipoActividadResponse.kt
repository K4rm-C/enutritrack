package com.example.enutritrack_app.data.remote.dto

import com.google.gson.annotations.SerializedName

data class TipoActividadResponse(
    val id: String,
    
    val nombre: String,
    
    val descripcion: String?,
    
    @SerializedName("met_value")
    val metValue: Double,
    
    val categoria: String?,
    
    @SerializedName("created_at")
    val createdAt: String // ISO 8601 format
)

