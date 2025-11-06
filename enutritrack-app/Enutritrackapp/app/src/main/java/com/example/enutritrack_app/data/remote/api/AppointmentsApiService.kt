package com.example.enutritrack_app.data.remote.api

import com.example.enutritrack_app.data.remote.dto.*
import retrofit2.Response
import retrofit2.http.*

/**
 * API Service para endpoints relacionados con citas médicas
 */
interface AppointmentsApiService {

    /**
     * Crea una nueva cita médica
     */
    @POST("citas-medicas")
    suspend fun createAppointment(
        @Body request: CreateCitaMedicaRequest
    ): Response<CitaMedicaResponse>

    /**
     * Obtiene todas las citas médicas de un usuario
     */
    @GET("citas-medicas/usuario/{userId}")
    suspend fun getAppointmentsByUser(
        @Path("userId") userId: String
    ): Response<List<CitaMedicaResponse>>

    /**
     * Obtiene una cita médica por ID
     */
    @GET("citas-medicas/{id}")
    suspend fun getAppointmentById(
        @Path("id") id: String
    ): Response<CitaMedicaResponse>

    /**
     * Actualiza una cita médica
     */
    @PATCH("citas-medicas/{id}")
    suspend fun updateAppointment(
        @Path("id") id: String,
        @Body request: UpdateCitaMedicaRequest
    ): Response<CitaMedicaResponse>

    /**
     * Elimina una cita médica
     */
    @DELETE("citas-medicas/{id}")
    suspend fun deleteAppointment(
        @Path("id") id: String
    ): Response<Unit>

    // ========== CATÁLOGOS (SOLO LECTURA) ==========

    /**
     * Obtiene todos los tipos de consulta
     */
    @GET("tipos-consulta")
    suspend fun getTiposConsulta(): Response<List<TipoConsultaResponse>>

    /**
     * Obtiene todos los estados de cita
     */
    @GET("estados-cita")
    suspend fun getEstadosCita(): Response<List<EstadoCitaResponse>>
}

