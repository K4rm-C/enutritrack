package com.example.enutritrack_app.data.remote.dto

import com.google.gson.annotations.SerializedName

/**
 * DTO de respuesta para Alergia del servidor
 */
data class AlergiaResponse(
    val id: String,
    @SerializedName("usuario_id")
    val usuarioId: String,
    val tipo: String?,
    val nombre: String,
    val severidad: String,
    val reaccion: String?,
    val notas: String?,
    @SerializedName("activa")
    val activa: Boolean,
    @SerializedName("created_at")
    val createdAt: String,  // ISO 8601 string
    @SerializedName("updated_at")
    val updatedAt: String   // ISO 8601 string
)

