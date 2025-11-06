package com.example.enutritrack_app.data.local.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Entidad local para documentos de citas médicas
 * Solo lectura - solo el doctor puede agregar documentos
 */
@Entity(tableName = "citas_medicas_documentos")
data class CitaMedicaDocumentosEntity(
    @PrimaryKey
    val id: String,
    
    val cita_medica_id: String, // FK → CitaMedicaEntity.id
    
    val nombre_archivo: String,
    
    val tipo_documento: String?,
    
    val ruta_archivo: String, // Ruta en el servidor
    
    val tamano_bytes: Long?,
    
    val notas: String?,
    
    val created_at: Long // timestamp en millis
)

