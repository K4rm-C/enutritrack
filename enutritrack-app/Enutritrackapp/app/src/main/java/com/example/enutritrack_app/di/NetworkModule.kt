package com.example.enutritrack_app.di

import android.content.Context
import com.example.enutritrack_app.BuildConfig
import com.example.enutritrack_app.config.ApiConfig
import com.example.enutritrack_app.data.remote.api.AuthApiService
import com.example.enutritrack_app.data.remote.api.HealthApiService
import com.example.enutritrack_app.data.remote.api.MedicalHistoryApiService
import com.example.enutritrack_app.data.remote.api.UserApiService
import com.example.enutritrack_app.data.remote.api.ProfileApiService
import com.example.enutritrack_app.data.remote.api.NutritionApiService
import com.example.enutritrack_app.data.remote.api.AppointmentsApiService
import com.example.enutritrack_app.data.remote.api.AlertsApiService
import com.example.enutritrack_app.data.remote.interceptors.AuthInterceptor
import com.example.enutritrack_app.data.remote.interceptors.TokenRefreshInterceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import com.google.gson.GsonBuilder
import java.util.concurrent.TimeUnit

object NetworkModule {

    fun createAuthApiService(context: Context): AuthApiService {
        return Retrofit.Builder()
            .baseUrl(ApiConfig.BASE_URL_AUTH)
            .client(createOkHttpClient(context))
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(AuthApiService::class.java)
    }

    fun createUserApiService(context: Context): UserApiService {
        return Retrofit.Builder()
            .baseUrl(ApiConfig.BASE_URL_USERS)
            .client(createOkHttpClientForUsers(context))
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(UserApiService::class.java)
    }
    
    /**
     * Crea el servicio API para endpoints de salud (peso, objetivos, medicamentos)
     * Estos endpoints están en el servidor principal (puerto 4000), no en el microservicio
     */
    fun createHealthApiService(context: Context): HealthApiService {
        // Gson por defecto omite campos null (no serializa nulls)
        // Esto evita enviar fecha_registro: null al servidor
        val gson = GsonBuilder().create()
        
        return Retrofit.Builder()
            .baseUrl(ApiConfig.BASE_URL_SERVER)  // Servidor principal, no microservicio
            .client(createOkHttpClient(context))  // Con autenticación
            .addConverterFactory(GsonConverterFactory.create(gson))
            .build()
            .create(HealthApiService::class.java)
    }
    
    /**
     * Crea el servicio API para endpoints de nutrición (alimentos, registros de comida, recomendaciones)
     * Estos endpoints están en el servidor principal (puerto 4000)
     */
    fun createNutritionApiService(context: Context): NutritionApiService {
        return Retrofit.Builder()
            .baseUrl(ApiConfig.BASE_URL_SERVER)  // Servidor principal
            .client(createOkHttpClient(context))  // Con autenticación
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(NutritionApiService::class.java)
    }
    
    /**
     * Crea el servicio API para endpoints de historial médico
     */
    fun createMedicalHistoryApiService(context: Context): MedicalHistoryApiService {
        return Retrofit.Builder()
            .baseUrl(ApiConfig.BASE_URL_MEDICAL)
            .client(createOkHttpClient(context))  // Con autenticación
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(MedicalHistoryApiService::class.java)
    }
    
    /**
     * Crea el servicio API para endpoints de perfil de usuario
     * Usa BASE_URL_USERS para endpoints de users/ y BASE_URL_SERVER para cuentas/ y doctors/
     * 
     * Nota: Los endpoints de users/ están en el microservicio (BASE_URL_USERS)
     * Los endpoints de cuentas/ y doctors/ están en el servidor principal (BASE_URL_SERVER)
     * Por simplicidad, creamos dos servicios separados
     */
    fun createProfileApiServiceForUsers(context: Context): ProfileApiService {
        return Retrofit.Builder()
            .baseUrl(ApiConfig.BASE_URL_USERS)
            .client(createOkHttpClient(context))  // Con autenticación para usuarios autenticados
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ProfileApiService::class.java)
    }
    
    /**
     * Crea el servicio API para endpoints de perfil relacionados con cuentas y doctors
     * Usa BASE_URL_SERVER (servidor principal)
     */
    fun createProfileApiServiceForServer(context: Context): ProfileApiService {
        return Retrofit.Builder()
            .baseUrl(ApiConfig.BASE_URL_SERVER)
            .client(createOkHttpClient(context))  // Con autenticación
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ProfileApiService::class.java)
    }

    /**
     * Crea el servicio API para endpoints de citas médicas
     * Estos endpoints están en el servidor principal (puerto 4000)
     */
    fun createAppointmentsApiService(context: Context): AppointmentsApiService {
        return Retrofit.Builder()
            .baseUrl(ApiConfig.BASE_URL_SERVER)  // Servidor principal
            .client(createOkHttpClient(context))  // Con autenticación
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(AppointmentsApiService::class.java)
    }

    /**
     * Crea el servicio API para endpoints de alertas
     * Estos endpoints están en el servidor principal (puerto 4000)
     */
    fun createAlertsApiService(context: Context): AlertsApiService {
        return Retrofit.Builder()
            .baseUrl(ApiConfig.BASE_URL_SERVER)  // Servidor principal
            .client(createOkHttpClient(context))  // Con autenticación
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(AlertsApiService::class.java)
    }

    private fun createOkHttpClient(context: Context): OkHttpClient {
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = if (BuildConfig.DEBUG) {
                HttpLoggingInterceptor.Level.BODY
            } else {
                HttpLoggingInterceptor.Level.NONE
            }
        }

        return OkHttpClient.Builder()
            .addInterceptor(loggingInterceptor)
            .addInterceptor(AuthInterceptor(context))
            .addInterceptor(TokenRefreshInterceptor(context))
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    /**
     * Cliente OkHttp para el servicio de usuarios sin interceptores de autenticación
     * para permitir registro público sin token
     */
    private fun createOkHttpClientForUsers(context: Context): OkHttpClient {
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = if (BuildConfig.DEBUG) {
                HttpLoggingInterceptor.Level.BODY
            } else {
                HttpLoggingInterceptor.Level.NONE
            }
        }

        return OkHttpClient.Builder()
            .addInterceptor(loggingInterceptor)
            // No agregar AuthInterceptor ni TokenRefreshInterceptor para permitir registro público
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
    }
}
