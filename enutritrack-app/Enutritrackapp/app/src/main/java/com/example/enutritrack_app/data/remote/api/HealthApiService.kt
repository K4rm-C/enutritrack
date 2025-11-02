package com.example.enutritrack_app.data.remote.api

import com.example.enutritrack_app.data.remote.dto.CreateHistorialPesoRequest
import com.example.enutritrack_app.data.remote.dto.HistorialPesoResponse
import retrofit2.Response
import retrofit2.http.*

/**
 * API Service para endpoints relacionados con salud
 */
interface HealthApiService {
    
    /**
     * Crea un nuevo registro de peso
     */
    @POST("historial-peso")
    suspend fun createWeightRecord(
        @Body request: CreateHistorialPesoRequest
    ): Response<HistorialPesoResponse>
    
    /**
     * Obtiene todos los registros de peso de un usuario
     */
    @GET("historial-peso/usuario/{userId}")
    suspend fun getWeightHistory(
        @Path("userId") userId: String
    ): Response<List<HistorialPesoResponse>>
    
    /**
     * Obtiene el último registro de peso de un usuario
     */
    @GET("historial-peso/ultimo/{userId}")
    suspend fun getLastWeight(
        @Path("userId") userId: String
    ): Response<HistorialPesoResponse>
    
    /**
     * Obtiene registros de peso por rango de fechas
     */
    @GET("historial-peso/rango/{userId}")
    suspend fun getWeightByRange(
        @Path("userId") userId: String,
        @Query("fechaInicio") fechaInicio: String,
        @Query("fechaFin") fechaFin: String
    ): Response<List<HistorialPesoResponse>>
    
    /**
     * Actualiza un registro de peso existente
     */
    @PATCH("historial-peso/{id}")
    suspend fun updateWeightRecord(
        @Path("id") id: String,
        @Body request: CreateHistorialPesoRequest
    ): Response<HistorialPesoResponse>
    
    /**
     * Elimina un registro de peso
     */
    @DELETE("historial-peso/{id}")
    suspend fun deleteWeightRecord(
        @Path("id") id: String
    ): Response<Unit>
    
    // ========== OBJETIVOS DE USUARIO ==========
    
    /**
     * Crea un nuevo objetivo de usuario
     */
    @POST("objetivo-usuario")
    suspend fun createObjective(
        @Body request: com.example.enutritrack_app.data.remote.dto.CreateObjetivoUsuarioRequest
    ): Response<com.example.enutritrack_app.data.remote.dto.ObjetivoUsuarioResponse>
    
    /**
     * Obtiene el objetivo de un usuario (retorna objeto único o null)
     */
    @GET("objetivo-usuario/usuario/{userId}")
    suspend fun getObjectives(
        @Path("userId") userId: String
    ): Response<com.example.enutritrack_app.data.remote.dto.ObjetivoUsuarioResponse>
    
    /**
     * Obtiene el objetivo vigente de un usuario
     */
    @GET("objetivo-usuario/vigente/{userId}")
    suspend fun getVigenteObjective(
        @Path("userId") userId: String
    ): Response<com.example.enutritrack_app.data.remote.dto.ObjetivoUsuarioResponse>
    
    /**
     * Actualiza un objetivo existente
     */
    @PATCH("objetivo-usuario/{id}")
    suspend fun updateObjective(
        @Path("id") id: String,
        @Body request: com.example.enutritrack_app.data.remote.dto.CreateObjetivoUsuarioRequest
    ): Response<com.example.enutritrack_app.data.remote.dto.ObjetivoUsuarioResponse>
    
    /**
     * Elimina un objetivo
     */
    @DELETE("objetivo-usuario/{id}")
    suspend fun deleteObjective(
        @Path("id") id: String
    ): Response<Unit>
    
    // ========== MEDICAMENTOS (SOLO LECTURA) ==========
    
    /**
     * Obtiene todos los medicamentos de un usuario
     */
    @GET("medicamentos/usuario/{userId}")
    suspend fun getMedications(
        @Path("userId") userId: String
    ): Response<List<com.example.enutritrack_app.data.remote.dto.MedicamentoResponse>>
    
    /**
     * Obtiene solo los medicamentos activos de un usuario
     */
    @GET("medicamentos/activos/{userId}")
    suspend fun getActiveMedications(
        @Path("userId") userId: String
    ): Response<List<com.example.enutritrack_app.data.remote.dto.MedicamentoResponse>>
    
