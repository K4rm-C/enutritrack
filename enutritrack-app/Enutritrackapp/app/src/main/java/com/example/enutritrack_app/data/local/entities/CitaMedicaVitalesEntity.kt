package com.example.enutritrack_app.data.local.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Entidad local para vitales de citas médicas
 * Solo lectura - solo el doctor puede crear/modificar vitales
 */
@Entity(tableName = "citas_medicas_vitales")
data class CitaMedicaVitalesEntity(
    @PrimaryKey
    val id: String,
    
    val cita_medica_id: String, // FK → CitaMedicaEntity.id
    
    val peso: Double?,
    
    val altura: Double?,
    
    val tension_arterial_sistolica: Int?,
    
    val tension_arterial_diastolica: Int?,
    
    val frecuencia_cardiaca: Int?,
    
    val temperatura: Double?,
    
    val saturacion_oxigeno: Int?,
    
    val notas: String?,
    
    val created_at: Long // timestamp en millis
)

