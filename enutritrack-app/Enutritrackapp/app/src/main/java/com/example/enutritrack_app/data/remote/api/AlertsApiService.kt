package com.example.enutritrack_app.data.remote.api

import com.example.enutritrack_app.data.remote.dto.*
import retrofit2.Response
import retrofit2.http.*

/**
 * API Service para endpoints relacionados con alertas
 */
interface AlertsApiService {

    /**
     * Obtiene todas las alertas de un usuario
     */
    @GET("alertas/usuario/{userId}")
    suspend fun getAlertsByUser(
        @Path("userId") userId: String
    ): Response<List<AlertaResponse>>

    /**
     * Obtiene una alerta por ID
     */
    @GET("alertas/{id}")
    suspend fun getAlertById(
        @Path("id") id: String
    ): Response<AlertaResponse>

    // ========== CATÁLOGOS (SOLO LECTURA) ==========

    /**
     * Obtiene todos los tipos de alerta
     */
    @GET("tipos-alerta")
    suspend fun getTiposAlerta(): Response<List<TipoAlertaResponse>>

    /**
     * Obtiene todas las categorías de alerta
     */
    @GET("categorias-alerta")
    suspend fun getCategoriasAlerta(): Response<List<CategoriaAlertaResponse>>

    /**
     * Obtiene todos los niveles de prioridad de alerta
     */
    @GET("niveles-prioridad-alerta")
    suspend fun getNivelesPrioridadAlerta(): Response<List<NivelPrioridadAlertaResponse>>

    /**
     * Obtiene todos los estados de alerta
     */
    @GET("estados-alerta")
    suspend fun getEstadosAlerta(): Response<List<EstadoAlertaResponse>>
}

