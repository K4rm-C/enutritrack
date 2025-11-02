package com.example.enutritrack_app.data.local.entities

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import com.example.enutritrack_app.data.local.database.SyncStatus

/**
 * Entidad local para datos del perfil de usuario y cuenta
 * 
 * Almacena información del perfil_usuario y datos de cuenta relacionados
 * para acceso offline y sincronización
 */
@Entity(
    tableName = "perfil",
    indices = [
        Index(value = ["cuenta_id"], unique = true),
        Index(value = ["syncStatus"])
    ]
)
data class ProfileEntity(
    @PrimaryKey
    val id: String,  // perfil_usuario.id
    
    val cuenta_id: String,
    
    val doctor_id: String?,
    
    // Datos del perfil_usuario
    val nombre: String,
    
    val fecha_nacimiento: Long, // timestamp en millis
    
    val genero_id: String,
    
    val genero_nombre: String, // Cache del nombre del género
    
    val altura: Double,
    
    val telefono: String?,
    
    val telefono_1: String?,
    
    val telefono_2: String?,
    
    // Datos de cuenta (cacheados)
    val email: String,
    
    val email_1: String?,
    
    val email_2: String?,
    
    // Información del doctor (cacheados para acceso offline)
    val doctor_nombre: String?,
    
    val doctor_especialidad: String?,
    
    val doctor_telefono: String?,
    
    val doctor_telefono_1: String?,
    
    val doctor_telefono_2: String?,
    
    val doctor_email: String?,
    
    val doctor_email_1: String?,
    
    val doctor_email_2: String?,
    
    // Sincronización
    val syncStatus: SyncStatus,
    
    val serverId: String? = null,
    
    val retryCount: Int = 0,
    
    val lastSyncAttempt: Long? = null,
    
    val createdAt: Long = System.currentTimeMillis(),
    
    val updatedAt: Long = System.currentTimeMillis()
)

