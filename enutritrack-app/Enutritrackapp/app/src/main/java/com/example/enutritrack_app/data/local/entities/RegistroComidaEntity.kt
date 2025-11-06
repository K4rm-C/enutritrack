package com.example.enutritrack_app.data.local.entities

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import com.example.enutritrack_app.data.local.database.SyncStatus

/**
 * Tipo de comida enum para Room
 */
enum class TipoComidaEnum {
    DESAYUNO,
    ALMUERZO,
    CENA,
    MERIENDA
}

/**
 * Entidad local para registros de comida
 * 
 * Representa una comida registrada por el usuario (desayuno, almuerzo, cena, merienda)
 * Los items individuales de la comida se almacenan en RegistroComidaItemEntity
 */
@Entity(
    tableName = "registro_comida",
    indices = [
        Index(value = ["usuario_id", "fecha"]),
        Index(value = ["syncStatus"])
    ]
)
data class RegistroComidaEntity(
    @PrimaryKey
    val id: String, // UUID generado localmente si es nuevo, o UUID del servidor
    
    val usuario_id: String, // FK → UserEntity.id
    
    val fecha: Long, // timestamp en millis
    
    val tipo_comida: TipoComidaEnum,
    
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

