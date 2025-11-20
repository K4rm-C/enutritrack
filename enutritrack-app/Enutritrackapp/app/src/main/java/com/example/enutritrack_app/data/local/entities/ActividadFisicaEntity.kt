package com.example.enutritrack_app.data.local.entities

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import com.example.enutritrack_app.data.local.database.SyncStatus

/**
 * Entidad local para registros de actividad física del usuario
 * 
 * Soporta sincronización offline: los registros se guardan localmente
 * primero y luego se sincronizan con el servidor cuando hay conexión
 */
@Entity(
    tableName = "actividad_fisica",
    indices = [
        Index(value = ["usuario_id", "fecha"]),
        Index(value = ["syncStatus"])
    ]
)
data class ActividadFisicaEntity(
    @PrimaryKey
    val id: String, // UUID generado localmente si es nuevo, o UUID del servidor
    
    val usuario_id: String, // FK → UserEntity.id
    
    val tipo_actividad_id: String, // FK → TipoActividadEntity.id
    
    val duracion_min: Int, // Duración en minutos
    
    val calorias_quemadas: Double, // Calorías quemadas
    
    val intensidad: String? = null, // Intensidad de la actividad (opcional)
    
    val notas: String? = null, // Notas adicionales (opcional)
    
    val fecha: Long, // timestamp en millis
    
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

