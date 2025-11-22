package com.example.enutritrack_app.config

/**
 * Configuración de URLs de la API
 * 
 * ═══════════════════════════════════════════════════════════════
 * 📝 INSTRUCCIONES PARA CAMBIAR LA IP DESPUÉS DEL DESPLIEGUE
 * ═══════════════════════════════════════════════════════════════
 * 
 * Para usar con GCP después del despliegue:
 * 1. Abre este archivo en Android Studio
 * 2. Reemplaza [TU_IP_GCP] con la IP de tu VM de GCP
 * 3. Cambia USE_PRODUCTION = true
 * 4. Recompila la app (Build > Rebuild Project)
 * 5. Instala el APK
 * 
 * Ejemplo:
 * Si tu IP de GCP es 34.123.45.67, cambia:
 *   private const val PROD_IP = "34.123.45.67"
 *   private const val USE_PRODUCTION = true
 * 
 * ═══════════════════════════════════════════════════════════════
 */
object ApiConfig {
    // ============================================
    // ⚙️ CONFIGURACIÓN - CAMBIAR AQUÍ LA IP ⚙️
    // ============================================
    
    /**
     * IP para desarrollo local (emulador Android)
     * 10.0.2.2 es la IP especial del emulador que apunta a localhost de la máquina host
     */
    private const val DEV_IP = "10.0.2.2"
    
    /**
     * IP para producción (GCP)
     * Reemplaza [TU_IP_GCP] con la IP externa de tu VM de GCP
     * Ejemplo: "34.123.45.67"
     */
    private const val PROD_IP = "[TU_IP_GCP]"  // <-- Cambiar aquí con la IP de GCP
    
    /**
     * Modo de operación:
     * - false = Desarrollo local (usa DEV_IP con puertos directos)
     * - true = Producción GCP (usa PROD_IP con rutas de Nginx)
     */
    private const val USE_PRODUCTION = false  // <-- Cambiar a true para usar GCP
    
    // ============================================
    // URLs base (no modificar manualmente)
    // ============================================
    private val BASE_IP = if (USE_PRODUCTION) PROD_IP else DEV_IP
    
    /**
     * URLs para desarrollo local (puertos directos)
     * Usadas cuando USE_PRODUCTION = false
     */
    val BASE_URL_AUTH_DEV = "http://$DEV_IP:3004/"
    val BASE_URL_USERS_DEV = "http://$DEV_IP:3001/"
    val BASE_URL_MEDICAL_DEV = "http://$DEV_IP:3002/"
    val BASE_URL_SERVER_DEV = "http://$DEV_IP:4000/"
    
    /**
     * URLs para producción GCP (rutas a través de Nginx)
     * Usadas cuando USE_PRODUCTION = true
     */
    val BASE_URL_AUTH_PROD = "http://$PROD_IP/auth/"
    val BASE_URL_USERS_PROD = "http://$PROD_IP/users/"
    val BASE_URL_MEDICAL_PROD = "http://$PROD_IP/medical/"
    val BASE_URL_SERVER_PROD = "http://$PROD_IP/api/"
    
    /**
     * URLs finales según el modo seleccionado
     * Estas son las que se usan en NetworkModule
     */
    val BASE_URL_AUTH = if (USE_PRODUCTION) BASE_URL_AUTH_PROD else BASE_URL_AUTH_DEV
    val BASE_URL_USERS = if (USE_PRODUCTION) BASE_URL_USERS_PROD else BASE_URL_USERS_DEV
    val BASE_URL_MEDICAL = if (USE_PRODUCTION) BASE_URL_MEDICAL_PROD else BASE_URL_MEDICAL_DEV
    val BASE_URL_SERVER = if (USE_PRODUCTION) BASE_URL_SERVER_PROD else BASE_URL_SERVER_DEV
}

