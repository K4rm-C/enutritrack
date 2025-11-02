package com.example.enutritrack_app.data.local.entities

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * Entidad local para alertas asignadas al usuario
 * Solo lectura - las alertas son creadas por el doctor o automáticamente
 */
@Entity(
    tableName = "alertas",
    indices = [
        Index(value = ["usuario_id", "fecha_deteccion"]),
        Index(value = ["estado_alerta_id"])
    ]
)
data class AlertaEntity(
    @PrimaryKey
    val id: String,
    
    val usuario_id: String, // FK → UserEntity.id
    
    val doctor_id: String?, // FK → PerfilDoctor.id (nullable, puede ser automática)
    
    val tipo_alerta_id: String, // FK → TipoAlertaEntity.id
    
    val nivel_prioridad_id: String, // FK → NivelPrioridadAlertaEntity.id
    
    val estado_alerta_id: String, // FK → EstadoAlertaEntity.id
    
    val titulo: String,
    
    val mensaje: String,
    
    val recomendacion_id: String?, // FK → RecomendacionEntity.id (nullable)
    
    val fecha_deteccion: Long, // timestamp en millis
    
    val fecha_resolucion: Long?, // timestamp en millis
    
    val resuelta_por: String?, // FK → PerfilDoctor.id (nullable)
    
    val notas_resolucion: String?,
    
    val created_at: Long, // timestamp en millis
    
    val updated_at: Long // timestamp en millis
)

