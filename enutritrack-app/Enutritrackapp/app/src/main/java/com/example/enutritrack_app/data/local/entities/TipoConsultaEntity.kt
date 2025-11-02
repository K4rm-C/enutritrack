package com.example.enutritrack_app.data.local.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Entidad local para tipos de consulta médica
 * Solo lectura - se sincroniza desde el servidor
 */
@Entity(tableName = "tipos_consulta")
data class TipoConsultaEntity(
    @PrimaryKey
    val id: String,

    val nombre: String,

    val descripcion: String?,

    val duracion_minutos: Int,

    val created_at: Long // timestamp en millis
)

