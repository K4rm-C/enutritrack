package com.example.enutritrack_app.data.remote.dto

import com.google.gson.annotations.SerializedName

data class TokenValidationResponse(
    @SerializedName("valid")
    val valid: Boolean,
    @SerializedName("user")
    val user: UserResponse?
)
