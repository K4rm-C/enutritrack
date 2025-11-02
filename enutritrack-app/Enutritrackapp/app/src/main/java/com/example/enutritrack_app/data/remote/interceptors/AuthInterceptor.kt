package com.example.enutritrack_app.data.remote.interceptors

import android.content.Context
import com.example.enutritrack_app.data.local.SecurityManager
import okhttp3.Interceptor
import okhttp3.Response

/**
 * Interceptor que agrega el token JWT a los requests
 */
class AuthInterceptor(private val context: Context) : Interceptor {

    private val securityManager = SecurityManager(context)

    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()

        // Agregar token solo si no es un request de login o refresh
        if (!originalRequest.url.encodedPath.contains("auth/login") &&
            !originalRequest.url.encodedPath.contains("auth/refresh") &&
            !originalRequest.url.encodedPath.contains("users") // Register no requiere token
        ) {
            val accessToken = securityManager.getAccessToken()
            if (accessToken != null) {
                val authenticatedRequest = originalRequest.newBuilder()
                    .header("Authorization", "Bearer $accessToken")
                    .build()
                return chain.proceed(authenticatedRequest)
            }
        }

        return chain.proceed(originalRequest)
    }
}
