package com.example.enutritrack_app.data.remote.dto

import com.google.gson.annotations.SerializedName

data class CitaMedicaVitalesResponse(
    val id: String,

    @SerializedName("cita_medica_id")
    val citaMedicaId: String,

    val peso: Double?,

    val altura: Double?,

    @SerializedName("tension_arterial_sistolica")
    val tensionArterialSistolica: Int?,

    @SerializedName("tension_arterial_diastolica")
    val tensionArterialDiastolica: Int?,

    @SerializedName("frecuencia_cardiaca")
    val frecuenciaCardiaca: Int?,

    val temperatura: Double?,

    @SerializedName("saturacion_oxigeno")
    val saturacionOxigeno: Int?,

    val notas: String?,

    @SerializedName("created_at")
    val createdAt: String
)

