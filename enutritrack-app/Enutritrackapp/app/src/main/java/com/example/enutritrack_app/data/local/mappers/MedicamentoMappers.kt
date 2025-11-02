package com.example.enutritrack_app.data.local.mappers

import com.example.enutritrack_app.data.local.entities.MedicamentoEntity
import com.example.enutritrack_app.data.remote.dto.MedicamentoResponse
import java.text.SimpleDateFormat
import java.util.*

/**
 * Funciones de mapeo para Medicamento
 */

/**
 * Formato de fecha para parsear respuestas del servidor
 */
private val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.US)

/**
 * Convierte MedicamentoResponse del servidor a MedicamentoEntity
 */
fun MedicamentoResponse.toEntity(): MedicamentoEntity {
    // Parsear fecha_inicio
    val fechaInicio = try {
        dateFormat.parse(fechaInicio)?.time ?: System.currentTimeMillis()
    } catch (e: Exception) {
        System.currentTimeMillis()
    }
    
    // Parsear fecha_fin (opcional)
    val fechaFin = fechaFin?.let {
        try {
            dateFormat.parse(it)?.time
        } catch (e: Exception) {
            null
        }
    }
    
    return MedicamentoEntity(
        id = id,
        usuario_id = usuarioId,
        nombre = nombre,
        dosis = dosis,
        frecuencia = frecuencia,
        fecha_inicio = fechaInicio,
        fecha_fin = fechaFin,
        notas = notas,
        activo = activo,
        lastSync = System.currentTimeMillis()
    )
}

