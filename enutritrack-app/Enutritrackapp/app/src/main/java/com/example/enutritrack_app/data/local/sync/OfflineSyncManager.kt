package com.example.enutritrack_app.data.local.sync

import android.content.Context
import android.util.Log
import androidx.work.*
import com.example.enutritrack_app.data.local.SecurityManager
import com.example.enutritrack_app.data.local.database.EnutritrackDatabase
import com.example.enutritrack_app.data.local.repositories.UserLocalRepository
import com.example.enutritrack_app.data.repositories.HealthRepository
import com.example.enutritrack_app.data.repositories.AppointmentsRepository
import com.example.enutritrack_app.data.repositories.AlertsRepository
import com.example.enutritrack_app.di.DatabaseModule
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import java.util.concurrent.TimeUnit

/**
 * Manager para orquestar la sincronización offline
 * 
 * Responsabilidades:
 * - Configurar WorkManager para sincronización periódica
 * - Disparar sincronización cuando se detecta conexión
 * - Proporcionar métodos para sincronización manual
 */
class OfflineSyncManager(
    private val context: Context
) {
    
    private val workManager = WorkManager.getInstance(context)
    private val networkMonitor = NetworkMonitor(context)
    private val securityManager = SecurityManager(context)
    
    companion object {
        private const val SYNC_WORK_NAME = "enutritrack_sync_work"
        private const val SYNC_TAG = "sync_health_data"
        
        // Periodicidad de sincronización (cada 15 minutos cuando hay conexión)
        private val REPEAT_INTERVAL = 15L
    }
    
    /**
     * Inicializa el sistema de sincronización
     * 
     * Configura:
     * 1. Work periódico para sincronización automática
     * 2. Observer de red para sincronizar al reconectar
     */
    fun initialize() {
        Log.d("OfflineSyncManager", "Inicializando sistema de sincronización")
        
        // 1. Configurar WorkManager periódico
        setupPeriodicSync()
        
        // 2. Observar cambios de red y sincronizar al reconectar
        observeNetworkAndSync()
    }
    
    /**
     * Configura el WorkManager para sincronización periódica
     */
    private fun setupPeriodicSync() {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .setRequiresBatteryNotLow(true)
            .build()
        
        val syncWork = PeriodicWorkRequestBuilder<SyncWorker>(
            REPEAT_INTERVAL,
            TimeUnit.MINUTES
        )
            .setConstraints(constraints)
            .addTag(SYNC_TAG)
            .setBackoffCriteria(
                BackoffPolicy.EXPONENTIAL,
                WorkRequest.MIN_BACKOFF_MILLIS,
                TimeUnit.MILLISECONDS
            )
            .build()
        
        workManager.enqueueUniquePeriodicWork(
            SYNC_WORK_NAME,
            ExistingPeriodicWorkPolicy.KEEP,  // Mantener si ya existe
            syncWork
        )
        
        Log.d("OfflineSyncManager", "WorkManager periódico configurado (cada $REPEAT_INTERVAL minutos)")
    }
    
    /**
     * Observa cambios de red y sincroniza automáticamente cuando hay conexión
     */
    private fun observeNetworkAndSync() {
        CoroutineScope(Dispatchers.IO).launch {
            var wasOffline = !networkMonitor.isOnline()
            
            networkMonitor.observeNetworkState().collect { isOnline ->
                if (isOnline && wasOffline) {
                    // Se reconectó después de estar offline
                    Log.d("OfflineSyncManager", "Conexión detectada, iniciando sincronización")
                    syncNow()
                }
                wasOffline = !isOnline
            }
        }
    }
    
    /**
     * Sincroniza inmediatamente (one-time work)
     */
    fun syncNow() {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()
        
        val syncWork = OneTimeWorkRequestBuilder<SyncWorker>()
            .setConstraints(constraints)
            .addTag(SYNC_TAG)
            .build()
        
        workManager.enqueue(syncWork)
        Log.d("OfflineSyncManager", "Sincronización inmediata enqueued")
    }
    
    /**
     * Sincroniza manualmente desde código (síncrono, para uso en ViewModels)
     */
    suspend fun syncNowAsync(): Result<Unit> {
        return try {
            val database = DatabaseModule.getDatabase(context)
            val userLocalRepository = UserLocalRepository(database.userDao(), context)
            
            val userId = securityManager.getUserId()
            if (userId == null) {
                Log.w("OfflineSyncManager", "No hay usuario logueado")
                return Result.failure(Exception("Usuario no autenticado"))
            }
            
            val healthRepository = HealthRepository(
                context = context,
                historialPesoDao = database.historialPesoDao(),
                objetivoUsuarioDao = database.objetivoUsuarioDao(),
                medicalHistoryDao = database.medicalHistoryDao(),
                medicamentoDao = database.medicamentoDao(),
                alergiaDao = database.alergiaDao(),
                actividadFisicaDao = database.actividadFisicaDao(),
                tipoActividadDao = database.tipoActividadDao(),
                userLocalRepository = userLocalRepository
            )
            
            val appointmentsRepository = AppointmentsRepository(
                context = context,
                citaMedicaDao = database.citaMedicaDao(),
                citaMedicaVitalesDao = database.citaMedicaVitalesDao(),
                citaMedicaDocumentosDao = database.citaMedicaDocumentosDao(),
                tipoConsultaDao = database.tipoConsultaDao(),
                estadoCitaDao = database.estadoCitaDao(),
                userLocalRepository = userLocalRepository
            )
            
            val alertsRepository = AlertsRepository(
                context = context,
                alertaDao = database.alertaDao(),
                tipoAlertaDao = database.tipoAlertaDao(),
                categoriaAlertaDao = database.categoriaAlertaDao(),
                nivelPrioridadAlertaDao = database.nivelPrioridadAlertaDao(),
                estadoAlertaDao = database.estadoAlertaDao()
            )
            
            // Sincronizar datos de salud
            healthRepository.syncAllPendingHealthData()
            
            // Sincronizar citas pendientes
            appointmentsRepository.syncAllPendingCitas()
            
            // Sincronizar catálogos de citas
            appointmentsRepository.syncTiposConsultaFromServer()
            appointmentsRepository.syncEstadosCitaFromServer()
            
            // Sincronizar citas desde servidor
            appointmentsRepository.syncCitasFromServer(userId)
            
            // Sincronizar alertas (solo lectura, no hay pendientes)
            alertsRepository.syncTiposAlertaFromServer()
            alertsRepository.syncCategoriasAlertaFromServer()
            alertsRepository.syncNivelesPrioridadFromServer()
            alertsRepository.syncEstadosAlertaFromServer()
            alertsRepository.syncAlertasFromServer(userId)
            
            Log.d("OfflineSyncManager", "Sincronización manual completada")
            Result.success(Unit)
        } catch (e: Exception) {
            Log.e("OfflineSyncManager", "Error en sincronización manual", e)
            Result.failure(e)
        }
    }
    
    /**
     * Cancela todas las sincronizaciones pendientes
     */
    fun cancelAllSync() {
        workManager.cancelUniqueWork(SYNC_WORK_NAME)
        workManager.cancelAllWorkByTag(SYNC_TAG)
        Log.d("OfflineSyncManager", "Sincronizaciones canceladas")
    }
}

