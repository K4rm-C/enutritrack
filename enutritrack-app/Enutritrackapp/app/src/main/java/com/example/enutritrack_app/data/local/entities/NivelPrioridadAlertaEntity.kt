package com.example.enutritrack_app.data.local.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Entidad local para niveles de prioridad de alerta
 * Solo lectura - se sincroniza desde el servidor
 */
@Entity(tableName = "niveles_prioridad_alerta")
data class NivelPrioridadAlertaEntity(
    @PrimaryKey
    val id: String,

    val nombre: String,

    val descripcion: String?,

    val nivel_numerico: Int, // 1 = más baja, mayor número = más alta

    val created_at: Long // timestamp en millis
)

