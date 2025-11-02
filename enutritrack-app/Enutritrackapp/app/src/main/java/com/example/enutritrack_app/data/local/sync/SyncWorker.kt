package com.example.enutritrack_app.data.local.sync

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.example.enutritrack_app.data.local.SecurityManager
import com.example.enutritrack_app.data.local.database.EnutritrackDatabase
import com.example.enutritrack_app.data.local.repositories.UserLocalRepository
import com.example.enutritrack_app.data.repositories.HealthRepository
import com.example.enutritrack_app.di.DatabaseModule
import android.util.Log

/**
 * Worker de WorkManager para sincronizar datos offline periódicamente
 * 
 * Se ejecuta automáticamente cuando:
 * - Hay conexión a internet
 * - Se cumplen las condiciones de la periodicidad configurada
 */
class SyncWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {
    
    override suspend fun doWork(): Result {
        return try {
            Log.d("SyncWorker", "=== INICIO SINCRONIZACIÓN ===")
            
            val database = DatabaseModule.getDatabase(applicationContext)
            val securityManager = SecurityManager(applicationContext)
            val userLocalRepository = UserLocalRepository(database.userDao(), applicationContext)
            
            // Obtener usuario actual
            val userId = securityManager.getUserId()
            if (userId == null) {
                Log.w("SyncWorker", "No hay usuario logueado, cancelando sync")
                return Result.success()  // No es un error, simplemente no hay nada que sincronizar
            }
            
            // Crear HealthRepository
            val healthRepository = HealthRepository(
                context = applicationContext,
                historialPesoDao = database.historialPesoDao(),
                objetivoUsuarioDao = database.objetivoUsuarioDao(),
                medicalHistoryDao = database.medicalHistoryDao(),
                medicamentoDao = database.medicamentoDao(),
                alergiaDao = database.alergiaDao(),
                actividadFisicaDao = database.actividadFisicaDao(),
                userLocalRepository = userLocalRepository
            )
            
            // Sincronizar todos los datos pendientes
            healthRepository.syncAllPendingHealthData()
            
            Log.d("SyncWorker", "=== SINCRONIZACIÓN COMPLETADA ===")
            Result.success()
        } catch (e: Exception) {
            Log.e("SyncWorker", "Error en sincronización", e)
            // Retry con backoff exponencial si hay error
            Result.retry()
        }
    }
}