    /**
     * Obtiene un medicamento por ID
     */
    @GET("medicamentos/{id}")
    suspend fun getMedication(
        @Path("id") id: String
    ): Response<com.example.enutritrack_app.data.remote.dto.MedicamentoResponse>
    
    // ========== ALERGIAS ==========
    
    /**
     * Crea una nueva alergia
     */
    @POST("alergias")
    suspend fun createAlergia(
        @Body request: com.example.enutritrack_app.data.remote.dto.CreateAlergiaRequest
    ): Response<com.example.enutritrack_app.data.remote.dto.AlergiaResponse>
    
    /**
     * Obtiene todas las alergias de un usuario
     */
    @GET("alergias/usuario/{usuarioId}")
    suspend fun getAlergiasByUsuario(
        @Path("usuarioId") usuarioId: String
    ): Response<List<com.example.enutritrack_app.data.remote.dto.AlergiaResponse>>
    
    /**
     * Obtiene solo las alergias activas de un usuario
     */
    @GET("alergias/activas/{usuarioId}")
    suspend fun getActiveAlergiasByUsuario(
        @Path("usuarioId") usuarioId: String
    ): Response<List<com.example.enutritrack_app.data.remote.dto.AlergiaResponse>>
    
    /**
     * Obtiene una alergia por ID
     */
    @GET("alergias/{id}")
    suspend fun getAlergiaById(
        @Path("id") id: String
    ): Response<com.example.enutritrack_app.data.remote.dto.AlergiaResponse>
    
    /**
     * Actualiza una alergia existente
     */
    @PATCH("alergias/{id}")
    suspend fun updateAlergia(
        @Path("id") id: String,
        @Body request: com.example.enutritrack_app.data.remote.dto.CreateAlergiaRequest
    ): Response<com.example.enutritrack_app.data.remote.dto.AlergiaResponse>
    
    /**
     * Desactiva una alergia
     */
    @PATCH("alergias/desactivar/{id}")
    suspend fun desactivarAlergia(
        @Path("id") id: String
    ): Response<com.example.enutritrack_app.data.remote.dto.AlergiaResponse>
    
    /**
     * Elimina una alergia
     */
    @DELETE("alergias/{id}")
    suspend fun deleteAlergia(
        @Path("id") id: String
    ): Response<Unit>
    
    // ========== ACTIVIDAD FÍSICA ==========
    
    /**
     * Crea una nueva actividad física
     */
    @POST("physical-activity")
    suspend fun createActividadFisica(
        @Body request: com.example.enutritrack_app.data.remote.dto.CreateActividadFisicaRequest
    ): Response<com.example.enutritrack_app.data.remote.dto.ActividadFisicaResponse>
    
    /**
     * Obtiene todas las actividades físicas de un usuario
     */
    @GET("physical-activity/user/{userId}")
    suspend fun getActividadesFisicasByUsuario(
        @Path("userId") userId: String
    ): Response<List<com.example.enutritrack_app.data.remote.dto.ActividadFisicaResponse>>
    
    /**
     * Obtiene una actividad física por ID
     */
    @GET("physical-activity/{id}")
    suspend fun getActividadFisicaById(
        @Path("id") id: String
    ): Response<com.example.enutritrack_app.data.remote.dto.ActividadFisicaResponse>
    
    /**
     * Actualiza una actividad física existente
     */
    @PATCH("physical-activity/{id}")
    suspend fun updateActividadFisica(
        @Path("id") id: String,
        @Body request: com.example.enutritrack_app.data.remote.dto.CreateActividadFisicaRequest
    ): Response<com.example.enutritrack_app.data.remote.dto.ActividadFisicaResponse>
    
    /**
     * Elimina una actividad física
     */
    @DELETE("physical-activity/{id}")
    suspend fun deleteActividadFisica(
        @Path("id") id: String
    ): Response<Unit>
    
    // ========== TIPOS DE ACTIVIDAD (SOLO LECTURA) ==========
    
    /**
     * Obtiene todos los tipos de actividad física
     */
    @GET("tipos-actividad")
    suspend fun getTiposActividad(): Response<List<com.example.enutritrack_app.data.remote.dto.TipoActividadResponse>>
}

