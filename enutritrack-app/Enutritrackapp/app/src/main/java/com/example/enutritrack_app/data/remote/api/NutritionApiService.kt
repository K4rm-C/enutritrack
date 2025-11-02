package com.example.enutritrack_app.data.remote.api

import com.example.enutritrack_app.data.remote.dto.*
import retrofit2.Response
import retrofit2.http.*

/**
 * API Service para endpoints relacionados con nutrición
 * 
 * Endpoints disponibles:
 * - Alimentos: /alimentos
 * - Registros de comida: /registro-comida
 * - Items de registro: /registro-comida-items
 * - Recomendaciones: /recomendacion
 */
interface NutritionApiService {
    
    // ========== ALIMENTOS ==========
    
    /**
     * Crea un nuevo alimento
     */
    @POST("alimentos")
    suspend fun createAlimento(
        @Body request: CreateAlimentoRequest
    ): Response<AlimentoResponse>
    
    /**
     * Obtiene todos los alimentos
     */
    @GET("alimentos")
    suspend fun getAllAlimentos(): Response<List<AlimentoResponse>>
    
    /**
     * Obtiene un alimento por ID
     */
    @GET("alimentos/{id}")
    suspend fun getAlimentoById(
        @Path("id") id: String
    ): Response<AlimentoResponse>
    
    /**
     * Busca alimentos por nombre
     */
    @GET("alimentos/buscar")
    suspend fun searchAlimentos(
        @Query("nombre") nombre: String
    ): Response<List<AlimentoResponse>>
    
    /**
     * Obtiene alimentos por categoría
     */
    @GET("alimentos/categoria/{categoria}")
    suspend fun getAlimentosByCategoria(
        @Path("categoria") categoria: String
    ): Response<List<AlimentoResponse>>
    
    /**
     * Actualiza un alimento existente
     */
    @PATCH("alimentos/{id}")
    suspend fun updateAlimento(
        @Path("id") id: String,
        @Body request: UpdateAlimentoRequest
    ): Response<AlimentoResponse>
    
    /**
     * Elimina un alimento
     */
    @DELETE("alimentos/{id}")
    suspend fun deleteAlimento(
        @Path("id") id: String
    ): Response<Unit>
    
    // ========== REGISTRO DE COMIDA ==========
    
    /**
     * Crea un nuevo registro de comida
     */
    @POST("registro-comida")
    suspend fun createRegistroComida(
        @Body request: CreateRegistroComidaRequest
    ): Response<RegistroComidaResponse>
    
    /**
     * Obtiene todos los registros de comida de un usuario
     */
    @GET("registro-comida/usuario/{usuarioId}")
    suspend fun getRegistrosByUsuario(
        @Path("usuarioId") usuarioId: String
    ): Response<List<RegistroComidaResponse>>
    
    /**
     * Obtiene un registro de comida por ID
     */
    @GET("registro-comida/{id}")
    suspend fun getRegistroComidaById(
        @Path("id") id: String
    ): Response<RegistroComidaResponse>
    
    /**
     * Obtiene registros de comida por tipo
     */
    @GET("registro-comida/tipo-comida/{usuarioId}/{tipoComida}")
    suspend fun getRegistrosByTipoComida(
        @Path("usuarioId") usuarioId: String,
        @Path("tipoComida") tipoComida: String
    ): Response<List<RegistroComidaResponse>>
    
    /**
     * Obtiene registros de comida por rango de fechas
     */
    @GET("registro-comida/rango/{usuarioId}")
    suspend fun getRegistrosByDateRange(
        @Path("usuarioId") usuarioId: String,
        @Query("fechaInicio") fechaInicio: String,
        @Query("fechaFin") fechaFin: String
    ): Response<List<RegistroComidaResponse>>
    
    /**
     * Actualiza un registro de comida existente
     */
    @PATCH("registro-comida/{id}")
    suspend fun updateRegistroComida(
        @Path("id") id: String,
        @Body request: UpdateRegistroComidaRequest
    ): Response<RegistroComidaResponse>
    
    /**
     * Elimina un registro de comida
     */
    @DELETE("registro-comida/{id}")
    suspend fun deleteRegistroComida(
        @Path("id") id: String
    ): Response<Unit>
    
    // ========== REGISTRO DE COMIDA ITEMS ==========
    
    /**
     * Crea un nuevo item de registro de comida
     */
    @POST("registro-comida-items")
    suspend fun createRegistroComidaItem(
        @Body request: CreateRegistroComidaItemRequest
    ): Response<RegistroComidaItemResponse>
    
    /**
     * Obtiene todos los items de un registro de comida
     */
    @GET("registro-comida-items/registro-comida/{registroComidaId}")
    suspend fun getItemsByRegistroComida(
        @Path("registroComidaId") registroComidaId: String
    ): Response<List<RegistroComidaItemResponse>>
    
    /**
     * Obtiene un item por ID
     */
    @GET("registro-comida-items/{id}")
    suspend fun getRegistroComidaItemById(
        @Path("id") id: String
    ): Response<RegistroComidaItemResponse>
    
    /**
     * Actualiza un item existente
     */
    @PATCH("registro-comida-items/{id}")
    suspend fun updateRegistroComidaItem(
        @Path("id") id: String,
        @Body request: CreateRegistroComidaItemRequest
    ): Response<RegistroComidaItemResponse>
    
    /**
     * Elimina un item
     */
    @DELETE("registro-comida-items/{id}")
    suspend fun deleteRegistroComidaItem(
        @Path("id") id: String
    ): Response<Unit>
    
    // ========== RECOMENDACIONES ==========
    
    /**
     * Obtiene todas las recomendaciones activas de un usuario
     */
    @GET("recomendacion/activas/{usuarioId}")
    suspend fun getRecomendacionesActivas(
        @Path("usuarioId") usuarioId: String
    ): Response<List<RecomendacionResponse>>
    
    /**
     * Obtiene todas las recomendaciones de un usuario
     */
    @GET("recomendacion/usuario/{usuarioId}")
    suspend fun getRecomendacionesByUsuario(
        @Path("usuarioId") usuarioId: String
    ): Response<List<RecomendacionResponse>>
    
    /**
     * Obtiene una recomendación por ID
     */
    @GET("recomendacion/{id}")
    suspend fun getRecomendacionById(
        @Path("id") id: String
    ): Response<RecomendacionResponse>
}

