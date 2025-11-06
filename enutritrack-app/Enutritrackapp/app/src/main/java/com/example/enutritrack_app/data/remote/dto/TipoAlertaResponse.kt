package com.example.enutritrack_app.data.remote.dto

import com.google.gson.annotations.SerializedName

data class TipoAlertaResponse(
    val id: String,

    val nombre: String,

    val descripcion: String?,

    @SerializedName("categoria_id")
    val categoriaId: String,

    @SerializedName("es_automatica")
    val esAutomatica: Boolean,

    @SerializedName("created_at")
    val createdAt: String
)

