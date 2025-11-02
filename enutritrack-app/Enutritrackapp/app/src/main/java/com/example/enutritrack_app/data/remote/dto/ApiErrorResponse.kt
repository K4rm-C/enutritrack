package com.example.enutritrack_app.data.remote.dto

import com.google.gson.annotations.SerializedName

data class ApiErrorResponse(
    @SerializedName("message")
    val message: String?,
    @SerializedName("statusCode")
    val statusCode: Int?,
    @SerializedName("error")
    val error: String?
)

