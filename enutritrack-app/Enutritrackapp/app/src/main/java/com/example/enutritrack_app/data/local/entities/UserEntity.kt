package com.example.enutritrack_app.data.local.entities

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * Entidad local para cachear datos del usuario actual
 * 
 * Esta entidad se sincroniza desde el servidor después del login
 * y se usa para validaciones offline y mostrar datos del perfil
 */
@Entity(
    tableName = "usuario",
    indices = [Index(value = ["id"], unique = true)]
)
data class UserEntity(
    @PrimaryKey
    val id: String,  // UUID del usuario
    
    val cuenta_id: String,
    
    val doctor_id: String?,  // nullable - usuario puede no tener doctor asignado
    
    val nombre: String,
    
    val fecha_nacimiento: Long,  // timestamp en millis
    
    val genero_id: String,
    
    val genero_nombre: String?,  // Cache del nombre del género
    
    val altura: Double,
    
    val telefono: String?,
    
    val telefono_1: String?,
    
    val telefono_2: String?,
    
    // Cache de datos del doctor asignado
    val doctor_nombre: String?,
    val doctor_telefono: String?,
    val doctor_especialidad: String?,
    
    // Timestamp de última sincronización
    val lastSync: Long = System.currentTimeMillis()
)

