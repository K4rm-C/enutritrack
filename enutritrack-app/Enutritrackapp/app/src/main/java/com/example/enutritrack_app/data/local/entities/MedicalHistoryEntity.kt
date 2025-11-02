package com.example.enutritrack_app.data.local.entities

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import com.example.enutritrack_app.data.local.database.SyncStatus

/**
 * Entidad local para el historial médico del usuario
 * 
 * Almacena condiciones médicas, alergias y medicamentos como arrays JSONB
 * Hay UNO por usuario (a diferencia de otras entidades que tienen múltiples registros)
 * 
 * Soporta sincronización offline
 */
@Entity(
    tableName = "historial_medico",
    indices = [
        Index(value = ["usuario_id"], unique = true),  // Un solo registro por usuario
        Index(value = ["syncStatus"])
    ]
)
data class MedicalHistoryEntity(
    @PrimaryKey
    val id: String,  // UUID generado localmente o del servidor
    
    val usuario_id: String,  // FK → UserEntity.id
    
    /**
     * Condiciones médicas como JSON array
     * Formato: ["condición1", "condición2", ...]
     */
    val condiciones: String?,  // JSON string, nullable
    
    /**
     * Alergias como JSON array
     * Formato: ["alergia1", "alergia2", ...]
     */
    val alergias: String?,  // JSON string, nullable
    
    /**
     * Medicamentos como JSON array
     * Formato: ["medicamento1", "medicamento2", ...]
     * Nota: En el modelo de servidor hay tabla separada de medicamentos,
     * pero en microservices usa JSONB array
     */
    val medicamentos: String?,  // JSON string, nullable
    
    /**
     * Estado de sincronización con el servidor
     */
    val syncStatus: SyncStatus = SyncStatus.SYNCED,
    
    /**
     * UUID asignado por el servidor después de sincronizar
     */
    val serverId: String? = null,
    
    /**
     * Contador de reintentos de sincronización
     */
    val retryCount: Int = 0,
    
    /**
     * Timestamp del último intento de sincronización
     */
    val lastSyncAttempt: Long? = null,
    
    /**
     * Timestamp de creación local
     */
    val createdAt: Long = System.currentTimeMillis(),
    
    /**
     * Timestamp de última actualización local
     */
    val updatedAt: Long = System.currentTimeMillis()
)

