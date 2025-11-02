package com.example.enutritrack_app.data.local.entities

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import com.example.enutritrack_app.data.local.database.SyncStatus

/**
 * Niveles de actividad física posibles
 */
enum class ActivityLevel {
    SEDENTARY,    // sedentario
    MODERATE,     // moderado
    ACTIVE,       // activo
    VERY_ACTIVE   // muy_activo
}

/**
 * Entidad local para los objetivos del usuario
 * 
 * Incluye:
 * - Peso objetivo (opcional)
 * - Nivel de actividad física
 * - Estado vigente (solo uno puede estar vigente a la vez)
 * 
 * Soporta sincronización offline
 */
@Entity(
    tableName = "objetivo_usuario",
    indices = [
        Index(value = ["usuario_id", "vigente"]),
        Index(value = ["syncStatus"])
    ]
)
data class ObjetivoUsuarioEntity(
    @PrimaryKey
    val id: String,  // UUID generado localmente o del servidor
    
    val usuario_id: String,  // FK → UserEntity.id
    
    /**
     * Peso objetivo en kg (opcional)
     */
    val peso_objetivo: Double?,
    
    /**
     * Nivel de actividad física
     */
    val nivel_actividad: String,  // ActivityLevel como string
    
    /**
     * Fecha en que se estableció el objetivo
     */
    val fecha_establecido: Long,  // timestamp en millis
    
    /**
     * Indica si este objetivo está vigente actualmente
     * Solo uno por usuario puede estar vigente
     */
    val vigente: Boolean,
    
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

