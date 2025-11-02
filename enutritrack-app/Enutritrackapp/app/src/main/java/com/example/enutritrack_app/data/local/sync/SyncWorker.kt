package com.example.enutritrack_app.data.local.sync

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.example.enutritrack_app.data.local.SecurityManager
import com.example.enutritrack_app.data.local.database.EnutritrackDatabase
import com.example.enutritrack_app.data.local.repositories.UserLocalRepository
import com.example.enutritrack_app.data.repositories.HealthRepository
import com.example.enutritrack_app.data.repositories.AppointmentsRepository
import com.example.enutritrack_app.data.repositories.AlertsRepository
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
            
            // Crear Repositories
            val healthRepository = HealthRepository(
                context = applicationContext,
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
                context = applicationContext,
                citaMedicaDao = database.citaMedicaDao(),
                citaMedicaVitalesDao = database.citaMedicaVitalesDao(),
                citaMedicaDocumentosDao = database.citaMedicaDocumentosDao(),
                tipoConsultaDao = database.tipoConsultaDao(),
                estadoCitaDao = database.estadoCitaDao(),
                userLocalRepository = userLocalRepository
            )
            
            val alertsRepository = AlertsRepository(
                context = applicationContext,
                alertaDao = database.alertaDao(),
                tipoAlertaDao = database.tipoAlertaDao(),
                categoriaAlertaDao = database.categoriaAlertaDao(),
                nivelPrioridadAlertaDao = database.nivelPrioridadAlertaDao(),
                estadoAlertaDao = database.estadoAlertaDao()
            )
            
            // Sincronizar todos los datos pendientes de salud
            healthRepository.syncAllPendingHealthData()
            
            // Sincronizar citas pendientes
            appointmentsRepository.syncAllPendingCitas()
            
            // Sincronizar catálogos de citas (si no existen)
            appointmentsRepository.syncTiposConsultaFromServer()
            appointmentsRepository.syncEstadosCitaFromServer()
            
            // Sincronizar citas desde servidor
            appointmentsRepository.syncCitasFromServer(userId)
            
            // Sincronizar alertas (solo lectura)
            alertsRepository.syncTiposAlertaFromServer()
            alertsRepository.syncCategoriasAlertaFromServer()
            alertsRepository.syncNivelesPrioridadFromServer()
            alertsRepository.syncEstadosAlertaFromServer()
            alertsRepository.syncAlertasFromServer(userId)
            
            Log.d("SyncWorker", "=== SINCRONIZACIÓN COMPLETADA ===")
            Result.success()
        } catch (e: Exception) {
            Log.e("SyncWorker", "Error en sincronización", e)
            // Retry con backoff exponencial si hay error
            Result.retry()
        }
    }
}

