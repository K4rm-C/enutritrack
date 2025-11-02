package com.example.enutritrack_app.data.remote.dto

import com.google.gson.annotations.SerializedName

data class NivelPrioridadAlertaResponse(
    val id: String,

    val nombre: String,

    val descripcion: String?,

    @SerializedName("nivel_numerico")
    val nivelNumerico: Int,

    @SerializedName("created_at")
    val createdAt: String
)

