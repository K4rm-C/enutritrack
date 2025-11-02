package com.example.enutritrack_app.data.remote.dto

import com.google.gson.annotations.SerializedName

data class CategoriaAlertaResponse(
    val id: String,

    val nombre: String,

    val descripcion: String?,

    @SerializedName("created_at")
    val createdAt: String
)

