package com.example.enutritrack_app.data.remote.dto

import com.google.gson.annotations.SerializedName

data class CitaMedicaDocumentosResponse(
    val id: String,

    @SerializedName("cita_medica_id")
    val citaMedicaId: String,

    @SerializedName("nombre_archivo")
    val nombreArchivo: String,

    @SerializedName("tipo_documento")
    val tipoDocumento: String?,

    @SerializedName("ruta_archivo")
    val rutaArchivo: String,

    @SerializedName("tamano_bytes")
    val tamanoBytes: Long?,

    val notas: String?,

    @SerializedName("created_at")
    val createdAt: String
)

