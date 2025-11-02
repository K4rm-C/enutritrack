package com.example.enutritrack_app.data.remote.dto

import com.google.gson.annotations.SerializedName

/**
 * DTO de solicitud para crear/actualizar Alergia
 */
data class CreateAlergiaRequest(
    @SerializedName("usuario_id")
    val usuarioId: String,
    val tipo: String? = null,
    val nombre: String,
    val severidad: String,  // "leve", "moderada", "severa", "critica"
    val reaccion: String,   // Obligatorio según requerimiento
    val notas: String? = null,
    val activa: Boolean = true
)

