package com.example.enutritrack_app.data.local.entities

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * Entidad local para recomendaciones del doctor
 * 
 * Solo lectura - las recomendaciones son configuradas por el doctor
 * y sincronizadas desde el servidor
 */
@Entity(
    tableName = "recomendaciones",
    indices = [
        Index(value = ["usuario_id", "activa"]),
        Index(value = ["usuario_id", "vigencia_hasta"])
    ]
)
data class RecomendacionEntity(
    @PrimaryKey
    val id: String, // UUID del servidor
    
    val usuario_id: String, // FK → UserEntity.id
    
    val tipo_recomendacion_id: String,
    
    val contenido: String,
    
    val fecha_generacion: Long, // timestamp en millis
    
    val vigencia_hasta: Long?, // timestamp en millis, null si no tiene vigencia
    
    val activa: Boolean,
    
    val prioridad: String?,
    
    val cita_medica_id: String?,
    
    val alerta_generadora_id: String?,
    
    /**
     * Timestamp de última sincronización desde servidor
     */
    val lastSync: Long = System.currentTimeMillis()
)

