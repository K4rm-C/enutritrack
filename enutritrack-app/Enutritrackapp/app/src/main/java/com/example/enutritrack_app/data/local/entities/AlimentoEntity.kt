package com.example.enutritrack_app.data.local.entities

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import com.example.enutritrack_app.data.local.database.SyncStatus

/**
 * Entidad local para alimentos
 * 
 * Almacena información nutricional de alimentos que el usuario puede usar
 * para registrar comidas
 */
@Entity(
    tableName = "alimentos",
    indices = [
        Index(value = ["nombre"], unique = true),
        Index(value = ["syncStatus"])
    ]
)
data class AlimentoEntity(
    @PrimaryKey
    val id: String, // UUID generado localmente si es nuevo, o UUID del servidor
    
    val nombre: String,
    
    val descripcion: String?,
    
    // Valores nutricionales por 100g
    val calorias_por_100g: Double,
    
    val proteinas_g_por_100g: Double,
    
    val carbohidratos_g_por_100g: Double,
    
    val grasas_g_por_100g: Double,
    
    val fibra_g_por_100g: Double?,
    
    val categoria: String?,
    
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

