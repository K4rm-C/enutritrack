package com.example.enutritrack_app.data.remote.dto

import com.google.gson.annotations.SerializedName
import java.text.SimpleDateFormat
import java.util.*

private val isoDateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
    timeZone = TimeZone.getTimeZone("UTC")
}

data class CreateActividadFisicaRequest(
    @SerializedName("usuario_id")
    val usuario_id: String,
    
    @SerializedName("tipo_actividad_id")
    val tipo_actividad_id: String? = null,
    
    @SerializedName("tipo_actividad")
    val tipo_actividad: String? = null,
    
    @SerializedName("duracion_min")
    val duracion_min: Int,
    
    @SerializedName("calorias_quemadas")
    val calorias_quemadas: Double,
    
    @SerializedName("fecha")
    val fecha: String // ISO 8601 format
) {
    constructor(
        usuario_id: String,
        tipo_actividad: String,
        duracion_min: Int,
        calorias_quemadas: Double,
        fecha: Date
    ) : this(
        usuario_id = usuario_id,
        tipo_actividad_id = null,
        tipo_actividad = tipo_actividad,
        duracion_min = duracion_min,
        calorias_quemadas = calorias_quemadas,
        fecha = isoDateFormat.format(fecha)
    )
}
