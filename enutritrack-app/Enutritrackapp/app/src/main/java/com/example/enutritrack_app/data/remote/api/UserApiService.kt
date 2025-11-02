package com.example.enutritrack_app.data.remote.api

import com.example.enutritrack_app.data.remote.dto.RegisterRequest
import com.example.enutritrack_app.data.remote.dto.UserResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface UserApiService {
    @POST("users")
    suspend fun register(@Body request: RegisterRequest): Response<UserResponse>
}

