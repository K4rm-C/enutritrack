package com.example.enutritrack_app.data.local.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Entidad local para tipos de alerta
 * Solo lectura - se sincroniza desde el servidor
 */
@Entity(tableName = "tipos_alerta")
data class TipoAlertaEntity(
    @PrimaryKey
    val id: String,

    val nombre: String,

    val descripcion: String?,

    val categoria_id: String, // FK → CategoriaAlertaEntity.id

    val es_automatica: Boolean,

    val created_at: Long // timestamp en millis
)

