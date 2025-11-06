package com.example.enutritrack_app.data.local.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Entidad local para estados de cita médica
 * Solo lectura - se sincroniza desde el servidor
 */
@Entity(tableName = "estados_cita")
data class EstadoCitaEntity(
    @PrimaryKey
    val id: String,

    val nombre: String,

    val descripcion: String?,

    val es_final: Boolean,

    val created_at: Long // timestamp en millis
)

