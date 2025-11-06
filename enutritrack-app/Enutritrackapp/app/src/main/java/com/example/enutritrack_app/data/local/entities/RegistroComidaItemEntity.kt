package com.example.enutritrack_app.data.local.entities

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import com.example.enutritrack_app.data.local.database.SyncStatus

/**
 * Entidad local para items individuales de un registro de comida
 * 
 * Cada item representa un alimento específico con su cantidad en gramos
 * y los valores nutricionales calculados (snapshot al momento del registro)
 */
@Entity(
    tableName = "registro_comida_items",
    indices = [
        Index(value = ["registro_comida_id"]),
        Index(value = ["alimento_id"]),
        Index(value = ["syncStatus"])
    ]
)
data class RegistroComidaItemEntity(
    @PrimaryKey
    val id: String, // UUID generado localmente si es nuevo, o UUID del servidor
    
    val registro_comida_id: String, // FK → RegistroComidaEntity.id
    
    val alimento_id: String, // FK → AlimentoEntity.id
    
    val cantidad_gramos: Double,
    
    // Valores nutricionales calculados (snapshot al momento del registro)
    val calorias: Double,
    
    val proteinas_g: Double,
    
    val carbohidratos_g: Double,
    
    val grasas_g: Double,
    
    val fibra_g: Double?,
    
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
    val createdAt: Long = System.currentTimeMillis()
)

