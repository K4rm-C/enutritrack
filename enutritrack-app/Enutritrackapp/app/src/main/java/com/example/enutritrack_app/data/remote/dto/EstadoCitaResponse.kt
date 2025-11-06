package com.example.enutritrack_app.data.remote.dto

import com.google.gson.annotations.SerializedName

data class EstadoCitaResponse(
    val id: String,

    val nombre: String,

    val descripcion: String?,

    @SerializedName("es_final")
    val esFinal: Boolean,

    @SerializedName("created_at")
    val createdAt: String
)

