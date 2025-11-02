package com.example.enutritrack_app.data.local.entities

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import com.example.enutritrack_app.data.local.database.SyncStatus

/**
 * Entidad local para citas médicas del usuario
 * 
 * Soporta sincronización offline: las citas se guardan localmente
 * primero y luego se sincronizan con el servidor cuando hay conexión
 */
@Entity(
    tableName = "citas_medicas",
    indices = [
        Index(value = ["usuario_id", "fecha_hora_programada"]),
        Index(value = ["syncStatus"])
    ]
)
data class CitaMedicaEntity(
    @PrimaryKey
    val id: String, // UUID generado localmente si es nuevo, o UUID del servidor
    
    val usuario_id: String, // FK → UserEntity.id
    
    val doctor_id: String, // FK → PerfilDoctor.id
    
    val tipo_consulta_id: String, // FK → TipoConsultaEntity.id
    
    val estado_cita_id: String, // FK → EstadoCitaEntity.id
    
    val fecha_hora_programada: Long, // timestamp en millis
    
    val fecha_hora_inicio: Long?, // timestamp en millis
    
    val fecha_hora_fin: Long?, // timestamp en millis
    
    val motivo: String?,
    
    val observaciones: String?,
    
    val diagnostico: String?, // Solo lectura (llenado por doctor)
    
    val tratamiento_recomendado: String?, // Solo lectura (llenado por doctor)
    
    val proxima_cita_sugerida: Long?, // timestamp en millis
    
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

