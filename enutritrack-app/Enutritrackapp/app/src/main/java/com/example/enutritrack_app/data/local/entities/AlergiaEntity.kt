package com.example.enutritrack_app.data.local.entities

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import com.example.enutritrack_app.data.local.database.SyncStatus

/**
 * Entidad local para alergias del usuario
 * 
 * Estructura completa de la tabla alergias del servidor
 * Soporta sincronización offline
 */
@Entity(
    tableName = "alergias",
    indices = [
        Index(value = ["usuario_id"]),
        Index(value = ["activa"]),
        Index(value = ["syncStatus"])
    ]
)
data class AlergiaEntity(
    @PrimaryKey
    val id: String,  // UUID generado localmente o del servidor
    
    val usuario_id: String,  // FK → UserEntity.id
    
    /**
     * Tipo de alergia (Medicamento, Alimento, Ambiental, etc.)
     * Opcional en el servidor pero recomendado
     */
    val tipo: String?,
    
    /**
     * Nombre de la alergia (ej. "Trimetroprima con Sulfa", "Tomate")
     * Obligatorio
     */
    val nombre: String,
    
    /**
     * Severidad de la alergia
     * ENUM: LEVE, MODERADA, SEVERA, CRITICA
     */
    val severidad: String,  // "leve", "moderada", "severa", "critica"
    
    /**
     * Reacción que causa la alergia
     * Obligatorio según requerimiento del usuario
     */
    val reaccion: String,
    
    /**
     * Notas adicionales (opcional)
     */
    val notas: String?,
    
    /**
     * Si la alergia está activa
     */
    val activa: Boolean = true,
    
    /**
     * Estado de sincronización con el servidor
     */
    val syncStatus: SyncStatus = SyncStatus.SYNCED,
    
    /**
     * UUID asignado por el servidor después de sincronizar
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

/**
 * Enum para severidad de alergia (basado en SeveridadEnum del servidor)
 */
enum class SeveridadAlergia(val value: String, val displayName: String) {
    LEVE("leve", "Leve"),
    MODERADA("moderada", "Moderada"),
    SEVERA("severa", "Severa"),
    CRITICA("critica", "Crítica");
    
    companion object {
        fun fromValue(value: String): SeveridadAlergia {
            return values().find { it.value == value.lowercase() } ?: LEVE
        }
    }
}

/**
 * Tipos comunes de alergia (selector amplio e inclusivo)
 */
enum class TipoAlergia(val displayName: String) {
    MEDICAMENTO("Medicamento"),
    ALIMENTO("Alimento"),
    AMBIENTAL("Ambiental"),
    CONTACTO("Contacto"),
    INSECTOS("Insectos/Picaduras"),
    ANIMALES("Animales"),
    OTRO("Otro");
    
    companion object {
        fun getAllDisplayNames(): List<String> {
            return values().map { it.displayName }
        }
    }
}

