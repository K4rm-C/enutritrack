package com.example.enutritrack_app.data.remote.api

import com.example.enutritrack_app.data.remote.dto.*
import retrofit2.Response
import retrofit2.http.*

/**
 * API Service para endpoints relacionados con perfil de usuario
 * 
 * Endpoints de perfil_usuario están en BASE_URL_USERS (microservicio)
 * Endpoints de cuentas están en BASE_URL_SERVER (servidor principal)
 * Endpoints de doctores están en BASE_URL_SERVER (servidor principal)
 */
interface ProfileApiService {
    
    // ========== PERFIL DE USUARIO ==========
    
    /**
     * Obtiene el perfil de usuario completo por cuenta_id
     * Incluye datos de cuenta y doctor relacionado
     */
    @GET("users/cuenta/{cuentaId}")
    suspend fun getProfileByCuentaId(
        @Path("cuentaId") cuentaId: String
    ): Response<ProfileResponse>
    
    /**
     * Obtiene el perfil de usuario completo por usuario_id
     * Incluye datos de cuenta y doctor relacionado
     */
    @GET("users/{userId}")
    suspend fun getProfileByUserId(
        @Path("userId") userId: String
    ): Response<ProfileResponse>
    
    /**
     * Actualiza el perfil de usuario
     */
    @PATCH("users/{userId}")
    suspend fun updateProfile(
        @Path("userId") userId: String,
        @Body request: UpdateProfileRequest
    ): Response<ProfileResponse>
    
    // ========== CUENTA ==========
    
    /**
     * Obtiene los datos de cuenta por cuenta_id
     */
    @GET("cuentas/{cuentaId}")
    suspend fun getAccount(
        @Path("cuentaId") cuentaId: String
    ): Response<CuentaResponse>
    
    /**
     * Actualiza los datos de cuenta (emails, contraseña)
     */
    @PATCH("cuentas/{cuentaId}")
    suspend fun updateAccount(
        @Path("cuentaId") cuentaId: String,
        @Body request: UpdateAccountRequest
    ): Response<CuentaResponse>
    
    // ========== DOCTOR ==========
    
    /**
     * Obtiene información del doctor por doctor_id
     * Incluye datos de cuenta y especialidad
     */
    @GET("doctors/{doctorId}")
    suspend fun getDoctorInfo(
        @Path("doctorId") doctorId: String
    ): Response<DoctorInfoResponse>
}

