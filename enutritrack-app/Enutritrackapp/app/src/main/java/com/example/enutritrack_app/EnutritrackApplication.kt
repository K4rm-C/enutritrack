package com.example.enutritrack_app

import android.app.Application
import android.util.Log
import com.example.enutritrack_app.data.local.SecurityManager
import com.example.enutritrack_app.data.local.sync.OfflineSyncManager

class EnutritrackApplication : Application() {
    
    private lateinit var offlineSyncManager: OfflineSyncManager
    
    override fun onCreate() {
        super.onCreate()
        Log.d("EnutritrackApplication", "Aplicación iniciada")
        
        // Inicializar sistema de sincronización offline si hay usuario logueado
        val securityManager = SecurityManager(this)
        if (securityManager.isLoggedIn()) {
            offlineSyncManager = OfflineSyncManager(this)
            offlineSyncManager.initialize()
            Log.d("EnutritrackApplication", "Sistema de sincronización inicializado")
        }
    }
    
    /**
     * Obtiene el OfflineSyncManager
     * Llamar después de login exitoso para inicializar
     */
    fun getOfflineSyncManager(): OfflineSyncManager {
        if (!::offlineSyncManager.isInitialized) {
            offlineSyncManager = OfflineSyncManager(this)
            offlineSyncManager.initialize()
        }
        return offlineSyncManager
    }
}
