package com.example.enutritrack_app.data.local.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Entidad local para estados de alerta
 * Solo lectura - se sincroniza desde el servidor
 */
@Entity(tableName = "estados_alerta")
data class EstadoAlertaEntity(
    @PrimaryKey
    val id: String,

    val nombre: String,

    val descripcion: String?,

    val created_at: Long // timestamp en millis
)

