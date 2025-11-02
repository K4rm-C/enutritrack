package com.example.enutritrack_app.data.local.entities

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import com.example.enutritrack_app.data.local.database.SyncStatus

/**
 * Entidad local para el historial de peso del usuario
 * 
 * Soporta sincronización offline: los registros se guardan localmente
 * primero y luego se sincronizan con el servidor cuando hay conexión
 */
@Entity(
    tableName = "historial_peso",
    indices = [
        Index(value = ["usuario_id", "fecha_registro"]),
        Index(value = ["syncStatus"])
    ]
)
data class HistorialPesoEntity(
    @PrimaryKey
    val id: String,  // UUID generado localmente si es nuevo, o UUID del servidor
    
    val usuario_id: String,  // FK → UserEntity.id
    
    val peso: Double,
    
    val fecha_registro: Long,  // timestamp en millis
    
    val notas: String?,
    
    /**
     * Estado de sincronización con el servidor
     */
    val syncStatus: SyncStatus = SyncStatus.SYNCED,
    
    /**
     * UUID asignado por el servidor después de sincronizar
     * null si aún no se ha sincronizado
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

