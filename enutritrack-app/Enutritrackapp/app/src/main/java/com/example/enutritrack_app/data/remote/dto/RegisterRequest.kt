package com.example.enutritrack_app.data.remote.dto

import com.google.gson.annotations.SerializedName

data class RegisterRequest(
    @SerializedName("nombre")
    val nombre: String,
    @SerializedName("email")
    val email: String,
    @SerializedName("password")
    val password: String,
    @SerializedName("fecha_nacimiento")
    val fechaNacimiento: String, // ISO 8601 format: "YYYY-MM-DD"
    @SerializedName("genero_id")
    val generoId: String? = null,
    @SerializedName("genero")
    val genero: String? = null, // Legacy field: "M", "F", "O"
    @SerializedName("altura")
    val altura: Double,
    @SerializedName("telefono")
    val telefono: String? = null
)

