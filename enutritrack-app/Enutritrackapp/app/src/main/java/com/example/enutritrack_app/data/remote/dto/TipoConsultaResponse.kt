package com.example.enutritrack_app.data.remote.dto

import com.google.gson.annotations.SerializedName

data class TipoConsultaResponse(
    val id: String,

    val nombre: String,

    val descripcion: String?,

    @SerializedName("duracion_minutos")
    val duracionMinutos: Int,

    @SerializedName("created_at")
    val createdAt: String
)

