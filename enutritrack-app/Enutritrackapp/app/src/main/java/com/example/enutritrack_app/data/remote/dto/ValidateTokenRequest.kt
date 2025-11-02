package com.example.enutritrack_app.data.remote.dto

import com.google.gson.annotations.SerializedName

data class ValidateTokenRequest(
    @SerializedName("token")
    val token: String
)
