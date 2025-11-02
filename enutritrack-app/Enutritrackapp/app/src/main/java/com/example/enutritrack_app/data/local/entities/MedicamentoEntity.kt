package com.example.enutritrack_app.data.local.entities

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * Entidad local para medicamentos asignados por el doctor
 * 
 * IMPORTANTE: Esta entidad es de SOLO LECTURA desde el servidor.
 * Los medicamentos solo pueden ser creados/modificados por el doctor.
 * La app solo los sincroniza desde el servidor para mostrar al usuario.
 */
@Entity(
    tableName = "medicamentos",
    indices = [
        Index(value = ["usuario_id", "activo"]),
        Index(value = ["id"], unique = true)
    ]
)
data class MedicamentoEntity(
    @PrimaryKey
    val id: String,  // UUID del servidor
    
    val usuario_id: String,  // FK → UserEntity.id
    
    val nombre: String,
    
    val dosis: String?,
    
    val frecuencia: String?,
    
    /**
     * Fecha de inicio en timestamp (millis)
     */
    val fecha_inicio: Long,
    
    /**
     * Fecha de fin en timestamp (millis), nullable si está activo indefinidamente
     */
    val fecha_fin: Long?,
    
    val notas: String?,
    
    /**
     * Indica si el medicamento está activo
     */
    val activo: Boolean,
    
    /**
     * Timestamp de última sincronización desde el servidor
     * No tiene syncStatus porque no se modifican localmente
     */
    val lastSync: Long = System.currentTimeMillis()
)

