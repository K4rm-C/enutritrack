package com.example.enutritrack_app.data.local.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Entidad local para categorías de alerta
 * Solo lectura - se sincroniza desde el servidor
 */
@Entity(tableName = "categorias_alerta")
data class CategoriaAlertaEntity(
    @PrimaryKey
    val id: String,

    val nombre: String,

    val descripcion: String?,

    val created_at: Long // timestamp en millis
)

