package com.example.enutritrack_app.data.local.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Entidad local para tipos de actividad física
 * Solo lectura - se sincroniza desde el servidor
 */
@Entity(tableName = "tipos_actividad")
data class TipoActividadEntity(
    @PrimaryKey
    val id: String,
    
    val nombre: String,
    
    val descripcion: String?,
    
    val met_value: Double,
    
    val categoria: String?,
    
    val created_at: Long // timestamp en millis
)

