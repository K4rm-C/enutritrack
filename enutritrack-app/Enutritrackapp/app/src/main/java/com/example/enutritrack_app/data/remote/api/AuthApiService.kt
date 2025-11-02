package com.example.enutritrack_app.data.remote.api

import com.example.enutritrack_app.data.remote.dto.*
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface AuthApiService {
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    @POST("auth/refresh")
    suspend fun refreshToken(@Body request: RefreshTokenRequest): Response<LoginResponse>

    @POST("auth/validate")
    suspend fun validateToken(@Body request: ValidateTokenRequest): Response<TokenValidationResponse>

    @GET("auth/me")
    suspend fun getCurrentUser(): Response<UserResponse>

    @POST("auth/logout")
    suspend fun logout(): Response<Map<String, String>>
}
